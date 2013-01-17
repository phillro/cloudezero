/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

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