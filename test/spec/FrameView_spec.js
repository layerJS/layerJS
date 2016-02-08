var jsdom = require("jsdom").jsdom;

var FrameView = require('../../src/framework/frameview.js');
var FrameData = require('../../src/framework/framedata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("FrameView", function() {

  var datasetReader = new DatasetReader();

  /*
    CommonViewTests(function() {
      return {
          data: datasetReader.readFromFile('simple_framedata.js')[0],
          ViewType : FrameView
      };
    });
  */
  CommonGroupViewTests('simple_framedata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_framedata.js'),
      ViewType: FrameView,
      parentId: 110529
    };
  });
})
