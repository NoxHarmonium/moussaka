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

        extend(this, data);
      };

      // Inherit from BaseResource
      util.inherits(Project, BaseResource);

      // Static Methods

      Project.get = function (id) {
        return $http.get('/projects/' + id + '/')
          .then(function (response) {
            return new Project(response.data);
          }, BaseResource.handleError);
      };

      Project.getAll = function (id) {
        return $http.get('/projects/')
          .then(function (response) {
            var projects = [];
            _.each(response.data, function (projectData) {
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
            return that;
          }, BaseResource.handleError);
      };

      Project.prototype.update = function () {
        var that = this;
        return $http.post('/projects/' + this.id + '/', that)
          .then(function (response) {
            return that;
          }, BaseResource.handleError);

      };

      return Project;
    }
  ];
})(module, require);
