var assert = require('assert'),
    auth = require('../routes/auth'),
    models = require('../models');

describe('Auth', function () {
  describe('#addInvite', function () {
    it('should not allow duplicate invites', function (done) {
      // set up mocks
      models.invite.findOne = function (value, callback) {
        callback("", {});
      };

      auth.createInvite('test@test.com', 0, function (status, errMsg) {
        assert.equal(false, status);
        assert.equal(errMsg, "test@test.com has already been invited.");
        done();
      });
    })
  })
})