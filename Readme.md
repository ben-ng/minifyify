Minifyify
=========
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

*Now with browserify 3 support*

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify takes your browserify bundle and minfies it. The magic: your code still maps back to the original, separate source files.

Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## Usage

Bundle your app with browserify's debug option, then pipe it to minifyify.

```sh
browserify -d entry.js | minifyify > bundle.min.js
```

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundle = new browserify()
  , out = fs.createWriteStream('bundle.min.js')
  , options // See docs;

bundle('entry.js')
  .bundle({debug: true})
  .pipe(minifyify(options))
  .pipe(out); // output is a minified bundle with an inline source map
```

You can also use callbacks to get your code and map in separate files

```js
bundle('entry.js')
  .bundle({debug: true})
  .pipe(minifyify(options, function (err, src, map) {
    assert.ifError(err);
    fs.writeFileSync('bundle.min.js', src);
    fs.writeFileSync('bundle.min.map.json', map);
  }))
```

## Options

### [options.compressPath]

Shorten the paths you see in the web inspector by defining a compression function.

```
// A typical compressPaths function
compressPaths: function (p) {
  return path.relative('my-app-root', p);
}
```

### [options.map]

If you are using an external sourcemap, this is the path to it (string), which is added to the bottom of the minified file so browsers can correctly map. [More details here](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-howwork).

Set to `false` to disable source maps.

Defaults to a no-op (absolute paths to all source files).

## FAQ

 * Wait.. Why did my bundle get BIGGER??

   It's not immediately obvious, but the more you minify code, the bigger the sourcemap gets. Browserify can get away with merely mapping lines to lines because it is going from uncompressed code to uncompressed code. Minifyify squishes multiple lines together, so the sourcemap has to carry more information.

   **Pull the sourcemap out into a separate file and link to it from the minified source!**

 * How does this work?

   Minifyify runs UglifyJS on your bundle, and uses Browserify's inline sourcemap to create a new sourcemap that maps the minified code to the unbundled files.

 * Why does the sourcemap cause my debugger to behave erratically?

   Some of the optimizations UglifyJS performs will result in sourcemaps that appear to broken. For example, when UglifyJS uses the comma operator to shorten statements on different lines, a single debugger "step" in minified code may execute multiple lines of the original source.

   Another common example of erratic behavior is when code like this is compressed:

   ```
   var myThing = myFunc('a')
    , cantGetHere = myFunc('b');
   ```

   If you set a breakpoint on the second line, your debugger might not pause execution there. I've found that setting the breakpoint on the first line and stepping onto the second line is more reliable.

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
