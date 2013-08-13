var _ = require('lodash')
  , fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , request = require('request')
  , browserify = require('browserify')
  , minifyify = require('../lib/minifyify')
  , deploy = require('./config/envoy')

  // Constants.. I want destructuring..
  , config = require('./config')
  , uuid = utils.string.uuid(5)
  , red = config.red
  , green = config.green
  , reset = config.reset
  , validatorUrl = config.validatorUrl
  , fileUrl = config.fileUrl
  , compilers = config.compilers

  // Helpers
  , compileApp
  , validateApp
  , testApp
  , clean = function () {
      utils.file.rmRf( path.join(fixtures.buildDir, 'apps'), {silent: true});
      utils.file.mkdirP( path.join(fixtures.buildDir, 'apps'), {silent: true});
    }

  // Tests
  , tests = {
      "before": clean
    , "after": clean
    };

compileApp = function (appname, cb) {
  var encAppname = encodeURIComponent(appname)
    , bundle = new browserify()
    , appDir = path.join(fixtures.buildDir, appname)
    , encAppDir = path.join(fixtures.buildDir, encAppname)
    , filename = fixtures.bundledFile(appname, uuid)
    , mapname = fixtures.bundledMap(appname, uuid)
    , destdir = fixtures.bundledDir(appname)
    , opts = {
        file: path.relative(encAppDir, fixtures.bundledFile(encAppname, uuid))
      , map: path.relative(encAppDir, fixtures.bundledMap(encAppname, uuid))
      , compressPaths: function (p) {
          try {
            return path.relative( path.join(fixtures.dir, appname), p );
          }
          catch (e) {
            console.error(p);
            throw new Error('Invalid path');
          }
        }
      };

  bundle.add(fixtures.entryScript(appname));

  minifyify(bundle, opts, function (code, map) {
    utils.file.mkdirP(destdir)
    utils.file.cpR(fixtures.scaffoldDir
      , path.join(fixtures.buildDir, 'apps'), {rename:appname, silent:true});
    utils.file.cpR(path.dirname(fixtures.entryScript(appname))
      , path.join(fixtures.buildDir, 'apps'), {rename:appname, silent:true});
    fs.writeFileSync( path.join(destdir, path.basename(filename)), code );
    fs.writeFileSync( path.join(destdir, path.basename(mapname)), map );

    cb();
  });
};

/**
* Validates an app
*/
validateApp = function (appname, compiler, cb) {
  // Validate!
  request.get({
        url: validatorUrl + encodeURIComponent(fileUrl
           + encodeURIComponent(appname) + '/bundle.' + uuid + '.min.js')
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
* Builds, uploads, and validates an app
*/
testApp = function(appname, cb) {
  // Compile lib
  compileApp(appname, function () {
    // Deploy the directory
    deploy(path.join(fixtures.buildDir, 'apps'), function (err, log) {
      assert.ifError(err);

      var chain
        , chainParams = [];

      _.each(compilers, function (compiler) {
        chainParams.push({
          func: validateApp
        , args: [appname, compiler]
        , callback: null
        });
      });

      chain = new utils.async.AsyncChain(chainParams);
      chain.last = cb;
      chain.run();
    });
  });
};

tests['simple file'] = function (next) {
  testApp('simple file', next);
};

tests['complex file'] = function (next) {
  testApp('complex file', next);
};

tests['native libs'] = function (next) {
  testApp('native libs', next);
};

tests['backbone app'] = function (next) {
  testApp('backbone app', next);
};

module.exports = tests;