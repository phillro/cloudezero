/*
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var ChatMessage = new Schema({
  'nickname':{type:String},
  'message':{type:String},
  'createdAt':{type:Date, default:Date.now}
});

module.exports = ChatMessage;


