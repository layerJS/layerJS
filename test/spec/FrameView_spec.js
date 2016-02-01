var jsdom = require("jsdom").jsdom;

var FrameView = require('../../src/framework/frameview.js');
var FrameData = require('../../src/framework/framedata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("FrameView", function() {

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
          data: datasetReader.readFromFile('simple_framedata.js')[0],
          ViewType : FrameView
      };
    });
  */
  CommonGroupViewTests(function() {
    return {
      data: datasetReader.readFromFile('simple_framedata.js'),
      ViewType: FrameView,
      parentId: 110529
    };
  });
})
