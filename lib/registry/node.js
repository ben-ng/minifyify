var Node
  , _ = require('lodash')
  , uglify = require('uglify-js')
  , path = require('path')
//  , gcc = require('gcc')
  , utils = require('utilities')
  , fs = require('fs')
  , os = require('os');

Node = function (file, code) {
  this.file = file;
  this.code = code;
  this.mappings = [];

  this._lowestIndex = -1;
  this._highestIndex = -1;
};

/**
* Minifies the node
*/
Node.prototype.minify = function (opts, cb) {
  var defaults = {
          outSourceMap: 'temp.map'
        , fromString: true
      }

  opts = opts || {}
  _.defaults(opts, defaults)

  return uglify.minify(this.code, opts);
};

/**
* Adds a mapping to the node
* @param mapping [Object] - {
*   generatedLine: <Integer>
* , generatedColumn: <Integer>
* , originalLine: <Integer>
* , originalColumn: <Integer>
* , name: <String>
* }
*/
Node.prototype.addMapping = function (mapping) {
  this.validateMapping(mapping);

  var index = mapping.generatedLine;

  // Refuse to map to the same index twice
  if(mapping[index]) {
    throw new Error('EEXISTS');
  }

  if(this._lowestIndex < 0 || index < this._lowestIndex) {
    this._lowestIndex = index;
  }

  if(this._highestIndex < 0 || index > this._highestIndex) {
    this._highestIndex = index;
  }

  this.mappings[index] = mapping;
};

/*
* Returns the range of the node in the original file
* This is 1-indexed!
* @return [Object]: {start: <Number>, end: <Number>}
*/
Node.prototype.range = function () {
  return {
    start: this._lowestIndex
  , end: this._highestIndex
  };
};

/**
* Validates a mapping. Throws if invalid
* @param mapping [Object] - {
*   generatedLine: <Integer>
* , generatedColumn: <Integer>
* , originalLine: <Integer>
* , originalColumn: <Integer>
* , name: <String>
* }
*/
Node.prototype.validateMapping = function (mapping) {
  var requiredKeys = [
    'generatedLine'
  , 'generatedColumn'
  , 'originalLine'
  , 'originalColumn'
  ];

  _.each(requiredKeys, function (key) {
    if(mapping[key] == null) {
      throw new Error('EMISSINGKEY');
    }
  });
};

/**
* Makes it easier to read the node
*/
Node.prototype.toJSON = function () {
  var mappings = []
    , range = this.range();

  for(var i = range.start, ii = range.end; i<ii; i++) {
    var mapping = this.mappings[i];

    // Remove cruft from mappings
    if(!mapping.name) {
      delete(mapping.name);
    }
    delete(mapping.source);

    mappings.push(mapping);
  }

  return {
    file: this.file
  , mappings: mappings
  , range: range
  , code: this.code
  };
};

module.exports = Node;
