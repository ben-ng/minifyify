var _ = require('lodash')
  , fixtures = require('./fixtures')
  , utils = require('utilities')
  , fs = require('fs')
  , path = require('path')
  , minify = require('../lib/registry/node/minify')
  , SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , SMGenerator = SM.SourceMapGenerator
  , tests = {}
  , compilers = ['gcc', 'uglify']
  , transform = function (opts, code, map, cb) {
      var consumer = new SMConsumer(map)
        , generator = new SMGenerator({file: opts.file});

      consumer.eachMapping(function (mapping) {
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
    }
  , compileLib = function (filename, next) {
      var file = path.join(fixtures.dir, 'libraries', filename + '.js');

      utils.file.mkdirP(path.join(fixtures.buildDir, 'libraries'));

      _.each(compilers, function (compiler) {
        var srcDest = path.join(fixtures.buildDir, 'libraries', filename + '.' + compiler + '.min.js')
          , mapDest = path.join(fixtures.buildDir, 'libraries', filename + '.' + compiler + '.map.json')
          , opts = {
              file: path.basename(filename)
            , map: path.basename(mapDest)
            , compressPaths: function (p) {
                return path.relative( path.join(fixtures.dir, 'libraries'), p );
              }
            }
          , data = fs.readFileSync(file).toString();

        minify[compiler](data, function (fcode, fmap) {
          // Compress paths and set comments/file
          transform(opts, fcode, fmap, function (code, map) {
            fs.writeFileSync(srcDest, code);
            fs.writeFileSync(mapDest, map);

            next();
          });
        });
      });
    };

tests['compile Backbone'] = function (next) {
  compileLib('Backbone', next);
};

module.exports = tests;
