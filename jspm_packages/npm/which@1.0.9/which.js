/* */ 
(function(process) {
  module.exports = which;
  which.sync = whichSync;
  var path = require("path"),
      fs,
      COLON = process.platform === "win32" ? ";" : ":",
      isExe,
      fs = require("fs");
  if (process.platform == "win32") {
    isExe = function isExe() {
      return true;
    };
  } else {
    isExe = function isExe(mod, uid, gid) {
      var ret = (mod & 0001) || (mod & 0010) && process.getgid && gid === process.getgid() || (mod & 0010) && process.getuid && 0 === process.getuid() || (mod & 0100) && process.getuid && uid === process.getuid() || (mod & 0100) && process.getuid && 0 === process.getuid();
      return ret;
    };
  }
  function which(cmd, cb) {
    if (isAbsolute(cmd))
      return cb(null, cmd);
    var pathEnv = (process.env.PATH || "").split(COLON),
        pathExt = [""];
    if (process.platform === "win32") {
      pathEnv.push(process.cwd());
      pathExt = (process.env.PATHEXT || ".EXE").split(COLON);
      if (cmd.indexOf(".") !== -1)
        pathExt.unshift("");
    }
    ;
    (function F(i, l) {
      if (i === l)
        return cb(new Error("not found: " + cmd));
      var p = path.resolve(pathEnv[i], cmd);
      ;
      (function E(ii, ll) {
        if (ii === ll)
          return F(i + 1, l);
        var ext = pathExt[ii];
        fs.stat(p + ext, function(er, stat) {
          if (!er && stat && stat.isFile() && isExe(stat.mode, stat.uid, stat.gid)) {
            return cb(null, p + ext);
          }
          return E(ii + 1, ll);
        });
      })(0, pathExt.length);
    })(0, pathEnv.length);
  }
  function whichSync(cmd) {
    if (isAbsolute(cmd))
      return cmd;
    var pathEnv = (process.env.PATH || "").split(COLON),
        pathExt = [""];
    if (process.platform === "win32") {
      pathEnv.push(process.cwd());
      pathExt = (process.env.PATHEXT || ".EXE").split(COLON);
      if (cmd.indexOf(".") !== -1)
        pathExt.unshift("");
    }
    for (var i = 0,
        l = pathEnv.length; i < l; i++) {
      var p = path.join(pathEnv[i], cmd);
      for (var j = 0,
          ll = pathExt.length; j < ll; j++) {
        var cur = p + pathExt[j];
        var stat;
        try {
          stat = fs.statSync(cur);
        } catch (ex) {}
        if (stat && stat.isFile() && isExe(stat.mode, stat.uid, stat.gid))
          return cur;
      }
    }
    throw new Error("not found: " + cmd);
  }
  var isAbsolute = process.platform === "win32" ? absWin : absUnix;
  function absWin(p) {
    if (absUnix(p))
      return true;
    var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?([\\\/])?/,
        result = splitDeviceRe.exec(p),
        device = result[1] || '',
        isUnc = device && device.charAt(1) !== ':',
        isAbsolute = !!result[2] || isUnc;
    return isAbsolute;
  }
  function absUnix(p) {
    return p.charAt(0) === "/" || p === "";
  }
})(require("process"));
