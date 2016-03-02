var jsdom = require("jsdom").jsdom;

var LayerView = require('../../src/framework/layerview.js');
var LayerData = require('../../src/framework/layerdata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var GroupView_renderChildPositionTests = require('./helpers/groupview_renderchildpositiontests.js');
var Common_renderChildPositionTests = require('./helpers/common_renderchildpositiontests.js');
var DatasetReader = require('./helpers/datasetreader.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');


describe("LayerView", function() {
  var datasetReader = new DatasetReader();

/*
    CommonViewTests(function() {
      return {
          data: datasetReader.readFromFile('simple_layerdata.js')[0],
          ViewType : LayerView
      };
    });
*/

  CommonGroupViewTests('simple_layerdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_layerdata.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

  Common_renderChildPositionTests('simple_layerdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_layerdata.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

  CommonGroupViewTests('test_data_set.js', function() {
    return {
      data: datasetReader.readFromFile('test_data_set.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

  Common_renderChildPositionTests('test_data_set.js', function() {
    return {
      data: datasetReader.readFromFile('test_data_set.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

/*
  ViewsCommonParseTests({
    ViewType: LayerView,
    viewTypeName: 'LayerView',
    type: 'layer'
  });
  */

  ViewsGroup_parseChildrenTests({
    ViewType: LayerView,
    viewTypeName: 'LayerView',
    type: 'layer'
  });


})
