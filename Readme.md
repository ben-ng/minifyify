Minifyify
---------
#### Tiny, Debuggable Browserify Bundles

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify minifies your bundle and pulls the source map out into a separate file. Now you can **deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break**.

## Usage

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundle = new browserify();

bundle.add('entryScript.js');

// You *must* run in debug mode!
bundle.bundle({debug: true})

// Pipe output to minifyify
.pipe(minifyify(function(code, map) {
  fs.writeFileSync('www/bundle.js', code);
  fs.writeFileSync('www/bundle.map', map);
}));
```

## License
MIT
