var Minifyify
  , _ = require('lodash')
  , minify = require('./minify')
  , transform = require('./transform')
  , path = require('path')
  , deoptimize = require('browserify-deoptimizer');

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
*   @param [opts.minifier] {String} - Minifier to use
*     , 'uglify' (default) or 'gcc' (needs Java)
*   @param [opts.compressPaths] {Function} - Transform source paths in the map
*/
Minifyify = function (bundle, opts, cb) {
  var defaults = {
          file: 'bundle.js'
        , map: 'bundle.map'
        , minifier: 'uglify'
        , compressPaths = function (p) {
            return path.relative(process.cwd(), p);
          }
        }
      , files
      , buffer = []
      , next = function (code, map) {
          tranform(opts, code, map, cb);
        };

  opts = opts || {}
  _.defaults(opts, defaults);

  files = deoptimize(bundle);

  _.each(files, function (data) {
    buffer.push(data);
  });

  buffer.join('\n');

  switch(opts.minifier) {
    case 'uglify':
      minify.uglify(buffer, next);
    break;
    case 'gcc':
      minify.gcc(buffer, next);
    break;
    default:
      throw new Error('Unknown minifier, use `uglify` or `gcc`');
  }
};

module.exports = Minifyify;
