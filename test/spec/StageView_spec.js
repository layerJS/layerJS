var jsdom = require("jsdom").jsdom;

var StageView = require('../../src/framework/stageview.js');
var LayerView = require('../../src/framework/layerview.js');
var StageData = require('../../src/framework/stagedata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("StageView", function() {

  var document, window,$;
  var datasetReader = new DatasetReader();

  beforeEach(function() {
     document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
     window = global.window = document.defaultView;
     $ = document.querySelector;
  });

/*
  CommonViewTests(function() {
    return {
        data: datasetReader.readFromFile('simple_stagedata.js')[0],
        ViewType : StageView
    };
  });
*/

CommonGroupViewTests(function() {
  return {
      data: datasetReader.readFromFile('simple_stagedata.js'),
      ViewType : StageView,
      parentId : 110540
  };
});


})
