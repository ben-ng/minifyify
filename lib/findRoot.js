var _ = require('lodash')
  , path = require('path')
  , utils = require('utilities')
  , findRoot;

findRoot = function (strings) {
  var root = _(strings)

    // Sort in descending order of file path length
    .sortBy(function (entry) {
      return 1000 - entry.length;
    })

    // Reduce until we find the shortest matching path
    .reduce(function (prev, next) {
      var min = Math.min(prev.length, next.length);

      for(var i=0, ii=min; i<ii; i++) {
        if(prev.charAt(i) !== next.charAt(i))
          break;
      }

      return prev.substring(0,i);
    });

  // Replace trailing slash
  root = root.replace(new RegExp(utils.string.escapeRegExpChars(path.sep) + '$'), '');

  // Return a dir, not a file
  if(root.split(path.sep).pop().indexOf('.')<0) {
    return root;
  }
  else {
    return path.dirname(root);
  }
};

module.exports=findRoot;
