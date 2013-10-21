(function (require, module) {
  'use strict';

  var serverModule = {
    starting: false,
    started: false,
    server: null
  };


  serverModule.start = function (next) {

    if (serverModule.started)
    {
      console.log('The server has already started.'.green);
      return next(null, serverModule.server);
    }

    if (serverModule.starting)
    {
      return next(new Error('An instance of the server is already attempting to start.'.yellow));
    }

    serverModule.starting = true;

    /**
     * Module dependencies.
     */

    var config = require('./include/config');
    var express = require('express');
    var userApi = require('./api_modules/userApi.js');
    var projectApi = require('./api_modules/projectApi.js');
    var http = require('http');
    var path = require('path');
    var colors = require('colors');
    var passport = require('passport');
    var auth = require('./api_modules/auth.js');
    var dbAccess = require('./include/dbAccess');

    /**
     * Main application
     */

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

    // development only
    if (config.show_friendly_errors) {
      app.use(express.errorHandler());
    }

    dbAccess.init(function (err) {
      if (err) {
        console.log(
          'Error: Database is required to run. Halting application'
          .red);
        next(err);
      }
    });

    auth.init();

    //
    // User API
    //
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

    //
    // Project API
    //
    app.param('projectName', projectApi.pProjectName);
    app.param('projectVersion', projectApi.pProjectVersion);
    app.get('/projects/', projectApi.listProjects);
    app.get('/projects/:projectName/:projectVersion/', projectApi.getProject);
    app.put('/projects/:projectName/:projectVersion/', projectApi.addProject);
    if (config.enable_test_exts) {
      app.get('/test/project_api/reset/', projectApi.resetTests);
    }

    // Rendered HTML pages
    app.get('/login', function (req, res) {
      res.render('login', {
        title: 'Login'
      });
    });

    serverModule.server = http.createServer(app)
      .listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port')
          .blue);
        serverModule.started = true;
        next(null, serverModule.server);
      });
  };

  module.exports = serverModule;

})(require, module);
