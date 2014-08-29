'use strict';

module.exports = function (grunt) {
  var srcFiles = [
    'Gruntfile.js',
    'app.js',
    'server.js',
    'api_modules/*.js',
    'tests/*.js',
    'schemas/*.js',
    'include/*.js',
    'shared/*.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsbeautifier: {
      files: srcFiles,
      options: {
        js: {
          braceStyle: 'collapse',
          breakChainedMethods: true,
          e4x: true,
          evalCode: false,
          indentChar: ' ',
          indentLevel: 0,
          indentSize: 2,
          indentWithTabs: false,
          jslintHappy: true,
          keepArrayIndentation: false,
          keepFunctionIndentation: false,
          maxPreserveNewlines: 10,
          preserveNewlines: true,
          spaceBeforeConditional: true,
          spaceInParen: false,
          unescapeStrings: false,
          wrapLineLength: 80,
          goodStuff: true

        }
      }
    },
    jshint: {
      files: srcFiles,
      options: {
        bitwise: true,
        curly: true,
        eqeqeq: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noarg: true,
        nonew: true,
        quotmark: 'single',
        undef: true,
        unused: false,
        strict: true,
        globalstrict: false,
        trailing: true,
        maxlen: 80,
        globals: {
          describe: true, // mocha
          it: true //mocha
        },
        node: true,
        devel: true,

      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          bail: true,
          colors: true,
          timeout: 30000
        },
        src: [
          'tests/utils.test.js',
          'tests/controlValidation.test.js',
          'tests/userApi.test.js',
          'tests/projectApi.test.js',
          'tests/deviceApi.test.js',
          'tests/profileApi.test.js'
        ]
      }
    },
    compass: { // Task
      dev: { // target
        options: {
          sassDir: 'public/sass',
          cssDir: 'public/css',
          loadAll: 'public/sass/extensions'
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.registerTask('test', ['mochaTest']);
  //grunt.registerTask('compile', ['compass']);
  grunt.registerTask('all', [ /*'compass',*/ 'jsbeautifier', 'jshint',
    'mochaTest'
  ]);
  grunt.registerTask('default', ['jsbeautifier', 'jshint']);
  grunt.registerTask('lint', ['jsbeautifier', 'jshint']);



};
