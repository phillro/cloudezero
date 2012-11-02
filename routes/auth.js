var models = require('../models');

exports.showLoginPage = function (req, res) {
  res.render('login');
};

/**
 * This takes the user email and password and
 * attempts to authenticate against the user
 * db.  On success, we set the session cookie.
 *
 * @param req
 * @param res
 */
exports.login = function (req, res) {
  var post = req.body;

  models.user.findOne({nickname:post.user}, function (err, doc) {
    if (doc) {
      if (doc.authenticate(post.password)) {
        res.redirect('/');
      } else {
        res.send("Bad password.");
      }
    } else {
      res.send("User not found.");
    }
  });
};

/**
 * Middleware method to check authentication.  On
 * fail send access_denied page and pass through
 * on success.
 *
 * @param req
 * @param res
 * @param next
 */
exports.checkAuth = function (req, res, next) {
  if (!req.session.user_id) {
    res.send('<html><head><title>ACCESS DENIED, LOL</title></head>' +
        '<body><div align="center"><img src="/images/access-denied.png"/>' +
        '<a href="/login">login</a></div></body></html>');
  } else {
    next();
  }
};


