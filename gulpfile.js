'use strict';

require('babel/register');

var gulp = require('gulp'),
  lazypipe = require('lazypipe'),
  runSequence = require('run-sequence'),
  bump = require('gulp-bump'),
  watch = require('gulp-watch'),
  shell = require('gulp-shell'),
  ghpages = require('gulp-gh-pages'),
  mocha = require('gulp-mocha'),
  git = require('gulp-git'),
  tagVersion = require('gulp-tag-version'),
  jshint = require('gulp-jshint');

var testServer;

function getJSHintPipe(rc) {
  return lazypipe()
    .pipe(jshint, rc || '.jshintrc')
    .pipe(jshint.reporter, 'jshint-stylish')
    .pipe(jshint.reporter, 'fail');
}

function jsSourcePipe() {
  return gulp.src('src/**/*.js');
}

gulp.task('jshint', ['jshint:src', 'jshint:test', 'jshint:gulpfile']);

gulp.task('jshint:src', function() {
  return jsSourcePipe()
    .pipe(getJSHintPipe()());
});

gulp.task('jshint:test', function() {
  return gulp.src('test/**/*.js')
    .pipe(getJSHintPipe('test/.jshintrc')());
});

gulp.task('jshint:gulpfile', function() {
  return gulp.src('gulpfile.js')
    .pipe(getJSHintPipe()());
});

gulp.task('test:watch', function() {
  return gulp.watch(['test/*.js', 'src/**/*.js'], ['test']);
});

gulp.task('jsdoc:watch', function() {
  return gulp.watch(['src/**/*.js', 'tutorials/*'], ['jsdoc']);
});

gulp.task('jsdoc', shell.task(['./node_modules/jsdoc/jsdoc.js . -c ./jsdoc.json']));

gulp.task('bump', function() {
  return gulp.src('package.json')
    .pipe(bump({ type: gulp.env.type || 'patch' }))
    .pipe(gulp.dest('./'));
});

gulp.task('bump-commit', function() {
  var version = require('./package.json').version;
  return gulp.src(['package.json'])
    .pipe(git.commit('Release v' + version));
});

gulp.task('tag', function() {
  return gulp.src('package.json')
    .pipe(tagVersion());
});

gulp.task('release', function(cb) {
  runSequence(
    'jshint',
    'bump',
    'bump-commit',
    'tag',
    cb
  );
});

gulp.task('gh-pages', ['jsdoc'], function() {
  return gulp.src('doc/**/*')
    .pipe(ghpages());
});

gulp.task('mocha', function() {
  return gulp.src('test/**/*.js')
    .pipe(mocha());
});

gulp.task('default', ['test']);

gulp.task('test', function(cb) {
  runSequence('jshint', 'mocha', cb);
});

gulp.task('ci', ['test', 'jsdoc']);
