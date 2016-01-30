var jsdom = require("jsdom").jsdom;

var CGroupView = require('../../src/framework/cgroupview.js');
var CGroupData = require('../../src/framework/cgroupdata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("CGroupView", function() {
  debugger;
  var document, window,$;

  var datasetReader = new DatasetReader();

  beforeEach(function() {
     document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
     window = global.window = document.defaultView;
     $ = document.querySelector;
  });

  CommonViewTests(function() {
    return {
        data: datasetReader.readFromFile('simple_cgroupdata.js')[0],
        ViewType : CGroupView
    };
  });

  CommonGroupViewTests(function() {
    return {
        map: datasetReader.readFromFileAsMap('simple_cgroupdata.js'),
        ViewType : CGroupView,
        parentId : 110530
    };
  });
})
