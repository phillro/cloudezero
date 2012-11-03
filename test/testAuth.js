var assert = require('assert'),
    auth = require('../routes/auth'),
    models = require('../models');

describe('Auth', function () {
  describe('#addInvite', function () {
    it('should not allow duplicate invites', function (done) {
      // mock a response with no err and one doc
      models.invite.findOne = function (value, callback) {
        callback(null, {});
      };

      auth.createInvite('test@test.com', 0, function (status, errMsg) {
        assert.equal(false, status);
        assert.equal(errMsg, "test@test.com has already been invited.");
        done();
      });
    })
  })
})