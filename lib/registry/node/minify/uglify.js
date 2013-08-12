var minifyUglify
  , uglify = require('uglify-js')
  , gcc = require('gcc')
  , utils = require('utilities');

minifyUglify = function (code, cb) {
  var result = uglify.minify(code, {
        outSourceMap: 'temp.map'
      , fromString: true
      });

  cb(result.code, result.map);
}

module.exports = minifyUglify;
