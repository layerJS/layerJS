
require("../../../src/kern/kern.js");
var WL = require("../../../src/framework/wl.js");
var defaults = require("../../../src/framework/defaults.js");

/* others*/
var pluginmanager = require("../../../src/framework/pluginmanager.js");
require("../../../src/framework/layoutmanager.js");
require("../../../src/framework/repository.js");
require("../../../src/framework/layouts/layerlayout.js");
require("../../../src/framework/layouts/plainlayout.js");

/* data objects*/
require("../../../src/framework/defaults.js");
require("../../../src/framework/cobjdata.js");
require("../../../src/framework/cimagedata.js");
require("../../../src/framework/cgroupdata.js");
require("../../../src/framework/framedata.js");
require("../../../src/framework/layerdata.js");
require("../../../src/framework/stagedata.js");

/* view objects*/
require("../../../src/framework/cobjview.js");
require("../../../src/framework/cimageview.js");
require("../../../src/framework/ctextview.js");
require("../../../src/framework/cgroupview.js");
require("../../../src/framework/layerview.js");
require("../../../src/framework/frameview.js");
require("../../../src/framework/stageview.js");

var dataset = require('../../datasets/dataset1.js'); 
WL.imagePath = "../../img/img_dataset1/";
WL.repository.importJSON(dataset, defaults.version);

var stageData = WL.repository.get("1", defaults.version);
console.log(stageData);

var stageView = pluginmanager.createView(stageData);
console.log(stageView);

document.body.appendChild(stageView.el);

console.log(WL);
