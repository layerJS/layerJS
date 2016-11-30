var FrameView = require('../../src/framework/frameview.js');
var state = require('../../src/framework/state.js');
var utilities = require("./helpers/utilities.js");

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
      htmlElement: require('./htmlelements/simple_frame.js')
    }
  });

  /*
  Refactoring: this does the same thing as ViewsCommonViewTests
  ViewsNodeViewTests('simple_framedata.js', FrameView, require('./datasets/simple_framedata.js')[0]);
*/

  /*
   Refactoring: FrameView doesn't have any children anymore (for now)
    ViewsGroup_renderChildPositionTests('simple_framedata.js', function() {
      return {
        data: require('./datasets/simple_framedata.js'),
        ViewType: FrameView,
        parentId: 110529
      };
    });

    Refactoring: No need for parsing anymore
    ViewsCommonParseTests(function() {
      return {
        ViewType: FrameView,
        viewTypeName: 'FrameView',
        type: 'frame'
      };
    });

   Refactoring: FrameView will not have children (for now)
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
  */
  ViewsCommonIdentifyTests('div data-lj-type="frame"', FrameView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'frame');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', FrameView, function() {
    return document.createElement('div');
  }, false);

  it('will register itself with the state', function() {
    var element = utilities.appendChildHTML(require('./htmlelements/simple_frame.js'));
    var frameView = new FrameView({
      el: element
    });
    var found = false;
    var frameViews = state._getRegisteredFrameViews(document);

    for (var i = 0; i < frameViews.length; i++) {
      found = frameView === frameViews[i];
    }

    expect(found).toBe(true);
  });

})
