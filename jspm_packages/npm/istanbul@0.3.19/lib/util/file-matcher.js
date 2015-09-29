/* */ 
(function(process) {
  var async = require("async"),
      fileset = require("fileset"),
      fs = require("fs"),
      path = require("path"),
      seq = 0;
  function filesFor(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = options || {};
    var root = options.root,
        includes = options.includes,
        excludes = options.excludes,
        realpath = options.realpath,
        relative = options.relative,
        opts;
    root = root || process.cwd();
    includes = includes && Array.isArray(includes) ? includes : ['**/*.js'];
    excludes = excludes && Array.isArray(excludes) ? excludes : ['**/node_modules/**'];
    opts = {
      cwd: root,
      nodir: true
    };
    seq += 1;
    opts['x' + seq + new Date().getTime()] = true;
    fileset(includes.join(' '), excludes.join(' '), opts, function(err, files) {
      if (err) {
        return callback(err);
      }
      if (relative) {
        return callback(err, files);
      }
      if (!realpath) {
        files = files.map(function(file) {
          return path.resolve(root, file);
        });
        return callback(err, files);
      }
      var realPathCache = module.constructor._realpathCache || {};
      async.map(files, function(file, done) {
        fs.realpath(path.resolve(root, file), realPathCache, done);
      }, callback);
    });
  }
  function matcherFor(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = null;
    }
    options = options || {};
    options.relative = false;
    options.realpath = true;
    filesFor(options, function(err, files) {
      var fileMap = {},
          matchFn;
      if (err) {
        return callback(err);
      }
      files.forEach(function(file) {
        fileMap[file] = true;
      });
      matchFn = function(file) {
        return fileMap[file];
      };
      matchFn.files = Object.keys(fileMap);
      return callback(null, matchFn);
    });
  }
  module.exports = {
    filesFor: filesFor,
    matcherFor: matcherFor
  };
})(require("process"));
