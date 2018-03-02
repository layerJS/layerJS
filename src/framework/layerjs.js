var $ = require('./domhelpers.js');
var defaults = require('./defaults.js');

require('./polyfill.js');
// this module defines a global namespace for all weblayer objects.
layerJS = {
  select: $.selectView,
  imagePath: "/",
  executeScriptCode: true,
  defaults: defaults
};

module.exports = layerJS;
