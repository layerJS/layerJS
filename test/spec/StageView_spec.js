var StageView = require('../../src/framework/stageview.js');
var state = require('../../src/framework/state.js');

var ViewsCommon_renderChildPositionTests = require('./helpers/views/common/_renderchildpositiontests.js');
var ViewsCommon_parseChildrenTests = require('./helpers/views/common/_parseChildrentests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js')

describe("StageView", function() {

  ViewsCommonViewTests('simple_stagedata_nochilden', function() {
    return {
      ViewType: StageView,
      htmlElement: require('./htmlelements/stage_nochildren_1.js')
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

  ViewsCommon_renderChildPositionTests('simple_stage_1.js', function() {
    return {
      htmlElement: require('./htmlelements/simple_stage_1.js'),
      ViewType: StageView
    };
  });

  ViewsCommon_parseChildrenTests(function() {
    return {
      ViewType: StageView,
      htmlElement: require('./htmlelements/simple_stage_1.js'),
      expectedChildren: ['simple_layer_1']
    }
  });


  /*

  // Refacotring: already tested in commonviewtests
  it('will register itself with the state', function() {
    spyOn(state, 'registerView');
    var stageView = new StageView(new StageView.Model(StageView.defaultProperties));
    expect(state.registerView).toHaveBeenCalledWith(stageView);
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

   //Refactoring: no need to parse anymore
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


  */
})
