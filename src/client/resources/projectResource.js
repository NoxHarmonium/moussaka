(function (module, require) {
  'use strict';

  var util = require('util');
  var extend = require('extend');
  var BaseResource = require('./baseResource.js');
  var _ = require('lodash');

  module.exports = ['$http',
    function ($http) {
      // TODO: Implement!

      var Project = function (data) {
        this.base = BaseResource;
        this.base();
        // TODO: Validation?

        this.name = '';
        this.description = '';
        this.users = [];
        this.admin = [];

        extend(this, data);
      };

      // Inherit from BaseResource
      util.inherits(Project, BaseResource);

      // Static Methods

      Project.get = function (id) {
        return $http.get('/projects/' + id + '/')
          .then(function (response) {
            return new Project(response.data.data);
          }, BaseResource.handleError);
      };

      Project.getAll = function (queryVars) {
        return $http({
            url: '/projects/',
            method: 'GET',
            params: queryVars
          })
          .then(function (response) {
            var projects = [];
            _.each(response.data.data, function (projectData) {
              projects.push(new Project(projectData));
            });
            return projects;
          }, BaseResource.handleError);
      };

      Project.delete = function (id) {
        return $http.delete('/projects/' + id + '/')
          .then(
            function (response) {
              return response;
            }, BaseResource.handleError);
      };

      // Instance Methods

      Project.prototype.create = function () {
        // TODO: Validation?
        var that = this;
        return $http.put('/projects/', that)
          .then(function (response) {
            that._id = response.data.data._id;
            // The only admin should be current user
            // at this point, there shouldn't be any
            // users.
            that.admins = response.data.data.admins;
            return that;
          }, BaseResource.handleError);
      };

      Project.prototype.update = function () {
        var that = this;
        console.log('Sending update: ', JSON.stringify(that));
        return $http.post('/projects/' + this._id + '/', that)
          .then(function (response) {
            return that;
          }, BaseResource.handleError);

      };

      Project.prototype.addAdmin = function (email) {
        var that = this;
        return $http.put('/projects/' +
            this._id + '/admins/' + email + '/')
          .then(function (response) {
            that.admins.push(email);
            return that;
          }, BaseResource.handleError);
      };

      Project.prototype.addUser = function (email) {
        var that = this;
        return $http.put('/projects/' +
            this._id + '/users/' + email + '/')
          .then(function (response) {
            that.users.push(email);
            return that;
          }, BaseResource.handleError);
      };

      Project.prototype.removeAdmin = function (email) {
        var that = this;
        return $http.delete('/projects/' +
            this._id + '/admins/' + email + '/')
          .then(function (response) {
            _.pull(that.admins, email);
            return that;
          }, BaseResource.handleError);
      };

      Project.prototype.removeUser = function (email) {
        var that = this;
        return $http.delete('/projects/' +
            this._id + '/users/' + email + '/')
          .then(function (response) {
            _.pull(that.users, email);
            return that;
          }, BaseResource.handleError);
      };

      return Project;
    }
  ];
})(module, require);
