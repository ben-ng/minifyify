var concat = require('concat-stream')
  , fixtures = require('./fixtures')
  , decouple = require('../lib/decouple')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , browserify = require('browserify')
  , validate = require('sourcemap-validator')
  , minifyify = require('../lib')

  // Helpers
  , compileApp
  , testApp
  , clean = function () {
      utils.file.rmRf( path.join(fixtures.buildDir, 'apps'), {silent: true});
      utils.file.mkdirP( path.join(fixtures.buildDir, 'apps'), {silent: true});
    }

  // Tests
  , tests = {
      "before": clean
    };

compileApp = function (appname, method, map, next) {

  if(typeof map == 'function') {
    next = map;
    map = 'bundle.map.json';
  }

  var bundle = new browserify()
    , opts = {
        compressPaths: function (p) {
          return path.relative(path.join(__dirname, 'fixtures', appname), p);
        }
      , map: map
      };

  bundle.add(fixtures.entryScript(appname));

  bundle = bundle
            .transform(require('hbsfy'))
            .bundle({debug: map !== false})

  if(method == 'stream') {
    bundle
      .pipe(minifyify(opts))
      .pipe(concat(function (data) {
        var decoupled = decouple(data, {noConsumer: true, map: opts.map});
        next(decoupled.code, decoupled.map);
      }));
  }
  // Callback
  else {
    bundle
      .pipe(minifyify(opts, function (err, src, map) {
        assert.ifError(err);
        next(src, map);
      }));
  }
};

/**
* Builds, uploads, and validates an app
*/
testApp = function(appname, method, cb) {
  var filename = fixtures.bundledFile(appname)
    , mapname = fixtures.bundledMap(appname)
    , destdir = fixtures.bundledDir(appname);

  // Compile lib
  compileApp(appname, method, function (min, map) {
    // Write to the build dir
    var appdir = path.join(fixtures.buildDir, 'apps', appname);

    utils.file.mkdirP( appdir, {silent: true});

    utils.file.cpR(fixtures.scaffoldDir
      , path.join(fixtures.buildDir, 'apps'), {rename:appname, silent:true});
    utils.file.cpR(path.dirname(fixtures.entryScript(appname))
      , path.join(fixtures.buildDir, 'apps'), {rename:appname, silent:true});
    fs.writeFileSync( path.join(destdir, path.basename(filename)), min );
    fs.writeFileSync( path.join(destdir, path.basename(mapname)), map );

    assert.doesNotThrow(function () {
      validate(min, map);
    }, appname + ' should not throw');

    cb();
  });
};

tests['simple file'] = function (next) {
  testApp('simple file', 'stream', next);
};

tests['complex file'] = function (next) {
  testApp('complex file', 'cb', next);
};

tests['native libs'] = function (next) {
  testApp('native libs', 'stream', next);
};

tests['backbone app'] = function (next) {
  testApp('backbone app', 'cb', next);
};

tests['transformed app'] = function (next) {
  testApp('transformed app', 'stream', next);
};

tests['opts.map = false cb'] = function (next) {
  compileApp('simple file', 'cb', false, function (min, map) {
    assert.ok(min);
    assert.ok(map == null);
    next();
  });
};

module.exports = tests;