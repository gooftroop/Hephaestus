/* */ 
(function(process) {
  var path = require("path"),
      fs = require("fs"),
      existsSync = fs.existsSync || path.existsSync,
      CAMEL_PATTERN = /([a-z])([A-Z])/g,
      YML_PATTERN = /\.ya?ml$/,
      yaml = require("js-yaml"),
      defaults = require("./report/common/defaults");
  function defaultConfig(includeBackCompatAttrs) {
    var ret = {
      verbose: false,
      instrumentation: {
        root: '.',
        extensions: ['.js'],
        'default-excludes': true,
        excludes: [],
        'embed-source': false,
        variable: '__coverage__',
        compact: true,
        'preserve-comments': false,
        'complete-copy': false,
        'save-baseline': false,
        'baseline-file': './coverage/coverage-baseline.json',
        'include-all-sources': false,
        'include-pid': false
      },
      reporting: {
        print: 'summary',
        reports: ['lcov'],
        dir: './coverage'
      },
      hooks: {
        'hook-run-in-context': false,
        'post-require-hook': null,
        'handle-sigint': false
      },
      check: {
        global: {
          statements: 0,
          lines: 0,
          branches: 0,
          functions: 0,
          excludes: []
        },
        each: {
          statements: 0,
          lines: 0,
          branches: 0,
          functions: 0,
          excludes: []
        }
      }
    };
    ret.reporting.watermarks = defaults.watermarks();
    ret.reporting['report-config'] = defaults.defaultReportConfig();
    if (includeBackCompatAttrs) {
      ret.instrumentation['preload-sources'] = false;
    }
    return ret;
  }
  function dasherize(word) {
    return word.replace(CAMEL_PATTERN, function(match, lch, uch) {
      return lch + '-' + uch.toLowerCase();
    });
  }
  function isScalar(v) {
    if (v === null) {
      return true;
    }
    return v !== undefined && !Array.isArray(v) && typeof v !== 'object';
  }
  function isObject(v) {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }
  function mergeObjects(explicit, template) {
    var ret = {};
    Object.keys(template).forEach(function(k) {
      var v1 = template[k],
          v2 = explicit[k];
      if (Array.isArray(v1)) {
        ret[k] = Array.isArray(v2) && v2.length > 0 ? v2 : v1;
      } else if (isObject(v1)) {
        v2 = isObject(v2) ? v2 : {};
        ret[k] = mergeObjects(v2, v1);
      } else {
        ret[k] = isScalar(v2) ? v2 : v1;
      }
    });
    return ret;
  }
  function mergeDefaults(explicit, implicit) {
    return mergeObjects(explicit || {}, implicit);
  }
  function addMethods() {
    var args = Array.prototype.slice.call(arguments),
        cons = args.shift();
    args.forEach(function(arg) {
      var method = arg,
          property = dasherize(arg);
      cons.prototype[method] = function() {
        return this.config[property];
      };
    });
  }
  function InstrumentOptions(config) {
    if (config['preload-sources']) {
      console.error('The preload-sources option is deprecated, please use include-all-sources instead.');
      config['include-all-sources'] = config['preload-sources'];
    }
    this.config = config;
  }
  addMethods(InstrumentOptions, 'extensions', 'defaultExcludes', 'completeCopy', 'embedSource', 'variable', 'compact', 'preserveComments', 'saveBaseline', 'baselineFile', 'includeAllSources', 'includePid');
  InstrumentOptions.prototype.root = function() {
    return path.resolve(this.config.root);
  };
  InstrumentOptions.prototype.excludes = function(excludeTests) {
    var defs;
    if (this.defaultExcludes()) {
      defs = ['**/node_modules/**'];
      if (excludeTests) {
        defs = defs.concat(['**/test/**', '**/tests/**']);
      }
      return defs.concat(this.config.excludes);
    }
    return this.config.excludes;
  };
  function ReportingOptions(config) {
    this.config = config;
  }
  addMethods(ReportingOptions, 'print', 'reports', 'dir', 'reportConfig');
  function isInvalidMark(v, key) {
    var prefix = 'Watermark for [' + key + '] :';
    if (v.length !== 2) {
      return prefix + 'must be an array of length 2';
    }
    v[0] = Number(v[0]);
    v[1] = Number(v[1]);
    if (isNaN(v[0]) || isNaN(v[1])) {
      return prefix + 'must have valid numbers';
    }
    if (v[0] < 0 || v[1] < 0) {
      return prefix + 'must be positive numbers';
    }
    if (v[1] > 100) {
      return prefix + 'cannot exceed 100';
    }
    if (v[1] <= v[0]) {
      return prefix + 'low must be less than high';
    }
    return null;
  }
  ReportingOptions.prototype.watermarks = function() {
    var v = this.config.watermarks,
        defs = defaults.watermarks(),
        ret = {};
    Object.keys(defs).forEach(function(k) {
      var mark = v[k],
          message = isInvalidMark(mark, k);
      if (message) {
        console.error(message);
        ret[k] = defs[k];
      } else {
        ret[k] = mark;
      }
    });
    return ret;
  };
  function HookOptions(config) {
    this.config = config;
  }
  addMethods(HookOptions, 'hookRunInContext', 'postRequireHook', 'handleSigint');
  function Configuration(obj, overrides) {
    var config = mergeDefaults(obj, defaultConfig(true));
    if (isObject(overrides)) {
      config = mergeDefaults(overrides, config);
    }
    if (config.verbose) {
      console.error('Using configuration');
      console.error('-------------------');
      console.error(yaml.safeDump(config, {
        indent: 4,
        flowLevel: 3
      }));
      console.error('-------------------\n');
    }
    this.verbose = config.verbose;
    this.instrumentation = new InstrumentOptions(config.instrumentation);
    this.reporting = new ReportingOptions(config.reporting);
    this.hooks = new HookOptions(config.hooks);
    this.check = config.check;
  }
  function loadFile(file, overrides) {
    var defaultConfigFile = path.resolve('.istanbul.yml'),
        configObject;
    if (file) {
      if (!existsSync(file)) {
        throw new Error('Invalid configuration file specified:' + file);
      }
    } else {
      if (existsSync(defaultConfigFile)) {
        file = defaultConfigFile;
      }
    }
    if (file) {
      console.error('Loading config: ' + file);
      configObject = file.match(YML_PATTERN) ? yaml.safeLoad(fs.readFileSync(file, 'utf8'), {filename: file}) : require(path.resolve(file));
    }
    return new Configuration(configObject, overrides);
  }
  function loadObject(obj, overrides) {
    return new Configuration(obj, overrides);
  }
  module.exports = {
    loadFile: loadFile,
    loadObject: loadObject,
    defaultConfig: defaultConfig
  };
})(require("process"));
