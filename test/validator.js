var validate = require('../lib/validate')
  , fs = require('fs')
  , path = require('path')
  , assert = require('assert')
  , libDir = path.join(__dirname, 'fixtures', 'libraries')
  , tests = {};

tests['Invalid Backbone'] = function () {
  var backbone = fs.readFileSync(path.join(libDir, 'Backbone.js')).toString()
    , backboneMin = fs.readFileSync(path.join(libDir, 'Backbone.min.js')).toString()
    , backboneMap = fs.readFileSync(path.join(libDir, 'Backbone.min.map')).toString();

  assert.throws(function () {
    validate(backbone, backboneMin, backboneMap);
  });
};

module.exports = tests;
