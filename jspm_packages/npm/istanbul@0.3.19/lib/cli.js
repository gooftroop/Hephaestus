/* */ 
(function(process) {
  var async = require("async"),
      Command = require("./command/index"),
      inputError = require("./util/input-error"),
      exitProcess = process.exit;
  require("./register-plugins");
  function findCommandPosition(args) {
    var i;
    for (i = 0; i < args.length; i += 1) {
      if (args[i].charAt(0) !== '-') {
        return i;
      }
    }
    return -1;
  }
  function exit(ex, code) {
    var streams = [process.stdout, process.stderr];
    async.forEach(streams, function(stream, done) {
      stream.write('', done);
    }, function() {
      if (ex) {
        throw ex;
      } else {
        exitProcess(code);
      }
    });
  }
  function errHandler(ex) {
    if (!ex) {
      return ;
    }
    if (!ex.inputError) {
      exit(ex);
    } else {
      console.error(ex.message);
      console.error('Try "istanbul help" for usage');
      exit(null, 1);
    }
  }
  function runCommand(args, callback) {
    var pos = findCommandPosition(args),
        command,
        commandArgs,
        commandObject;
    if (pos < 0) {
      return callback(inputError.create('Need a command to run'));
    }
    commandArgs = args.slice(0, pos);
    command = args[pos];
    commandArgs.push.apply(commandArgs, args.slice(pos + 1));
    try {
      commandObject = Command.create(command);
    } catch (ex) {
      errHandler(inputError.create(ex.message));
      return ;
    }
    commandObject.run(commandArgs, errHandler);
  }
  function runToCompletion(args) {
    runCommand(args, errHandler);
  }
  if (require.main === module) {
    var args = Array.prototype.slice.call(process.argv, 2);
    runToCompletion(args);
  }
  module.exports = {runToCompletion: runToCompletion};
})(require("process"));
