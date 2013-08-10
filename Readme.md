Minifyify
---------
#### Tiny, Debuggable Browserify Bundles

Before, you had to choose between sane debugging and sane load times. Now, you can have both.

Browserify in debug mode tacks on a massive sourceMappingURL with your uncompressed source code, on top of the already uncompressed bundle, resulting in a single massive Javascript file **more than twice as large as your original source code.**

Minifyify minifies your bundle and pulls the source map out into a separate file. Now you can **deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break**.

**Bonus:** Since Minifyify is a transform, dead code paths are removed before Browserify processes `require()`s. You only get the modules you actually use in the final bundle. Works great with [envify](https://npmjs.org/package/envify)!

## Usage

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundle = new browserify()
  , minifier;

// Create a new minifier object for each bundle
// (All options are optional, but highly recommended)
minifier = new minifyify({
    source: 'bundle.js' // Where you intend to place the generated bundle
  , map: 'bundle.map'   // Where you intend to place the generated sourcemap
  , transformPaths:     // Great for shortening your source paths
      function (filePath) {
        // This will make all paths relative to 'project_dir'
        return path.relative('project_dir', filePath);
      }
  });

bundle.add('entryScript.js');

// Note: Pass browserify the transformer, not the minifier object
bundle.transform(minifier.transformer);

// You *must* run in debug mode!
bundle.bundle({debug: true})

// Pipe to the consumer to receive your minified code and accompanying sourcemap
.pipe(minifier.consumer(function(code, map) {
  fs.writeFileSync('www/bundle.js', code);
  fs.writeFileSync('www/bundle.map', map);
}));
```

## License
MIT
