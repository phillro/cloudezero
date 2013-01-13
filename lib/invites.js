var conf = require('../etc/config'),
    email = require('emailjs'),
    models = require('../models');

/**
 * Email server for sending invites
 */
var emailServer = email.server.connect(conf.email.server);

/**
 * Attempts to create a new invite.  If there's already an invite
 * to this email address or this email address already belongs to
 * a registered user we return false and a reason.
 *
 * @param emailAddress The email address of the person being invited
 * @param inviterEmail The email of the user sending the invite
 * @param callback Returns true/false and sets a string on false with
 *                 the reason why we didn't create an invite.
 */
exports.createInvite = function (emailAddress, inviterEmail, callback) {
    // first check if there's already a pending invite
    models.invite.findOne({email:emailAddress}, function (err, invite) {
        if (invite) {
            callback(false, emailAddress + " has already been invited.");
        } else {
            models.user.findOne({email:emailAddress}, function (err, user) {
                if (user) {
                    callback(false, emailAddress + " is already a user.");
                } else {
                    var invite = new models.invite;

                    invite.email = emailAddress;
                    invite.invited_by = inviterEmail;
                    invite.save();

                    sendEmail(invite.email,
                        "Invited to #external_festivus from " + inviterEmail,
                        "Click <a href='http://cloudezero.net/invited/" + invite.id + "'>here</a> to register.");

                    callback(true, null);
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
 */
function sendEmail(emailAddress, subject, body) {
    emailServer.send({
        from:conf.email.from,
        to:emailAddress,
        subject:subject,
        text:body,
        attachment:[
            {data:body, alternative:true}
        ]
    }, function (err, message) {
        if (err) {
            console.log(err);
        } else {
            console.log(message);
        }
    });
}
;