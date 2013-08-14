var assert = require('assert')
  , findroot = require('../lib/findRoot')
  , tests = {};

tests['single string'] = function () {
  assert.strictEqual(findroot(['a']), 'a');
}

tests['two strings, sorted'] = function () {
  assert.strictEqual(findroot(['a','ab']), 'a');
}

tests['two strings, unsorted'] = function () {
  assert.strictEqual(findroot(['asd','asdf','asb']), 'as');
}

tests['two strings, unsorted, no root'] = function () {
  assert.strictEqual(findroot(['asd','asdf','asb','d']), '');
}

tests['single dir'] = function () {
  assert.strictEqual(findroot(['a/']), 'a');
}

tests['two dirs'] = function () {
  assert.strictEqual(findroot(['a/b/d','a/b/c']), 'a/b');
}

tests['three dirs'] = function () {
  assert.strictEqual(findroot(['a','a/b/d/file.json','a/b/c']), 'a');
}

module.exports = tests;
