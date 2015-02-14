'use strict';

var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  prettify = require('gulp-jsbeautifier'),
  mocha = require('gulp-spawn-mocha'),
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
  gutil = require('gulp-util'),
  bowerFiles = require('bower-files'),
  ngAnnotate = require('gulp-ng-annotate'),
  uglify = require('gulp-uglify'),
  cssmin = require('gulp-cssmin'),
  gulpif = require('gulp-if');



var isWatching = false;
var development =
  config.code_generation.minify;

var bowerFilesOpts = {
  join: {fonts: ['eot', 'woff', 'svg', 'ttf']}
};

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
    //'tests/projectApi.test.js',
    //'tests/deviceApi.test.js',
    //'tests/profileApi.test.js'
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
  bowerCssDest: './public/css',
  bowerManifest: 'bower.json',
  manualBowerCss: [
    'bower_components/jquery-ui/themes/base/base.css',
    'bower_components/jquery-ui/themes/base/core.css',
    'bower_components/jquery-ui/themes/base/slider.css',
    'bower_components/jquery-ui/themes/eggplant/theme.css'
  ]
};

var onError = function (err) {
  gutil.beep();
  console.log(gutil.colors.red(err));
};

var browserifyOptions = {
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
    .pipe(gulpif(!development, cssmin()))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('bowerJsDeps', function () {
  gulp.src(bowerFiles(bowerFilesOpts).js)
    .pipe(concat('libs.js'))
    .pipe(gulpif(!development, ngAnnotate()))
    .pipe(gulpif(!development, uglify()))
    .pipe(gulp.dest(paths.browserifyDest));
});

gulp.task('bowerCssDeps', function () {
  gulp.src(
    bowerFiles(bowerFilesOpts).css
      .concat(paths.manualBowerCss)
    )
    .pipe(concat('libs.css'))
    .pipe(gulpif(!development, cssmin()))
    .pipe(gulp.dest(paths.bowerCssDest));
});

gulp.task('bowerFontDeps', function () {
  gulp.src(bowerFiles(bowerFilesOpts).fonts)
    .pipe(gulp.dest(paths.fontDest));
});

gulp.task('browserifyApp', ['jshint'], function (cb) {
  // Compile the main app bundle
  var b = browserify(browserifyOptions);
  b.ignore('jquery');
  b.add(paths.browserifySrc);

  b.bundle()
    .pipe(source('app.js'))
    .pipe(gulpif(!development, ngAnnotate()))
    .pipe(gulpif(!development, uglify()))
    .pipe(gulp.dest(paths.browserifyDest))
    .on('end', cb);
});

gulp.task('test', ['compile'], function () {
  return gulp.src(paths.tests, {
      read: false
    })
    .pipe(mocha({
      R: 'spec',
      c: true,
      t: 30000,
      env: {
        NODE_ENV: 'testing'
      }
    }));
});

gulp.task('watch', function () {
  isWatching = true;
  gulp.watch(paths.scripts, ['browserifyApp']);
  gulp.watch(paths.lessDir, ['less']);
  gulp.watch(paths.bowerManifest,
    ['bowerJsDeps', 'bowerCssDeps', 'bowerFontDeps']);
});

gulp.task('watchLess', function () {
  isWatching = true;
  gulp.watch(paths.lessDir, ['less']);
});

gulp.task('default', ['all']);
gulp.task('compile', ['bowerJsDeps', 'bowerCssDeps', 'bowerFontDeps',
  'browserifyApp', 'less']);
gulp.task('all', ['test', 'prettify']);

// Hack to stop gulp from hanging after mocha test
// Follow:
// https://github.com/gulpjs/gulp/issues/167
// https://github.com/sindresorhus/gulp-mocha/issues/1
// https://github.com/sindresorhus/gulp-mocha/issues/54
// gulp.on('stop', function () {
//   if (!isWatching) {
//     process.nextTick(function () {
//       process.exit(0);
//     });
//   }
// });
