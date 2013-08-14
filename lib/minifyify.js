var Minifyify
  , _ = require('lodash')
  , utils = require('utilities')
  , through = require('through')
  , browserify = require('browserify')
  , fs = require('fs')
  , path = require('path')
  , btoa = require('btoa')
  , domain = require('domain')
  , minify = require('./minify')
  , findRoot = require('./findRoot')
  , findSources = require('./findSources')
  , transform = require('./transform')
  , decouple = require('./decouple')
  , enhanceMap = require('./enhance')
  , noop = function(d, cb){
      if(d)
        this.queue(d)
      if(cb)
        cb();
    }
  , bundleIntoTempDir
  , copyFile;


/*
* Helper function, copies a file over to the temporary directory,
* minifying if needed
*/
copyFile = function (source, destination, opts, next) {
  var buff = []
    , write = function (d) {
        buff.push(d)
      }
    , end = function () {
        var stream = this
          , buffer = buff.join('')
          , afterMin = function (code, map) {

              // Enhance the map
              map = enhanceMap(map, source, buffer);

              code+='\n//@ sourceMappingURL=data:application/json;base64,'+btoa(map);
              stream.queue(code);
              stream.queue(null);
            };

          switch(opts.minifier) {
            case 'uglify':
              minify.uglify(buffer, afterMin);
            break;
            case 'gcc':
              minify.gcc(buffer, afterMin);
            break;
            default:
              throw new Error('Unknown minifier, use `uglify` or `gcc`');
          }
      }
    , minifyingThrough = through(write, end)
    , noopThrough = through(function(d){this.queue(d)});

  fs.createReadStream(source)
  .pipe( opts.minifier ? minifyingThrough : noopThrough )
  .pipe( fs.createWriteStream(destination).on('finish', next) );
};

/*
* Bundles into a temporary directory
* and returns the path to the directory
* @param bundle {Browserify} - What you get from `new Browserify`
* @param [opts] {Object} - Options from Minifyify()
* @param cb {Function} - Called after bundling with params [<String> tmpdir, <String> basedir, <Array> entryScripts]
*/
bundleIntoTempDir = function (bundle, opts, cb) {
  _.each(opts.transforms, function (transform) {
    bundle.transform(transform);
  });

  bundle
  .bundle({debug:true})
  .pipe(through(write, end));

  var brwsfyBuffer = [];

  function write(d) {
    brwsfyBuffer.push(d);
  };

  function end() {
    var self = this
      , tmpdir = path.join(require('osenv').tmpdir(), utils.string.uuid(5))
      , chain
      , chainParams = []
      , loadFile
      , basedir
      , bundleData = brwsfyBuffer.join('')
      , filesUnderBaseDir
      , files = {};

    // Pull apart the source map to discover the packages and files used
    files = findSources(bundleData);

    // Figure out the base directory
    basedir = findRoot(files);

    // Copy over all the package.json files we can find under this directory for browserify
    filesUnderBaseDir = _.filter(utils.file.readdirR(basedir), function (p) {
      return path.basename(p) === 'package.json';
    });

    files = files.concat(filesUnderBaseDir);

    files = _.map(files, function (file) {
      return {
        key: path.relative(basedir, file)
      , file: file
      };
    });

    // Convert to array of AsyncChain params
    chainParams = _.map(files, function (f) {
      var dest = path.join(tmpdir, f.key)
        , dir = path.dirname(dest)
        , modOpts = _.clone(opts);

      utils.file.mkdirP( dir );

      // Don't minify package.json files
      if(path.extname(f.file)==='.json')
        modOpts.minifier = false;

      return {
        args: [f.file, dest, modOpts]
      , func: copyFile
      , callback: null
      };
    });

    chain = new utils.async.AsyncChain(chainParams);
    chain.last = function () {
      // After all files have been minified and copied to the temporary dir
      self.queue(null);

      cb(tmpdir, basedir, _.clone(bundle._entries), files);
    };
    chain.run();
  }
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
    , hint = function (f) {
        console.log(' > ' + f);
      };

  opts = opts || {}
  _.defaults(opts, defaults);

  bundleIntoTempDir(bundle, opts, function (tmpdir, basedir, entryScripts, files) {
    var newBundle = new browserify();

    _.each(entryScripts, function (entryScript) {
      entryScript = path.join(tmpdir, path.relative(basedir, entryScript));

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
