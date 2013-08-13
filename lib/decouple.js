var atob = require('atob')
  , _ = require('lodash')
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

  return {
    code: src.substring(0, offset) + ';;;\n//@ sourceMappingURL=' + opts.map + '\n'
  , map: map
  };
};

module.exports = decoupleBundle;