var path = require('path')
  , FIXTURES_DIR = path.join(__dirname)
  , BUILD_DIR = path.join(__dirname, '..', 'build')
  , SCAFFOLD_DIR = path.join(__dirname, '..', 'build', 'scaffold')
  , entryScript = function (name) {
      return path.join(FIXTURES_DIR, name, 'entry.js');
    }
  , bundledDir = function (name) {
      return path.join(BUILD_DIR, 'apps', name);
    }
  , bundledFile = function (name, uuid) {
      return path.join(BUILD_DIR, name, 'bundle.min.js');
    }
  , bundledMap = function (name, uuid) {
      return path.join(BUILD_DIR, name, 'bundle.map.json');
    }
  , simplifyPath = function (filePath) {
      return path.relative(FIXTURES_DIR, filePath);
    };

module.exports = {
  entryScript: entryScript
, simplifyPath: simplifyPath
, bundledFile: bundledFile
, bundledDir: bundledDir
, bundledMap: bundledMap
, dir: FIXTURES_DIR
, buildDir: BUILD_DIR
, scaffoldDir:SCAFFOLD_DIR
};
