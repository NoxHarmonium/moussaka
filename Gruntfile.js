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
    browserify: {
      options: {
        debug: true,
        //transform: ['reactify'],
        //extensions: ['.jsx'],
      },
      dev: {
        //options: {
        //  alias: ['react:']  // Make React available externally for dev tools
        //},
        src: ['client/authModule.js','client/projectModule.js'],
        dest: 'public/js/bundle.js'
      },
      //production: {
      //  options: {
      //    debug: false
      //  },
      //  src: '<%= browserify.dev.src %>',
      //  dest: 'build/bundle.js'
      //}
    },
    less: {
      development: {
        options: {
        },
        files: {
          "public/css/kube.css": "public/less/kube.less",
          "public/css/auth.css": "public/less/auth.less",
          "public/css/dashboard.css": "public/less/dashboard.less",
        }
      }
    },
    watch: {
      less: {
        files: ['public/less/**/*.less'],
        tasks: ['less'],
      },
      clientCode: {
        files: ['client/*.js'],
        tasks: ['browserify'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('compile', ['less', 'browserify']);
  grunt.registerTask('all', [ 'less', 'jsbeautifier', 'jshint',
    'mochaTest', 'browserify'
  ]);
  grunt.registerTask('default', ['jsbeautifier', 'jshint',
    'browserify']);
  grunt.registerTask('lint', ['jsbeautifier', 'jshint']);



};
