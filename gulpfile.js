'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  prettify = require('gulp-jsbeautifier'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  changed = require('gulp-changed'),
  cache = require('gulp-cached');

var paths = {
  scripts: [
    'app.js',
    'server.js',
    'api_modules/*.js',
    'tests/*.js',
    'schemas/*.js',
    'include/*.js',
    'shared/*.js',
    'gulpfile.js'
  ]
};

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
    .pipe(cache('format-js'))
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./'))
});


gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['jshint']);
});

gulp.task('default', ['jshint', 'prettify']);
