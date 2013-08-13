var _ = require('lodash')
  , fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , request = require('request')
  , minify = require('../lib/minify')
  , deploy = require('./config/envoy')
  , SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , SMGenerator = SM.SourceMapGenerator
  , red = '\033[31m'
  , green = '\033[32m'
  , reset = '\033[0m'
  , tests = {}
  , compilers = ['gcc', 'uglify']
  , validatorUrl = 'https://sourcemap-validator.herokuapp.com/validate.json?url='
  , fileUrl = 'http://travisci.s3-website-us-east-1.amazonaws.com/'
  , transform
  , compileLib
  , validate
  , testLib;

/**
* Transforms source code and a map
* opts [Object] - {file: string, map: string, compressPaths: function}
* code [String] - The code to transform
* map [String] - The map to tranform
* cb [Function] - Called after transformation is done
*/
transform = function (opts, code, map, cb) {
  var consumer = new SMConsumer(map)
    , generator = new SMGenerator({file: opts.file});

  consumer.eachMapping(function (mapping) {
    if(!mapping.source) {
      console.error(red+'WARNING: Mapping needs a source\n\
GCC might have encountered a license or unremovable comment\n\
Remove it to get rid of this warning!\n'+JSON.stringify(mapping,null,2)+reset);
      return;
    }

    var newMapping = {
        generated: {
          line: mapping.generatedLine
        , column: mapping.generatedColumn
        }
      , original: {
          line: mapping.originalLine
        , column: mapping.originalColumn
        }
      , source: opts.compressPaths(mapping.source)
      , name: mapping.name
      };

    src=mapping.source;
  });

  generator.setSourceContent(opts.compressPaths(opts.file), code);

  code = code + '\n//# sourceMappingURL=' + opts.map + '\n';
  map = JSON.parse( generator.toString() );
  map.file = opts.file;
  map = JSON.stringify(map);

  cb(code, map);
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
    var srcDest = path.join(fixtures.buildDir, 'libraries', filename + '.' + compiler + '.min.js')
      , mapDest = path.join(fixtures.buildDir, 'libraries', filename + '.' + compiler + '.map.json')
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
        url: validatorUrl + encodeURIComponent(fileUrl + filename + '.' + compiler + '.min.js')
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
