var decouple = require('./decouple')
  , findSources;

findSources = function (bundle) {
  var unbundled = decouple(bundle)
    , map = JSON.parse(unbundled.map);

  return map.sources;
};

module.exports = findSources;
