/* */ 
var util = require("util"),
    EventEmitter = require("events").EventEmitter,
    Factory = require("../util/factory"),
    factory = new Factory('report', __dirname, false);
function Report() {
  EventEmitter.call(this);
}
util.inherits(Report, EventEmitter);
factory.bindClassMethods(Report);
var proto = {
  synopsis: function() {
    throw new Error('synopsis must be overridden');
  },
  getDefaultConfig: function() {
    return null;
  },
  writeReport: function() {
    throw new Error('writeReport: must be overridden');
  }
};
Object.keys(proto).forEach(function(k) {
  Report.prototype[k] = proto[k];
});
module.exports = Report;
