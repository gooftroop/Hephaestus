/* */ 
var Factory = require("../util/factory"),
    factory = new Factory('command', __dirname, true);
function Command() {}
factory.bindClassMethods(Command);
Command.prototype = {
  toolName: function() {
    return require("../util/meta").NAME;
  },
  type: function() {
    return this.constructor.TYPE;
  },
  synopsis: function() {
    return "the developer has not written a one-line summary of the " + this.type() + " command";
  },
  usage: function() {
    console.error("the developer has not provided a usage for the " + this.type() + " command");
  },
  run: function(args, callback) {
    return callback(new Error("run: must be overridden for the " + this.type() + " command"));
  }
};
module.exports = Command;
