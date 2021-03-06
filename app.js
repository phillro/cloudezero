/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var conf = require('./etc/config.js'),
    express = require('express'),
    http = require('http'),
    partials = require('express-partials'),
    path = require('path'),
    redisStore = require('connect-redis')(express),
    routes = require('./routes'),
    url = require('url'),
    auth = require('./routes/auth'),
    chatRoutes = require('./routes/chat'),
    postingRoutes = require('./routes/posting'),
    userRoutes = require('./routes/user');

var app = express();

// configure redis for sessions
var redisUrl = url.parse(conf.redis.url);
var redisHost = redisUrl.hostname.split(':')[0];
var redisPort = redisUrl.port;
var redisAuth = redisUrl.auth.split(':');

var redis = require("redis").createClient(redisPort, redisHost);
redis.auth(redisAuth[1]);

// configure app
app.configure(configureExpress);

function configureExpress() {
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.cookieParser());
  app.use(express.session({
    secret:'bgockbgockbgock',
    store:new redisStore({
      client:redis
    })
  }));
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(partials());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
}

// define routes
// default index page
app.get('/', auth.checkAuth, routes.index);

// authentication related routes
app.get('/login', auth.showLoginPage);
app.get('/logout', auth.logout);
app.post('/login', auth.login);
app.post('/extension/auth/login', auth.extensionLogin);
app.get('/extension/auth/logout', auth.extensionLogout);
app.post('/send_invite', auth.sendInvite);
app.get('/invited/:invite_id', auth.showRegister);
app.post('/register', auth.register);

// chat related routes
app.get('/chat/getMessages', auth.checkAuth, chatRoutes.getMessages);
app.post('/chat/addMessage', auth.checkAuth, chatRoutes.addMessage);

// posting related routes
app.post('/posting/add', auth.checkAuth, postingRoutes.addPosting);
app.post('/posting/addComment', auth.checkAuth, postingRoutes.addCommentToPosting);
app.post('/posting/registerVote', auth.checkAuth, postingRoutes.registerVote);
app.get('/posting/getPostings/:numPostings/:earlierThan', auth.checkAuth, postingRoutes.getPostings);
app.get('/posting/getSortedPostings/:field/:direction', auth.checkAuth, postingRoutes.getSortedPostings);
app.get('/posting/getPosting/:postingId', auth.checkAuth, postingRoutes.getPosting);

// user-related routes
app.get('/user/get/:id', auth.checkAuth, userRoutes.get);
app.get('/user/current', auth.checkAuth, userRoutes.getCurrentUser);

// start server
var server = http.createServer(app).listen(app.get('port'), function () {
  console.log("cloudezero running on port " + app.get('port'));
});

// create client for pub/sub
var redis = require("redis").createClient(redisPort, redisHost);
redis.auth(redisAuth[1]);

redis.subscribe('system-messages');
redis.subscribe('posting-updates');
redis.subscribe('new-postings');
redis.subscribe('chat');

redis.on('error', function (e) {
  console.log(e);
});

// attach sockets
io = require('socket.io').listen(server);

// start updates sockets
io.configure(function () {
  io.set('log level', 1);
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

var currentUsers = {};

// set up sockets
io.sockets.on('connection', function (socket) {
  redis.on('message', function (channel, message) {
    socket.emit('updates', {channel:channel, message:message});
  });

  socket.on('user_connect', function (nickname) {
    // there is a delay on picking up disconnects, so wipe this
    // out in case someone just hit refresh
    if (currentUsers[nickname]) {
      currentUsers[nickname].disconnect();
    }
    socket.nickname = nickname;
    currentUsers[nickname] = socket;
    io.sockets.emit('current_users', Object.keys(currentUsers));
  });

  socket.on('disconnect', function () {
    delete currentUsers[socket.nickname];
    io.sockets.emit('current_users', Object.keys(currentUsers));
  });
});

