var jsdom = require("jsdom").jsdom;

var CGroupView = require('../../src/framework/cgroupview.js');
var CGroupData = require('../../src/framework/cgroupdata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("CGroupView", function() {

  var datasetReader = new DatasetReader();

  CommonViewTests(function() {
    return {
        data: datasetReader.readFromFile('simple_cgroupdata.js')[0],
        ViewType : CGroupView
    };
  });
  
  CommonViewTests(function() {
    return {
        data: datasetReader.readFromFile('anchor_cgroupdata.js')[0],
        ViewType : CGroupView
    };
  });

  CommonGroupViewTests(function() {
    return {
        data: datasetReader.readFromFile('cgroupdata_with_cobjdata.js'),
        ViewType : CGroupView,
        parentId : 110530
    };
  });
  
   
  
});