/* */ 
var EventEmitter = require("events").EventEmitter;
var assert = require("assert");
var tests = {};
module.exports = test;
test.run = run;
function test(msg, handler) {
  tests[msg] = handler;
}
function run() {
  var specs = Object.keys(tests);
  var specsRemaining = specs.length;
  specs.forEach(function(spec) {
    var handler = tests[spec];
    var shoulds = handler();
    var keys = Object.keys(shoulds);
    var remaining = keys.length;
    keys.forEach(function(should) {
      var em = new EventEmitter(),
          to = setTimeout(function() {
            assert.fail('never ended');
          }, 5000);
      em.on('error', function assertFail(err) {
        assert.fail(err);
      }).on('end', function assertOk() {
        clearTimeout(to);
        shoulds[should].status = true;
        if (!(--remaining)) {
          console.log(['', '» ' + spec, keys.map(function(k) {
            return '   » ' + k;
          }).join('\n'), '', '   Total: ' + keys.length, '   Failed: ' + keys.map(function(item) {
            return shoulds[should].status;
          }).filter(function(status) {
            return !status;
          }).length, ''].join('\n'));
          if (!(--specsRemaining)) {
            console.log('All done');
          }
        }
      });
      shoulds[should](em);
    });
  });
}
