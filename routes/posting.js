var models = require('../models');

exports.addPosting = function (req, res) {
  var post = req.body;

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
            //client.publish('updates', newPost.id);
            console.log(user.nickname + " added " + newPost.imageUrl);
            res.send("OK");
          }
        });
      } else {
        user.reposts++;
        user.save();
        console.log(user.nickname + " reposted " + newPost.imageUrl);
        res.send("REPOST");
      }
    });
  });
};

exports.getPostings = function (req, res) {
  models.posting.find().sort('createdAt').limit(25).exec(function (err, docs) {
    res.send(docs);
  });
};