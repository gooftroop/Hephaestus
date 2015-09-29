/* */ 
var util = require("util"),
    fs = require("fs"),
    Store = require("./index");
function LookupStore(opts) {
  Store.call(this, opts);
}
LookupStore.TYPE = 'fslookup';
util.inherits(LookupStore, Store);
Store.mix(LookupStore, {
  keys: function() {
    return [];
  },
  get: function(key) {
    return fs.readFileSync(key, 'utf8');
  },
  hasKey: function(key) {
    var stats;
    try {
      stats = fs.statSync(key);
      return stats.isFile();
    } catch (ex) {
      return false;
    }
  },
  set: function(key) {
    if (!this.hasKey(key)) {
      throw new Error('Attempt to set contents for non-existent file [' + key + '] on a fslookup store');
    }
    return key;
  }
});
module.exports = LookupStore;
