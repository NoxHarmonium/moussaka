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
            return new User(response.data);
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

      User.prototype.create = function () {
        // TODO: Validation?
        var that = this;
        return $http.put('/users/' + that.username + '/', that)
          .then(function (response) {
            return that;
          }, BaseResource.handleError);
      };

      return User;

    }
  ];

})(module, require);
