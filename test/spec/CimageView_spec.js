var jsdom = require("jsdom").jsdom;
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');
var CimageData = require('../../src/framework/cimagedata.js');
var CimageView = require('../../src/framework/cimageview.js');
var pluginManager = require('../../src/framework/pluginmanager.js');
var WL = require('../../src/framework/wl.js');

describe("CimageView", function() {

  var datasetReader = new DatasetReader();
  var document, window, $;

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  CommonViewTests('simple_cimagedata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_cimagedata.js')[0],
      ViewType: CimageView
    };
  });

  it('can be created', function() {
    var cv = new CimageView(new CimageData());
    expect(cv).toBeDefined();
  });

  it('will set the src attribute of the DOM element', function() {
    var data = pluginManager.createModel(datasetReader.readFromFile('simple_cimagedata.js')[0]);
    var view = new CimageView(data);
    view.render();

    var element = view.el;

    expect(element.getAttribute('src')).toBe(WL.imagePath + data.attributes.src);
  });

  it('will set the alt attribute of the DOM element', function() {
    var data = pluginManager.createModel(datasetReader.readFromFile('simple_cimagedata.js')[0]);
    var view = new CimageView(data);
    view.render();

    var element = view.el;

    expect(element.getAttribute('alt')).toBe(data.attributes.alt);
  });

  it('the Parse method will add an alt property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('alt', 'some alt');

    var dataObject = CimageView.parse(element);

    expect(dataObject.alt).toBe('some alt');
  });

  it('the Parse method will add an src property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('src', 'some source');

    var dataObject = CimageView.parse(element);

    expect(dataObject.src).toBe('some source');
  });

});
