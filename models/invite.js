var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var Invite = new Schema({
  'email':{type:String},
  'invited_by':{type:ObjectId},
  'createdAt':{type:Date, default:Date.now}
});

module.exports = Invite;


