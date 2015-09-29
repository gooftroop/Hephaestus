/* */ 
(function(process) {
  (function(isNode) {
    function addDerivedInfoForFile(fileCoverage) {
      var statementMap = fileCoverage.statementMap,
          statements = fileCoverage.s,
          lineMap;
      if (!fileCoverage.l) {
        fileCoverage.l = lineMap = {};
        Object.keys(statements).forEach(function(st) {
          var line = statementMap[st].start.line,
              count = statements[st],
              prevVal = lineMap[line];
          if (count === 0 && statementMap[st].skip) {
            count = 1;
          }
          if (typeof prevVal === 'undefined' || prevVal < count) {
            lineMap[line] = count;
          }
        });
      }
    }
    function addDerivedInfo(coverage) {
      Object.keys(coverage).forEach(function(k) {
        addDerivedInfoForFile(coverage[k]);
      });
    }
    function removeDerivedInfo(coverage) {
      Object.keys(coverage).forEach(function(k) {
        delete coverage[k].l;
      });
    }
    function percent(covered, total) {
      var tmp;
      if (total > 0) {
        tmp = 1000 * 100 * covered / total + 5;
        return Math.floor(tmp / 10) / 100;
      } else {
        return 100.00;
      }
    }
    function computeSimpleTotals(fileCoverage, property, mapProperty) {
      var stats = fileCoverage[property],
          map = mapProperty ? fileCoverage[mapProperty] : null,
          ret = {
            total: 0,
            covered: 0,
            skipped: 0
          };
      Object.keys(stats).forEach(function(key) {
        var covered = !!stats[key],
            skipped = map && map[key].skip;
        ret.total += 1;
        if (covered || skipped) {
          ret.covered += 1;
        }
        if (!covered && skipped) {
          ret.skipped += 1;
        }
      });
      ret.pct = percent(ret.covered, ret.total);
      return ret;
    }
    function computeBranchTotals(fileCoverage) {
      var stats = fileCoverage.b,
          branchMap = fileCoverage.branchMap,
          ret = {
            total: 0,
            covered: 0,
            skipped: 0
          };
      Object.keys(stats).forEach(function(key) {
        var branches = stats[key],
            map = branchMap[key],
            covered,
            skipped,
            i;
        for (i = 0; i < branches.length; i += 1) {
          covered = branches[i] > 0;
          skipped = map.locations && map.locations[i] && map.locations[i].skip;
          if (covered || skipped) {
            ret.covered += 1;
          }
          if (!covered && skipped) {
            ret.skipped += 1;
          }
        }
        ret.total += branches.length;
      });
      ret.pct = percent(ret.covered, ret.total);
      return ret;
    }
    function blankSummary() {
      return {
        lines: {
          total: 0,
          covered: 0,
          skipped: 0,
          pct: 'Unknown'
        },
        statements: {
          total: 0,
          covered: 0,
          skipped: 0,
          pct: 'Unknown'
        },
        functions: {
          total: 0,
          covered: 0,
          skipped: 0,
          pct: 'Unknown'
        },
        branches: {
          total: 0,
          covered: 0,
          skipped: 0,
          pct: 'Unknown'
        },
        linesCovered: {}
      };
    }
    function summarizeFileCoverage(fileCoverage) {
      var ret = blankSummary();
      addDerivedInfoForFile(fileCoverage);
      ret.lines = computeSimpleTotals(fileCoverage, 'l');
      ret.functions = computeSimpleTotals(fileCoverage, 'f', 'fnMap');
      ret.statements = computeSimpleTotals(fileCoverage, 's', 'statementMap');
      ret.branches = computeBranchTotals(fileCoverage);
      ret.linesCovered = fileCoverage.l;
      return ret;
    }
    function mergeFileCoverage(first, second) {
      var ret = JSON.parse(JSON.stringify(first)),
          i;
      delete ret.l;
      Object.keys(second.s).forEach(function(k) {
        ret.s[k] += second.s[k];
      });
      Object.keys(second.f).forEach(function(k) {
        ret.f[k] += second.f[k];
      });
      Object.keys(second.b).forEach(function(k) {
        var retArray = ret.b[k],
            secondArray = second.b[k];
        for (i = 0; i < retArray.length; i += 1) {
          retArray[i] += secondArray[i];
        }
      });
      return ret;
    }
    function mergeSummaryObjects() {
      var ret = blankSummary(),
          args = Array.prototype.slice.call(arguments),
          keys = ['lines', 'statements', 'branches', 'functions'],
          increment = function(obj) {
            if (obj) {
              keys.forEach(function(key) {
                ret[key].total += obj[key].total;
                ret[key].covered += obj[key].covered;
                ret[key].skipped += obj[key].skipped;
              });
              Object.keys(obj.linesCovered).forEach(function(key) {
                if (!ret.linesCovered[key]) {
                  ret.linesCovered[key] = obj.linesCovered[key];
                } else {
                  ret.linesCovered[key] += obj.linesCovered[key];
                }
              });
            }
          };
      args.forEach(function(arg) {
        increment(arg);
      });
      keys.forEach(function(key) {
        ret[key].pct = percent(ret[key].covered, ret[key].total);
      });
      return ret;
    }
    function summarizeCoverage(coverage) {
      var fileSummary = [];
      Object.keys(coverage).forEach(function(key) {
        fileSummary.push(summarizeFileCoverage(coverage[key]));
      });
      return mergeSummaryObjects.apply(null, fileSummary);
    }
    function toYUICoverage(coverage) {
      var ret = {};
      addDerivedInfo(coverage);
      Object.keys(coverage).forEach(function(k) {
        var fileCoverage = coverage[k],
            lines = fileCoverage.l,
            functions = fileCoverage.f,
            fnMap = fileCoverage.fnMap,
            o;
        o = ret[k] = {
          lines: {},
          calledLines: 0,
          coveredLines: 0,
          functions: {},
          calledFunctions: 0,
          coveredFunctions: 0
        };
        Object.keys(lines).forEach(function(k) {
          o.lines[k] = lines[k];
          o.coveredLines += 1;
          if (lines[k] > 0) {
            o.calledLines += 1;
          }
        });
        Object.keys(functions).forEach(function(k) {
          var name = fnMap[k].name + ':' + fnMap[k].line;
          o.functions[name] = functions[k];
          o.coveredFunctions += 1;
          if (functions[k] > 0) {
            o.calledFunctions += 1;
          }
        });
      });
      return ret;
    }
    function incrementIgnoredTotals(cov) {
      var fileCoverage = JSON.parse(JSON.stringify(cov));
      [{
        mapKey: 'statementMap',
        hitsKey: 's'
      }, {
        mapKey: 'branchMap',
        hitsKey: 'b'
      }, {
        mapKey: 'fnMap',
        hitsKey: 'f'
      }].forEach(function(keys) {
        Object.keys(fileCoverage[keys.mapKey]).forEach(function(key) {
          var map = fileCoverage[keys.mapKey][key];
          var hits = fileCoverage[keys.hitsKey];
          if (keys.mapKey === 'branchMap') {
            var locations = map.locations;
            locations.forEach(function(location, index) {
              if (hits[key][index] === 0 && location.skip) {
                hits[key][index] = 1;
              }
            });
            return ;
          }
          if (hits[key] === 0 && map.skip) {
            hits[key] = 1;
          }
        });
      });
      return fileCoverage;
    }
    var exportables = {
      addDerivedInfo: addDerivedInfo,
      addDerivedInfoForFile: addDerivedInfoForFile,
      removeDerivedInfo: removeDerivedInfo,
      blankSummary: blankSummary,
      summarizeFileCoverage: summarizeFileCoverage,
      summarizeCoverage: summarizeCoverage,
      mergeFileCoverage: mergeFileCoverage,
      mergeSummaryObjects: mergeSummaryObjects,
      toYUICoverage: toYUICoverage,
      incrementIgnoredTotals: incrementIgnoredTotals
    };
    if (isNode) {
      module.exports = exportables;
    } else {
      window.coverageUtils = exportables;
    }
  }(typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof exports !== 'undefined'));
})(require("process"));
