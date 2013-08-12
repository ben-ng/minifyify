var deoptimize = require('../lib/deoptimize')
  , decouple = require('../lib/decouple')
  , fixtures = require('./fixtures')
  , browserify = require('browserify')
  , assert = require('assert')
  , tests = {};

tests['deoptimizes simple file'] = function (next) {
  var bundle = new browserify();

  bundle.add(fixtures.entryScript('simple file'));

  bundle.bundle({debug: true}, function (err, data) {
    assert.ifError(err);

    var registry
      , nodes;

    assert.doesNotThrow(function () {
      registry = deoptimize(decouple(data));
    });

    nodes = registry.toJSON();

    assert.ok(nodes[0].file.match(/^.*\/entry.js$/) != null, 'entry script is in registry');

    assert.strictEqual(nodes[0].mappings.length, 3, 'there should be three mappings');
    assert.deepEqual(nodes[0].mappings[0], {
      generatedLine: 2,
      generatedColumn: 0,
      originalLine: 1,
      originalColumn: 0
    }, 'first mapping is as expected');

    assert.deepEqual(nodes[0].mappings[1], {
      generatedLine: 3,
      generatedColumn: 0,
      originalLine: 2,
      originalColumn: 0
    }, 'second mapping is as expected');

    assert.deepEqual(nodes[0].mappings[2], {
      generatedLine: 4,
      generatedColumn: 0,
      originalLine: 3,
      originalColumn: 0
    }, 'third mapping is as expected');

    next();
  });
};

module.exports = tests;
