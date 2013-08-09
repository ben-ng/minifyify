var concat = require('concat-stream')
  , path = require('path')
  , fs = require('fs')
  , atob = require('atob')
  , sourcemap = require('source-map')
  , uglify = require('uglify-js')
  , SMConsumer = sourcemap.SourceMapConsumer
  , SMGenerator = sourcemap.SourceMapGenerator
  , os = require('os');

// Debugging function
var printSourceMap = function (map) {
  var self = this
    , order = SMConsumer.ORIGINAL_ORDER;
  (new SMConsumer(map)).eachMapping(function (mapping, self, order) {
    console.log(mapping.generatedLine + ',' + mapping.generatedColumn + ' > ' + mapping.originalLine + ',' + mapping.originalColumn + ' in ' + mapping.source);
  });
};

// Fixes uglify warnings from the browserify prelude
var fixSourcemapForPrelude = function (sourcemap) {
  var consumer = new SMConsumer(sourcemap)
  , preludeConsumer
  , generator = SMGenerator.fromSourceMap(consumer)
  , srcFile = '/node_modules/browserify/node_modules/browser-pack/_prelude.js'
  , preludeParsed
  , outputMap;

  // Just map to the minifed version, after all nothing should be going wrong in there
  generator.addMapping({
    generated: {line:1, column: 0}
  , original: {line:1, column: 0}
  , source: srcFile
  });

  // Add the original prelude file
  generator.setSourceContent(srcFile, '(`browser-pack` prelude)');

  outputMap = generator.toString();

  return outputMap;
};

// Adds sourcecontent to sourcemap
var enhanceSourcemapWithContent = function (inputmap, outputmap) {
  var output = JSON.parse(outputmap)
    , input = JSON.parse(inputmap)
    , mappings = {}
    , filename
    , outputSourcesContent = [];

  // Preserve the order of the sourceContent
  for(var i=0, ii=input.sources.length; i<ii; i++) {
    filename = input.sources[i];

    mappings[filename] = input.sourcesContent[i];
  }

  for(var i=0, ii=output.sources.length; i<ii; i++) {
    filename = output.sources[i];

    outputSourcesContent.push(mappings[filename]);
  }

  output.sourcesContent = outputSourcesContent;

  return JSON.stringify(output);
};

// Separates code from sourcemap
var decoupleBundle = function (src) {
  var marker = '//@ sourceMappingURL=data:application/json;base64,'
    , offset = src.indexOf(marker)
    , map = atob(src.substring(offset + marker.length));

  try {
    map = JSON.parse(map);
  }
  catch(e) {
    throw e;
  }

  return {
    code: src
  , map: JSON.stringify(map)
  };
};

/*
* The master function
* INTENDED USE:
  var mold = require('mold-source-map')
    , brwsify = require('browserify')
    , minifyify = require('minifyify')
    , bundle = brwsify();

  bundle.add(something);

  bundle.bundle({debug: true})
  .on('error', function (err) { console.error(err); })
  .pipe(mold.transformSourcesRelativeTo(path.dirname(inputFile)))

  // Magic happens here
  .pipe(minifyify(function (src, map) {
    fs.writeFileSync(OUTPUT_FILE, src  + ';;;\n//@ sourceMappingURL=/scripts.map\n');
    fs.writeFileSync(OUTPUT_MAP, map);
  });
*/
var minifyify = function (cb) {
  var max = 100000
    , min = 1
    , randomNum = Math.floor(Math.random() * (max - min + 1) + min)
    , TMP_FILE = path.join(os.tmpdir(), 'minifyify.' + randomNum + '.map');

  return concat(function (outBuff) {

    outBuff = decoupleBundle(outBuff);

    outBuff.map = fixSourcemapForPrelude(outBuff.map);

    fs.writeFile(TMP_FILE, outBuff.map, function (err) {
      var minBuff;

      if(err) {
        return cb(err);
      }

      minBuff = uglify.minify(outBuff.code, {
          inSourceMap: TMP_FILE,
          outSourceMap: 'js/scripts.map',
          fromString: true
      });

      minBuff.map = enhanceSourcemapWithContent(outBuff.map, minBuff.map);

      cb(minBuff.code, minBuff.map);
    });
  });
};

module.exports = minifyify;
