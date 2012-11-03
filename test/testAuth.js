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

    it('should not invite people who are already members', function (done) {
      // mock a response with no err and no docs, and a user that already exists
      models.invite.findOne = function (value, callback) {
        callback(null, null);
      };

      models.user.findOne = function (value, callback) {
        callback(null, {});
      };

      auth.createInvite('test@test.com', 0, function (status, errMsg) {
        assert.equal(false, status);
        assert.equal(errMsg, "test@test.com is already a user.");
        done();
      });
    })
  })
})