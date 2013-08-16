var _ = require('lodash')
  , fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , browserify = require('browserify')
  , validate = require('../lib/validate')
  , minifyify = require('../lib/minifyify')

  // Constants.. I want destructuring..
  , config = require('./config')
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
    };

compileApp = function (appname, cb) {
  var encAppname = encodeURIComponent(appname)
    , bundle = new browserify()
    , appDir = path.join(fixtures.buildDir, appname)
    , encAppDir = path.join(fixtures.buildDir, encAppname)
    , filename = fixtures.bundledFile(appname)
    , mapname = fixtures.bundledMap(appname)
    , destdir = fixtures.bundledDir(appname)
    , opts = {
        file: path.relative(encAppDir, fixtures.bundledFile(encAppname))
      , map: path.relative(encAppDir, fixtures.bundledMap(encAppname))
      , transforms: [require('hbsfy')]
      };

  bundle.add(fixtures.entryScript(appname));

  minifyify(bundle, opts, function (code, map, sourcesContent) {
    utils.file.mkdirP(destdir)
    utils.file.cpR(fixtures.scaffoldDir
      , path.join(fixtures.buildDir, 'apps'), {rename:appname, silent:true});
    utils.file.cpR(path.dirname(fixtures.entryScript(appname))
      , path.join(fixtures.buildDir, 'apps'), {rename:appname, silent:true});
    fs.writeFileSync( path.join(destdir, path.basename(filename)), code );
    fs.writeFileSync( path.join(destdir, path.basename(mapname)), map );

    cb(code, map, sourcesContent);
  });
};

/**
* Builds, uploads, and validates an app
*/
testApp = function(appname, cb) {
  // Compile lib
  compileApp(appname, function (code, map, sourcesContent) {
    assert.doesNotThrow(function () {
      validate.validate(sourcesContent, code, map, 'uglify');

      cb();
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