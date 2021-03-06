/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var models = require('../models'),
    conf = require('../etc/config.js'),
    rtg = require("url").parse(conf.redis.url),
    redis = require("redis").createClient(rtg.port, rtg.hostname);

redis.auth(rtg.auth.split(":")[1]);

/**
 * This is the endpoint unto which image links are POSTed.
 *
 * The extension expects to receive an object containing a
 * status and an optional string.
 *
 * Statuses are : -1 for error, 0 for repost, 1 for ok and
 * the messages contain error info or repost info.
 */
exports.addPosting = function (req, res) {
  var post = req.body;

  if (post.imageUrl == null) {
    res.send({status:-1, message:"No image URL specified!"});
  }

  models.user.findById(req.session.user_id, function (err, user) {
    // check for repost before adding
    models.posting.findOne({imageUrl:post.imageUrl}, function (err, doc) {
      if (doc) {
        // ding the user for reposting
        user.reposts++;
        user.save();

        // shame user in the chat
        redis.publish('system-messages', user.nickname + ' reposted again. ' + user.reposts + ' so far.');

        // send repost fail
        res.send({status:0, message:doc.nickname + ' at ' + doc.createdAt});
      } else {
        var newPost = new models.posting;

        newPost.imageUrl = post.imageUrl;
        newPost.userId = user.id;
        newPost.nickname = user.nickname;
        newPost.save(function (err) {
          if (!err) {
            user.posts++;
            user.save();
            console.log(user.nickname + " added " + newPost.imageUrl);
            redis.publish('new-postings', newPost.id);
            redis.publish('system-messages', user.nickname + ' posted a new image.');
            res.send({status:1});
          } else {
            res.send({status:-1, message:err.message});
          }
        });
      }
    });
  });
};

exports.addCommentToPosting = function (req, res) {
  var post = req.body;

  models.user.findById(req.session.user_id, function (err, user) {
    models.posting.findById(post.postingId, function (err, posting) {
      var comment = {};
      comment['nickname'] = user.nickname;
      comment['text'] = post.text;
      posting.comments.push(comment);
      posting.save();

      // send update notification
      redis.publish('posting-updates', posting.id);
      res.send('ok');
    });
  });
};

exports.getPostings = function (req, res) {
  models.posting.where('createdAt')
      .lt(req.params.earlierThan)
      .sort('-createdAt')
      .limit(req.params.numPostings)
      .exec(function (err, docs) {
        res.send(docs);
      });
};

exports.getSortedPostings = function (req, res) {
  var dir = req.params.direction === "1" ? '' : '-';

  models.posting.where()
      .sort(dir + req.params.field)
      .limit(100)
      .exec(function (err, docs) {
        res.send(docs);
      });
};

exports.getPosting = function (req, res) {
  models.posting.findById(req.params.postingId, function (err, doc) {
    res.send(doc);
  });
};

// todo: refactor this, written while tired
exports.registerVote = function (req, res) {
  models.posting.findById(req.body.id, function (err, doc) {
    var userId = req.session.user_id;
    var vote = req.body.vote;

    resetUserVote(userId, doc);

    try {
      // downvote
      if (vote == '-1') {
        doc.downvoters.push(userId);
        doc.rating--;
      }

      // upvote
      if (vote == '1') {
        doc.upvoters.push(userId);
        doc.rating++;
      }
    } catch (err) {
      console.log(err);
    }

    doc.save();
    redis.publish('posting-updates', doc.id);
    res.send(200);
  });
};

function resetUserVote(userId, posting) {
  var idx = posting.downvoters.indexOf(userId);
  if (idx > -1) {
    posting.downvoters.splice(idx, 1);
    posting.rating++;
  }

  idx = posting.upvoters.indexOf(userId);
  if (idx > -1) {
    posting.upvoters.splice(idx, 1);
    posting.rating--;
  }

  return posting;
}