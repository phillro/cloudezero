var conf = require('../etc/config.js'),
    userModel = require('./user'),
    mongoose = require('mongoose');

var dbConnStr = 'mongodb://' + conf.mongo.user + ':' + conf.mongo.password + '@' + conf.mongo.host + ':' + conf.mongo.port + '/' + conf.mongo.dbName;

// load models
exports.user = mongoose.model('user', userModel);

// connect
mongoose.connect(dbConnStr);