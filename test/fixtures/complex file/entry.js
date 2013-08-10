var submodule = require('./submodule')
  , myString;

myString = submodule.createString(function () {
  var mathy = 1 + 1 + 2 + 3 + 5 + 8;

  mathy *= 1337;

  return 'potato #' + mathy;
});

console.log(myString);
