var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var Posting = new Schema({
  imageUrl:{type:String},
  userId:{type:ObjectId},
  nickname:String,
  upvoters:[ObjectId],
  downvoters:[ObjectId],
  comments:[
    { userId:ObjectId,
      nickname:String,
      date:{type:Date, default:Date.now},
      text:String,
      upvoters:[ObjectId],
      downvoters:[ObjectId]}
  ],
  createdAt:{type:Date, default:Date.now}
});

module.exports = Posting;


