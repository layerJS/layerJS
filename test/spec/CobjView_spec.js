var jsdom = require("jsdom").jsdom;
var CobjView = require('../../src/framework/cobjview.js');
var CobjData = require('../../src/framework/cobjdata.js');
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');

describe("CobjView", function() {

  var datasetReader = new DatasetReader();
  var document, window, $;

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body><div id='outer'><div id='6'></div><div id='7'></div></div></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  CommonViewTests('simple_cobjdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_cobjdata.js')[0],
      ViewType: CobjView
    };
  });

  CommonViewTests('anchor_cobjdata.js', function() {
    return {
      data: datasetReader.readFromFile('anchor_cobjdata.js')[0],
      ViewType: CobjView
    };
  });

  it('can be created', function() {
    var cv = new CobjView(new CobjData);
    expect(cv).not.toBeUndefined();
    expect(document.getElementById('wl-obj-css').innerHTML).toBe('');
  });
});
