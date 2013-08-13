Minifyify
---------
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify minifies your bundle and pulls the source map out into a separate file. Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## Usage

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , path = require('path')
  , bundle = new browserify()
  , transforms = [require('hbsfy')]
  , opts = {
      // The URL the source is available at
      file: '/bundle.js'

      // The URL this map is available at
    , map: '/bundle.map'

      // Use this option to compress paths
    , compressPaths: function (p) {
        return path.relative('./www', p);
      }

      // If you use transforms, specify them here
      // Do *not* apply them to the bundle yourself!
    , transforms: transforms
    };

bundle.add('entryScript.js');

minifyify(bundle, opts, function(code, map) {
  // SourceMappingURL comment is already added for you at this point
  fs.writeFileSync('www/bundle.js', code);
  fs.writeFileSync('www/bundle.map', map);
});
```

## License
MIT
