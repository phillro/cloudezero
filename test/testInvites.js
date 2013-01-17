/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var assert = require('assert'),
    invites = require('../lib/invites'),
    models = require('../models');

describe('Auth', function () {
  describe('#addInvite', function () {
    it('should not allow duplicate invites', function (done) {
      // mock an existing invite
      models.invite.findOne = function (value, callback) {
        callback(null, {});
      };

      invites.createInvite('test@test.com', 0, function (status, errMsg) {
        assert.equal(false, status);
        assert.equal(errMsg, "test@test.com has already been invited.");
        done();
      });
    })

    it('should not invite people who are already members', function (done) {
      // mock no invites but an existing user
      models.invite.findOne = function (value, callback) {
        callback(null, null);
      };

      models.user.findOne = function (value, callback) {
        callback(null, {});
      };

      invites.createInvite('test@test.com', 0, function (status, errMsg) {
        assert.equal(false, status);
        assert.equal(errMsg, "test@test.com is already a user.");
        done();
      });
    })

    it('should correctly create an invite', function (done) {
      // mock no invites and no users for this email
      models.invite.findOne = function (value, callback) {
        callback(null, null);
      };

      models.user.findOne = function (value, callback) {
        callback(null, null);
      };

      models.invite.save = function (value, callback) {
        console.log(value);
        callback(null, {});
      };

      invites.createInvite('test@test.com', 0, function (status, errMsg) {
        assert.equal(true, status);
        done();
      });
    })
  })
})