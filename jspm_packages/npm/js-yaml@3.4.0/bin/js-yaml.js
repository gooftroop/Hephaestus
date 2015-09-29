/* */ 
(function(Buffer, process) {
  'use strict';
  var fs = require("fs");
  var argparse = require("argparse");
  var yaml = require("../index");
  var cli = new argparse.ArgumentParser({
    prog: 'js-yaml',
    version: require("../package.json!systemjs-json").version,
    addHelp: true
  });
  cli.addArgument(['-c', '--compact'], {
    help: 'Display errors in compact mode',
    action: 'storeTrue'
  });
  cli.addArgument(['-j', '--to-json'], {
    help: argparse.Const.SUPPRESS,
    dest: 'json',
    action: 'storeTrue'
  });
  cli.addArgument(['-t', '--trace'], {
    help: 'Show stack trace on error',
    action: 'storeTrue'
  });
  cli.addArgument(['file'], {
    help: 'File to read, utf-8 encoded without BOM',
    nargs: '?',
    defaultValue: '-'
  });
  var options = cli.parseArgs();
  function readFile(filename, encoding, callback) {
    if (options.file === '-') {
      var chunks = [];
      process.stdin.on('data', function(chunk) {
        chunks.push(chunk);
      });
      process.stdin.on('end', function() {
        return callback(null, Buffer.concat(chunks).toString(encoding));
      });
    } else {
      fs.readFile(filename, encoding, callback);
    }
  }
  readFile(options.file, 'utf8', function(error, input) {
    var output,
        isYaml;
    if (error) {
      if (error.code === 'ENOENT') {
        console.error('File not found: ' + options.file);
        process.exit(2);
      }
      console.error(options.trace && error.stack || error.message || String(error));
      process.exit(1);
    }
    try {
      output = JSON.parse(input);
      isYaml = false;
    } catch (error) {
      if (error instanceof SyntaxError) {
        try {
          output = [];
          yaml.loadAll(input, function(doc) {
            output.push(doc);
          }, {});
          isYaml = true;
          if (0 === output.length) {
            output = null;
          } else if (1 === output.length) {
            output = output[0];
          }
        } catch (error) {
          if (options.trace && error.stack) {
            console.error(error.stack);
          } else {
            console.error(error.toString(options.compact));
          }
          process.exit(1);
        }
      } else {
        console.error(options.trace && error.stack || error.message || String(error));
        process.exit(1);
      }
    }
    if (isYaml) {
      console.log(JSON.stringify(output, null, '  '));
    } else {
      console.log(yaml.dump(output));
    }
    process.exit(0);
  });
})(require('@empty').Buffer, require("process"));
