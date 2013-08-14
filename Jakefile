var t = new jake.TestTask('minifyify', function () {

  this.testFiles.include('test/findRoot.js');
  this.testFiles.include('test/validator.js');
  this.testFiles.include('test/libraries.js');
  this.testFiles.include('test/bundles.js');

  this.testFiles.include('test/finish.js');
});

npmPublishTask('minifyify', function () {
  this.packageFiles.include([
    'Jakefile'
  , 'lib/**'
  , 'test/**'
  , 'package.json'
  , 'Readme.md'
  ]);
  this.packageFiles.exclude([
    'test/build/apps'
  , 'test/build/libraries'
  ]);
});
