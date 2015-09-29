/* */ 
var util = require("util"),
    Store = require("./index");
function MemoryStore() {
  Store.call(this);
  this.map = {};
}
MemoryStore.TYPE = 'memory';
util.inherits(MemoryStore, Store);
Store.mix(MemoryStore, {
  set: function(key, contents) {
    this.map[key] = contents;
  },
  get: function(key) {
    if (!this.hasKey(key)) {
      throw new Error('Unable to find entry for [' + key + ']');
    }
    return this.map[key];
  },
  hasKey: function(key) {
    return this.map.hasOwnProperty(key);
  },
  keys: function() {
    return Object.keys(this.map);
  },
  dispose: function() {
    this.map = {};
  }
});
module.exports = MemoryStore;
