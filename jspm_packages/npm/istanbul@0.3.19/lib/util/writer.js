/* */ 
var util = require("util"),
    EventEmitter = require("events").EventEmitter;
function extend(cons, proto) {
  Object.keys(proto).forEach(function(k) {
    cons.prototype[k] = proto[k];
  });
}
function ContentWriter() {}
ContentWriter.prototype = {
  write: function() {
    throw new Error('write: must be overridden');
  },
  println: function(str) {
    this.write(str + '\n');
  }
};
function Writer() {
  EventEmitter.call(this);
}
util.inherits(Writer, EventEmitter);
extend(Writer, {
  writeFile: function() {
    throw new Error('writeFile: must be overridden');
  },
  copyFile: function() {
    throw new Error('copyFile: must be overridden');
  },
  done: function() {
    throw new Error('done: must be overridden');
  }
});
module.exports = {
  Writer: Writer,
  ContentWriter: ContentWriter
};
