/* */ 
var path = require("path");
var istanbul = require("istanbul");
var minimatch = require("minimatch");
var globalSourceCache = require("./source-cache");
var coverageMap = require("./coverage-map");
var SourceCacheStore = require("./source-cache-store");
function isAbsolute(file) {
  if (path.isAbsolute) {
    return path.isAbsolute(file);
  }
  return path.resolve(file) === path.normalize(file);
}
var CoverageReporter = function(rootConfig, helper, logger) {
  var _ = helper._;
  var log = logger.create('coverage');
  this.adapters = [];
  var config = rootConfig.coverageReporter || {};
  var basePath = rootConfig.basePath;
  var reporters = config.reporters;
  var sourceCache = globalSourceCache.get(basePath);
  var includeAllSources = config.includeAllSources === true;
  if (config.watermarks) {
    config.watermarks = helper.merge({}, istanbul.config.defaultConfig().reporting.watermarks, config.watermarks);
  }
  if (!helper.isDefined(reporters)) {
    reporters = [config];
  }
  var collectors;
  var pendingFileWritings = 0;
  var fileWritingFinished = function() {};
  function writeReport(reporter, collector) {
    try {
      reporter.writeReport(collector, true);
    } catch (e) {
      log.error(e);
    }
    --pendingFileWritings;
  }
  function disposeCollectors() {
    if (pendingFileWritings <= 0) {
      _.forEach(collectors, function(collector) {
        collector.dispose();
      });
      fileWritingFinished();
    }
  }
  function normalize(key) {
    var excludeKey = isAbsolute(key) ? path.relative(basePath, key) : key;
    excludeKey = path.normalize(excludeKey);
    return excludeKey;
  }
  function removeFiles(covObj, patterns) {
    var obj = {};
    Object.keys(covObj).forEach(function(key) {
      var found = patterns.some(function(pattern) {
        return minimatch(normalize(key), pattern, {dot: true});
      });
      if (!found) {
        obj[key] = covObj[key];
      }
    });
    return obj;
  }
  function overrideThresholds(key, overrides) {
    var thresholds = {};
    Object.keys(overrides).some(function(pattern) {
      if (minimatch(normalize(key), pattern, {dot: true})) {
        thresholds = overrides[pattern];
        return true;
      }
    });
    return thresholds;
  }
  function checkCoverage(browser, collector) {
    var defaultThresholds = {
      global: {
        statements: 0,
        branches: 0,
        lines: 0,
        functions: 0,
        excludes: []
      },
      each: {
        statements: 0,
        branches: 0,
        lines: 0,
        functions: 0,
        excludes: [],
        overrides: {}
      }
    };
    var thresholds = helper.merge({}, defaultThresholds, config.check);
    var rawCoverage = collector.getFinalCoverage();
    var globalResults = istanbul.utils.summarizeCoverage(removeFiles(rawCoverage, thresholds.global.excludes));
    var eachResults = removeFiles(rawCoverage, thresholds.each.excludes);
    Object.keys(eachResults).forEach(function(key) {
      eachResults[key] = istanbul.utils.summarizeFileCoverage(eachResults[key]);
    });
    var coverageFailed = false;
    function check(name, thresholds, actuals) {
      var keys = ['statements', 'branches', 'lines', 'functions'];
      keys.forEach(function(key) {
        var actual = actuals[key].pct;
        var actualUncovered = actuals[key].total - actuals[key].covered;
        var threshold = thresholds[key];
        if (threshold < 0) {
          if (threshold * -1 < actualUncovered) {
            coverageFailed = true;
            log.error(browser.name + ': Uncovered count for ' + key + ' (' + actualUncovered + ') exceeds ' + name + ' threshold (' + -1 * threshold + ')');
          }
        } else {
          if (actual < threshold) {
            coverageFailed = true;
            log.error(browser.name + ': Coverage for ' + key + ' (' + actual + '%) does not meet ' + name + ' threshold (' + threshold + '%)');
          }
        }
      });
    }
    check('global', thresholds.global, globalResults);
    Object.keys(eachResults).forEach(function(key) {
      var keyThreshold = helper.merge(thresholds.each, overrideThresholds(key, thresholds.each.overrides));
      check('per-file' + ' (' + key + ') ', keyThreshold, eachResults[key]);
    });
    return coverageFailed;
  }
  function generateOutputDir(browserName, dir, subdir) {
    dir = dir || 'coverage';
    subdir = subdir || browserName;
    if (_.isFunction(subdir)) {
      subdir = subdir(browserName);
    }
    return path.join(dir, subdir);
  }
  this.onRunStart = function(browsers) {
    collectors = Object.create(null);
    if (browsers) {
      browsers.forEach(this.onBrowserStart.bind(this));
    }
  };
  this.onBrowserStart = function(browser) {
    collectors[browser.id] = new istanbul.Collector();
    if (!includeAllSources)
      return ;
    collectors[browser.id].add(coverageMap.get());
  };
  this.onBrowserComplete = function(browser, result) {
    var collector = collectors[browser.id];
    if (!collector)
      return ;
    if (!result || !result.coverage)
      return ;
    collector.add(result.coverage);
  };
  this.onSpecComplete = function(browser, result) {
    if (!result.coverage)
      return ;
    collectors[browser.id].add(result.coverage);
  };
  this.onRunComplete = function(browsers, results) {
    var checkedCoverage = {};
    reporters.forEach(function(reporterConfig) {
      browsers.forEach(function(browser) {
        var collector = collectors[browser.id];
        if (!collector) {
          return ;
        }
        if (config.hasOwnProperty('check') && !checkedCoverage[browser.id]) {
          checkedCoverage[browser.id] = true;
          var coverageFailed = checkCoverage(browser, collector);
          if (coverageFailed) {
            if (results) {
              results.exitCode = 1;
            }
          }
        }
        pendingFileWritings++;
        var mainDir = reporterConfig.dir || config.dir;
        var subDir = reporterConfig.subdir || config.subdir;
        var simpleOutputDir = generateOutputDir(browser.name, mainDir, subDir);
        var resolvedOutputDir = path.resolve(basePath, simpleOutputDir);
        var outputDir = helper.normalizeWinPath(resolvedOutputDir);
        var sourceStore = _.isEmpty(sourceCache) ? null : new SourceCacheStore({sourceCache: sourceCache});
        var options = helper.merge({sourceStore: sourceStore}, config, reporterConfig, {dir: outputDir});
        var reporter = istanbul.Report.create(reporterConfig.type || 'html', options);
        var isConsole = reporterConfig.type && reporterConfig.type.match(/^(text|text-summary)$/);
        var hasNoFile = _.isUndefined(reporterConfig.file);
        if (isConsole && hasNoFile) {
          writeReport(reporter, collector);
          return ;
        }
        helper.mkdirIfNotExists(outputDir, function() {
          log.debug('Writing coverage to %s', outputDir);
          writeReport(reporter, collector);
          disposeCollectors();
        });
      });
    });
    disposeCollectors();
  };
  this.onExit = function(done) {
    if (pendingFileWritings) {
      fileWritingFinished = done;
    } else {
      done();
    }
  };
};
CoverageReporter.$inject = ['config', 'helper', 'logger'];
module.exports = CoverageReporter;
