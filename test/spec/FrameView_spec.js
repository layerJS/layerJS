var FrameView = require('../../src/framework/frameview.js');
var state = require('../../src/framework/state.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroupViewTests = require('./helpers/views/group/viewtests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');
var ViewsGroup_renderChildPositionTests = require('./helpers/views/group/_renderchildpositiontests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsNodeViewTests = require('./helpers/views/node/viewtests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js')

describe("FrameView", function() {

  ViewsCommonViewTests('simple_framedata.js', function() {
    return {
      ViewType: FrameView,
      data: require('./datasets/simple_framedata.js')[0]
    }
  });

  ViewsNodeViewTests('simple_framedata.js', FrameView, require('./datasets/simple_framedata.js')[0]);

  ViewsGroup_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: require('./datasets/simple_framedata.js'),
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

  it('will register itself with the state', function() {
    var frameView = new FrameView(new FrameView.Model(FrameView.defaultProperties));
    var found = false;
    var frameViews = state._getRegisteredFrameViews(document);

    for (var i = 0; i < frameViews.length; i++) {
      found = frameView === frameViews[i];
    }

    expect(found).toBe(true);
  });
})
