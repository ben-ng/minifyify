var optimize
  , decouple = require('./decouple')
  , deoptimize = require('./deoptimize')
  , _ = require('lodash');

/*
* Optimize a bundle
* @param bundle [Mixed] - String of source code,
*   or decoupled bundle {code: <String>, map: <String>}
* @return generator [SourceMapGenerator] - The generator with the generated source map
*/
optimize = function (bundle, opts, cb) {
  var registry
    , generator
    , minified
    , defaults = {
        map: 'bundle.map'
      , file: 'bundle.js'
      , compressPaths: function (f) {return f;}
      , minifier: 'gcc'
      };

  opts = opts || {};
  _.defaults(opts, defaults);

  if(typeof bundle === 'string') {
    bundle = decouple(bundle, opts);
  }

  registry = deoptimize(bundle, opts);
  return registry.minify(opts);
};

module.exports = optimize;
