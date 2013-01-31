/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var models = require('../models'),
    conf = require('../etc/config.js'),
    sanitize = require('validator').sanitize,
    rtg = require('url').parse(conf.redis.url),
    redis = require('redis').createClient(rtg.port, rtg.hostname);

redis.auth(rtg.auth.split(":")[1]);

exports.addMessage = function (req, res) {
  var post = req.body;

  models.user.findById(req.session.user_id, function (err, user) {
    var newMessage = new models.chatMessage;
    newMessage.nickname = user.nickname;
    newMessage.message = sanitize(post.message).entityEncode();
    newMessage.save();

    redis.publish('chat', JSON.stringify(newMessage));
    res.send(200);
  });
};

exports.getMessages = function (req, res) {
  models.chatMessage.where().sort('-createdAt').limit(100).exec(function (err, docs) {
    res.send(docs.reverse());
  });
};