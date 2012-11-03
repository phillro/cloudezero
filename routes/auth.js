var models = require('../models'),
    email = require("emailjs");

/**
 * Set up email service for sending invites
 *
 * TODO : pull these values out to config.js
 */
var server = email.server.connect({
  user:"bronsteinomatic@gmail.com",
  password:"cloude000",
  host:"smtp.gmail.com",
  ssl:true
});

/**
 * Renders login.ejs
 *
 * @param req
 * @param res
 */
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

/**
 * POST method that attempts to send an invite to someone.
 *
 * If an Invite has already been created, or the email address
 * already matches a registered User - we don't send another...
 * all these cases should return responses that indicate this.
 *
 * @param req
 * @param res
 */
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

/**
 * Attempts to create a new invite.  If there's already an invite
 * to this email address or this email address already belongs to
 * a registered user we return false and a reason.
 *
 * @param emailAddress The email address of the person being invited
 * @param inviterId The User._id of the inviter
 * @param callback Returns true/false and sets a string on false with
 *                 the reason why we didn't create an invite.
 */
exports.createInvite = function (emailAddress, inviterId, callback) {
  // first check if there's already a pending invite
  models.invite.findOne({email:emailAddress}, function (err, doc) {
    if (doc) {
      callback(false, emailAddress + " has already been invited.");
    } else {
      models.user.findOne({email:emailAddress}, function (err, doc) {
        if (doc) {
          callback(false, emailAddress + " is already a user.");
        } else {
          callback(true, "HOLY FUCK");
          // TODO actually create invite
        }
      });
    }
  });
};

/**
 * Uses the emailjs server (initialized above) to send an email.
 *
 * @param emailAddress
 * @param subject
 * @param body
 * @param res
 */
function sendEmail(emailAddress, subject, body, res) {
  server.send({
    from:"cloudezero <bronsteinomatic@gmail.com>",
    to:emailAddress,
    subject:subject,
    text:body
  }, function (err, message) {
    if (err) {
      res.send("ERROR YOU SUCK AT THIS");
    } else {
      res.send("Success!");
    }
  });
}