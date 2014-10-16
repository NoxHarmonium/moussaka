(function (module, require) {
  'use strict';

  var util = require('util');
  var extend = require('extend');
  var BaseResource = require('./baseResource.js');
  var _ = require('lodash');

  module.exports = ['$http',
    function ($http) {

      var Device = function (data) {
        this.base = BaseResource;
        this.base();
        // TODO: Validation?

        this._id = '';
        this.projectId = '';
        this.projectVersion = '';
        this.updatedAt = null;
        this.deviceName = '';
        this.currentState = null;
        this.deviceSchema = null;
        extend(this, data);
      };

      // Inherit from BaseResource
      util.inherits(Device, BaseResource);

      // Static Methods

      Device.get = function (projectId, deviceId) {
        return $http.get('/projects/' + projectId +
            '/devices/' + deviceId + '/')
          .then(function (response) {
            return new Device(response.data.data);
          }, BaseResource.handleError);
      };

      Device.getAll = function (projectId, queryVars) {
        return $http({
            url: '/projects/' + projectId + '/devices/',
            method: 'GET',
            params: queryVars
          })
          .then(function (response) {
            var data = response.data;
            var devices = [];
            _.each(data.data, function (deviceData) {
              devices.push(new Device(deviceData));
            });
            return {
              devices: devices,
              totalRecords: data.control.totalRecords
            };
          }, BaseResource.handleError);
      };

      // Instance Methods

      Device.prototype.create = function () {
        // TODO: Validation?
        var that = this;
        return $http.put('/projects/', that)
          .then(function (response) {
            that._id = response.data._id;
            // The only admin should be current user
            // at this point, there shouldn't be any
            // users.
            that.admins = response.data.admins;
            return that;
          }, BaseResource.handleError);
      };

      Device.prototype.update = function () {
        var that = this;
        console.log('Sending update: ', JSON.stringify(that));
        return $http.post('/projects/' + this._id + '/', that)
          .then(function (response) {
            return that;
          }, BaseResource.handleError);

      };

      return Device;
    }
  ];
})(module, require);
