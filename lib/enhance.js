var SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , SMGenerator = SM.SourceMapGenerator
  , validate = require('./validate')
  , enhance;

/*
* Applies sourceContent and source to a map
*/
enhance = function (map, source, sourceContent) {
  var consumer = new SMConsumer(map)
    , generator = new SMGenerator({file: source});

  consumer.eachMapping(function (mapping) {
    // FIXME: This is stupid, but uglify sometimes adds invalid mappings
    try {
      validate.validateMapping(mapping);

      var newMapping = {
        generated: {
          column: mapping.generatedColumn
        , line: mapping.generatedLine
        }
      , original: {
          column: mapping.originalColumn
        , line: mapping.originalLine
        }
      , name: mapping.name
      , source: source
      };

      generator.addMapping(newMapping);
    }
    catch (e) {
      throw e;
    }
  });

  generator.setSourceContent(source, sourceContent);

  return generator.toString();
};

module.exports = enhance;
