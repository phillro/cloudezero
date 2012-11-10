var models = require('../models');

exports.addPosting = function (req, res) {
  var post = req.body;

  console.log("New posting from " + req.session.user_id);
  console.log(post.imageUrl);

  res.send("DENIED");
};