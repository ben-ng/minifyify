var Minifier
  , through = require('through')
  , optimize = require('./optimize');

Minifier = function (opts) {
  var write
    , end
    , buff = '';

  write = function (data) {
    buff += data;
  }

  end = function (data) {
    var result = optimize(buff, opts);

    // Put the sourcemap inline
    result.code = result.code.replace(/\s?;;;[^\t]\/\/@ sourceMappingURL[^\t]*$/, '') + '\n//@ sourceMappingURL=data:application/json;base64,'
      + (new Buffer(result.map)).toString('base64');

    this.queue(result.code);
    this.queue(null);
  }

  return through(write, end);
}

module.exports = Minifier;
