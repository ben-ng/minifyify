var Minifyify
  , _ = require('lodash')
  , utils = require('utilities')
  , through = require('through')
  , browserify = require('browserify')
  , fs = require('fs')
  , path = require('path')
  , btoa = require('btoa')
  , minify = require('./minify')
  , transform = require('./transform')
  , decouple = require('./decouple')
  , noop = function(d, cb){
      if(d)
        this.queue(d)
      if(cb)
        cb();
    }
  , bundleIntoTempDir;

/*
* Bundles into a temporary directory
* and returns the path to the directory
* @param bundle {Browserify} - What you get from `new Browserify`
* @param [opts] {Object} - Options from Minifyify()
* @param cb {Function} - Called after bundling with params [<String> tmpdir, <Array> entryScripts]
*/
bundleIntoTempDir = function (bundle, opts, cb) {
      // Listen to browserify events and track all the files and packages used
  var files = {}
    , onFile = function (file, id, parent) { files[file]={file:file, isPackage:!parent}; };

  _.each(opts.transforms, function (transform) {
    bundle.transform(transform);
  });

  bundle
  .on('file',onFile)
  .on('package',onFile)
  .bundle()
  .pipe(through(noop, function () {
    var self = this
      , tmpdir = require('osenv').tmpdir()
      , chain
      , chainParams = []
      , loadFile;

    // Loads a file
    copyFile = function (source, destination, next) {
      var buff = []
        , write = function (d) {
            buff.push(d)
          }
        , end = function () {
            var stream = this
              , afterMin = function (code, map) {
                  code+='\n//@ sourceMappingURL=data:application/json;base64,'+btoa(map.toString())+'\n';
                  stream.queue(code);
                  stream.queue(null);
                };

            switch(opts.minifier) {
              case 'uglify':
                minify.uglify(buff.join('\n'), afterMin);
              break;
              case 'gcc':
                minify.gcc(buff.join('\n'), afterMin);
              break;
              default:
                throw new Error('Unknown minifier, use `uglify` or `gcc`');
            }
          };

      fs.createReadStream(source)
      .pipe(through(write, end))
      .pipe( fs.createWriteStream(destination).on('finish', next) );
    };

    // Convert to array of AsyncChain params
    chainParams = _.map(files, function (f) {
      var dest = path.join(tmpdir, opts.compressPaths(f.file))
        , dir = path.dirname(dest);

      if(f.isPackage) {
        return {
          args: [0] //Dummy
        , func: noop
        , callback: null
        };
      }
      else {
        utils.file.mkdirP( dir );

        return {
          args: [f, dest]
        , func: copyFile
        , callback: null
        };
      }
    });

    chain = new utils.async.AsyncChain(chainParams);
    chain.last = function () {
      // After all files have been minified and copied to the temporary dir
      self.queue(null);

      cb(tmpdir, _.clone(bundle._entries));
    };
    chain.run();
  }));
};

/**
* Browserifyminifyify!
* ```
* var bundle = new browserify();
* bundle.add('entry.js');
* minifyify(bundle, opts, function (code, map) {
*   // Write to filesystem here
* });
* ```
* @param bundle {Browserify} - What you get from `new browserify()`
* @param [opts] {Object} - Options for minification
*   @param [opts.file] {String} - URL to generated source
*   @param [opts.map] {String} - URL to source map
*   @param [opts.transforms] {Array} - Array of transforms
*   @param [opts.minifier] {String} - Minifier to use
*     , 'uglify' (default) or 'gcc' (needs Java)
*   @param [opts.compressPaths] {Function} - Transform source paths in the map
* @param cb {Function} - Callback with signature function(code, map)
*/
Minifyify = function (bundle, opts, cb) {
      // All minifyify options are optional, here are the defaults
  var defaults = {
          file: 'bundle.js'
        , map: 'bundle.map'
        , minifier: 'uglify'
        , transforms: []
        , compressPaths: function (p) {
            return path.relative(process.cwd(), p);
          }
        }

        // Called after everything is done
      , next = function (code, map) {
          transform(opts, code, map, cb);
        };

  opts = opts || {}
  _.defaults(opts, defaults);

  bundleIntoTempDir(bundle, opts, function (tmpdir, entryScripts) {
    var newBundle = new browserify();

    _.each(entryScripts, function (entryScript) {
      newBundle.add(entryScript);
    });

    _.each(opts.transforms, function (transform) {
      newBundle.transform(transform);
    });

    newBundle.bundle({debug:true}, function (err, data) {
      if(err) throw err;

      var decoupled = decouple(data, opts);

      transform(opts, decoupled.code, decoupled.map, cb);
    });
  });
};

module.exports = Minifyify;
