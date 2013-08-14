var minifyUglify
  , uglify = require('uglify-js')
  , utils = require('utilities');

minifyUglify = function (code, cb) {
  try {
    var result = uglify.minify(code, {
          outSourceMap: 'temp.map'
        , fromString: true
        });
  }
  catch (e) {
    console.error('Can\'t minify: ' + e.toString() + '\n' + code);
    process.exit(1);
  }

  cb(result.code, result.map);
}

module.exports = minifyUglify;
