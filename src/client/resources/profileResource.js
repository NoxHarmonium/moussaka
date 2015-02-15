(function (module, require) {
  'use strict';

  var util = require('util');
  var extend = require('extend');
  var BaseResource = require('./baseResource.js');
  var _ = require('lodash');

  module.exports = ['$http',
    function ($http) {

      var Profile = function (data) {
        this.base = BaseResource;
        this.base();
        // TODO: Validation?

        this._id = '';
        this.projectId = '';
        this.projectVersion = '';
        this.profileName = [];
        this.profileData = {};
        this.owner = {};

        extend(this, data);
      };

      // Inherit from BaseResource
      util.inherits(Profile, BaseResource);

      // Static Methods

      Profile.get = function (projectId, profileId) {
        return $http.get('/projects/' + projectId +
          '/profiles/' + profileId + '/')
          .then(function (response) {
            return new Profile(response.data.data);
          }, BaseResource.handleError);
      };

      Profile.getAll = function (projectId, queryVars) {
        return $http({
            url: '/projects/' + projectId + '/profiles/',
            method: 'GET',
            params: queryVars
          })
          .then(function (response) {
            var data = response.data;
            var profiles = [];
            _.each(data.data, function (projectData) {
              profiles.push(new Profile(projectData));
            });
            return {
              profiles: profiles,
              totalRecords: data.control.totalRecords
            };
          }, BaseResource.handleError);
      };


      // Instance Methods

      Profile.prototype.create = function (deviceId) {
        // TODO: Validation?
        var that = this;
        return $http.put('/projects/' + this.projectId +
          '/profiles/?deviceId=' + deviceId, that)
          .then(function (response) {
            that._id = response.data.data._id;
            return that;
          }, BaseResource.handleError);
      };

      // TODO: Why is delete sometimes an instance method (like here)
      // and sometimes static like projectResource?
      Profile.prototype.delete = function () {
        return $http.delete('/projects/' + this.projectId +
          '/profiles/' + this._id + '/')
          .then(
            function (response) {
              return response;
            }, BaseResource.handleError);
      };

      return Profile;
    }
  ];
})(module, require);
