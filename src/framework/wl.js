var $ = require('./domhelpers.js');
// this module defines a global namespace for all weblayer objects.
WL = {
  select: $.selectView,
  imagePath: "/",
  executeScriptCode : true
};

module.exports = WL;
