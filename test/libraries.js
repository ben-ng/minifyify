var _ = require('lodash')
  , fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , validate = require('../lib/validate')
  , minify = require('../lib/minify')
  , enhanceMap = require('../lib/enhance')

  // Constants.. I want destructuring..
  , config = require('./config')
  , red = config.red
  , green = config.green
  , reset = config.reset
  , validatorUrl = config.validatorUrl
  , fileUrl = config.fileUrl
  , compilers = config.compilers

  // Helpers
  , compileLib
  , validate
  , testLib
  , clean = function () {
      utils.file.rmRf( path.join(fixtures.buildDir, 'libraries'), {silent: true});
      utils.file.mkdirP( path.join(fixtures.buildDir, 'libraries'), {silent: true});
    }

  // Tests
  , tests = {
    "before": clean
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
    , srcs = []
    , compile;

  // Helper function, compiles a single file
  compile = function (compiler, next) {
    var srcDest = path.join(fixtures.buildDir
          , 'libraries', filename + '.' + compiler + '.min.js')
        origSrcDest = path.join(fixtures.buildDir
          , 'libraries', filename + '.js')
        , mapDest = path.join(fixtures.buildDir
          , 'libraries', filename + '.' + compiler + '.map.json')
      , opts = {
          file: filename + '.js'
        , map: filename + '.' + compiler + '.map.json'
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

    //data = strip(data);

    minify[compiler](data, function (code, map) {
      // Compress paths and set comments/file

      map = enhanceMap(map, opts.file, data);
      code+='\n//@ sourceMappingURL='+opts.map;
      fs.writeFileSync(srcDest, code);
      fs.writeFileSync(mapDest, map);

      // Copy original source over
      fs.writeFileSync(origSrcDest, data);

      srcs.push({src:data, min:code, map:map, compiler:compiler});

      next();
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
  chain.last=function () {
    cb(srcs)
  };
  chain.run();
};

/**
* Builds, uploads, and validates a lib
*/
testLib = function(filename, cb) {
  // Compile lib
  compileLib(filename, function (srcs) {
    assert.doesNotThrow(function () {
      _.each(srcs, function (src) {
        var srcObj = {}
        srcObj[filename+'.js'] = src.src;
        validate.validate(srcObj, src.min, src.map, src.compiler);
      });
    });

    cb();
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
