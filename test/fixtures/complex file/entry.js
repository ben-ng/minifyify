var submodule = require('./submodule')
  , myString
  , actual
  , expected;

myString = submodule.createString(function () {
  var mathy = 1 + 1 + 2 + 3 + 5 + 8;

  mathy *= 1337;

  return 'potato #' + mathy;
});

actual = document.createElement('pre');
expected = document.createElement('pre');

actual.innerHTML   = 'Actual:   ' + myString;
expected.innerHTML = 'Expected: Wed Dec 31 1969 22:30:23 GMT-0800 (PST) friedpotato #26740bakedpotato #26740sliced potato #26740';

document.body.appendChild(actual);
document.body.appendChild(expected)
