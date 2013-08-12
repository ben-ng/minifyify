Minifyify
---------
#### Tiny, Debuggable Browserify Bundles

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify minifies your bundle and pulls the source map out into a separate file. Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## Known Issues

 * Help! Source maps for backbone apps are broken. See [issue #1](https://github.com/ben-ng/minifyify/issues/1) for more info.
 * Tests aren't complete yet while I focus on fixing [#1](https://github.com/ben-ng/minifyify/issues/1)

## Usage

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , path = require('path')
  , bundle = new browserify()
  , opts = {
      // The URL the source is available at
      file: '/bundle.js'
      // The URL this map is available at
    , map: '/bundle.map'
      // Use this option to compress paths
    , compressPaths: function (p) {
        return path.relative('./www', p);
      }
    };

bundle.add('entryScript.js');

// You *must* run in debug mode!
bundle.bundle({debug: true})

// Pipe output to minifyify
.pipe(minifyify(function(code, map) {
  fs.writeFileSync('www/bundle.js', code);
  fs.writeFileSync('www/bundle.map', map);
}, opts));
```

## License
MIT
