/* */ 
'use strict';
var Schema = require("../schema");
module.exports = Schema.DEFAULT = new Schema({
  include: [require("./default_safe")],
  explicit: [require("../type/js/undefined"), require("../type/js/regexp"), require("../type/js/function")]
});
