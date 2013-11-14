var deoptimize
  , Registry = require('./registry');

/*
* Deoptimize a bundle
* @param bundle [Object] - Decoupled bundle {code: <String>, map: <String>}
* @return [Registry] - The registry representing the deoptimized bundle
*/
deoptimize = function (bundle, opts) {
  var registry;

  registry = new Registry(bundle);

  return registry;
};

module.exports = deoptimize;
