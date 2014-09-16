(function (require, module) {
  'use strict';

  var serverModule = {
    starting: false,
    started: false,
    server: null
  };


  serverModule.start = function (next) {

    if (serverModule.started) {
      console.log('The server has already started.'.green);
      return next(null, serverModule.server);
    }

    if (serverModule.starting) {
      return next(new Error(
        'An instance of the server is already attempting to start.'.yellow
      ));
    }

    serverModule.starting = true;

    /**
     * Module dependencies.
     */

    var config = require('./include/config');
    var express = require('express');
    var userApi = require('./api_modules/userApi.js');
    var projectApi = require('./api_modules/projectApi.js');
    var profileApi = require('./api_modules/profileApi.js');
    var deviceApi = require('./api_modules/deviceApi.js');
    var http = require('http');
    var path = require('path');
    var colors = require('colors');
    var passport = require('passport');
    var auth = require('./api_modules/auth.js');
    var dbAccess = require('./include/dbAccess');
    var utils = require('./include/utils');

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
    auth.init();

    // If the apikey is set, use it rather than a persistant
    // login (i.e. browser)
    app.use(auth.apiKeyAuthoriser);

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



    //
    // User API
    //
    app.param('user', userApi.pUser);

    app.get('/users/:user/', userApi.getUser);
    app.del('/users/:user/', userApi.deleteUser);
    app.put('/users/:user/', userApi.putUser);
    app.post('/users/:user/password/', userApi.changePassword);
    app.post('/users/:user/resetpassword/', userApi.resetPassword);
    app.get('/logout/', userApi.logout);
    app.post('/login/', userApi.login);
    if (config.enable_test_exts) {
      app.get('/test/user_api/reset/', userApi.resetTests);
      app.post('/test/user_api/expirePassword/:user/',
        userApi.expireTempPassword);
    }

    //
    // Project API
    //
    app.param('projectId', projectApi.pProjectId);

    app.get('/projects/', projectApi.listProjects);
    app.get('/projects/:projectId/', projectApi.getProject);
    app.del('/projects/:projectId/', projectApi.removeProject);
    app.put('/projects/', projectApi.addProject);
    app.put('/projects/:projectId/users/:user/',
      projectApi.addProjectUser);
    app.del('/projects/:projectId/users/:user/',
      projectApi.removeProjectUser);
    app.put('/projects/:projectId/admins/:user/',
      projectApi.addProjectAdmin);
    app.del('/projects/:projectId/admins/:user/',
      projectApi.removeProjectAdmin);
    if (config.enable_test_exts) {
      app.get('/test/project_api/reset/', projectApi.resetTests);
    }

    //
    // Profile API
    //
    app.param('profileId', profileApi.pProfileId);

    app.get('/projects/:projectId/profiles/',
      profileApi.getProfiles);
    app.get('/projects/:projectId/profiles/:profileId/',
      profileApi.getProfile);
    app.del('/projects/:projectId/profiles/:profileId/',
      profileApi.deleteProfile);
    app.put('/projects/:projectId/profiles/',
      profileApi.saveProfile);
    if (config.enable_test_exts) {
      app.get('/test/profile_api/reset/', profileApi.resetTests);
    }

    //
    // Device API
    //
    app.param('deviceMacAddr', deviceApi.pDeviceMacAddr);
    app.put('/projects/:projectId/devices/' +
      ':deviceMacAddr/', deviceApi.registerDevice);
    app.get('/projects/:projectId/devices/', deviceApi.listDevices);
    app.get('/projects/:projectId/devices/' +
      ':deviceMacAddr/', deviceApi.getDevice);
    app.del('/projects/:projectId/devices/' +
      ':deviceMacAddr/', deviceApi.deregisterDevice);
    app.get('/projects/:projectId/devices/' +
      ':deviceMacAddr/schema/', deviceApi.getSchema);
    app.put('/projects/:projectId/sessions/' +
      ':deviceMacAddr/', deviceApi.startSession);
    app.del('/projects/:projectId/sessions/' +
      ':deviceMacAddr/', deviceApi.stopSession);
    app.post('/projects/:projectId/sessions/' +
      ':deviceMacAddr/updates', deviceApi.queueUpdate);
    app.get('/projects/:projectId/sessions/' +
      ':deviceMacAddr/updates', deviceApi.getUpdates);
    if (config.enable_test_exts) {
      app.get('/test/device_api/reset/', deviceApi.resetTests);
    }

    // Rendered HTML pages
    app.get('/views/auth', function (req, res) {
      res.render('auth');
    });

    app.get('/views/test', function (req, res) {
      res.render('test');
    });

    app.get('/views/dashboard', function (req, res) {
      res.render('dashboard');
    });


    app.get('/views/partials/login', function (req, res) {
      res.render('partials/login');
    });

    app.get('/views/partials/createAccount', function (req, res) {
      res.render('partials/createAccount');
    });

     app.get('/views/partials/listProjects', function (req, res) {
      res.render('partials/listProjects');
    });

    var server = http.createServer(app);

    server.listen(app.get('port'), function () {
      console.log('Express server listening on port ' + app.get('port')
        .toString()
        .blue);
      serverModule.started = true;
      next(null, serverModule.server);
    });

    serverModule.server = server;
  };

  serverModule.stop = function () {
    if (serverModule.started) {
      serverModule.server.close(function () {
        serverModule.started = false;
      });
    }
  };

  module.exports = serverModule;

})(require, module);
