var config = require('./config');

module.exports = {
  "success": function () {
    console.log(config.green + 'All tests succeeded' + config.reset);
    process.exit(0);
  }
};
