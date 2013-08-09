var concat = require('concat-stream')
  , path = require('path')
  , fs = require('fs')
  , atob = require('atob')
  , sourcemap = require('source-map')
  , uglify = require('uglify-js')
  , SMConsumer = sourcemap.SourceMapConsumer
  , SMGenerator = sourcemap.SourceMapGenerator
  , os = require('os');

// Fixes uglify warnings from the browserify prelude
var fixSourcemapForPrelude = function (sourcemap, cb) {
  // Yeah, this is weird, but we want to use the prelude.js that browserify depends on
  var BROWSER_PACK_FILE = path.join(__dirname, 'node_modules', 'browserify', 'node_modules', 'browser-pack', 'prelude.js');

  fs.readFile(BROWSER_PACK_FILE, function (err, preludeData) {
    if(err) {
      return cb(err);
    }

    var consumer = new SMConsumer(sourcemap)
    , preludeConsumer
    , generator = SMGenerator.fromSourceMap(consumer)
    , srcFile = '/node_modules/browserify/node_modules/browser-pack/prelude.js'
    , preludeMap;

    preludeData = preludeData.toString();

    // FIXME:
    // Compression options `unused` and `dead_code` don't seem to work
    // uglifyjs will remove everything in this file unless we execute the function ):
    preludeData = preludeData + '();'

    // Create a sourcemap using uglify (which browserify also uses)
    preludeMap = uglify.minify(preludeData, {
      outSourceMap: 'js/prelude.map'
    , fromString: true
    , compress: {
        // Leaving these in here, but they don't seem to work without the fix on #16
        unused: false
      , dead_code: false
      }
    }).map;

    // Add these mappings to our sourcemap
    preludeConsumer = new SMConsumer(preludeMap);
    preludeConsumer.eachMapping(function (mapping) {
      generator.addMapping({
        generated: {line:mapping.generatedLine, column: mapping.generatedColumn}
      , original: {line:mapping.originalLine, column: mapping.originalColumn}
      , source: srcFile
      });
    });

    // Add the original prelude file
    generator.setSourceContent(srcFile, preludeData)

    cb(null, generator.toString());
  });
};

// Adds sourcecontent to sourcemap
var enhanceSourcemapWithContent = function (inputmap, outputmap) {
  var output = JSON.parse(outputmap);

  output.sourcesContent = JSON.parse(inputmap).sourcesContent;

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

    fixSourcemapForPrelude(outBuff.map, function (err, newmap) {
      if(err) {
        return cb(err);
      }

      fs.writeFile(TMP_FILE, newmap, function (err) {
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
  });
};

module.exports = minifyify;