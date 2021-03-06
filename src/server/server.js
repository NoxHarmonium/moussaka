(function (require, module) {
  'use strict';

  var serverModule = {
    starting: false,
    started: false,
    server: null,
    logFile: process.stdout
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

    var express = require('express');
    var favicon = require('serve-favicon');
    var logger = require('morgan');
    var methodOverride = require('method-override');
    var session = require('express-session');
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var errorHandler = require('errorhandler');
    var lactate = require('lactate');
    var cors = require('cors');

    var config = require('../shared/config.js');
    var userApi = require('./api/userApi.js');
    var projectApi = require('./api/projectApi.js');
    var profileApi = require('./api/profileApi.js');
    var deviceApi = require('./api/deviceApi.js');
    var path = require('path');
    var colors = require('colors');
    var passport = require('passport');
    var auth = require('./api/auth.js');
    var dbAccess = require('./include/dbAccess.js');
    var utils = require('../shared/utils');
    var i18n = require('i18next');
    var Q = require('q');

    // Errors
    var customErrorHandler = require('./api/customErrorHandler.js');
    var MongooseValidationError =
      require('mongoose/lib/error/validation');
    var InvalidQueryParams =
      require('./include/invalidQueryParams.js');

    /**
     * Main application
     */

    i18n.init({
      ns: {
        namespaces: ['ns.app'],
        defaultNs: 'ns.app'
      },
      resSetPath: 'locales/__lng__/new.__ns__.json',
      saveMissing: true,
      debug: false, // Set to true for very verbose messages
      sendMissingTo: 'fallback',
      supportedLngs: 'en-US',
      lng: config.locale
    });

    // TODO: Resolve why this breaks promise flow in API
    // https://github.com/kriskowal/q/issues/579
    Q.longStackSupport = config.q_long_stacktrace;

    var app = express();
    var rootDir = process.cwd();
    var staticFiles = lactate.dir(path.join(rootDir, './public/'), {});

    // Make jade render pretty
    // Stops whitespace dependant inline-block elements
    // from breaking.
    app.locals.pretty = true;

    // all environments
    app.set('port', process.env.PORT || config.listen_port || 3000);
    app.set('views', path.join(rootDir, './views/'));
    app.set('view engine', 'jade');
    app.use(favicon(path.join(rootDir, './public/img/favicon/favicon.ico')));
    app.use(logger('dev', {
      stream: serverModule.logFile
    }));
    app.use(methodOverride());
    app.use(session({
      resave: true,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET || config.session_secret
    }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));
    app.use(multer());

    app.use(staticFiles.toMiddleware());

    app.use(passport.initialize());
    app.use(passport.session());
    auth.init();

    // If the apikey is set, use it rather than a persistant
    // login (i.e. browser)
    app.use(auth.apiKeyAuthoriser);
    app.use(auth.ensureAuth);

    app.use(i18n.handle);

    // development only
    if (config.show_friendly_errors) {
      app.use(errorHandler());
    }



    dbAccess.init(function (err) {
      if (err) {
        console.log(
          'Error: Database is required to run. Halting application'
          .red);
        next(err);
      }
    });

    deviceApi.resetDeviceCount();

    i18n.registerAppHelper(app);

    // Cross Domain
    app.use(cors({
      origin: config.access_control_allow_origin
    }));
    app.options('*', cors());

    //
    // User API
    //
    app.param('user', userApi.pUser);

    app.get('/users/:user/', userApi.getUser);
    app.delete('/users/:user/', userApi.deleteUser);
    app.put('/users/:user/', userApi.putUser);
    app.post('/users/:user/password/', userApi.changePassword);
    app.post('/users/:user/resetpassword/', userApi.resetPassword);
    app.post('/logout/', userApi.logout);
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
    app.post('/projects/:projectId/', projectApi.updateProject);
    app.delete('/projects/:projectId/', projectApi.removeProject);
    app.put('/projects/', projectApi.addProject);
    app.put('/projects/:projectId/users/:user/',
      projectApi.addProjectUser);
    app.delete('/projects/:projectId/users/:user/',
      projectApi.removeProjectUser);
    app.put('/projects/:projectId/admins/:user/',
      projectApi.addProjectAdmin);
    app.delete('/projects/:projectId/admins/:user/',
      projectApi.removeProjectAdmin);
    if (config.enable_test_exts) {
      app.get('/test/project_api/reset/', projectApi.resetTests);
    }

    //
    // Profile API
    //
    app.param('profileId', profileApi.pProfileId);
    app.use('/projects/:projectId/profiles/', profileApi.qDeviceId);

    app.get('/projects/:projectId/profiles/',
      profileApi.getProfiles);
    app.get('/projects/:projectId/profiles/:profileId/',
      profileApi.getProfile);
    app.delete('/projects/:projectId/profiles/:profileId/',
      profileApi.deleteProfile);
    app.put('/projects/:projectId/profiles/',
      profileApi.saveProfile);
    if (config.enable_test_exts) {
      app.get('/test/profile_api/reset/', profileApi.resetTests);
    }

    //
    // Device API
    //
    app.param('deviceId', deviceApi.pDeviceId);
    app.put('/projects/:projectId/devices/', deviceApi.registerDevice);
    app.post('/projects/:projectId/devices/:deviceId/',
      deviceApi.registerDevice);
    app.get('/projects/:projectId/devices/', deviceApi.listDevices);
    app.get('/projects/:projectId/devices/' +
      ':deviceId/', deviceApi.getDevice);
    app.delete('/projects/:projectId/devices/' +
      ':deviceId/', deviceApi.deregisterDevice);
    app.get('/projects/:projectId/devices/' +
      ':deviceId/schema/', deviceApi.getSchema);
    app.get('/projects/:projectId/devices/' +
      ':deviceId/state/', deviceApi.getCurrentState);
    app.put('/projects/:projectId/sessions/' +
      ':deviceId/', deviceApi.startSession);
    app.delete('/projects/:projectId/sessions/' +
      ':deviceId/', deviceApi.stopSession);
    app.post('/projects/:projectId/sessions/' +
      ':deviceId/updates', deviceApi.queueUpdate);
    app.get('/projects/:projectId/sessions/' +
      ':deviceId/updates', deviceApi.getUpdates);
    if (config.enable_test_exts) {
      app.get('/test/device_api/reset/', deviceApi.resetTests);
    }

    // Error Catchers

    // Handle certain exceptions
    app.use(customErrorHandler);

    // Rendered HTML pages
    app.get('/views/auth', function (req, res) {
      res.render('auth', {
        allow_signup: config.allow_signup
      });
    });

    app.get('/views/test', function (req, res) {
      res.render('test');
    });

    app.get('/views/dashboard', function (req, res) {
      var user = req.user || {};
      res.render('dashboard', {
        userFirstName: user.firstName,
        userLastName: user.lastName
      });
    });

    app.param('partialName', function (req, res, next, partialName) {
      var user = req.user || {};
      res.render('partials/' + partialName, {
        user: user
      });
    });

    app.param('controlName', function (req, res, next, controlName) {
      var user = req.user || {};
      res.render('controls/' + controlName, {
        user: user
      });
    });

    app.get('/views/partials/:partialName', function (req, res) {});
    app.get('/views/controls/:controlName', function (req, res) {});

    serverModule.server = app.listen(app.get('port'), function () {
      console.log('Express server listening on port ' + app.get('port')
        .toString()
        .blue);
      serverModule.started = true;
      next(null, serverModule.server);
    });
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
