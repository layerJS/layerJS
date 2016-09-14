var FrameView =require('../../src/framework/frameview.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroupViewTests = require('./helpers/views/group/viewtests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');
var ViewsGroup_renderChildPositionTests = require('./helpers/views/group/_renderchildpositiontests.js');
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

  ViewsGroup_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data:require('./datasets/simple_framedata.js'),
      ViewType: FrameView,
      parentId: 110529
    };
  });

  ViewsCommonParseTests(function() {
    return {
      ViewType: FrameView,
      viewTypeName: 'FrameView',
      type: 'frame'
    };
  });

  ViewsGroup_parseChildrenTests(function() {
    return {
      ViewType: FrameView,
      HTML: "<div id='100' data-lj-id='100' data-lj-type='frame'>" +
        "<div id='101' data-lj-id='101' data-lj-type='group'></div>" +
        "<div id='102' data-lj-id='102' data-lj-type='group'></div>" +
        "<div/>" +
        "</div>",
      expectedChildren: ['101', '102']
    };
  });

  ViewsCommonIdentifyTests('div data-lj-type="frame"', FrameView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'frame');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', FrameView, function() {
    return document.createElement('div');
  }, false);

})
