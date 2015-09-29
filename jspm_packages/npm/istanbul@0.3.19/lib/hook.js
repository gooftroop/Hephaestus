/* */ 
(function(process) {
  var path = require("path"),
      fs = require("fs"),
      Module = require("module"),
      vm = require("vm"),
      originalLoaders = {},
      originalCreateScript = vm.createScript,
      originalRunInThisContext = vm.runInThisContext;
  function transformFn(matcher, transformer, verbose) {
    return function(code, filename) {
      var shouldHook = typeof filename === 'string' && matcher(path.resolve(filename)),
          transformed,
          changed = false;
      if (shouldHook) {
        if (verbose) {
          console.error('Module load hook: transform [' + filename + ']');
        }
        try {
          transformed = transformer(code, filename);
          changed = true;
        } catch (ex) {
          console.error('Transformation error; return original code');
          console.error(ex);
          transformed = code;
        }
      } else {
        transformed = code;
      }
      return {
        code: transformed,
        changed: changed
      };
    };
  }
  function unloadRequireCache(matcher) {
    if (matcher && typeof require !== 'undefined' && require && require.cache) {
      Object.keys(require.cache).forEach(function(filename) {
        if (matcher(filename)) {
          delete require.cache[filename];
        }
      });
    }
  }
  function hookRequire(matcher, transformer, options) {
    options = options || {};
    var extensions,
        fn = transformFn(matcher, transformer, options.verbose),
        postLoadHook = options.postLoadHook && typeof options.postLoadHook === 'function' ? options.postLoadHook : null;
    extensions = options.extensions || ['.js'];
    extensions.forEach(function(ext) {
      if (!(ext in originalLoaders)) {
        originalLoaders[ext] = Module._extensions[ext] || Module._extensions['.js'];
      }
      Module._extensions[ext] = function(module, filename) {
        var ret = fn(fs.readFileSync(filename, 'utf8'), filename);
        if (ret.changed) {
          module._compile(ret.code, filename);
        } else {
          originalLoaders[ext](module, filename);
        }
        if (postLoadHook) {
          postLoadHook(filename);
        }
      };
    });
  }
  function unhookRequire() {
    Object.keys(originalLoaders).forEach(function(ext) {
      Module._extensions[ext] = originalLoaders[ext];
    });
  }
  function hookCreateScript(matcher, transformer, opts) {
    opts = opts || {};
    var fn = transformFn(matcher, transformer, opts.verbose);
    vm.createScript = function(code, file) {
      var ret = fn(code, file);
      return originalCreateScript(ret.code, file);
    };
  }
  function unhookCreateScript() {
    vm.createScript = originalCreateScript;
  }
  function hookRunInThisContext(matcher, transformer, opts) {
    opts = opts || {};
    var fn = transformFn(matcher, transformer, opts.verbose);
    vm.runInThisContext = function(code, file) {
      var ret = fn(code, file);
      return originalRunInThisContext(ret.code, file);
    };
  }
  function unhookRunInThisContext() {
    vm.runInThisContext = originalRunInThisContext;
  }
  module.exports = {
    hookRequire: hookRequire,
    unhookRequire: unhookRequire,
    hookCreateScript: hookCreateScript,
    unhookCreateScript: unhookCreateScript,
    hookRunInThisContext: hookRunInThisContext,
    unhookRunInThisContext: unhookRunInThisContext,
    unloadRequireCache: unloadRequireCache
  };
})(require("process"));
