var invites = require('../lib/invites'),
    models = require('../models');

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

exports.extensionLogin = function(req,res){
    var post = req.body;

    models.user.findOne({nickname:post.user}, function (err, doc) {
        if (doc) {
            if (doc.authenticate(post.password)) {
                req.session.user_id = doc.id;
                res.send("Authentication successful.");
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
 * Wipes out the session and returns user to the login
 * page.
 *
 * @param req
 * @param res
 */
exports.extensionLogout = function (req, res) {
    delete req.session.user_id;
    res.send('Success.');
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

    // TODO : validate email address

    models.user.findById(req.session.user_id, function (err, doc) {
        if (doc.can_invite) {
            invites.createInvite(post.email, doc.email, function (status, errMsg) {
                if (status) {
                    res.send('Success.');
                } else {
                    res.send(errMsg);
                }
            });
        } else {
            res.send("You can't send invites.");
        }
    });
};

exports.showRegister = function (req, res) {
    models.invite.findById(req.params.invite_id, function (err, doc) {
        if (doc) {
            res.render("register", {layout:false, email:doc.email, inviteId:doc.id});
        } else {
            res.send("Invite does not exist.");
        }
    });
};

exports.register = function (req, res) {
    var post = req.body;
    var user = new models.user;

    models.invite.findById(post.inviteId, function (err, doc) {
        if (doc) {
            user.nickname = post.nickname;
            user.email = post.email;
            user.password = post.password;
            user.save();
            doc.remove();

            res.send("ok.  click <a href='/login'>here</a> to login");
        } else {
            res.send("Invalid invite id.");
        }
    });
};




