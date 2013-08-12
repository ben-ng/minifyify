var Minifier
  , concat = require('concat-stream')
  , optimize = require('./optimize');

Minifier = function (cb, opts) {
  return concat(function(data) {
    var optimized = optimize(data, opts);

    cb(optimized.code, optimized.map.toString());
  });
};

module.exports = Minifier;
