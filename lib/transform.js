var transform
  , SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , SMGenerator = SM.SourceMapGenerator;

/**
* Transforms source code and a map
* opts [Object] - {file: string, map: string, compressPaths: function}
* code [String] - The code to transform
* map [String] - The map to tranform
* cb [Function] - Called after transformation is done
*/
transform = function (opts, code, map, cb) {
  var consumer = new SMConsumer(map)
    , generator = new SMGenerator({file: opts.file});

  consumer.eachMapping(function (mapping) {
    if(!mapping.source) {
      console.error(red+'WARNING: Mapping needs a source\n\
GCC might have encountered a license or unremovable comment\n\
Remove it to get rid of this warning!\n'+JSON.stringify(mapping,null,2)+reset);
      return;
    }

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

    src=mapping.source;
  });

  generator.setSourceContent(opts.compressPaths(opts.file), code);

  code = code + '\n//# sourceMappingURL=' + opts.map + '\n';
  map = JSON.parse( generator.toString() );
  map.file = opts.file;
  map = JSON.stringify(map);

  cb(code, map);
};

module.exports = transform;
