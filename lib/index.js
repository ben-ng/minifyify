var Minifier
  , concat = require('concat-stream')
  , optimize = require('./optimize');

Minifier = function (cb, opts) {
  return concat(function(data) {
    optimize(data, opts, cb);
  });
};

module.exports = Minifier;
