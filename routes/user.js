var models = require('../models');

exports.get = function (req, res) {
  models.user.findById(req.params.id, function (err, doc) {
    if (!err) {
      res.send(doc);
    } else {
      handleError(res, err);
    }
  });
};

exports.getCurrentUser = function (req, res) {
  models.user.findById(req.session.user_id, function (err, doc) {
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