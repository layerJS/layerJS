var jsdom = require("jsdom").jsdom;
var ObjView = require('../../src/framework/objview.js');
var ObjData = require('../../src/framework/objdata.js');
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');

describe("ObjView", function() {

  var datasetReader = new DatasetReader();
  var document, window, $;

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body><div id='outer'><div id='6'></div><div id='7'></div></div></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  CommonViewTests('simple_objdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_objdata.js')[0],
      ViewType: ObjView
    };
  });

  CommonViewTests('anchor_objdata.js', function() {
    return {
      data: datasetReader.readFromFile('anchor_objdata.js')[0],
      ViewType: ObjView
    };
  });

  it('can be created', function() {
    var cv = new ObjView(new ObjData);
    expect(cv).not.toBeUndefined();
    expect(document.getElementById('wl-obj-css').innerHTML).toBe('');
  });
});
