/**
* Tests for minification
*/

var assert = require('assert')
  , browserify = require('browserify')
  , through = require('through')
  , minifyify = require('../')
  , fixtures = require('./fixtures')
  , tests;

tests = {
  'does not minify when minify=false': function (next) {
    var unminifiedBundle = new browserify()
      , minifiedBundle = new browserify()
      , minifier = new minifyify( {minify: false} ) // !!!
      , minifiedLength = 0
      , unminifiedLength = 0
      , ended = 0;

    minifiedBundle.add( fixtures.entryScript('simple file') );
    unminifiedBundle.add( fixtures.entryScript('simple file') );

    minifiedBundle.transform( minifier.transformer );

    minifiedBundle.bundle().pipe((function () {
      return through(write, end);

      function write(data) {
        minifiedLength += data.length;
      }
    }()));

    unminifiedBundle.bundle().pipe((function () {
      return through(write, end);

      function write(data) {
        unminifiedLength += data.length;
      }
    }()));

    function end() {
      ended++;

      if(ended === 2) {
        assert.strictEqual(unminifiedLength, minifiedLength, 'output is the same length');

        next();
      }
    }
  }
, 'minifies by default': function (next) {
    var unminifiedBundle = new browserify()
      , minifiedBundle = new browserify()
      , minifier = new minifyify()
      , minifiedLength = 0
      , unminifiedLength = 0
      , ended = 0;

    minifiedBundle.add( fixtures.entryScript('simple file') );
    unminifiedBundle.add( fixtures.entryScript('simple file') );

    minifiedBundle.transform( minifier.transformer );

    minifiedBundle.bundle().pipe((function () {
      return through(write, end);

      function write(data) {
        minifiedLength += data.length;
      }
    }()));

    unminifiedBundle.bundle().pipe((function () {
      return through(write, end);

      function write(data) {
        unminifiedLength += data.length;
      }
    }()));

    function end() {
      ended++;

      if(ended === 2) {
        assert.ok(unminifiedLength > minifiedLength, 'minified output is smaller');

        next();
      }
    }
  }
};

module.exports = tests;
