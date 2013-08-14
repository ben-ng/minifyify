var transform
  , _ = require('lodash')
  , SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , SMGenerator = SM.SourceMapGenerator
  , validate = require('./validate');

/**
* Transforms source code and a map
* opts [Object] - {file: string, map: string, compressPaths: function}
* code [String] - The code to transform
* map [String] - The map to tranform
* cb [Function] - Called after transformation is done
*/
transform = function (opts, code, map, cb) {
  var consumer = new SMConsumer(map)
    , generator = new SMGenerator({file: opts.file})
    , sources = {};

  consumer.eachMapping(function (mapping) {
    // FIXME: This is stupid, but uglify sometimes adds invalid mappings
    try {
      validate.validateMapping(mapping);

      var newMapping = {
          generated: {
            line: mapping.generatedLine
          , column: mapping.generatedColumn
          }
        , original: {
            line: mapping.originalLine
          , column: mapping.originalColumn
          }
        , source: opts.compressPaths(mapping.source)
        , name: mapping.name
        };

      sources[opts.compressPaths(mapping.source)] = mapping.source;
      generator.addMapping(newMapping);
    }
    catch (e) {
      throw e;
    }
  });

  _.each(sources, function (source, path) {
    generator.setSourceContent(path, consumer.sourceContentFor(source));
  });

  code = code + '\n//@ sourceMappingURL=' + opts.map + '\n';
  map = JSON.parse( generator.toString() );
  map.file = opts.file;
  map = JSON.stringify(map);

  cb(code, map, map.sourcesContent);
};

module.exports = transform;
