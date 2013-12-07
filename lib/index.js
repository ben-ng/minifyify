var Minifier
  , through = require('through')
  , optimize = require('./optimize')
  , concat = require('concat-stream');

Minifier = function (opts, cb) {
  var write
    , end
    , buff = '';

  if(typeof opts == 'function') {
    cb = opts;
    opts = {
      map: 'bundle.map.json'
    };
  }

  write = function (data) {
    buff += data;
  };

  end = function (data) {
    try {
      var result = optimize(buff, opts);
    }
    catch(e) {
      if(typeof cb == 'function')
        return cb(e);
    }

    // Strip out existing map
    result.code = result.code.replace(/\s*\/\/(?:@|#) sourceMappingURL=(.*)$/m, '');

    if(typeof cb == 'function') {
      // Append the URL to the map
      result.code += '\n//# sourceMappingURL=' + opts.map;
      cb(null, result.code, result.map);
    }
    else {
      // Append the inline sourcemap
      result.code += '\n//# sourceMappingURL=data:application/json;base64,'
        + (new Buffer(result.map)).toString('base64');
    }

    this.queue(result.code);
    this.queue(null);
  };

  return through(write, end);
};

module.exports = Minifier;
