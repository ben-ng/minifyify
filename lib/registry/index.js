var Registry
  , SrcNode = require('./node')
  , _ = require('lodash')
  , SM = require('source-map')
  , SMGenerator = SM.SourceMapGenerator
  , SMConsumer = SM.SourceMapConsumer;

Registry = function (bundle) {
  var self = this;

  this.sourceNodes = {};
  this.sources = [];
  this.map = bundle.map;
  this.code = bundle.code;

  this.map.eachMapping(function (mapping) {
    self.addMapping(mapping);
  });
};

/**
* Creates an empty source map generator
*/
Registry.prototype.createGenerator = function (opts) {
  var defaults = {file: opts.file}
    , generator;

  opts = opts || {};
  _.defaults(opts, defaults);

  generator = new SMGenerator(opts);

  return new SMGenerator(opts);
};

/**
* Minifies each node and returns the new bundle and a map
*/
Registry.prototype.minify = function (opts) {
  var self = this
    , lines = this.code.split('\n')
    , generator = this.createGenerator(opts)
      // What the last line saved from
      // the original bundle is
    , highWaterMark = 0
    , buffer = []
    , minifyNode = function (node) {
        var range = node.range()
          , consumer
          , firstGeneratedLine;

        // Add the code before this node
        for(highWaterMark, ii=range.start-1;
          highWaterMark<ii; highWaterMark++) {
          buffer.push(lines[highWaterMark]);
        }

        // Minify the node
        var res = node.minify(opts)
          , code = res.code.split('\n')
          , map = res.map;

        // If minification removed EVERYTHING, use the minified code.
        // It was probably already minified, like the prelude
        if(res.code === '') {
          return;
        }

        // We need this to offset the generated line numberse
        firstGeneratedLine = buffer.length;

        // Add each minified line to the buffer
        for(var i=0, ii=code.length; i<ii; i++) {
          buffer.push(code[i]);
        }

        // Convert mappings
        consumer = new SMConsumer(map);

        // Offsets line numbers and applies to generator
        consumer.eachMapping(function (mapping) {
          var newMapping = {
            generated: {
              line: firstGeneratedLine + mapping.generatedLine
            , column: mapping.generatedColumn
            }
          , original: {
              line: mapping.originalLine
            , column: mapping.originalColumn
            }
          , source: opts.compressPaths(node.file)
          , name: mapping.name
          };

          try {
            generator.addMapping(newMapping);
          }
          catch(e) {
            console.error('WARNING: Invalid Mapping');
            console.error(newMapping);
          }
        });

        // This is the line after the node ends,
        // because the ranges are 1-indexed
        highWaterMark = range.end;
      };

  // Iterate through each node
  _.each(this.sourceNodes, function (node) {
    minifyNode(node);
  });

  // Add the remaining code after the last node
  for(var ii=lines.length;
    highWaterMark<ii; highWaterMark++) {
    buffer.push(lines[highWaterMark]);
  }

  // Transfer sourceContent over to the generator
  _.each(self.getSources(), function (source) {
    generator.setSourceContent(opts.compressPaths(source)
      , this.map.sourceContentFor(source));
  }, self);

  return {code: buffer.join('\n'), map: generator.toString()};
};

/**
* Adds a mapping to a node in the registry
* @param mapping [Object] - {
*   generatedLine: <Integer>
* , generatedColumn: <Integer>
* , originalLine: <Integer>
* , originalColumn: <Integer>
* , source: <String>
* , name: <String>
* }
*/
Registry.prototype.addMapping = function (mapping) {
  var srcNode = this.getNode(mapping.source);

  srcNode.addMapping(mapping);

  // Add to sources array if new
  if(mapping.source && this.sources.indexOf(mapping.source) < 0) {
    this.sources.push(mapping.source);
  }
};

/**
* Returns an array of sources referenced in previous mappings
*/
Registry.prototype.getSources = function () {
  return this.sources;
};

/**
* Adds a node to the registry or gets an existing one
* @param file [String] - The file name of the node
*/
Registry.prototype.getNode = function (file) {
  if(!this.sourceNodes[file]) {
    this.sourceNodes[file] = new SrcNode(file, this.map.sourceContentFor(file));
  }

  return this.sourceNodes[file];
};

/**
* Returns an object representing the registry
*/
Registry.prototype.toJSON = function () {
  var buffer = [];

  _.each(this.sourceNodes, function (node) {
    buffer.push(node.toJSON());
  });

  return buffer;
};

/**
* Returns a formatted JSON string
*/
Registry.prototype.toString = function () {
  return JSON.stringify(this.toJSON(), null, 2);
};

/**
* Resets the registry
*/
Registry.prototype.reset = function () {
  this.sourceNodes = {};
};

module.exports = Registry;
