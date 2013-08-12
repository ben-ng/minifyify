var submodule = require('./submodule')
  , path = require('path')
  , myString;

myString = submodule.createString(function () {
  return path.join('highway','to','hell');
});

myString = path.join(myString, 'stairway', 'to', 'heaven');

console.log(myString);
