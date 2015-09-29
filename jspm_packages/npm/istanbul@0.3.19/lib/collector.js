/* */ 
(function(process) {
  "use strict";
  var MemoryStore = require("./store/memory"),
      utils = require("./object-utils");
  function Collector(options) {
    options = options || {};
    this.store = options.store || new MemoryStore();
  }
  Collector.prototype = {
    add: function(coverage) {
      var store = this.store;
      Object.keys(coverage).forEach(function(key) {
        var fileCoverage = coverage[key];
        if (store.hasKey(key)) {
          store.setObject(key, utils.mergeFileCoverage(fileCoverage, store.getObject(key)));
        } else {
          store.setObject(key, fileCoverage);
        }
      });
    },
    files: function() {
      return this.store.keys();
    },
    fileCoverageFor: function(fileName) {
      var ret = this.store.getObject(fileName);
      utils.addDerivedInfoForFile(ret);
      return ret;
    },
    getFinalCoverage: function() {
      var ret = {},
          that = this;
      this.files().forEach(function(file) {
        ret[file] = that.fileCoverageFor(file);
      });
      return ret;
    },
    dispose: function() {
      this.store.dispose();
    }
  };
  module.exports = Collector;
})(require("process"));
