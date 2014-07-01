var plugin
  , fs = require('fs')
  , ReadableStream = require('stream').Readable;

plugin = function (bundle, minifyifyOpts) {
  minifyifyOpts = minifyifyOpts || {};

  var minifyify = require('./minifier')
    , minifier = new minifyify(minifyifyOpts)
    , oldBundle = bundle.bundle
    , bundleStarted = false;

  // Hook up the transform so we know what sources were used
  bundle.transform({global: true}, minifier.transformer);

  // Proxy the bundle's bundle function so we can capture its output
  bundle.bundle = function (bundleOpts, bundleCb) {

    var bundleStream
      , minifiedStream = new ReadableStream();

    // Normalize options
    if(typeof bundleOpts == 'function') {
      bundleCb = bundleOpts;
      bundleOpts = {};
    }
    else {
      bundleOpts = bundleOpts || {};
    }

    // Force debug mode
    bundleOpts.debug = true;

    /*
    * If no callback was given, require that the user
    * specified a path to write the sourcemap out to
    */
    if(!bundleStarted && !bundleCb && !minifyifyOpts.output) {
      throw new Error('Minifyify: opts.output is required since no callback was given');
    }

    // Call browserify's bundle function and capture the output stream
    bundleStream = oldBundle.call(bundle, bundleOpts);

    /*
    * Browserify has this mechanism that delays bundling until all deps
    * are ready, and that means bundle gets called twice. The extra time,
    * it should just pass thru the data instead of trying to consume it.
    */
    if(bundleStarted) {
      return bundleStream;
    }

    if(!bundleStarted) {
      bundleStarted = true;
    }

    /*
    * Pipe browserify's output into the minifier's consumer
    * which has the ability to transform the sourcemap
    */
    bundleStream.pipe(minifier.consumer(function (err, src, map) {
      var finish;

      // A callback we'll need later
      finish = function () {
        // Otherwise, throw if anything bad happened
        if(err) { throw err; }

        // Push the minified src to our proxied stream
        minifiedStream._read = function () {
          minifiedStream.push(src);
          minifiedStream.push(null);
        }
        minifiedStream.resume();
        minifiedStream.emit('readable');

        if(typeof bundleCb == 'function') {
          return bundleCb(err, src, map);
        }
      };

      // Write the sourcemap to the specified output location
      if(minifyifyOpts.minify && minifyifyOpts.output) {
        var writeStream = fs.createWriteStream(minifyifyOpts.output);

        // Delay completion until the map is written
        writeStream.on('close', finish);

        writeStream.write(map);
        writeStream.end();
      }
      else {
        finish();
      }
    }));

    minifiedStream.pause();

    // The bundle function should return our proxied stream
    return minifiedStream;
  };
};

module.exports = plugin;
