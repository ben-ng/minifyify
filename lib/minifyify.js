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

function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

/*
* Helper function, copies a file over to the temporary directory,
* minifying and transforming and all that sweet, smooth jazz
*/
copyFile = function (source, destination, opts, next) {
  var buff = []
    , write = function (data) {
        buff.push(data)
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

  var copyStream = fs.createReadStream(source);

  // Must pipe through each transform before we minify
  // as they might convert non-js files into js
  _.each(opts.transforms, function (transform) {
    copyStream = copyStream.pipe(transform(source));
  });

  copyStream.pipe( opts.minifier ? minifyingThrough : noopThrough )
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
  var files = [];

  var d = bundle.deps({transform: opts.transforms});
  d.pipe(through(function (dep) {
    files.push(dep.id);
  }, function () {
    var self = this
      , tmpdir = path.join(require('osenv').tmpdir(), utils.string.uuid(5))
      , chain
      , chainParams = []
      , basedir
      , packageJsons;

    // Figure out the base directory so we can use shorter file paths
    basedir = findRoot(files);

    // Copy over all the package.json files we can find under this directory
    packageJsons = _.filter(utils.file.readdirR(basedir), function (p) {
      return path.basename(p) === 'package.json';
    });

    // Add all the package.json files
    files = files.concat(packageJsons);

    // Convert to array of AsyncChain params
    chainParams = _.map(files, function (f) {
      var dest = path.join(tmpdir, opts.compressPaths(f, basedir))
        , dir = path.dirname(dest)
        , modOpts = _.clone(opts);

      utils.file.mkdirP( dir );

      // Don't minify .json files, but assume
      // that everything else has been transformed
      // into js (e.g. hbs templates)
      if(path.extname(f)==='.json')
        modOpts.minifier = false;

      return {
        args: [f, dest, modOpts]
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
*   @param [opts.compressPaths] {Function} - Transform source paths in the map, function(path, base)
* @param cb {Function} - Callback with signature function(code, map)
*/
Minifyify = function (bundle, opts, cb) {
      // All minifyify options are optional, here are the defaults
  var defaults = {
          file: 'bundle.js'
        , map: 'bundle.map'
        , minifier: 'uglify'
        , transforms: []
        , compressPaths: function (fullPath, baseDir) {
            return path.relative(baseDir, fullPath);
          }
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

      transform(_.extend(opts,{basedir:basedir}), decoupled.code, decoupled.map, cb);
    });
  });
};

module.exports = Minifyify;
