/* */ 
'use strict';
var Schema = require("../schema");
module.exports = new Schema({
  include: [require("./core")],
  implicit: [require("../type/timestamp"), require("../type/merge")],
  explicit: [require("../type/binary"), require("../type/omap"), require("../type/pairs"), require("../type/set")]
});
