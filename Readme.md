Minifyify
---------
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify minifies your bundle and pulls the source map out into a separate file. Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

# IMPORTANT!

This is still a work in progress, and as such there are a few known issues.

 * There is an issue in `browserify` that can result in invalid mappings. [Use this patched fork for the time being](https://github.com/ben-ng/node-browserify).
 * Minifying with `hbsfy` results in a broken sourcemap (see: #6).
 * This uses a [patched uglifyjs2](https://github.com/mishoo/UglifyJS2/pull/268) for the time being.

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
