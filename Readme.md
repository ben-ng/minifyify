Minifyify
---------
##### Minify your browserify bundle without losing the sourcemap


## Usage

Just like how you would use `concat-stream`.

```js
var mold = require('mold-source-map')
  , browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundle = browserify();

bundle.add(something);

bundle.bundle({debug: true})
.on('error', function (err) { console.error(err); })

// Shorten your source maps
.pipe(mold.transformSourcesRelativeTo(path.dirname(inputFile)))

// Magic happens here
.pipe(minifyify(function (src, map) {
  // Don't forget to append the sourceMappingURL yourself
  fs.writeFileSync(OUTPUT_FILE, src  + ';\n//@ sourceMappingURL=/scripts.map\n');
  fs.writeFileSync(OUTPUT_MAP, map);
});
```

## License
MIT
