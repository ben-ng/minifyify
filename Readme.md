Minifyify
=========
#### Tiny, Debuggable Browserify Bundles

[![Build Status](https://travis-ci.org/ben-ng/minifyify.png?branch=master)](https://travis-ci.org/ben-ng/minifyify)

*Now with Browserify 4 & CoffeeScript support*

Before, browserify made you choose between sane debugging and sane load times. Now, you can have both.

Minifyify is a browserify plugin that minifies your code. The magic? The sourcemap points back to the original, separate source files.

Now you can deploy a minified bundle in production, and still have a sourcemap handy for when things inevitably break!

## Usage

### Programmatic API
```js
var browserify = require('browserify')
  , bundler = new browserify();

bundler.add('entry.js');

bundler.plugin('minifyify', {map: 'bundle.map.json'});

bundler.bundle(function (err, src, map) {
  // Your code here
});
```

The map option should be the location of the sourcemap on your server, and is used to insert the `sourceMappingURL` comment in `src`.

### Command Line
```sh
$ browserify entry.js -p [minifyify --map bundle.map.json --output bundle.map.json] > bundle.js
```

The `--output` option is a required option on the command line interface and specifies where minifyify should write the sourcemap to on disk.

## Options

### [options.compressPath]

Shorten the paths you see in the web inspector by defining a compression function.

```
// A typical compressPath function
compressPath: function (p) {
  return path.relative('my-app-root', p);
}
```

If a string is provided, it will be used instead of `my-app-root` in the function above. This is useful if you are working from the command line and cannot define a function.

Defaults to a no-op (absolute paths to all source files).

### [options.map]

This is added to the bottom of the minified source file, and should point to where the map will be accessible from on your server. [More details here](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-howwork).

Example: If your bundle is at `mysite.com/bundle.js` and the map is at `mysite.com/map.js`, set `options.map = '/map.js'`

Set to `false` to minify, but not produce a source map or append the source map URL comment.

### [options.minify]

Set to false to disable minification and source map transforms. This essentially turns minifyify into a pass-thru stream.

If you set it to an object, it will be passed as the options argument to `uglify.minify`.

### [options.output]

Specify a path to write the sourcemap to. Required when using the CLI, optional when working programmatically.

## FAQ

 * PARSE ERROR!

   Are you using `brfs`? Pin it to version `1.0.2`. See issue #44 for details.

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
