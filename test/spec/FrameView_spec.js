var jsdom = require("jsdom").jsdom;

var FrameView = require('../../src/framework/frameview.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var GroupView_renderChildPositionTests = require('./helpers/groupview_renderchildpositiontests.js');
var Common_renderChildPositionTests = require('./helpers/common_renderchildpositiontests.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsNodeViewTests = require('./helpers/views/node/viewtests.js');

describe("FrameView", function() {

  /*
    CommonViewTests(function() {
      return {
          data: require('datasets/simple_framedata.js')[0],
          ViewType : FrameView
      };
    });
  */

  ViewsNodeViewTests('simple_framedata.js', FrameView, require('./datasets/simple_framedata.js')[0]);

  CommonGroupViewTests('simple_framedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_framedata.js'))),
      ViewType: FrameView,
      parentId: 110529
    };
  });

  Common_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_framedata.js'))),
      ViewType: FrameView,
      parentId: 110529
    };
  });

  GroupView_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_framedata.js'))),
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

  ViewsCommonIdentifyTests('div data-wl-type="frame"', FrameView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-wl-type', 'frame');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', FrameView, function() {
    return document.createElement('div');
  }, false);

})
