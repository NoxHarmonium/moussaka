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
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(result.success)
        .to.be(false);
    });

    it('n < min', function () {
      data.values.n = schema.min - 10;
      var result = control.validate(schema, data);
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(result.success)
        .to.be(false);
    });

    it('n == min', function () {
      data.values.n = schema.min;
      var result = control.validate(schema, data);
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(result.success)
        .to.be(true);
    });

    it('n >= min && n <= max (0)', function () {
      data.values.n = schema.min + 1;
      var result = control.validate(schema, data);
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(result.success)
        .to.be(true);
    });

    it('n >= min && n <= max (1)', function () {
      data.values.n = schema.max - 1;
      var result = control.validate(schema, data);
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(result.success)
        .to.be(true);
    });

    it('apply n (locked)', function () {
      schema.lockedValues.n = true;
      var newData = {
        values: {
          n: 789
        }
      };
      var oldDataValue = data.values.n;
      control.apply(schema, data, newData);
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(data.values.n)
        .to.equal(oldDataValue);
    });

    it('apply n (unlocked)', function () {
      schema.lockedValues.n = false;
      var newData = {
        values: {
          n: 789
        }
      };
      control.apply(schema, data, newData);
      console.log('data.values.n: ' + JSON.stringify(data.values.n));

      expect(data.values.n)
        .to.be(newData.values.n);
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
      var oldDataValue = data.values.s;

      schema.lockedValues.s = true;
      var newData = {
        values: {
          s: 'xyz'
        }
      };
      control.apply(schema, data, newData);
      expect(data.values.s)
        .to.equal(oldDataValue);
    });

    it('apply s (unlocked)', function () {
      schema.lockedValues.s = false;
       var newData = {
        values: {
          s: 'xyz'
        }
      };
      control.apply(schema, data, newData);
      expect(data.values.s)
        .to.equal(newData.values.s);
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
      var oldDataValue = data.values.b;

      schema.lockedValues.b = true;
      var newData = {
        values: {
          b: 'true'
        }
      };
      control.apply(schema, data, newData);
      expect(data.values.b)
        .to.be(oldDataValue);
    });

    it('apply b (unlocked)', function () {
      schema.lockedValues.b = false;
       var newData = {
        values: {
          b: true
        }
      };
      control.apply(schema, data, newData);
      expect(data.values.b)
        .to.equal(newData.values.b);
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

      var newData = {
        values: {
          r: 34,
          g: 46,
          b: 129,
          a: 222
        }
      };
      _.each(keys, function (key) {
        schema.lockedValues[key] = true;

        var oldDataValue = data.values[key];
        control.apply(schema, data, newData);
        expect(data.values[key])
          .to.equal(oldDataValue);

        schema.lockedValues[key] = false;
      });
    });

    it('apply keys (unlocked)', function () {
      resetData();
      var newData = {
        values: {
          r: 34,
          g: 46,
          b: 129,
          a: 222
        }
      };

      _.each(keys, function (key) {
        schema.lockedValues[key] = false;

        control.apply(schema, data, newData);
        expect(data.values[key])
          .to.be(newData.values[key]);

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
      var newData = {
        values: {
          x: 45,
          y: -34,
          z: 44.45
        }
      };
      _.each(keys, function (key) {
        schema.lockedValues[key] = true;

        var oldDataValue = data.values[key];
        console.log(JSON.stringify(data));
        control.apply(schema, data, newData);
        expect(data.values[key])
          .to.equal(oldDataValue);

        schema.lockedValues[key] = false;
      });
    });

    it('apply keys (unlocked)', function () {
      resetData();
      var newData = {
        values: {
          x: 45,
          y: -34,
          z: 44.45
        }
      };
      _.each(keys, function (key) {
        schema.lockedValues[key] = false;

        control.apply(schema, data, newData);
        expect(data.values[key])
          .to.equal(newData.values[key]);

        schema.lockedValues[key] = true;
      });
    });

  });


})(require, describe, it);
