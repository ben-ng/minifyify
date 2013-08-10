/**
* Tests for sourcemaps
*/

var assert = require('assert')
  , path = require('path')
  , browserify = require('browserify')
  , through = require('through')
  , minifyify = require('../')
  , fixtures = require('./fixtures')
  , domain = require('domain')
  , fs = require('fs')
  , SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , tests;

tests = {
  'fails to consume when not in debug mode': function (next) {
    var bundle = new browserify()
      , minifier = new minifyify
      , d = domain.create()
      , failTimeout;

    bundle.add( fixtures.entryScript('simple file') );
    bundle.transform(minifier.transformer);

    // Expect to catch the error
    d.on('error', function (e) {
      clearTimeout(failTimeout);

      assert.strictEqual(e.toString()
        , 'Error: Cannot consume when browserify is not in debug mode'
        , 'there should be a helpful error message');

      next();
    });

    // Try to consume output, should trigger error inside domain
    d.run(function () {
      bundle.bundle().pipe(minifier.consumer(function (code, map) {
        //Don't matter, shouldn't ever reach here anyways
        assert.fail('the consumer callback should not have been called');
      }));
    });

    // Fail this test in 1 second
    failTimeout = setTimeout(function () {
      assert.fail('there should be an error consuming without debug:true');
    }, 1000);
  }
, 'consumes in debug mode': function (next) {
    var bundle = new browserify()
      , minifier = new minifyify
      , d = domain.create();

    bundle.add( fixtures.entryScript('simple file') );
    bundle.transform(minifier.transformer);

    // We don't expect any errors
    d.on('error', function (e) {
      assert.fail('there should be no errors, but this happened: ' + e);
    });

    // Try to consume output, should trigger error inside domain
    d.run(function () {
      bundle.bundle({debug: true}).pipe(minifier.consumer(function (code, map) {
        //Don't matter, shouldn't ever reach here anyways
        assert.ok('the consumer callback was called');

        next();
      }));
    });
  }
, 'transforms sourcemap': function (next) {
    var bundle = new browserify()
      , bundledFile = fixtures.bundledFile('complex file')
      , bundledMap = fixtures.bundledMap('complex file')
      , minifier = new minifyify({
          source: bundledFile
        , map: path.basename(bundledMap)
        , transformPaths: function (filePath) {
            return path.relative(fixtures.dir, filePath);
          }
        })
      , d = domain.create();

    bundle.add( fixtures.entryScript('complex file') );
    bundle.transform(minifier.transformer);

    // We don't expect any errors
    d.on('error', function (e) {
      assert.fail('there should be no errors, but this happened: ' + e);
    });

    // Try to consume output, should trigger error inside domain
    d.run(function () {
      bundle.bundle({debug: true})
      .pipe(minifier.consumer(function (code, map) {
        assert.ok('the consumer callback was called');

        var consumer = new SMConsumer(map);

        if(process.env.debug) {
          var bundledPage = path.join(path.dirname(bundledFile), 'index.html');
          console.log(' [DEBUG] Writing output to fixture directory');
          console.log('  bundle: ' + path.relative(process.cwd(), bundledFile));
          console.log('  map:    ' + path.relative(process.cwd(), bundledMap));
          console.log('  open "' + path.relative(process.cwd(), bundledPage) + '" in your browser dev tools');

          fs.writeFileSync(bundledFile, code);
          fs.writeFileSync(bundledMap, map);
        }

        next();
      }));
    });
  }
};

module.exports = tests;