var _ = require('lodash')
  , fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , request = require('request')
  , minify = require('../lib/minify')
  , transform = require('../lib/transform')
  , deploy = require('./config/envoy')

  // Constants
  , uuid = utils.string.uuid(5)
  , red = '\033[31m'
  , green = '\033[32m'
  , reset = '\033[0m'
  , validatorUrl = 'https://sourcemap-validator.herokuapp.com/validate.json?url='
  , fileUrl = 'http://travisci.s3-website-us-east-1.amazonaws.com/'
  , compilers = ['gcc', 'uglify']

  // Helpers
  , compileLib
  , validate
  , testLib

  // Tests
  , tests = {
    "before": function () {
      utils.file.rmRf( path.join(fixtures.buildDir, 'libraries') );
      utils.file.mkdirP( path.join(fixtures.buildDir, 'libraries') );
    }
  };

/**
* Builds a lib into the build dir
* filename [String] - The library's name
* cb [Function] - Called after finishing
*/
compileLib = function (filename, cb) {
  var file = path.join(fixtures.dir, 'libraries', filename + '.js')
    , chain
    , chainParams = []
    , compile;

  // Helper function, compiles a single file
  compile = function (compiler, next) {
    var srcDest = path.join(fixtures.buildDir
        , 'libraries', filename + '.' + uuid + '.' + compiler + '.min.js')
      , mapDest = path.join(fixtures.buildDir
        , 'libraries', filename + '.' + uuid + '.' + compiler + '.map.json')
      , opts = {
          file: path.basename(filename)
        , map: path.basename(mapDest)
        , compressPaths: function (p) {
            try {
              return path.relative( path.join(fixtures.dir, 'libraries'), p );
            }
            catch (e) {
              console.error(p);
              throw new Error('Invalid path');
            }
          }
        }
      , data = fs.readFileSync(file).toString();

    minify[compiler](data, function (fcode, fmap) {
      // Compress paths and set comments/file
      transform(opts, fcode, fmap, function (code, map) {
        fs.writeFileSync(srcDest, code);
        fs.writeFileSync(mapDest, map);

        next();
      });
    });
  }

  utils.file.mkdirP(path.join(fixtures.buildDir, 'libraries'));

  _.each(compilers, function (compiler) {
    chainParams.push({
      func: compile
    , args: [compiler]
    , callback: null
    });
  });

  chain = new utils.async.AsyncChain(chainParams);
  chain.last=cb;
  chain.run();
};

/**
* Validates a lib
*/
validateLib = function (filename, compiler, cb) {
  // Validate!
  request.get({
        url: validatorUrl + encodeURIComponent(fileUrl
           + filename + '.' + uuid + '.' + compiler + '.min.js')
      , json: true
      }
    , function (err, resp, body) {
      assert.ifError(err);
      assert.strictEqual(body.report.warnings.length, 0
        , red+String.fromCharCode(parseInt(2192,16)) +' expected zero '+compiler+' warnings, got:\n'
          + JSON.stringify(body.report.warnings, null, 2) + reset);
      assert.strictEqual(body.report.errors.length, 0
        , red+String.fromCharCode(parseInt(2192,16)) +' expected zero '+compiler+' errors, got:\n'
          + JSON.stringify(body.report.errors, null, 2) + reset);

      console.log(green+String.fromCharCode(parseInt(2192,16)) +' '+ compiler +' '+ String.fromCharCode(parseInt(2713,16))+reset);

      cb();
    });
};

/**
* Builds, uploads, and validates a lib
*/
testLib = function(filename, cb) {
  // Compile lib
  compileLib(filename, function () {
    // Deploy the directory
    deploy(path.join(fixtures.buildDir, 'libraries'), function (err, log) {
      assert.ifError(err);

      var chain
        , chainParams = [];

      _.each(compilers, function (compiler) {
        chainParams.push({
          func: validateLib
        , args: [filename, compiler]
        , callback: null
        });
      });

      chain = new utils.async.AsyncChain(chainParams);
      chain.last = cb;
      chain.run();
    });
  });
};

tests['Backbone.js'] = function (next) {
  testLib('Backbone', next);
};

tests['jQuery'] = function (next) {
  testLib('Jquery', next);
};

tests['lo-dash'] = function (next) {
  testLib('Lodash', next);
};

tests['Underscore.js'] = function (next) {
  testLib('Underscore', next);
};

module.exports = tests;
