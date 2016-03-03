var jsdom = require("jsdom").jsdom;

var FrameView = require('../../src/framework/frameview.js');
var FrameData = require('../../src/framework/framedata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var GroupView_renderChildPositionTests = require('./helpers/groupview_renderchildpositiontests.js');
var Common_renderChildPositionTests = require('./helpers/common_renderchildpositiontests.js');
var DatasetReader = require('./helpers/datasetreader.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');

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

  Common_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_framedata.js'),
      ViewType: FrameView,
      parentId: 110529
    };
  });

  GroupView_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_framedata.js'),
      ViewType: FrameView,
      parentId: 110529
    };
  });

  ViewsCommonParseTests({
    ViewType: FrameView,
    viewTypeName: 'FrameView',
    type: 'frame'
  });

  ViewsGroup_parseChildrenTests({
    ViewType: FrameView,
    viewTypeName: 'FrameView',
    type: 'frame',
    HTML: "<div id='100' data-wl-id='100' data-wl-type='frame'>" +
      "<div id='element1'></div>" +
      "<div id='101' data-wl-id='101' data-wl-type='group'></div>" +
      "<div id='element2'></div>" +
      "<div id='102' data-wl-id='102' data-wl-type='text'></div>" +
      "<div id='element3'></div>",
    expectedChildren: ['101', '102']
  });
})
