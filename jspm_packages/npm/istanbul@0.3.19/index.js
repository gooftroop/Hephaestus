/* */ 
(function(process) {
  var path = require("path"),
      Store = require("./lib/store/index"),
      Report = require("./lib/report/index"),
      meta = require("./lib/util/meta");
  require("./lib/register-plugins");
  module.exports = {
    Instrumenter: require("./lib/instrumenter"),
    Store: Store,
    Collector: require("./lib/collector"),
    hook: require("./lib/hook"),
    Report: Report,
    config: require("./lib/config"),
    Reporter: require("./lib/reporter"),
    utils: require("./lib/object-utils"),
    matcherFor: require("./lib/util/file-matcher").matcherFor,
    VERSION: meta.VERSION,
    Writer: require("./lib/util/writer").Writer,
    ContentWriter: require("./lib/util/writer").ContentWriter,
    FileWriter: require("./lib/util/file-writer"),
    _yuiLoadHook: require("./lib/util/yui-load-hook"),
    TreeSummarizer: require("./lib/util/tree-summarizer"),
    assetsDir: path.resolve(__dirname, 'lib', 'vendor')
  };
})(require("process"));
