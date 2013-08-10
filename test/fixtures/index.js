var path = require('path')
  , FIXTURES_DIR = path.join(__dirname)
  , entryScript = function (name) {
      return path.join(FIXTURES_DIR, name, 'entry.js');
    }
  , bundledFile = function (name) {
      return path.join(FIXTURES_DIR, name, 'bundle.js');
    }
  , bundledMap = function (name) {
      return path.join(FIXTURES_DIR, name, 'bundle.map');
    }
  , simplifyPath = function (filePath) {
      return path.relative(FIXTURES_DIR, filePath);
    };

module.exports = {
  entryScript: entryScript
, simplifyPath: simplifyPath
, bundledFile: bundledFile
, bundledMap: bundledMap
, dir: FIXTURES_DIR
};
