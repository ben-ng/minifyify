var assert = require('assert')
  , fs = require('fs')
  , path = require('path')
  , jsesc = require('jsesc')
  , validate = require('sourcemap-validator')
  , fixtures = require('./fixtures')
  , tests = {};

tests['browserify | minifyify > out.js'] = function (next) {
  var appname = 'simple file'
    , browserify = path.join(path.dirname(require.resolve('browserify')), 'bin', 'cmd.js')
    , minifyify = path.join(__dirname, '..', 'bin', 'cmd.js')
    , outFile = path.join(fixtures.buildDir, 'apps', appname, 'bundle.clied.js')
    , cmd = browserify + ' -d "' + jsesc(fixtures.entryScript(appname), {quotes: 'double'})
      + '" | ' + minifyify + ' > "'
      + jsesc(outFile, {quotes: 'double'}) + '"'
    , ex = jake.createExec(cmd)
    , dat = '';

  ex.addListener('stdout', function (data) {
    dat += data;
  });

  ex.addListener('error', function (err, code) {
    console.error(err, code);
    process.exit(code);
  });

  ex.addListener('cmdEnd', function () {
    assert.doesNotThrow(function () {
      validate(fs.readFileSync(outFile).toString())
    }, 'The bundle should have a valid inline sourcemap');
    next();
  });

  ex.run();
};

module.exports = tests;
