var minifyGcc
  , path = require('path')
  , gcc = require('gcc')
  , fs = require('fs')
  , os = require('osenv')
  , utils = require('utilities');

minifyGcc = function (code, cb) {
  var tempCode = path.join(os.tmpdir(), utils.string.uuid(5)+'.minifyify.js')
    , tempMinCode = path.join(os.tmpdir(), utils.string.uuid(5)+'.minifyify.min.js')
    , tempMap = path.join(os.tmpdir(), utils.string.uuid(5)+'.minifyify.map');

  fs.writeFile(tempCode, code, function(err) {
    if(err) {
      throw err;
    }

    gcc.compile(tempCode, tempMinCode, {
      create_source_map: tempMap
    }, function (err, tempCode, stderr) {
      if(err) {
        throw err;
      }

      fs.readFile(tempMap, function(err, data) {
        if(err) {
          throw err;
        }

        cb(tempCode, data.toString());
      });
    });
  })
}

module.exports = minifyGcc;
