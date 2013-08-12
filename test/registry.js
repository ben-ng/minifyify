var Registry = require('../lib/registry')
  , assert = require('assert')
  , SM = require('source-map')
  , SMGenerator = SM.SourceMapGenerator
  , SMConsumer = SM.SourceMapConsumer
  , simpleCode = 'mao\n\
cat\n\
cow\n\
fish\n\
chicken\n\
'
  , simpleMapGenerator
  , simpleMap
  , simpleMapConsumer
  , tests = {};


// Create a sourcemap to consume later on
simpleMapGenerator = new SMGenerator({file: 'file.js'});
simpleMapGenerator.setSourceContent('file.js', simpleCode);
simpleMapGenerator.addMapping({
  'source': 'file.js'
, 'generated': {line: 1, column: 0}
, 'original': {line: 4, column: 0}
});
simpleMapGenerator.addMapping({
  'source': 'file.js'
, 'generated': {line: 2, column: 3}
, 'original': {line: 5, column: 0}
});
simpleMap = simpleMapGenerator.toString();
simpleMapConsumer = new SMConsumer(simpleMap);

// Tests begin

tests['create new registry'] = function () {
  assert.doesNotThrow(function () {
    var registry = new Registry({code:simpleCode, map: simpleMapConsumer});
  });
}

tests['add range of mappings'] = function () {
  var registry = new Registry({code:simpleCode, map: simpleMapConsumer})
    , range;

  range = registry.getNode('file.js').range();

  assert.deepEqual(range, {start: 1, end: 2}, 'range should equal range in generated file')
}

module.exports = tests;