var config = require('./config');

module.exports = {
  "finishup": function () {
    console.log(config.green + 'All tests suceeded' + config.reset);
    process.exit(0);
  }
};
