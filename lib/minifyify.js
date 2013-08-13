var Minifyify
  , _ = require('lodash')
  , path = require('path')
  , envoy = require('envoy')
  , deoptimize = require('browserify-deoptimizer');

Minifyify = function (opts, cb) {
  var defaults = {
          file: 'bundle.js'
        , map: 'bundle.map'
        , compressPaths = function (p) {
            return path.relative(process.cwd(), p);
          }
        }
      , files;

  opts = opts || {}
  _.defaults(opts, defaults);

  files = deoptimize(bundle)
};

module.exports = Minifyify;
