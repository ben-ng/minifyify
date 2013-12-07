var atob = require('atob')
  , SM = require('source-map')
  , _ = require('lodash')
  , SMConsumer = SM.SourceMapConsumer
  , decoupleBundle;

/*
* Given source with embedded sourcemap, seperate the two
* Returns the code and SourcemapConsumer object seperately
*/
decoupleBundle = function (src, opts) {
  var re = /\s*\/\/(?:@|#) sourceMappingURL=data:application\/json;base64,(\S*)$/m
    , map = src.match(re)
    , defaults = {map: 'scripts.map'};

  opts = opts || {};
  _.defaults(opts, defaults);

  if(!map) {
    throw new Error('No SourceMappingURL to decouple');
  }

  map = atob(map[1]);
  src = src.replace(re, '//# sourceMappingURL=' + opts.map);

  if(!opts.noConsumer) {
    try {
      map = new SMConsumer( JSON.parse(map) );
    }
    catch(e) {
      throw e;
    }
  }

  return {
    code: src
  , map: map
  };
};

module.exports = decoupleBundle;
