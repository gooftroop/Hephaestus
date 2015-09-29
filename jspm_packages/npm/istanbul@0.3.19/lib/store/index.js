/* */ 
var Factory = require("../util/factory"),
    factory = new Factory('store', __dirname, false);
function Store() {}
factory.bindClassMethods(Store);
Store.prototype = {
  set: function() {
    throw new Error("set: must be overridden");
  },
  get: function() {
    throw new Error("get: must be overridden");
  },
  keys: function() {
    throw new Error("keys: must be overridden");
  },
  hasKey: function() {
    throw new Error("hasKey: must be overridden");
  },
  dispose: function() {},
  getObject: function(key) {
    return JSON.parse(this.get(key));
  },
  setObject: function(key, object) {
    return this.set(key, JSON.stringify(object));
  }
};
module.exports = Store;
