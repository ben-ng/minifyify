var optimize = require('../lib/optimize')
  , decouple = require('../lib/decouple')
  , fixtures = require('./fixtures')
  , browserify = require('browserify')
  , assert = require('assert')
  , path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , utils = require('utilities')
  , SMConsumer = require('source-map').SourceMapConsumer

    // Debugging functions, pay no mind...
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

    // Bundles a file and writes it to the build dir
  , buildBundle = function (fixtureName, next) {
      var bundle = new browserify();

      bundle.add(fixtures.entryScript(fixtureName));

      bundle.bundle({debug: true}, function (err, data) {
        assert.ifError(err);

        var minified = optimize(data, {
          map: 'bundle.map'
        , file: 'bundle.js'
        , compressPaths: function (p) {
            if(p.indexOf('../../../node_modules')>=0) {
              return p.replace(/\.\.\/\.\.\/\.\.\/node_modules/,'../../node_modules');
            }
            else {
              return path.relative(path.dirname(fixtures.entryScript(fixtureName)), p);
            }
          }
        });

        utils.file.mkdirP(fixtures.bundledDir(fixtureName));
        utils.file.cpR(fixtures.scaffoldDir
          , path.dirname(fixtures.scaffoldDir)
          , {rename: path.basename(fixtures.bundledDir(fixtureName))});
        utils.file.cpR(path.dirname(fixtures.entryScript(fixtureName))
          , path.dirname(fixtures.scaffoldDir)
          , {rename: path.basename(fixtures.bundledDir(fixtureName))});
        fs.writeFileSync(fixtures.bundledFile(fixtureName), minified.code);
        fs.writeFileSync(fixtures.bundledMap(fixtureName), minified.map);

        next();
      });
    }

  , tests = {};

tests['optimizes simple file'] = function (next) {
  buildBundle('simple file', next);
};

tests['optimizes complex file'] = function (next) {
  buildBundle('complex file', next);
};

tests['optimizes backbone app'] = function (next) {
  buildBundle('backbone app', next);
};

module.exports = tests;
