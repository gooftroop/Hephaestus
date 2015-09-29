/* */ 
"format cjs";
(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.minimatch = f();
  }
})(function() {
  var define,
      module,
      exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a)
            return a(o, !0);
          if (i)
            return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {exports: {}};
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)
      s(r[o]);
    return s;
  })({
    1: [function(require, module, exports) {
      module.exports = minimatch;
      minimatch.Minimatch = Minimatch;
      var path = {sep: '/'};
      try {
        path = require("path");
      } catch (er) {}
      var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
      var expand = require("brace-expansion");
      var qmark = '[^/]';
      var star = qmark + '*?';
      var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';
      var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';
      var reSpecials = charSet('().*{}+?[]^$\\!');
      function charSet(s) {
        return s.split('').reduce(function(set, c) {
          set[c] = true;
          return set;
        }, {});
      }
      var slashSplit = /\/+/;
      minimatch.filter = filter;
      function filter(pattern, options) {
        options = options || {};
        return function(p, i, list) {
          return minimatch(p, pattern, options);
        };
      }
      function ext(a, b) {
        a = a || {};
        b = b || {};
        var t = {};
        Object.keys(b).forEach(function(k) {
          t[k] = b[k];
        });
        Object.keys(a).forEach(function(k) {
          t[k] = a[k];
        });
        return t;
      }
      minimatch.defaults = function(def) {
        if (!def || !Object.keys(def).length)
          return minimatch;
        var orig = minimatch;
        var m = function minimatch(p, pattern, options) {
          return orig.minimatch(p, pattern, ext(def, options));
        };
        m.Minimatch = function Minimatch(pattern, options) {
          return new orig.Minimatch(pattern, ext(def, options));
        };
        return m;
      };
      Minimatch.defaults = function(def) {
        if (!def || !Object.keys(def).length)
          return Minimatch;
        return minimatch.defaults(def).Minimatch;
      };
      function minimatch(p, pattern, options) {
        if (typeof pattern !== 'string') {
          throw new TypeError('glob pattern string required');
        }
        if (!options)
          options = {};
        if (!options.nocomment && pattern.charAt(0) === '#') {
          return false;
        }
        if (pattern.trim() === '')
          return p === '';
        return new Minimatch(pattern, options).match(p);
      }
      function Minimatch(pattern, options) {
        if (!(this instanceof Minimatch)) {
          return new Minimatch(pattern, options);
        }
        if (typeof pattern !== 'string') {
          throw new TypeError('glob pattern string required');
        }
        if (!options)
          options = {};
        pattern = pattern.trim();
        if (path.sep !== '/') {
          pattern = pattern.split(path.sep).join('/');
        }
        this.options = options;
        this.set = [];
        this.pattern = pattern;
        this.regexp = null;
        this.negate = false;
        this.comment = false;
        this.empty = false;
        this.make();
      }
      Minimatch.prototype.debug = function() {};
      Minimatch.prototype.make = make;
      function make() {
        if (this._made)
          return ;
        var pattern = this.pattern;
        var options = this.options;
        if (!options.nocomment && pattern.charAt(0) === '#') {
          this.comment = true;
          return ;
        }
        if (!pattern) {
          this.empty = true;
          return ;
        }
        this.parseNegate();
        var set = this.globSet = this.braceExpand();
        if (options.debug)
          this.debug = console.error;
        this.debug(this.pattern, set);
        set = this.globParts = set.map(function(s) {
          return s.split(slashSplit);
        });
        this.debug(this.pattern, set);
        set = set.map(function(s, si, set) {
          return s.map(this.parse, this);
        }, this);
        this.debug(this.pattern, set);
        set = set.filter(function(s) {
          return s.indexOf(false) === -1;
        });
        this.debug(this.pattern, set);
        this.set = set;
      }
      Minimatch.prototype.parseNegate = parseNegate;
      function parseNegate() {
        var pattern = this.pattern;
        var negate = false;
        var options = this.options;
        var negateOffset = 0;
        if (options.nonegate)
          return ;
        for (var i = 0,
            l = pattern.length; i < l && pattern.charAt(i) === '!'; i++) {
          negate = !negate;
          negateOffset++;
        }
        if (negateOffset)
          this.pattern = pattern.substr(negateOffset);
        this.negate = negate;
      }
      minimatch.braceExpand = function(pattern, options) {
        return braceExpand(pattern, options);
      };
      Minimatch.prototype.braceExpand = braceExpand;
      function braceExpand(pattern, options) {
        if (!options) {
          if (this instanceof Minimatch) {
            options = this.options;
          } else {
            options = {};
          }
        }
        pattern = typeof pattern === 'undefined' ? this.pattern : pattern;
        if (typeof pattern === 'undefined') {
          throw new Error('undefined pattern');
        }
        if (options.nobrace || !pattern.match(/\{.*\}/)) {
          return [pattern];
        }
        return expand(pattern);
      }
      Minimatch.prototype.parse = parse;
      var SUBPARSE = {};
      function parse(pattern, isSub) {
        var options = this.options;
        if (!options.noglobstar && pattern === '**')
          return GLOBSTAR;
        if (pattern === '')
          return '';
        var re = '';
        var hasMagic = !!options.nocase;
        var escaping = false;
        var patternListStack = [];
        var negativeLists = [];
        var plType;
        var stateChar;
        var inClass = false;
        var reClassStart = -1;
        var classStart = -1;
        var patternStart = pattern.charAt(0) === '.' ? '' : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))' : '(?!\\.)';
        var self = this;
        function clearStateChar() {
          if (stateChar) {
            switch (stateChar) {
              case '*':
                re += star;
                hasMagic = true;
                break;
              case '?':
                re += qmark;
                hasMagic = true;
                break;
              default:
                re += '\\' + stateChar;
                break;
            }
            self.debug('clearStateChar %j %j', stateChar, re);
            stateChar = false;
          }
        }
        for (var i = 0,
            len = pattern.length,
            c; (i < len) && (c = pattern.charAt(i)); i++) {
          this.debug('%s\t%s %s %j', pattern, i, re, c);
          if (escaping && reSpecials[c]) {
            re += '\\' + c;
            escaping = false;
            continue;
          }
          switch (c) {
            case '/':
              return false;
            case '\\':
              clearStateChar();
              escaping = true;
              continue;
            case '?':
            case '*':
            case '+':
            case '@':
            case '!':
              this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);
              if (inClass) {
                this.debug('  in class');
                if (c === '!' && i === classStart + 1)
                  c = '^';
                re += c;
                continue;
              }
              self.debug('call clearStateChar %j', stateChar);
              clearStateChar();
              stateChar = c;
              if (options.noext)
                clearStateChar();
              continue;
            case '(':
              if (inClass) {
                re += '(';
                continue;
              }
              if (!stateChar) {
                re += '\\(';
                continue;
              }
              plType = stateChar;
              patternListStack.push({
                type: plType,
                start: i - 1,
                reStart: re.length
              });
              re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
              this.debug('plType %j %j', stateChar, re);
              stateChar = false;
              continue;
            case ')':
              if (inClass || !patternListStack.length) {
                re += '\\)';
                continue;
              }
              clearStateChar();
              hasMagic = true;
              re += ')';
              var pl = patternListStack.pop();
              plType = pl.type;
              switch (plType) {
                case '!':
                  negativeLists.push(pl);
                  re += ')[^/]*?)';
                  pl.reEnd = re.length;
                  break;
                case '?':
                case '+':
                case '*':
                  re += plType;
                  break;
                case '@':
                  break;
              }
              continue;
            case '|':
              if (inClass || !patternListStack.length || escaping) {
                re += '\\|';
                escaping = false;
                continue;
              }
              clearStateChar();
              re += '|';
              continue;
            case '[':
              clearStateChar();
              if (inClass) {
                re += '\\' + c;
                continue;
              }
              inClass = true;
              classStart = i;
              reClassStart = re.length;
              re += c;
              continue;
            case ']':
              if (i === classStart + 1 || !inClass) {
                re += '\\' + c;
                escaping = false;
                continue;
              }
              if (inClass) {
                var cs = pattern.substring(classStart + 1, i);
                try {
                  RegExp('[' + cs + ']');
                } catch (er) {
                  var sp = this.parse(cs, SUBPARSE);
                  re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
                  hasMagic = hasMagic || sp[1];
                  inClass = false;
                  continue;
                }
              }
              hasMagic = true;
              inClass = false;
              re += c;
              continue;
            default:
              clearStateChar();
              if (escaping) {
                escaping = false;
              } else if (reSpecials[c] && !(c === '^' && inClass)) {
                re += '\\';
              }
              re += c;
          }
        }
        if (inClass) {
          cs = pattern.substr(classStart + 1);
          sp = this.parse(cs, SUBPARSE);
          re = re.substr(0, reClassStart) + '\\[' + sp[0];
          hasMagic = hasMagic || sp[1];
        }
        for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
          var tail = re.slice(pl.reStart + 3);
          tail = tail.replace(/((?:\\{2})*)(\\?)\|/g, function(_, $1, $2) {
            if (!$2) {
              $2 = '\\';
            }
            return $1 + $1 + $2 + '|';
          });
          this.debug('tail=%j\n   %s', tail, tail);
          var t = pl.type === '*' ? star : pl.type === '?' ? qmark : '\\' + pl.type;
          hasMagic = true;
          re = re.slice(0, pl.reStart) + t + '\\(' + tail;
        }
        clearStateChar();
        if (escaping) {
          re += '\\\\';
        }
        var addPatternStart = false;
        switch (re.charAt(0)) {
          case '.':
          case '[':
          case '(':
            addPatternStart = true;
        }
        for (var n = negativeLists.length - 1; n > -1; n--) {
          var nl = negativeLists[n];
          var nlBefore = re.slice(0, nl.reStart);
          var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
          var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
          var nlAfter = re.slice(nl.reEnd);
          nlLast += nlAfter;
          var openParensBefore = nlBefore.split('(').length - 1;
          var cleanAfter = nlAfter;
          for (i = 0; i < openParensBefore; i++) {
            cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
          }
          nlAfter = cleanAfter;
          var dollar = '';
          if (nlAfter === '' && isSub !== SUBPARSE) {
            dollar = '$';
          }
          var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
          re = newRe;
        }
        if (re !== '' && hasMagic) {
          re = '(?=.)' + re;
        }
        if (addPatternStart) {
          re = patternStart + re;
        }
        if (isSub === SUBPARSE) {
          return [re, hasMagic];
        }
        if (!hasMagic) {
          return globUnescape(pattern);
        }
        var flags = options.nocase ? 'i' : '';
        var regExp = new RegExp('^' + re + '$', flags);
        regExp._glob = pattern;
        regExp._src = re;
        return regExp;
      }
      minimatch.makeRe = function(pattern, options) {
        return new Minimatch(pattern, options || {}).makeRe();
      };
      Minimatch.prototype.makeRe = makeRe;
      function makeRe() {
        if (this.regexp || this.regexp === false)
          return this.regexp;
        var set = this.set;
        if (!set.length) {
          this.regexp = false;
          return this.regexp;
        }
        var options = this.options;
        var twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
        var flags = options.nocase ? 'i' : '';
        var re = set.map(function(pattern) {
          return pattern.map(function(p) {
            return (p === GLOBSTAR) ? twoStar : (typeof p === 'string') ? regExpEscape(p) : p._src;
          }).join('\\\/');
        }).join('|');
        re = '^(?:' + re + ')$';
        if (this.negate)
          re = '^(?!' + re + ').*$';
        try {
          this.regexp = new RegExp(re, flags);
        } catch (ex) {
          this.regexp = false;
        }
        return this.regexp;
      }
      minimatch.match = function(list, pattern, options) {
        options = options || {};
        var mm = new Minimatch(pattern, options);
        list = list.filter(function(f) {
          return mm.match(f);
        });
        if (mm.options.nonull && !list.length) {
          list.push(pattern);
        }
        return list;
      };
      Minimatch.prototype.match = match;
      function match(f, partial) {
        this.debug('match', f, this.pattern);
        if (this.comment)
          return false;
        if (this.empty)
          return f === '';
        if (f === '/' && partial)
          return true;
        var options = this.options;
        if (path.sep !== '/') {
          f = f.split(path.sep).join('/');
        }
        f = f.split(slashSplit);
        this.debug(this.pattern, 'split', f);
        var set = this.set;
        this.debug(this.pattern, 'set', set);
        var filename;
        var i;
        for (i = f.length - 1; i >= 0; i--) {
          filename = f[i];
          if (filename)
            break;
        }
        for (i = 0; i < set.length; i++) {
          var pattern = set[i];
          var file = f;
          if (options.matchBase && pattern.length === 1) {
            file = [filename];
          }
          var hit = this.matchOne(file, pattern, partial);
          if (hit) {
            if (options.flipNegate)
              return true;
            return !this.negate;
          }
        }
        if (options.flipNegate)
          return false;
        return this.negate;
      }
      Minimatch.prototype.matchOne = function(file, pattern, partial) {
        var options = this.options;
        this.debug('matchOne', {
          'this': this,
          file: file,
          pattern: pattern
        });
        this.debug('matchOne', file.length, pattern.length);
        for (var fi = 0,
            pi = 0,
            fl = file.length,
            pl = pattern.length; (fi < fl) && (pi < pl); fi++, pi++) {
          this.debug('matchOne loop');
          var p = pattern[pi];
          var f = file[fi];
          this.debug(pattern, p, f);
          if (p === false)
            return false;
          if (p === GLOBSTAR) {
            this.debug('GLOBSTAR', [pattern, p, f]);
            var fr = fi;
            var pr = pi + 1;
            if (pr === pl) {
              this.debug('** at the end');
              for (; fi < fl; fi++) {
                if (file[fi] === '.' || file[fi] === '..' || (!options.dot && file[fi].charAt(0) === '.'))
                  return false;
              }
              return true;
            }
            while (fr < fl) {
              var swallowee = file[fr];
              this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);
              if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
                this.debug('globstar found match!', fr, fl, swallowee);
                return true;
              } else {
                if (swallowee === '.' || swallowee === '..' || (!options.dot && swallowee.charAt(0) === '.')) {
                  this.debug('dot detected!', file, fr, pattern, pr);
                  break;
                }
                this.debug('globstar swallow a segment, and continue');
                fr++;
              }
            }
            if (partial) {
              this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
              if (fr === fl)
                return true;
            }
            return false;
          }
          var hit;
          if (typeof p === 'string') {
            if (options.nocase) {
              hit = f.toLowerCase() === p.toLowerCase();
            } else {
              hit = f === p;
            }
            this.debug('string match', p, f, hit);
          } else {
            hit = f.match(p);
            this.debug('pattern match', p, f, hit);
          }
          if (!hit)
            return false;
        }
        if (fi === fl && pi === pl) {
          return true;
        } else if (fi === fl) {
          return partial;
        } else if (pi === pl) {
          var emptyFileEnd = (fi === fl - 1) && (file[fi] === '');
          return emptyFileEnd;
        }
        throw new Error('wtf?');
      };
      function globUnescape(s) {
        return s.replace(/\\(.)/g, '$1');
      }
      function regExpEscape(s) {
        return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      }
    }, {
      "brace-expansion": 2,
      "path": undefined
    }],
    2: [function(require, module, exports) {
      var concatMap = require("concat-map");
      var balanced = require("balanced-match");
      module.exports = expandTop;
      var escSlash = '\0SLASH' + Math.random() + '\0';
      var escOpen = '\0OPEN' + Math.random() + '\0';
      var escClose = '\0CLOSE' + Math.random() + '\0';
      var escComma = '\0COMMA' + Math.random() + '\0';
      var escPeriod = '\0PERIOD' + Math.random() + '\0';
      function numeric(str) {
        return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
      }
      function escapeBraces(str) {
        return str.split('\\\\').join(escSlash).split('\\{').join(escOpen).split('\\}').join(escClose).split('\\,').join(escComma).split('\\.').join(escPeriod);
      }
      function unescapeBraces(str) {
        return str.split(escSlash).join('\\').split(escOpen).join('{').split(escClose).join('}').split(escComma).join(',').split(escPeriod).join('.');
      }
      function parseCommaParts(str) {
        if (!str)
          return [''];
        var parts = [];
        var m = balanced('{', '}', str);
        if (!m)
          return str.split(',');
        var pre = m.pre;
        var body = m.body;
        var post = m.post;
        var p = pre.split(',');
        p[p.length - 1] += '{' + body + '}';
        var postParts = parseCommaParts(post);
        if (post.length) {
          p[p.length - 1] += postParts.shift();
          p.push.apply(p, postParts);
        }
        parts.push.apply(parts, p);
        return parts;
      }
      function expandTop(str) {
        if (!str)
          return [];
        var expansions = expand(escapeBraces(str));
        return expansions.filter(identity).map(unescapeBraces);
      }
      function identity(e) {
        return e;
      }
      function embrace(str) {
        return '{' + str + '}';
      }
      function isPadded(el) {
        return /^-?0\d/.test(el);
      }
      function lte(i, y) {
        return i <= y;
      }
      function gte(i, y) {
        return i >= y;
      }
      function expand(str) {
        var expansions = [];
        var m = balanced('{', '}', str);
        if (!m || /\$$/.test(m.pre))
          return [str];
        var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
        var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
        var isSequence = isNumericSequence || isAlphaSequence;
        var isOptions = /^(.*,)+(.+)?$/.test(m.body);
        if (!isSequence && !isOptions) {
          if (m.post.match(/,.*}/)) {
            str = m.pre + '{' + m.body + escClose + m.post;
            return expand(str);
          }
          return [str];
        }
        var n;
        if (isSequence) {
          n = m.body.split(/\.\./);
        } else {
          n = parseCommaParts(m.body);
          if (n.length === 1) {
            n = expand(n[0]).map(embrace);
            if (n.length === 1) {
              var post = m.post.length ? expand(m.post) : [''];
              return post.map(function(p) {
                return m.pre + n[0] + p;
              });
            }
          }
        }
        var pre = m.pre;
        var post = m.post.length ? expand(m.post) : [''];
        var N;
        if (isSequence) {
          var x = numeric(n[0]);
          var y = numeric(n[1]);
          var width = Math.max(n[0].length, n[1].length);
          var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
          var test = lte;
          var reverse = y < x;
          if (reverse) {
            incr *= -1;
            test = gte;
          }
          var pad = n.some(isPadded);
          N = [];
          for (var i = x; test(i, y); i += incr) {
            var c;
            if (isAlphaSequence) {
              c = String.fromCharCode(i);
              if (c === '\\')
                c = '';
            } else {
              c = String(i);
              if (pad) {
                var need = width - c.length;
                if (need > 0) {
                  var z = new Array(need + 1).join('0');
                  if (i < 0)
                    c = '-' + z + c.slice(1);
                  else
                    c = z + c;
                }
              }
            }
            N.push(c);
          }
        } else {
          N = concatMap(n, function(el) {
            return expand(el);
          });
        }
        for (var j = 0; j < N.length; j++) {
          for (var k = 0; k < post.length; k++) {
            expansions.push([pre, N[j], post[k]].join(''));
          }
        }
        return expansions;
      }
    }, {
      "balanced-match": 3,
      "concat-map": 4
    }],
    3: [function(require, module, exports) {
      module.exports = balanced;
      function balanced(a, b, str) {
        var bal = 0;
        var m = {};
        var ended = false;
        for (var i = 0; i < str.length; i++) {
          if (a == str.substr(i, a.length)) {
            if (!('start' in m))
              m.start = i;
            bal++;
          } else if (b == str.substr(i, b.length) && 'start' in m) {
            ended = true;
            bal--;
            if (!bal) {
              m.end = i;
              m.pre = str.substr(0, m.start);
              m.body = (m.end - m.start > 1) ? str.substring(m.start + a.length, m.end) : '';
              m.post = str.slice(m.end + b.length);
              return m;
            }
          }
        }
        if (bal && ended) {
          var start = m.start + a.length;
          m = balanced(a, b, str.substr(start));
          if (m) {
            m.start += start;
            m.end += start;
            m.pre = str.slice(0, start) + m.pre;
          }
          return m;
        }
      }
    }, {}],
    4: [function(require, module, exports) {
      module.exports = function(xs, fn) {
        var res = [];
        for (var i = 0; i < xs.length; i++) {
          var x = fn(xs[i], i);
          if (Array.isArray(x))
            res.push.apply(res, x);
          else
            res.push(x);
        }
        return res;
      };
    }, {}]
  }, {}, [1])(1);
});
