var jsdom = require("jsdom").jsdom;
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');
var ImageData = require('../../src/framework/imagedata.js');
var ImageView = require('../../src/framework/imageview.js');
var pluginManager = require('../../src/framework/pluginmanager.js');
var WL = require('../../src/framework/wl.js');

var ViewsCommonParseTests = require('./helpers/views/common/_parsetests.js');

describe("ImageView", function() {

  var datasetReader = new DatasetReader();
  var document, window, $;

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  CommonViewTests('simple_imagedata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_imagedata.js')[0],
      ViewType: ImageView
    };
  });

  it('can be created', function() {
    var cv = new ImageView(new ImageData());
    expect(cv).toBeDefined();
  });

  it('will set the src attribute of the DOM element', function() {
    var data = pluginManager.createModel(datasetReader.readFromFile('simple_imagedata.js')[0]);
    var view = new ImageView(data);
    view.render();

    var element = view.outerEl;

    expect(element.getAttribute('src')).toBe(WL.imagePath + data.attributes.src);
  });

  it('will set the alt attribute of the DOM element', function() {
    var data = pluginManager.createModel(datasetReader.readFromFile('simple_imagedata.js')[0]);
    var view = new ImageView(data);
    view.render();

    var element = view.outerEl;

    expect(element.getAttribute('alt')).toBe(data.attributes.alt);
  });

  it('the Parse method will add an alt property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('alt', 'some alt');

    var dataObject = ImageView.parse(element);

    expect(dataObject.alt).toBe('some alt');
  });

  it('the Parse method will add an src property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('src', 'some source');

    var dataObject = ImageView.parse(element);

    expect(dataObject.src).toBe('some source');
  });

  xit('the Parse method will add an src property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('src', 'some source');

    var imageView = new imageView(new imageView.Model({}));
    var dataObject = imageView.parse(element);

    expect(dataObject.src).toBe('some source');
  });

  ViewsCommonParseTests({
    ViewType: ImageView,
    viewTypeName: 'ImageView',
    type: 'image'
  });

});
