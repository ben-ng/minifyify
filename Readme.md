Minifyify
=========
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify takes your browserify bundle and minfies it. The magic: your code still maps back to the original, separate source files.

Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## New in 1.0.x
 * Simpler, streaming API
 * A much more robust algorithm
 * Such speed, much performance

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

## Options

### [options.compressPath]

Shorten the paths you see in the web inspector by defining a compression function.

```
// A typical compressPaths function
compressPaths: function (p) {
  return path.relative('my-app-root', p);
}
```

Defaults to a no-op (absolute paths to all source files).

## FAQ

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
