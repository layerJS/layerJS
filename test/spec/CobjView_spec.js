var jsdom = require("jsdom").jsdom;
var CobjView = require('../../src/framework/cobjview.js');
var CobjData = require('../../src/framework/cobjdata.js');
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');

describe("CobjView", function() {

  var datasetReader= new DatasetReader();
  var document, window,$;

  beforeEach(function() {
     document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body><div id='outer'><div id='6'></div><div id='7'></div></div></body></html>");
     window = global.window = document.defaultView;
     $ = document.querySelector;
  });

  CommonViewTests('simple_cobjdata.js', function() {
    return {
        data: datasetReader.readFromFile('simple_cobjdata.js')[0],
        ViewType : CobjView
    };
  });
  
   CommonViewTests('anchor_cobjdata.js', function() {
    return {
        data: datasetReader.readFromFile('anchor_cobjdata.js')[0],
        ViewType : CobjView
    };
  });

  it('can be created', function() {
    var cv = new CobjView(new CobjData);
    expect(cv).not.toBeUndefined();
    // expect(cv.el.outerHTML).toBe('<div class="object-default object-node"></div>');
    expect(document.getElementById('wl-obj-css').innerHTML).toBe('');
  });
  // it('can be initialized with an CobjData object', function() {
  //   var cd = new CobjData({
  //     "id": 5,
  //     "type": "text",
  //     "text": "Frame 1:1",
  //     "scaleX": 1,
  //     "scaleY": 1,
  //     "height": 2000,
  //     "zIndex": 500,
  //     "width": 626,
  //     "y": 100,
  //     "x": 100,
  //     "rotation": 0
  //   });
  //   expect(cd).not.toBeUndefined();
  //   var cv = new CobjView(cd);
  //   expect(cv).not.toBeUndefined();
  //   expect(cv.el.getAttribute('data-wl-id')).toBe("5");
  //   expect(cv.el.id).toBe("5");
  //   expect(cv.el.className).toBe('object-default object-text');
  //   expect(cv.el.outerHTML).toBe('<div data-wl-id="5" id="5" class="object-default object-text"></div>'); // remove this expect if we get trouble with attribute orders
  // });
});
