var optimize = require('../lib/optimize')
  , decouple = require('../lib/decouple')
  , fixtures = require('./fixtures')
  , browserify = require('browserify')
  , assert = require('assert')
  , path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , SMConsumer = require('source-map').SourceMapConsumer
  , pad = function (index) {
      var n = new String(index).split('');
      while(n.length<5) {
        n.unshift('0');
      }
      return n.join('');
    }
  , printLines = function (lines) {
      lines = lines.split('\n');

      _.each(lines, function (line, index) {
        process.stdout.write('\n[' + pad(index) + '] ' + line);
      });

      process.stdout.write('\n');
    }
  , tests = {};

tests['optimizes simple file'] = function (next) {
  var bundle = new browserify();

  bundle.add(fixtures.entryScript('simple file'));

  bundle.bundle({debug: true}, function (err, data) {
    assert.ifError(err);

    var minified = optimize(data);

    /*
    console.log('---- Original File ----');
    printLines(data);

    console.log('---- Minified File ----');
    printLines(minified.code);
    */

    fs.writeFileSync(fixtures.bundledFile('simple file'), minified.code);
    fs.writeFileSync(fixtures.bundledMap('simple file'), minified.map);

    next();
  });
};

tests['optimizes complex file'] = function (next) {
  var bundle = new browserify();

  bundle.add(fixtures.entryScript('complex file'));

  bundle.bundle({debug: true}, function (err, data) {
    assert.ifError(err);

    var minified = optimize(data, {
      map: 'bundle.map'
    , file: 'bundle.js'
    });

    /*
    console.log('---- Original File ----');
    printLines(data);

    console.log('---- Minified File ----');
    printLines(minified.code);
    */

    fs.writeFileSync(fixtures.bundledFile('complex file'), minified.code);
    fs.writeFileSync(fixtures.bundledMap('complex file'), minified.map);

    next();
  });
};

tests['optimizes backbone app'] = function (next) {
  var bundle = new browserify();

  bundle.add(fixtures.entryScript('backbone app'));

  bundle.transform(require('hbsfy'));

  bundle.bundle({debug: true}, function (err, data) {
    assert.ifError(err);

    var minified = optimize(data, {
      map: 'bundle.map'
    , file: 'bundle.js'
    , compressPaths: function (p) { return path.relative(fixtures.dir, p); }
    });

    fs.writeFileSync(fixtures.bundledFile('backbone app'), minified.code);
    fs.writeFileSync(fixtures.bundledMap('backbone app'), minified.map);

    next();
  });
};

module.exports = tests;
