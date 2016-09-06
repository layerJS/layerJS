'use strict';
require("./kern/kern.js");
require("./framework/layerjs.js");

/* others*/
require("./framework/pluginmanager.js");
require("./framework/layoutmanager.js");
require("./framework/repository.js");
require("./framework/parsemanager.js");
require("./framework/layouts/layerlayout.js");
require("./framework/layouts/slidelayout.js");
require("./framework/layouts/canvaslayout.js");
require("./framework/gestures/gesturemanager.js");
require("./framework/router/router.js");
require("./framework/state.js");

/* data objects*/
require("./framework/defaults.js");
require("./framework/identifypriority.js");
require("./framework/nodedata.js");

/* view objects*/
/* The order in which the views are required is imported for the pluginmanager.identify */
require("./framework/nodeview.js");
require("./framework/elementview.js");
require("./framework/scriptview.js");
require("./framework/layerview.js");
require("./framework/frameview.js");
require("./framework/stageview.js");
require("./framework/groupview.js");

var FileRouter = require("./framework/router/filerouter.js");

layerJS.init = function() {
  layerJS.parseManager.parseDocument();
  layerJS.router.addRouter(new FileRouter());
};
