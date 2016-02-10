var jsdom = require("jsdom").jsdom;

var CGroupView = require('../../src/framework/cgroupview.js');
var CGroupData = require('../../src/framework/cgroupdata.js');
var CobjView = require('../../src/framework/cobjview.js');
var CobjData = require('../../src/framework/cobjdata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var CommonGroupViewTests = require('./helpers/commongroupviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("CGroupView", function() {

  var datasetReader = new DatasetReader();

  var document, window, $;

  beforeEach(function() {

    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });


  CommonViewTests('simple_cgroupdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_cgroupdata.js')[0],
      ViewType: CGroupView
    };
  });

  CommonViewTests('anchor_cgroupdata.js', function() {
    return {
      data: datasetReader.readFromFile('anchor_cgroupdata.js')[0],
      ViewType: CGroupView
    };
  });

  CommonGroupViewTests('cgroupdata_with_cobjdata.js', function() {
    return {
      data: datasetReader.readFromFile('cgroupdata_with_cobjdata.js'),
      ViewType: CGroupView,
      parentId: 110530
    };
  });

  it("when a view that is attached using the attachView method changes, the _myChildListenerCallback should be called", function() {
    var cgroupData = new CGroupData(datasetReader.readFromFile('simple_cgroupdata.js')[0]);
    var cgroupView = new CGroupView(cgroupData);

    expect(cgroupView._myChildListenerCallback).toBeDefined();
    spyOn(cgroupView, '_myChildListenerCallback');

    var cobjData = new CobjData(datasetReader.readFromFile('simple_cobjdata.js')[0]);
    var cobjView = new CobjView(cobjData);

    cgroupView.attachView(cobjView);

    cobjView.data.set('x', 20);

    expect(cgroupView._myChildListenerCallback.calls.count()).toBe(1);
    expect(cgroupView._myChildListenerCallback).toHaveBeenCalledWith(cobjView.data);
  });

});
