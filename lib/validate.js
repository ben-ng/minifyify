var validate
  , validateMapping
  , assert = require('assert')
  , SM = require('source-map')
  , _ = require('lodash')
  , SMConsumer = SM.SourceMapConsumer;

// Performs simple validation of a mapping
validateMapping = function (mapping) {
  assert.ok(mapping.generatedColumn!=null, 'missing generated column');
  assert.ok(mapping.generatedLine!=null, 'missing generated line');
  assert.ok(mapping.generatedColumn >= 0, 'generated column must be greater or equal to zero');
  assert.ok(mapping.generatedLine >= 0, 'generated line must be greater or equal to zero');

  /*
  assert.ok(mapping.originalColumn!=null, 'missing original column');
  assert.ok(mapping.originalLine!=null, 'missing original line');
  assert.ok(mapping.originalColumn >= 0, 'original column must be greater or equal to zero');
  assert.ok(mapping.originalLine >= 0, 'original line must be greater or equal to zero');
  */
  //assert.ok(mapping.source == null, 'source is missing');
};

// Validates an entire sourcemap
validate = function (srcs, min, map, compiler) {
  var consumer = new SMConsumer(map)
    , min = min.split('\n')
    , mappingCount = 0
    , splitSrcs = {};

  _.each(srcs, function (src, file) {
    return splitSrcs[file] = src.split('\n'); // Split sources by line
  });

  consumer.eachMapping(function (mapping) {
    mappingCount++;

    validateMapping(mapping);

    // These validations can't be performed with just the mapping
    var originalLine
      , errMsg
      , mapRef = _.template('<%=generatedLine%>:<%=generatedColumn%>'+ String.fromCharCode(parseInt(2192,16))+'<%=originalLine%>:<%=originalColumn%> "<%=name%>" in <%=source%>')(mapping)
      , expected
      , actual;

    if(mapping.name) {
      originalLine = splitSrcs[mapping.source][mapping.originalLine - 1];
      expected = mapping.name;
      actual = originalLine.split('').splice(mapping.originalColumn, expected.length).join('');

      errMsg = _.template('\
Warning: mismatched names\n\
 Expected: "<%=expected%>"\n\
 Got: "<%=actual%>"\n\
 Original Line: <%=original%>\n\
 Mapping: <%=mapRef%>', {expected: expected, actual: actual, original:originalLine, mapRef: mapRef});

      assert.strictEqual(actual, mapping.name, errMsg);
    }
  });

  assert.ok(JSON.parse(map).sources && JSON.parse(map).sources.length, 'There were no sources in the file');
};

module.exports = {
  validate: validate
, validateMapping: validateMapping
};
