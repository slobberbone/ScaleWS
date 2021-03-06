/**
 * Module dependencies.
 */
var express = require('express'),
  http = require('http'),
  path = require('path'),
  app = express(),
  io = require('socket.io'),
  _ = require('underscore'),
  Backbone = require('backbone');
var mongoose = require('mongoose');
require('./config.js')(app, express, mongoose);

/**
 * Network configuration.
 */
var server = http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
var socketio = io.listen(server);
  socketio.set('log level', 1);


/**
 * App configuration.
 */
//Model
//Backbone model
var model = require('./app/models/Server.Measure.Model')(require('./app/models/Measure.Model')(Backbone));
var collection = new (require('./app/models/Measure.Collection')(Backbone,model));
//MongoDb model 
var modelDb = require('./app/models/modelDB')(mongoose, model);
//
// Override Backbone.sync :
Backbone.sync = require('./app/controllers/backboneServerSync')(modelDb);
collection.fetch(); //Sync the collection with the db
//
//Views
//create a Backbone.ServerView
require('./app/networkView/ServerBackboneView')(Backbone, _);
//extend from Backbone.ServerView
new (require('./app/networkView/socketView')(socketio, Backbone, _))({collection: collection});
new (require('./app/networkView/apiView')(app, "/"+model.getCollectionName(), Backbone, _, model.getCategoriesMasks()))({collection: collection});
new (require('./app/networkView/scaleView')(app, _, Backbone))({collection: collection});


/**
 * Routes configuration.
 */
//Client (index.html)
var client = require('./app/routes');
client.init(app);