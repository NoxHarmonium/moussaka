(function (require, describe, it) {
  'use strict';
  var utils = require('../include/utils.js');
  var expect = require('expect.js');

  var arrayA = [{
    a: 1,
    b: '2',
    c: {
      d: 4,
      e: 5
    },
    f: [1, 2, 3]
  }, {
    a: 11,
    b: '22',
    c: {
      d: 44,
      e: 55
    },
    f: [11, 22, 33]
  }, {
    a: 111,
    b: '222',
    c: {
      d: 444,
      e: 555
    },
    f: [111, 222, 333]
  }];

  // Same as A but rearranged
  var arrayB = [{
      f: [111, 222, 333],
      a: 111,
      b: '222',
      c: {
        d: 444,
        e: 555
      }
    }, {
      a: 1,
      b: '2',
      c: {
        d: 4,
        e: 5
      },
      f: [1, 2, 3]
    }, {
      a: 11,
      c: {
        d: 44,
        e: 55
      },
      f: [11, 22, 33],
      b: '22'

    }

  ];

  // Different to both a and b
  var arrayC = [{
    a: 1,
    b: '2',
    c: {
      d: 4,
      e: 5
    },
    f: [1, 9, 3]
  }, {
    a: 11,
    b: '22',
    c: {
      d: 14,
      e: 55
    },
    f: [11, 22, 33]
  }, {
    a: 111,
    b: '232',
    c: {
      d: 444,
      e: 555
    },
    f: [111, 222, 333]
  }];


  describe('arrayMatch tests', function () {

    it('(arrayA, null) === false', function () {
      expect(utils.arrayMatch(arrayA, null))
        .to.be(false);
    });

    it('(null, arrayA) === false', function () {
      expect(utils.arrayMatch(null, arrayA))
        .to.be(false);
    });

    it('(null, null) === true', function () {
      expect(utils.arrayMatch(null, null))
        .to.be(true);
    });

    it('(arrayA, arrayA) === true', function () {
      expect(utils.arrayMatch(arrayA, arrayA))
        .to.be(true);
    });

    it('(arrayA, arrayB) === true', function () {
      expect(utils.arrayMatch(arrayA, arrayB))
        .to.be(true);
    });

    it('(arrayA, arrayC) === false', function () {
      expect(utils.arrayMatch(arrayA, arrayC))
        .to.be(false);
    });

  });


})(require, describe, it);
