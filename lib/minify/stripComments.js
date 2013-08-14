var strip = require('uncommentify').sync
  , concat = require('concat-stream');

module.exports = function (input) {
  return strip(input, {all: true}).replace(/\n\s+\n/g,'\n').replace(/^\s+/,'');
};
