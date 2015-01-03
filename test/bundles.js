var fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , browserify = require('browserify')
  , validate = require('sourcemap-validator')
  , Minifyify = require('../lib/minifier')

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

compileApp = function (appname, map, next) {
  var opts = {
    compressPath: function (p) {
      return path.relative(path.join(__dirname, 'fixtures', appname), p);
    }
  };

  if(typeof map == 'function') {
    next = map;
    map = 'bundle.map.json';
    opts.map = map;
  }

  if (typeof map == 'object') {
    opts = utils.object.merge(opts, map)
  }

  var bundle = new browserify({debug: map !== false})
    , minifier = new Minifyify(opts);

  bundle.add(fixtures.entryScript(appname));

  bundle = bundle
            .transform(require('coffeeify'))
            .transform(require('hbsfy'))
            .transform(require('brfs'))
            .transform(minifier.transformer)
            .bundle()

  bundle.pipe(minifier.consumer(function (err, src, map) {
    if(err) {
      throw err;
    }

    next(src, map)
  }));
};

/**
* Builds, uploads, and validates an app
*/
testApp = function(appname, cb) {
  var filename = fixtures.bundledFile(appname)
    , mapname = fixtures.bundledMap(appname)
    , destdir = fixtures.bundledDir(appname);

  // Compile lib
  compileApp(appname, function (min, map) {
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
  testApp('simple file', next);
};

tests['complex file'] = function (next) {
  testApp('complex file', next);
};

tests['native libs'] = function (next) {
  testApp('native libs', next);
};

tests['brfs app'] = function (next) {
  testApp('brfs app', next);
};

/* Broken because of coffeescript 1.8.0..
 * See: https://github.com/jashkenas/coffeescript/issues/3681
 * See: https://github.com/jashkenas/coffeescript/issues/3672

tests['coffee app'] = function (next) {
  testApp('coffee app', next);
};

*/

tests['backbone app'] = function (next) {
  testApp('backbone app', next);
};

tests['transformed app'] = function (next) {
  testApp('transformed app', next);
};

tests['argument map = false should not produce a sourcemap'] = function (next) {
  compileApp('simple file', false, function (min, map) {
    assert.ok(min);
    assert.ok(map == null);
    next();
  });
};

tests['opts.map = false should not produce a sourcemap'] = function (next) {
  compileApp('simple file', { map : false }, function (min, map) {
    assert.ok(min);
    assert.ok(map == null);
    next();
  });
};

tests['opts.map = true should produce a sourcemap'] = function (next) {
  compileApp('simple file', { map : true }, function (min, map) {
    assert.ok(min);
    assert.ok(map);
    next();
  });
};

tests['opts.sourcesContent = false should produce a map without sourcesContent'] = function (next) {
  compileApp('simple file', { sourcesContent : false }, function (min, map) {
    map = JSON.parse(map, null, 4);
    assert.ok(min);
    assert.ok(map);
    assert.ok(map.sourcesContent == null);
    next();
  });
};

module.exports = tests;