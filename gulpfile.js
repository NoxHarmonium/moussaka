'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  prettify = require('gulp-jsbeautifier'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  changed = require('gulp-changed'),
  cache = require('gulp-cached'),
  browserify = require('gulp-browserify'),
  less = require('gulp-less'),
  config = require('./src/shared/config.js'),
  concat = require('gulp-concat');

var isWatching = false;

var paths = {
  scripts: [
    'gulpfile.js',
    'src/app.js',
    'src/server.js',
    'tests/*.js',
    'src/**/*.js'
  ],
  tests: [
    'tests/utils.test.js',
    'tests/controlValidation.test.js',
    'tests/initApi.test.js',
    'tests/userApi.test.js',
    'tests/projectApi.test.js',
    'tests/deviceApi.test.js',
    'tests/profileApi.test.js'
  ],
  browserifySrc: [
    'src/client/authModule.js', 
    'src/client/dashboardModule.js'
  ],
  browserifyDest: 'public/js/',
  lessDir: 'public/less/**/*.less',
  lessSrc: [ 
    'public/less/kube.less',
    'public/less/auth.less',
    'public/less/dashboard.less'
  ]
};

gulp.task('less', function () {
  return gulp.src(paths.lessSrc, { base: './' })
    .pipe(cache('less'))
    .pipe(less())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('browserify', function() {
    var debug = config.code_generation.browserify.debug;
    return gulp.src(paths.browserifySrc)
        .pipe(cache('browserify'))
        .pipe(browserify({
          insertGlobals : true,
          debug : debug
        }))
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(paths.browserifyDest));
});

gulp.task('jshint', function () {
  return gulp.src(paths.scripts, {
      base: './'
    })
    .pipe(cache('syntax-check'))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('prettify', function () {
  return gulp.src(paths.scripts, {
      base: './'
    })
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('test', function () {
  return gulp.src(paths.tests, {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec',
      bail: true,
      colors: true,
      timeout: 30000
    }));

});


gulp.task('watch', function () {
  isWatching = true;
  gulp.watch(paths.scripts, ['jshint', 'browserify']);
  gulp.watch(paths.lessDir, ['less']);
});

gulp.task('compile', ['jshint', 'browserify', 'less' ]);

gulp.task('default', ['jshint', 'prettify', 'browserify', 'less', 'test' ]);

// Hack to stop gulp from hanging after mocha test
// Follow:
// https://github.com/gulpjs/gulp/issues/167
// https://github.com/sindresorhus/gulp-mocha/issues/1
// https://github.com/sindresorhus/gulp-mocha/issues/54
gulp.on('stop', function () {
  if (!isWatching) {
    process.nextTick(function () {
      process.exit(0);
    });
  }
});
