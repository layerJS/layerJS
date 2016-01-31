/*
Loading pluginmanager and all views in order that the views are registered
in the pluginmanager. Maybe remove it to an init function?
*/

require("../../../src/framework/pluginManager.js")

/* view objects*/
require("../../../src/framework/cgroupview.js");
require("../../../src/framework/stageview.js");
require("../../../src/framework/frameview.js");
require("../../../src/framework/layerview.js");


beforeEach(function () {
    delete global.document;
    delete global.window;
});
