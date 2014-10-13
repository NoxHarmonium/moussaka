(function (module, require) {
  'use strict';

  var util = require('util');
  var extend = require('extend');
  var BaseResource = require('./baseResource.js');
  /*
    app.get('/users/:user/', userApi.getUser);
    app.del('/users/:user/', userApi.deleteUser);
    app.put('/users/:user/', userApi.putUser);
    */

  module.exports = ['$http',
    function ($http) {

      var User = function (data) {
        this.base = BaseResource;
        this.base();
        // TODO: Validation?

        extend(this, data);
      };

      // Inherit from BaseResource
      util.inherits(User, BaseResource);

      // Static Methods

      User.get = function (email) {
        return $http.get('/users/' + email + '/')
          .then(function (response) {
            return new User(response.data.data);
          }, BaseResource.handleError);
      };

      User.delete = function (email) {
        return $http.delete('/users/' + email + '/')
          .then(
            function (response) {
              return response;
            }, BaseResource.handleError);
      };

      User.login = function (email, password) {
        return $http.post('/login/', {
            username: email,
            password: password
          })
          .then(
            function (response) {
              // TODO: Return user object on login
              // to prevent two calls
              return response;
            }, BaseResource.handleError);
      };

      User.logout = function () {
        return $http.post('/logout/')
          .then(function (response) {
            return response;
          }, BaseResource.handleError);
      };

      // Instance Methods

      User.prototype.create = function (password) {
        // TODO: Validation?
        var that = this;
        return $http.put('/users/' + that.username + '/',
          extend({}, that, {password: password}))
          .then(function (response) {
            return that;
          }, BaseResource.handleError);
      };

      User.prototype.delete = function () {
        return User.delete(this.username);
      };

      User.prototype.login = function (password) {
        return User.login(this.username, password);
      };

      User.prototype.changePassword =
        function (oldPassword, newPassword) {
          var that = this;
          return $http.post('/users/' + that.username + '/' +
              '/password/', {
                'oldPassword': oldPassword,
                'newPassword': newPassword
              })
            .then(function (response) {
              return that;
            }, BaseResource.handleError);
      };

      User.prototype.resetPassword = function () {
        var that = this;
        return $http.post('/users/' + that.username +
            '/resetpassword/')
          .then(function (response) {
            return that;
          }, BaseResource.handleError);
      };

      return User;

    }
  ];

})(module, require);
