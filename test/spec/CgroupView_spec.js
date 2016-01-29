var jsdom = require("jsdom").jsdom;

var CGroupView = require('../../src/framework/cgroupview.js');
var CGroupData = require('../../src/framework/cgroupdata.js');
var CommonViewTests = require('./helpers/commonviewtests.js');
var DatasetReader = require('./helpers/datasetreader.js');

describe("CGroupView", function() {
  debugger;
  var document, window,$;

  var datasetReader = new DatasetReader();

  beforeEach(function() {
     document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body><div id='outer'><div id='6'></div><div id='7'></div></div></body></html>");
     window = global.window = document.defaultView;
     $ = document.querySelector;
  });

  it('can be created', function() {
    var cv = new CGroupView(new CGroupData ( { children : [] }));
    expect(cv).not.toBeUndefined();
    expect(cv.el.outerHTML).toBe('<div class="object-default object-group"></div>');
    expect(document.getElementById('wl-obj-css').innerHTML).toBe('');
  });

  CommonViewTests(function() {
    return {
        data: datasetReader.readFromFile('simple_cgroupdata.js')[0],
        ViewType : CGroupView
    };
  });

})
