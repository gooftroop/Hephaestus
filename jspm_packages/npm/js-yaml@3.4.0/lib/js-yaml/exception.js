/* */ 
'use strict';
var inherits = require("util").inherits;
function YAMLException(reason, mark) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');
}
inherits(YAMLException, Error);
YAMLException.prototype.toString = function toString(compact) {
  var result = this.name + ': ';
  result += this.reason || '(unknown reason)';
  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }
  return result;
};
module.exports = YAMLException;
