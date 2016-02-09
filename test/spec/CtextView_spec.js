var jsdom = require("jsdom").jsdom;
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');
var CtextData = require('../../src/framework/ctextdata.js');
var CtextView = require('../../src/framework/ctextview.js');
var pluginManager = require('../../src/framework/pluginmanager.js');

describe("CtextView", function() {

  var datasetReader = new DatasetReader();
  var document, window, $;

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  CommonViewTests('simple_ctextdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_ctextdata.js')[0],
      ViewType: CtextView
    };
  });

  it('can be created', function() {
    var cv = new CtextView(new CtextData());
    expect(cv).toBeDefined();
  });

  it('will put the text attribute in the innerHTML the DOM element', function() {
    var data = pluginManager.createModel(datasetReader.readFromFile('simple_ctextdata.js')[0]);
    var view = new CtextView(data);
    view.render();
    var element = view.el;

    expect(element.innerHTML).toBe(data.attributes.content);
  });

  it('the Parse method will add an content property to the data object', function() {
    var element = document.createElement('div');
    element.innerHTML = 'some content';

    var dataObject = CtextView.parse(element);

    expect(dataObject.content).toBe('some content');
  });
});
