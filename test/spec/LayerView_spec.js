var jsdom = require("jsdom").jsdom;

var LayerView = require('../../src/framework/layerview.js');
var LayerData = require('../../src/framework/layerdata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("LayerView", function() {

  var document, window, $;
  var datasetReader = new DatasetReader();

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  /*
    CommonViewTests(function() {
      return {
          data: datasetReader.readFromFile('simple_layerdata.js')[0],
          ViewType : LayerView
      };
    });
  */
  CommonGroupViewTests(function() {
    return {
      data: datasetReader.readFromFile('simple_layerdata.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });


})
