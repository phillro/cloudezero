var models = require('../models');

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
  
  if(post.imageUrl == null) {
    res.send({status:-1, message:"No image URL specified!"});
  }

  models.user.findById(req.session.user_id, function (err, user) {
    // check for repost before adding
    models.posting.count({'imageUrl':post.imageUrl}, function (err, cnt) {
      if (cnt === 0) {
        var newPost = new models.posting;

        newPost.imageUrl = post.imageUrl;
        newPost.userId = user.id;
        newPost.nickname = user.nickname;
        newPost.save(function (err) {
          if (!err) {
            user.posts++;
            user.save();
            console.log(user.nickname + " added " + newPost.imageUrl);
            res.send({status:1});
          }else{
            res.send({status:-1, message:err.message});
          }
        });
      } else {
        // ding the user for reposting
        user.reposts++;
        user.save();
        
        // send repost fail
        // TODO: it would be cool if this returned a message saying who
        // originally posted this image and when.
        res.send({status:0});
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
      res.send('ok');
    });
  });
};

exports.getPostings = function (req, res) {
  models.posting.where().sort('-createdAt').limit(50).exec(function (err, docs) {
    res.send(docs.reverse());
  });
};

exports.getPosting = function (req, res) {
  models.posting.findById(req.params.postingId, function (err, doc) {
    res.send(doc);
  });
};