var FrameView = require('../../src/framework/frameview.js');
var state = require('../../src/framework/state.js');
var utilities = require("./helpers/utilities.js");

var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js')

describe("FrameView", function() {

  ViewsCommonViewTests('simple_frame_1.js', function() {
    return {
      ViewType: FrameView,
      htmlElement: require('./htmlelements/simple_frame_1.js')
    }
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
    var element = utilities.appendChildHTML(require('./htmlelements/simple_frame_1.js'));
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
