/**
 * Module dependencies.
 */

// Config

var config = require('./include/config');

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var colors = require('colors');

// Thanks http://stackoverflow.com/a/14049430

mongoose.connection.on("open", function (ref) {
  return console.log("Connected to mongo server!".green);
});

mongoose.connection.on("error", function (err) {
  console.log("Could not connect to mongo server!".yellow);
  console.log(err.message.red);
  process.exit(1);
});

try {
  mongoose.connect(config.mongo_url);
  var db = mongoose.connection;
  console.log("Started connection on " + (config.mongo_url)
    .cyan + ", waiting for it to open...".grey);
} catch (err) {
  console.log(("Setting up failed to connect to " + config.mongo_url)
    .red, err.message);
  process.exit(1);
}


var app = express();
exports.app_object = app;



// all environments
app.set('port', config.listen_port || process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({
  secret: 'keyboard cat'
}));

var auth = require('./api_modules/auth.js');
// Schemas
var user_api = require('./api_modules/user_api.js');

app.use(app.router);
app.use(require('stylus')
  .middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
  if (!err) return next();
  console.log("Unhandled error: ".red + err + "\n" + err.stack);
  res.send(500, {
    detail: err
  });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

app.get('/login', function (req, res) {
  res.render('login', {
    title: 'Login'
  });
});

http.createServer(app)
  .listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
