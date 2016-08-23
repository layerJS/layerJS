var LayerView =require('../../src/framework/layerview.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var GroupView_renderChildPositionTests = require('./helpers/groupview_renderchildpositiontests.js');
var Common_renderChildPositionTests = require('./helpers/common_renderchildpositiontests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');

describe("LayerView", function() {

  /*
      CommonViewTests(function() {
        return {
            data: JSON.parse(JSON.stringify(require('./datasets/simple_layerdata.js')[0],
            ViewType : LayerView
        };
      });
  */

  CommonGroupViewTests('simple_layerdata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_layerdata.js'))),
      ViewType: LayerView,
      parentId: 5
    };
  });
  Common_renderChildPositionTests('simple_layerdata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_layerdata.js'))),
      ViewType: LayerView,
      parentId: 5
    };
  });

  CommonGroupViewTests('test_data_set.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/test_data_set.js'))),
      ViewType: LayerView,
      parentId: 5
    };
  });

  Common_renderChildPositionTests('test_data_set.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/test_data_set.js'))),
      ViewType: LayerView,
      parentId: 5
    };
  });

  ViewsCommonParseTests(function() {
    return {
      ViewType: LayerView
    }
  });

  it('the Parse method will set nativeScroll to true if the DOM element has a data-lj-native-scroll attribute equals true', function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-native-scroll', 'true');
    element.innerHTML = "<div data-lj-helper='scroller'/>";

    var layerView = new LayerView(null, {
      el: element
    });
    var dataModel = layerView.data;

    expect(dataModel.attributes.nativeScroll).toBeTruthy();
  });

  it('the Parse method will set nativeScroll to false if the DOM element has a data-lj-native-scroll attribute equals false', function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-native-scroll', 'false');
    element.innerHTML = "<div/>";

    var layerView = new LayerView(null, {
      el: element
    });
    var dataModel = layerView.data;

    expect(dataModel.attributes.nativeScroll).toBeFalsy();
  });

  ViewsGroup_parseChildrenTests(function() {
    return {
      ViewType: LayerView,
      viewTypeName: 'LayerView',
      type: 'layer',
      HTML: "<div id='100' data-lj-id='100' data-lj-type='layer'>" +
        "<div id='101' data-lj-id='101' data-lj-type='frame'></div>" +
        "<div id='102' data-lj-id='102' data-lj-type='frame'></div>" +
        "<div/>" +
        "</div>",
      expectedChildren: ['101', '102']
    };
  });

  ViewsCommonIdentifyTests('div data-lj-type="layer"', LayerView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'layer');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', LayerView, function() {
    return document.createElement('div');
  }, false);


})
