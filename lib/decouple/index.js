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
  var marker = '//@ sourceMappingURL=data:application/json;base64,'
    , offset = src.indexOf(marker)
    , defaults = {map: 'scripts.map'}
    , map;

  opts = opts || {};
  _.defaults(opts, defaults);

  if(offset<0) {
    throw new Error('ENOURL');
  }

  map = atob(src.substring(offset + marker.length));

  try {
    map = new SMConsumer( JSON.parse(map) );
  }
  catch(e) {
    throw e;
  }

  return {
    code: src.substring(0, offset) + ';;;\n//@ sourceMappingURL=' + opts.map + '\n'
  , map: map
  };
};

module.exports = decoupleBundle;