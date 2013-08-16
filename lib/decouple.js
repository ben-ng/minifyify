var atob = require('atob')
  , _ = require('lodash')
  , decoupleBundle;

/*
* Given source with embedded sourcemap, seperate the two
* Returns the code and SourcemapConsumer object seperately
*/
decoupleBundle = function (src, opts) {
  var marker = '//@ sourceMappingURL=data:application/json;base64,'
    , offset = src.lastIndexOf(marker)
    , defaults = {map: 'scripts.map'}
    , map
    , substr;

  opts = opts || {};
  _.defaults(opts, defaults);

  if(offset<0) {
    throw new Error('ENOURL');
  }

  substr = src.substring(offset + marker.length);

  map = atob(substr);

  return {
    code: src.substring(0, offset)
  , map: map
  };
};

module.exports = decoupleBundle;