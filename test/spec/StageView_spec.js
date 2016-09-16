var StageView = require('../../src/framework/stageview.js');

var ViewsGroupViewTests = require('./helpers/views/group/viewtests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js')

describe("StageView", function() {

    ViewsCommonViewTests('simple_stagedata_nochilden', function() {
      return {
          data: require('./datasets/simple_stagedata_nochildren.js')[0],
          ViewType : StageView
      };
    });

  ViewsGroupViewTests('simple_stagedata.js', function() {
    return {
      data: require('./datasets/simple_stagedata.js'),
      ViewType: StageView,
      parentId: 110540
    };
  });

  ViewsGroupViewTests('test_data_set.js', function() {
    return {
      data:require('./datasets/test_data_set.js'),
      ViewType: StageView,
      parentId: 1
    };
  });

  ViewsCommonParseTests(function() {
    return {
      ViewType: StageView
    };
  });

  ViewsGroup_parseChildrenTests(function() {
    return {
      ViewType: StageView,
      HTML: "<div id='100' data-lj-id='100' data-lj-type='stage'>" +
        "<div id='101' data-lj-id='101' data-lj-type='layer'></div>" +
        "<div id='102' data-lj-id='102' data-lj-type='layer'></div>" +
        "<div/>" +
        "</div>",
      expectedChildren: ['101', '102']
    };
  });

  ViewsCommonIdentifyTests('div data-lj-type="stage"', StageView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'stage');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', StageView, function() {
    return document.createElement('div');
  }, false);

})
