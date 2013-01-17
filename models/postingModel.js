/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var Posting = new Schema({
  imageUrl:{type:String},
  userId:{type:ObjectId},
  nickname:String,
  comments:[
    {
      nickname:String,
      text:String
    }
  ],
  createdAt:{type:Date, default:Date.now}
});

module.exports = Posting;


