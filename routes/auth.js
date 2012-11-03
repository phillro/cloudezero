var models = require('../models'),
    email = require("emailjs");

var server = email.server.connect({
  user:"bronsteinomatic@gmail.com",
  password:"cloude000",
  host:"smtp.gmail.com",
  ssl:true
});

exports.showLoginPage = function (req, res) {
  res.render('login', {layout:false});
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
        req.session.user_id = doc.id;
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
 * Wipes out the session and returns user to the login
 * page.
 *
 * @param req
 * @param res
 */
exports.logout = function (req, res) {
  delete req.session.user_id;
  res.redirect('/login');
}

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

exports.checkCanInvite = function (req, res, next) {
  models.user.findById(req.session.user_id, function (err, doc) {
    if (doc.can_invite) {
      next();
    } else {
      res.send("You don't have invite privileges.");
    }
  });
};

exports.invite = function (req, res) {
  res.render("invite");
};

exports.sendInvite = function (req, res) {
  var post = req.body;

  models.user.findById(req.session.user_id, function (err, doc) {
    if (doc.can_invite) {
      console.log("User " + doc.nickname + " is sending invite to " + post.email);
      sendEmail(post.email, doc.nickname + " is inviting you to lulzserver", "hey there", res);

    } else {
      res.send("You can't send invites.");
    }
  });
};

function sendEmail(emailAddress, subject, body, res) {
  server.send({
    from:"cloudezero <bronsteinomatic@gmail.com>",
    to:emailAddress,
    subject:subject,
    text:body
  }, function (err, message) {
    if(err){
      res.send("ERROR YOU SUCK AT THIS");
    }else{
      res.send("Success!");
    }
  });
}


