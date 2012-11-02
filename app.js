var conf = require('./etc/config.js'),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    redis = require('redis'),
    redisStore = require('connect-redis')(express),
    routes = require('./routes'),
    url = require('url'),
    user = require('./routes/user');

var app = express();

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
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
}

function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

app.post('/login', function (req, res) {
  var post = req.body;
  if (post.user == 'john' && post.password == 'johnspassword') {
    req.session.user_id = 4;
    res.redirect('/');
  } else {
    res.send('Bad user/pass');
  }
});

app.get('/', checkAuth, routes.index);

// user-related routes
app.get('/user/:nickname', user.get);

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
