Minifyify
=========
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

*Now with Browserify 4 & CoffeeScript support*

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify takes your browserify bundle and minfies it. The magic: your code still maps back to the original, separate source files.

Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## Simple Usage

```js
var browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundler = new browserify();
  , minifier = new minifyify();

bundler.add('entry.js');
bundler.transform({global: true}, minifier.transform);

bundler
  .bundle({debug: true})
  .pipe(minifier.consumer(function (err, src, map) {
    // Your code here
  }));
```

## Full Usage

```js
var path = require('path')
  , browserify = require('browserify')
  , minifyify = require('minifyify')
  , bundler
  , minifier
  , options = {
      compressPath: function (p) {
        return path.relative('my-app-root', p);
      }
    , map: '/bundle.map.json'
    };

bundler = new browserify();
minifier = new minifyify(options);

bundler.add('entry.js')

// Your other transforms
bundler.transform(require('coffeeify'));
bundler.transform(require('hbsfy'));

// Minifies code while tracking sourcemaps
// {global: true} lets us also minify browser shims
bundler.transform({global: true}, minifier.transform);

bundler
  // Debug must be true for minifyify to work
  .bundle({debug: true})

   // Consume pulls the source map out of src and transforms the mappings
  .pipe(minifier.consumer(function (err, src, map) {
    // src and map are strings
    // src has a comment pointing to map
  }));
```

## Options

### [options.compressPath]

Shorten the paths you see in the web inspector by defining a compression function.

```
// A typical compressPath function
compressPath: function (p) {
  return path.relative('my-app-root', p);
}
```

Defaults to a no-op (absolute paths to all source files).

### [options.map]

This is added to the bottom of the minified source file, and should point to where the map will be accessible from on your server. [More details here](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-howwork).

Example: If your bundle is at `mysite.com/bundle.js` and the map is at `mysite.com/map.js`, set `options.map = '/map.js'`

Set to `false` to disable source maps.

## FAQ

 * Why is this not a *real* transform?

   At this time of writing it is not possible to acheive what minifyify does with a pure transform. Minifyify needs to transform browserify's source map, which is only appended after all transforms have run and the bundling process is complete. That is the job of the `.consumer()` function.

 * Wait.. Why did the total size (souce code + map) get BIGGER??

   It's not immediately obvious, but the more you minify code, the bigger the sourcemap gets. Browserify can get away with merely mapping lines to lines because it is going from uncompressed code to uncompressed code. Minifyify squishes multiple lines together, so the sourcemap has to carry more information.

   This is OK because the sourcemap is in a separate file, which means your app will be snappy for your users as their browsers won't download the sourcemap.

 * How does this work?

   Minifyify runs UglifyJS on each file in your bundle, and transforms browserify's sourcemap to map to the original files.

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

Copyright (c) 2013-2014 Ben Ng

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
