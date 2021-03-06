/* */ 
var path = require("path");
var test = require("tape");
var resolve = require("../index");
test('$NODE_PATH', function(t) {
  t.plan(4);
  resolve('aaa', {
    paths: [__dirname + '/node_path/x', __dirname + '/node_path/y'],
    basedir: __dirname
  }, function(err, res) {
    t.equal(res, __dirname + '/node_path/x/aaa/index.js');
  });
  resolve('bbb', {
    paths: [__dirname + '/node_path/x', __dirname + '/node_path/y'],
    basedir: __dirname
  }, function(err, res) {
    t.equal(res, __dirname + '/node_path/y/bbb/index.js');
  });
  resolve('ccc', {
    paths: [__dirname + '/node_path/x', __dirname + '/node_path/y'],
    basedir: __dirname
  }, function(err, res) {
    t.equal(res, __dirname + '/node_path/x/ccc/index.js');
  });
  resolve('tap', {
    paths: ['node_path'],
    basedir: 'node_path/x'
  }, function(err, res) {
    t.equal(res, path.resolve(__dirname, '..', 'node_modules/tap/lib/main.js'));
  });
});
