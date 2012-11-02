var models = require('../models');

exports.get = function (req, res) {
  models.user.findOne({'nickname':req.params.nickname}, function (err, doc) {
    if (!err) {
      res.send(doc);
    } else {
      handleError(res, err);
    }
  });
};

function handleError(response, error) {
  response.send(error);
}