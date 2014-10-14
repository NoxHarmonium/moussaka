(function (require, describe, it) {
  'use strict';
  var utils = require('../src/shared/utils.js');
  var expect = require('expect.js');
  var controls = require('../src/shared/controls.js');
  var _ = require('lodash');

  describe('Numeric control', function () {

    var type = 'float';
    var control = controls[type];
    var schema = {
      type: type,
      min: -50,
      max: 50,
      lockedValues: {}
    };
    var data = {
      values: {
        n: 3
      }
    };

    it('n == null', function () {
      data.values.n = null;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);
    });

    it('n < min', function () {
      data.values.n = schema.min - 10;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);
    });

    it('n == min', function () {
      data.values.n = schema.min;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(true);
    });

    it('n >= min && n <= max (0)', function () {
      data.values.n = schema.min + 1;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(true);
    });

    it('n >= min && n <= max (1)', function () {
      data.values.n = schema.max - 1;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(true);
    });

    it('apply n (locked)', function () {
      schema.lockedValues.n = true;
      var newData = {};
      control.apply(schema, data, newData);
      expect(newData.values.n)
        .to.be(undefined);
    });

    it('apply n (unlocked)', function () {
      schema.lockedValues.n = false;
      var newData = {};
      control.apply(schema, data, newData);
      expect(newData.values.n)
        .to.be(data.values.n);
    });

    it('n == max', function () {
      data.values.n = schema.max;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(true);
    });

    it('n > max', function () {
      data.values.n = schema.max + 10;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);
    });


  });

  describe('String control', function () {

    var type = 'string';
    var control = controls[type];
    var schema = {
      type: type,
      lockedValues: {}
    };
    var data = {
      values: {
        s: 'string'
      }
    };

    it('apply s (locked)', function () {
      schema.lockedValues.s = true;
      var newData = {};
      control.apply(schema, data, newData);
      expect(newData.values.s)
        .to.be(undefined);
    });

    it('apply s (unlocked)', function () {
      schema.lockedValues.s = false;
      var newData = {};
      control.apply(schema, data, newData);
      expect(newData.values.s)
        .to.be(data.values.s);
    });

    it('n == null', function () {
      data.values.s = null;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);
    });

  });

  describe('Boolean control', function () {

    var type = 'boolean';
    var control = controls[type];
    var schema = {
      type: type,
      lockedValues: {}
    };
    var data = {
      values: {
        b: 'false'
      }
    };

    it('apply b (locked)', function () {
      schema.lockedValues.b = true;
      var newData = {};
      control.apply(schema, data, newData);
      expect(newData.values.s)
        .to.be(undefined);
    });

    it('apply b (unlocked)', function () {
      schema.lockedValues.b = false;
      var newData = {};
      control.apply(schema, data, newData);
      expect(newData.values.s)
        .to.be(data.values.s);
    });

    it('b == null', function () {
      data.values.b = null;
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);
    });

    it('b == true', function () {
      data.values.b = 'true';
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(true);
    });

    it('b == false', function () {
      data.values.b = 'false';
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(true);
    });

    it('b != true|false', function () {
      data.values.b = 'False';
      var result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);

      data.values.b = 'True';
      result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);

      data.values.b = 5;
      result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);

      data.values.b = 'someotherstring';
      result = control.validate(schema, data);
      expect(result.success)
        .to.be(false);

    });

  });

  describe('Color control', function () {

    var type = 'color';
    var control = controls[type];
    var schema = {
      type: type,
      lockedValues: {}
    };
    var data = {
      values: {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      }
    };
    var keys = ['r', 'g', 'b', 'a'];
    var resetData = function () {
      _.each(keys, function (key) {
        data.values[key] = 0;
      });
    };

    it('n == null', function () {
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = null;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(false);

        data.values[key] = oldValue;
      });

    });

    it('n < 0', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = -1;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(false);

        data.values[key] = oldValue;
      });
    });

    it('n == 0', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = 0;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(true);

        data.values[key] = oldValue;
      });
    });

    it('n >= 0 && n <= 255 (0)', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = 1;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(true);

        data.values[key] = oldValue;
      });
    });

    it('n >= 0 && n <= 255 (1)', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = 254;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(true);

        data.values[key] = oldValue;
      });
    });

    it('apply keys (locked)', function () {
      resetData();
      _.each(keys, function (key) {
        schema.lockedValues[key] = true;

        var newData = {};
        control.apply(schema, data, newData);
        expect(newData.values[key])
          .to.be(undefined);

        schema.lockedValues[key] = false;
      });
    });

    it('apply keys (unlocked)', function () {
      resetData();
      _.each(keys, function (key) {
        schema.lockedValues[key] = false;

        var newData = {};
        control.apply(schema, data, newData);
        expect(newData.values[key])
          .to.be(data.values[key]);

        schema.lockedValues[key] = true;
      });
    });

    it('n == 255', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = 255;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(true);

        data.values[key] = oldValue;
      });
    });

    it('n > 255', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = 256;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(false);

        data.values[key] = oldValue;
      });
    });

  });

  describe('Position control', function () {
    var type = 'position';
    var control = controls[type];
    var schema = {
      type: type,
      lockedValues: {}
    };
    var data = {
      values: {
        x: 0,
        y: 0,
        z: 0
      }
    };
    var keys = ['x', 'y', 'z'];
    var resetData = function () {
      _.each(keys, function (key) {
        data.values[key] = 0;
      });
    };

    it('n == null', function () {
      resetData();
      _.each(keys, function (key) {
        var oldValue = data.values[key];
        data.values[key] = null;

        var result = control.validate(schema, data);
        expect(result.success)
          .to.be(false);

        data.values[key] = oldValue;
      });

    });

    it('apply keys (locked)', function () {
      resetData();
      _.each(keys, function (key) {
        schema.lockedValues[key] = true;

        var newData = {};
        control.apply(schema, data, newData);
        expect(newData.values[key])
          .to.be(undefined);

        schema.lockedValues[key] = false;
      });
    });

    it('apply keys (unlocked)', function () {
      resetData();
      _.each(keys, function (key) {
        schema.lockedValues[key] = false;

        var newData = {};
        control.apply(schema, data, newData);
        expect(newData.values[key])
          .to.be(data.values[key]);

        schema.lockedValues[key] = true;
      });
    });

  });


})(require, describe, it);
