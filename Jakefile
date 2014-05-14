/* globals jake, npmPublishTask */

new jake.TestTask('minifyify', function () {
  this.testFiles.include('test/user-errors.js');
  this.testFiles.include('test/bundles.js');
});

npmPublishTask('minifyify', function () {
  this.packageFiles.include([
    'Jakefile'
  , 'lib/**'
  , 'test/**'
  , 'bin/*'
  , 'package.json'
  , 'Readme.md'
  ]);
  this.packageFiles.exclude([
    'test/build/apps'
  ]);
});
