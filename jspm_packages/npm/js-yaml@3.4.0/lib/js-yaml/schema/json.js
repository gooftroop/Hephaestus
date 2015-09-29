/* */ 
'use strict';
var Schema = require("../schema");
module.exports = new Schema({
  include: [require("./failsafe")],
  implicit: [require("../type/null"), require("../type/bool"), require("../type/int"), require("../type/float")]
});
