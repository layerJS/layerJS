require("./kern/kern.js");
require("./framework/wl.js");

/* others*/
require("./framework/pluginmanager.js");
require("./framework/layoutmanager.js");
require("./framework/repository.js");
require("./framework/parsemanager.js");
require("./framework/layouts/layerlayout.js");
require("./framework/layouts/plainlayout.js");
require("./framework/gesturemanager.js");

/* data objects*/
require("./framework/defaults.js");
require("./framework/objdata.js");
require("./framework/imagedata.js");
require("./framework/textdata.js");
require("./framework/groupdata.js");
require("./framework/framedata.js");
require("./framework/layerdata.js");
require("./framework/stagedata.js");

/* view objects*/
require("./framework/objview.js");
require("./framework/imageview.js");
require("./framework/textview.js");
require("./framework/groupview.js");
require("./framework/layerview.js");
require("./framework/frameview.js");
require("./framework/stageview.js");

WL.init = function(){
  WL.parseManager.parseDocument();
  WL.gestureManager.register();
}
