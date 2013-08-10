var Minifier
  , _ = require('lodash')
  , concat = require('concat-stream')
  , through = require('through')
  , uglify = require('uglify-js')
  , atob = require('atob')
  , path = require('path')
  , SM = require('source-map')
  , SMConsumer = SM.SourceMapConsumer
  , SMGenerator = SM.SourceMapGenerator;

Minifier = function (opts) {
  /*
  * Handle options/defaults
  */
  opts = opts || {};

  var self = this
    , defaults = {
        minify: true
      , source: 'bundle.js'
      , map: 'bundle.map'
      , transformPaths: function (filePath) {
          // noop
          return filePath;
        }
      };

  _.defaults(opts, defaults);

  /*
  * Instance variables
  */
  self.registry = {}; // Keep source maps and code by file

  /*
  * Registers maps and code by file
  */
  self.registerMap = function (file, code, map) {
    self.registry[file] = {code:code, map:map};
  };

  /*
  * Gets map by file
  */
  self.mapForFile = function (file) {
    if(!self.registry[file]) {
      throw new Error('ENOFILE');
    }

    return self.registry[file].map;
  };

  /*
  * Gets code by file
  */
  self.codeForFile = function (file) {
    if(!self.registry[file]) {
      throw new Error('ENOFILE');
    }

    return self.registry[file].code;
  };

  /*
  * Compresses code before Browserify touches it
  * Does nothing if minify is false
  */
  self.transformer = function (file) {
    var buffs = [];

    return through(write, end);

    function write(data) {
      if(opts.minify) {
        buffs.push(data);
      }
      else {
        this.queue(data);
      }
    }

    function end(data) {
      var unminCode = buffs.join();

      if(opts.minify) {
        var min = uglify.minify(unminCode, {
          fromString: true
        , outSourceMap: opts.map
        });

        this.queue(min.code);

        self.registerMap(file, unminCode, new SMConsumer(min.map));
      }

      this.queue(null);
    }
  };

  /*
  * Consumes the output stream from Browserify
  */
  self.consumer = function (cb) {
    return concat(function(data) {
      if(!opts.minify) {
        return cb(data, null);
      }
      else {
        var bundle;

        try {
          bundle = self.decoupleBundle(data);
        }
        catch(e) {
          if(e.toString() == 'Error: ENOURL') {
            throw new Error('Cannot consume when browserify is not in debug mode');
          }
          else {
            throw e;
          }
        }

        // Re-maps the browserify sourcemap
        // to the original source using the
        // uglify sourcemap
        bundle.map = self.transformMap(bundle.map);

        cb(bundle.code, bundle.map);
      }
    });
  };

  /*
  * Given a SourceMapConsumer from a bundle's map,
  * transform it so that it maps to the unminified
  * source
  */
  self.transformMap = function (bundleMap) {
    var generator = new SMGenerator({
          file: opts.source
        })
        // Map File -> The lowest numbered line in the bundle (offset)
      , bundleToMinMap = {}

        /*
        * Helper function that maps minified source to a line in the browserify bundle
        */
      , mapSourceToLine = function (source, line) {
          var target = bundleToMinMap[source];

          if(!target || target > line) {
            bundleToMinMap[source] = line;
          }
        }

        /*
        * Helper function that gets the line
        */
      , lineForSource = function (source) {
          var target = bundleToMinMap[source];

          if(!target) {
            throw new Error('ENOFILE');
          }

          return target;
        };

    // Figure out where my minified files went in the bundle
    bundleMap.eachMapping(function (mapping) {
      mapSourceToLine(mapping.source, mapping.generatedLine);
    });

    // Map from the hi-res sourcemaps to the browserify bundle
    self.eachSource(function (file, code) {
      var offset = lineForSource(file) - 1
        , fileMap = self.mapForFile(file)
        , transformedFileName = opts.transformPaths(file);

      fileMap.eachMapping(function (mapping) {
        generator.addMapping( self.transformMapping(transformedFileName, mapping, offset) );
      });

      generator.setSourceContent(transformedFileName, code);
    });

    return generator.toString();
  };

  /*
  * Given a mapping (from SMConsumer.eachMapping)
  * return a new mapping (for SMGenerator.addMapping)
  * resolved to the original source
  */
  self.transformMapping = function (file, mapping, offset) {
    return {
      generated: {
        line: mapping.generatedLine + offset
      , column: mapping.generatedColumn
      }
    , original: {
        line: mapping.originalLine
      , column: mapping.originalColumn
      }
    , source: file
    , name: mapping.name
    }
  };

  /*
  * Iterates over each code file, executes a function
  */
  self.eachSource = function (cb) {
    _.each(self.registry, function(v, file) {
      cb(file, self.codeForFile(file), self.mapForFile(file));
    });
  };

  /*
  * Given source with embedded sourcemap, seperate the two
  * Returns the code and SourcemapConsumer object seperately
  */
  self.decoupleBundle = function (src) {
    var marker = '//@ sourceMappingURL=data:application/json;base64,'
      , offset = src.indexOf(marker)
      , map;

    if(offset<0) {
      throw new Error('ENOURL');
    }

    map = atob(src.substring(offset + marker.length));

    try {
      map = new SMConsumer( JSON.parse(map) );
    }
    catch(e) {
      throw e;
    }

    return {
      code: src.substring(0, offset) + ';;;\n//@ sourceMappingURL=' + opts.map + '\n'
    , map: map
    };
  };

  return this;
};

module.exports = Minifier;
