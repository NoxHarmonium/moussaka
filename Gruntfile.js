'use strict';

module.exports = function (grunt) {
  var srcFiles = [
    'Gruntfile.js',
    'app.js',
    'api_modules/*.js',
    'tests/*.js',
    'schemas/*.js',
    'include/*.js'
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
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');

  grunt.registerTask('default', ['jsbeautifier', 'jshint']);


};
