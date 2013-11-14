var t = new jake.TestTask('minifyify', function () {
  this.testFiles.include('test/bundles.js');
  this.testFiles.include('test/cmd.js');
});

npmPublishTask('minifyify', function () {
  this.packageFiles.include([
    'Jakefile'
  , 'lib/**'
  , 'test/**'
  , 'browserify.js'
  , 'package.json'
  , 'Readme.md'
  ]);
  this.packageFiles.exclude([
    'test/build/apps'
  , 'test/build/libraries'
  ]);
});
