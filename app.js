var conf = require('./etc/config.js'),
    express = require('express'),
    http = require('http'),
    partials = require('express-partials'),
    path = require('path'),
    redis = require('redis'),
    redisStore = require('connect-redis')(express),
    routes = require('./routes'),
    url = require('url'),
    auth = require('./routes/auth'),
    userRoutes = require('./routes/user');

var app = express();

// configure app
app.configure(configureExpress);

function configureExpress() {
  var redisUrl = url.parse(conf.redis.url);
  var redisAuth = redisUrl.auth.split(':');
  app.set('redisHost', redisUrl.hostname);
  app.set('redisPort', redisUrl.port);
  app.set('redisDb', redisAuth[0]);
  app.set('redisPass', redisAuth[1]);
  app.use(express.cookieParser());
  app.use(express.session({
    secret:'bgockbgockbgock',
    store:new redisStore({
      host:app.set('redisHost'),
      port:app.set('redisPort'),
      db:app.set('redisDb'),
      pass:app.set('redisPass')
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
app.post('/send_invite', auth.sendInvite);

// user-related routes
app.get('/user/get/:id', auth.checkAuth, userRoutes.get);
app.get('/user/current', auth.checkAuth, userRoutes.getCurrentUser);

// start server
http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
