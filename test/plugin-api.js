/* globals jake */

var assert = require('assert')
  , fs = require('fs')
  , path = require('path')
  , jsesc = require('jsesc')
  , validate = require('sourcemap-validator')
  , browserify = require('browserify')
  , fixtures = require('./fixtures')
  , tests = {};

tests['browserify -p minifyify > out.js'] = function (next) {
  var appname = 'simple file'
    , browserify = path.join(path.dirname(require.resolve('browserify')), 'bin', 'cmd.js')
    , minifyify = path.join(__dirname, '..', 'lib', 'index.js')
    , outFile = path.join(fixtures.buildDir, 'apps', appname, 'bundle.clied.js')
    , outMapFile = path.join(fixtures.buildDir, 'apps', appname, 'bundle.clied.map.json')
    , cmd = browserify + ' "' + jsesc(fixtures.entryScript(appname), {quotes: 'double'}) +
      '" -p [ "' + jsesc(minifyify, {quotes: 'double'}) + '" --output "' + jsesc(outMapFile, {quotes: 'double'}) + '" ] > "' +
      jsesc(outFile, {quotes: 'double'}) + '"'
    , ex = jake.createExec(cmd)
    , dat = [];

  ex.addListener('stdout', function (data) {
    dat.push(data);
  });

  ex.addListener('stderr', function (data) {
    dat.push(data);
  });

  ex.addListener('error', function (err, code) {
    process.stderr.write('Test failed, output:');
    process.stderr.write(dat.join('\n'));
    process.stderr.write(err, code);
    process.exit(code);
  });

  ex.addListener('cmdEnd', function () {
    assert.doesNotThrow(function () {
      validate(fs.readFileSync(outFile).toString(), fs.readFileSync(outMapFile).toString())
    }, 'The bundle should have a valid external sourcemap');
    next();
  });

  ex.run();
};

tests['programmatic plugin api'] = function (next) {
  var bundler = new browserify();
  bundler.add(fixtures.entryScript('simple file'));
  bundler.plugin(require('../lib'));
  bundler.bundle(function (err, src, map) {
    if(err) { throw err; }
    assert.doesNotThrow(function () {
      validate(src, map)
    }, 'The bundle should have a valid sourcemap');
    next();
  });
}

module.exports = tests;