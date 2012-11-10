var conf = require('../etc/config.js'),
    inviteModel = require('./inviteModel'),
    postingModel = require('./postingModel'),
    userModel = require('./userModel'),
    mongoose = require('mongoose');

var dbConnStr = 'mongodb://' + conf.mongo.user +
    ':' + conf.mongo.password + '@' + conf.mongo.host +
    ':' + conf.mongo.port + '/' + conf.mongo.dbName;

// load models
exports.invite = mongoose.model('invite', inviteModel);
exports.posting = mongoose.model('posting', postingModel);
exports.user = mongoose.model('user', userModel);

// connect
mongoose.connect(dbConnStr);