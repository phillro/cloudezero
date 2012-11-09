var crypto = require('crypto'),
    mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var User = new Schema({
  'nickname':String,
  'email':String,
  'hashed_password':String,
  'salt':String,
  'is_admin':{type:Boolean, default:false},
  'can_invite':{type:Boolean, default:false},
  'posts':{type:Number, default:0},
  'reposts':{type:Number, default:0},
  'upvotes':{type:Number, default:0},
  'downvotes':{type:Number, default:0},
  'createdAt':{type:Date, default:Date.now}
});

User.virtual('id')
    .get(function () {
      return this._id.toHexString();
    });

User.virtual('password')
    .set(function (password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
      return this._password;
    });

User.method('authenticate', function (plainText) {
  return this.encryptPassword(plainText) === this.hashed_password;
});

User.method('makeSalt', function () {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

User.method('encryptPassword', function (password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

module.exports = User;
