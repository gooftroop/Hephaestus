/* */ 
(function(process) {
  var util = require("util"),
      path = require("path"),
      os = require("os"),
      fs = require("fs"),
      mkdirp = require("mkdirp"),
      Store = require("./index");
  function makeTempDir() {
    var dir = path.join(os.tmpDir ? os.tmpDir() : (process.env.TMPDIR || '/tmp'), 'ts' + new Date().getTime());
    mkdirp.sync(dir);
    return dir;
  }
  function TmpStore(opts) {
    opts = opts || {};
    this.tmp = opts.tmp || makeTempDir();
    this.map = {};
    this.seq = 0;
    this.prefix = 't' + new Date().getTime() + '-';
  }
  TmpStore.TYPE = 'tmp';
  util.inherits(TmpStore, Store);
  Store.mix(TmpStore, {
    generateTmpFileName: function() {
      this.seq += 1;
      return this.prefix + this.seq + '.tmp';
    },
    set: function(key, contents) {
      var tmpFile = this.generateTmpFileName();
      fs.writeFileSync(tmpFile, contents, 'utf8');
      this.map[key] = tmpFile;
    },
    get: function(key) {
      var tmpFile = this.map[key];
      if (!tmpFile) {
        throw new Error('Unable to find tmp entry for [' + tmpFile + ']');
      }
      return fs.readFileSync(tmpFile, 'utf8');
    },
    hasKey: function(key) {
      return !!this.map[key];
    },
    keys: function() {
      return Object.keys(this.map);
    },
    dispose: function() {
      var map = this.map;
      Object.keys(map).forEach(function(key) {
        fs.unlinkSync(map[key]);
      });
      this.map = {};
    }
  });
  module.exports = TmpStore;
})(require("process"));
