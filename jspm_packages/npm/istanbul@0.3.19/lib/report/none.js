/* */ 
var util = require("util"),
    Report = require("./index");
function NoneReport() {
  Report.call(this);
}
NoneReport.TYPE = 'none';
util.inherits(NoneReport, Report);
Report.mix(NoneReport, {
  synopsis: function() {
    return 'Does nothing. Useful to override default behavior and suppress reporting entirely';
  },
  writeReport: function() {
    this.emit('done');
  }
});
module.exports = NoneReport;
