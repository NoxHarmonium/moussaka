/**
 * Module dependencies.
 */

// Config

var config = require('./include/config');

var express = require('express');
var userApi = require('./api_modules/userApi.js');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var colors = require('colors');
var passport = require("passport");
var auth = require('./api_modules/auth.js');

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
app.use(passport.initialize());
app.use(passport.session());


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

// User API
app.param('user', userApi.pUser);

app.get('/users/', userApi.listUsers);
app.get('/users/:user/', userApi.getUser);
app.del('/users/:user/', userApi.deleteUser);
app.put('/users/:user/', userApi.putUser);
app.post('/users/:user/password/', userApi.changePassword);
app.post('/users/:user/resetpassword/', userApi.resetPassword);
app.get('/logout/', userApi.logout);
app.post('/login/', userApi.login);
if (config.enable_test_exts) {
  app.get('/test/user_api/testusers/', userApi.getTestUsers);
  app.get('/test/user_api/reset/', userApi.resetTests);
}

// Rendered HTML pages
app.get('/login', function (req, res) {
  res.render('login', {
    title: 'Login'
  });
});

http.createServer(app)
  .listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
