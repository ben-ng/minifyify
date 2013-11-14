Minifyify
=========
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify minifies your bundle and pulls the source map out into a separate file. Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## Usage

```sh
browserify -d entry.js | minifyify > bundle.min.js
```

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundle = new browserify()
  , out = fs.createWriteStream('bundle.min.js');

bundle('entry.js')
  .bundle({debug: true})
  .pipe(minifyify())
  .pipe(out);
```

## FAQ

 * How does this work?

   Minifyify runs UglifyJS on your bundle, and uses Browserify's inline sourcemap to create a new sourcemap that maps the minified code to the unbundled files.

 * Why does the sourcemap cause my debugger to behave erratically?

   Some of the optimizations UglifyJS performs will result in sourcemaps that appear to broken. For example, when UglifyJS uses the comma operator to shorten statements on different lines, a single debugger "step" in minified code may execute multiple lines of the original source.

## License

The MIT License (MIT)

Copyright (c) 2013 Ben Ng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
