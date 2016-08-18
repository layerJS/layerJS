var frameView = function() {
  return require('../../src/framework/frameview.js')
};
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

  ViewsNodeViewTests('simple_framedata.js', frameView, require('./datasets/simple_framedata.js')[0]);

  CommonGroupViewTests('simple_framedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_framedata.js'))),
      ViewType: frameView(),
      parentId: 110529
    };
  });

  Common_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_framedata.js'))),
      ViewType: frameView(),
      parentId: 110529
    };
  });

  GroupView_renderChildPositionTests('simple_framedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_framedata.js'))),
      ViewType: frameView(),
      parentId: 110529
    };
  });

  ViewsCommonParseTests(function() {
    return {
      ViewType: frameView(),
      viewTypeName: 'FrameView',
      type: 'frame'
    };
  });

  ViewsGroup_parseChildrenTests(function() {
    return {
      ViewType: frameView(),
      HTML: "<div id='100' data-lj-id='100' data-lj-type='frame'>" +
        "<div id='101' data-lj-id='101' data-lj-type='group'></div>" +
        "<div id='102' data-lj-id='102' data-lj-type='group'></div>" +
        "<div/>" +
        "</div>",
      expectedChildren: ['101', '102']
    };
  });

  ViewsCommonIdentifyTests('div data-lj-type="frame"', frameView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'frame');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', frameView, function() {
    return document.createElement('div');
  }, false);

})
