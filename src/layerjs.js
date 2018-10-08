'use strict';

require("./kern/Kern.js");
require("./framework/layerjs.js");
require("./framework/state.js");

/* others*/
require("./framework/pluginmanager.js");
require("./framework/layoutmanager.js");
require("./framework/parsemanager.js");
require("./framework/layouts/layerlayout.js");
require("./framework/layouts/slidelayout.js");
require("./framework/layouts/canvaslayout.js");
require("./framework/gestures/gesturemanager.js");
require("./framework/router/router.js");

/* data objects*/
require("./framework/defaults.js");

/* view objects*/
/* The order in which the views are required is imported for the pluginmanager.identify */
require("./framework/layerview.js");
require("./framework/frameview.js");
require("./framework/stageview.js");
var href = window.location.href;
var FileRouter = require("./framework/router/filerouter.js");
var HashRouter = require("./framework/router/hashrouter.js");
var $ = require('./framework/domhelpers.js');
var initialized = false;

layerJS.init = function() {
  if (initialized) return;
  initialized = true;
  layerJS.parseManager.parseDocument();

  var routerAttribute = $.getAttributeLJ(document.body, 'router');
  if (routerAttribute && 'filerouter' === routerAttribute.toLowerCase()) {
    layerJS.router.addRouter(new FileRouter({
      cacheCurrent: true
    }));
  }

  layerJS.router.addRouter(new HashRouter());


  // disable cache completely until we find a solution for wrongly stored stages (see issue #45)
  layerJS.router.navigate(href, null, true, true).then(function() {
    // layerJS.router.cache = true;
  });
};
// initialze layerjs
if (document.readyState === "interactive") { // dom is ready -> initialize
  if (!$.getAttributeLJ(document.body, "no-init") && !initialized) {
    layerJS.init();
  }
} else {
  document.addEventListener("DOMContentLoaded", function() {
    if (!$.getAttributeLJ(document.body, "no-init") && !initialized) {
      layerJS.init();
    }
  });
}

console.log('*** layerJS *** checkout http://layerjs.org *** happy to help you: developers@layerjs.org ***');
