var Minifier
  , concat = require('concat-stream')
  , optimize = require('./optimize');

Minifier = function (cb) {
  return concat(function(data) {
    var optimized = optimize(data);

    cb(optimized.code, optimized.map);
  });
};

module.exports = Minifier;
