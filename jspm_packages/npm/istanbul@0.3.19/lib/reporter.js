/* */ 
(function(process) {
  var Report = require("./report/index"),
      configuration = require("./config"),
      inputError = require("./util/input-error");
  function Reporter(cfg, dir) {
    this.config = cfg || configuration.loadFile();
    this.dir = dir || this.config.reporting.dir();
    this.reports = {};
  }
  Reporter.prototype = {
    add: function(fmt) {
      if (this.reports[fmt]) {
        return ;
      }
      var config = this.config,
          rptConfig = config.reporting.reportConfig()[fmt] || {};
      rptConfig.verbose = config.verbose;
      rptConfig.dir = this.dir;
      rptConfig.watermarks = config.reporting.watermarks();
      try {
        this.reports[fmt] = Report.create(fmt, rptConfig);
      } catch (ex) {
        throw inputError.create('Invalid report format [' + fmt + ']');
      }
    },
    addAll: function(fmts) {
      var that = this;
      fmts.forEach(function(f) {
        that.add(f);
      });
    },
    write: function(collector, sync, callback) {
      var reports = this.reports,
          verbose = this.config.verbose,
          handler = this.handleDone.bind(this, callback);
      this.inProgress = Object.keys(reports).length;
      Object.keys(reports).forEach(function(name) {
        var report = reports[name];
        if (verbose) {
          console.error('Write report: ' + name);
        }
        report.on('done', handler);
        report.writeReport(collector, sync);
      });
    },
    handleDone: function(callback) {
      this.inProgress -= 1;
      if (this.inProgress === 0) {
        return callback();
      }
    }
  };
  module.exports = Reporter;
})(require("process"));
