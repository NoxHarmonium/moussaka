'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  prettify = require('gulp-jsbeautifier'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  changed = require('gulp-changed'),
  cache = require('gulp-cached'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify'),
  less = require('gulp-less'),
  config = require('./src/shared/config.js'),
  concat = require('gulp-concat'),
  bowerResolve = require('bower-resolve'),
  runSequence = require('run-sequence'),
  plumber = require('gulp-plumber'),
  gutil = require('gulp-util');



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
    './src/client/app.js',
  ],
  browserifyDest: 'public/js/',
  lessDir: 'public/less/**/*.less',
  lessSrc: [
    'public/less/kube.less',
    'public/less/auth.less',
    'public/less/dashboard.less',
    'public/less/font-awesome.less'
  ],
  fontSrc: [
    'bower_components/font-awesome/fonts/*'
  ],
  fontDest: 'public/fonts/',
  bowerCssSrc: [
    'bower_components/spectrum/spectrum.css'
  ],
  bowerCssDest: './public/css'
};

var onError = function (err) {
  gutil.beep();
  console.log(gutil.colors.red(err));
};

var browserifyOptions = {
  insertGlobals: true,
  debug: config.code_generation.browserify.debug
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

gulp.task('prettify', ['jshint'], function () {
  return gulp.src(paths.scripts, {
      base: './'
    })
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('less', function () {
  return gulp.src(paths.lessSrc, {
      base: './public/less/'
    })
    .pipe(cache('less'))
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(less({
      errorReporting: 'console',
      logLevel: 2
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('copyFonts', function () {
  return gulp.src(paths.fontSrc)
    .pipe(gulp.dest(paths.fontDest));
});

gulp.task('copyBowerCss', function () {
  return gulp.src(paths.bowerCssSrc)
    .pipe(gulp.dest(paths.bowerCssDest));
});

gulp.task('browserifyLibs', ['jshint'], function (cb) {
  // build out angular and jquery to a library file called libs.js
  bowerResolve.init(function () {
    var b = browserify(browserifyOptions);

    // Modules that only work globally and require shimming
    // (Denoted by underscore prefix)
    b.require(bowerResolve('angular'), {
      expose: '_angular'
    });
    b.require(bowerResolve('angular-ui-router'), {
      expose: '_angular-ui-router'
    });
    b.require(bowerResolve('angular-cookies'), {
      expose: '_angular-cookies'
    });
    b.require(bowerResolve('angular-breadcrumb'), {
      expose: '_angular-breadcrumb'
    });
    b.require(bowerResolve('spectrum'), {
      expose: '_spectrum'
    });
    b.require(bowerResolve('angular-spectrum-colorpicker'), {
      expose: '_angular-spectrum-colorpicker'
    });
    b.require(bowerResolve('kube'), {
      expose: '_kube'
    });
    // TODO: Replace with jQuery UI control
    b.require(bowerResolve('Tabslet'), {
      expose: '_tabslet'
    });
    b.require(bowerResolve('jquery-ui'), {
      expose: '_jquery-ui'
    });
    b.require(bowerResolve('angular-ui-slider'), {
      expose: '_angular-ui-slider'
    });

    // Modules that work well with requireJs
    b.require(bowerResolve('jquery'), {
      expose: 'jquery'
    });


    b.transform('deamdify');
    b.transform('debowerify');
    b.bundle()
      .pipe(source('libs.js'))
      .pipe(gulp.dest(paths.browserifyDest))
      .on('end', cb);
  });
});

gulp.task('browserifyApp', ['jshint'], function (cb) {
  // Compile the main app bundle using the libs bundle
  var b = browserify(browserifyOptions);
  b.add(paths.browserifySrc);
  b.external('_angular');
  b.external('_angular-ui-router');
  b.external('_angular-cookies');
  b.external('_angular-breadcrumb');
  b.external('_spectrum');
  b.external('_angular-spectrum-colorpicker');
  b.external('_kube');
  b.external('_tabslet');
  b.external('_jquery-ui');
  b.external('_angular-ui-slider');

  b.external('jquery');

  b.transform('deamdify');
  b.transform('debowerify');
  b.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(paths.browserifyDest))
    .on('end', cb);
});

gulp.task('browserifyAll', ['jshint'], function (callback) {
  runSequence(
    'browserifyLibs',
    'browserifyApp',
    callback
  );
});

gulp.task('test', ['compile'], function () {
  return gulp.src(paths.tests, {
      read: false
    })
    .pipe(mocha({
      reporter: 'spec',
      bail: true,
      colors: true,
      timeout: 30000
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function () {
  isWatching = true;
  gulp.watch(paths.scripts, ['browserifyApp']);
  gulp.watch(paths.lessDir, ['less']);
});

gulp.task('watchLess', function () {
  isWatching = true;
  gulp.watch(paths.lessDir, ['less']);
});

gulp.task('default', ['all']);
gulp.task('compile', ['browserifyAll', 'less', 'copyFonts', 'copyBowerCss']);
gulp.task('all', ['test', 'prettify']);

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
