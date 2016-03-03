var jsdom = require("jsdom").jsdom;
var DatasetReader = require('./helpers/datasetreader.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');
var TextData = require('../../src/framework/textdata.js');
var TextView = require('../../src/framework/textview.js');
var pluginManager = require('../../src/framework/pluginmanager.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe("TextView", function() {

  var datasetReader = new DatasetReader();
  var document, window, $;

  beforeEach(function() {
    document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
    window = global.window = document.defaultView;
    $ = document.querySelector;
  });

  CommonViewTests('simple_textdata.js', function() {
    return {
      data: datasetReader.readFromFile('simple_textdata.js')[0],
      ViewType: TextView
    };
  });

  it('can be created', function() {
    var cv = new TextView(new TextData());
    expect(cv).toBeDefined();
  });

  it('will put the text attribute in the innerHTML the DOM element', function() {
    var data = pluginManager.createModel(datasetReader.readFromFile('simple_textdata.js')[0]);
    var view = new TextView(data);
    view.render();
    var element = view.innerEl;

    expect(element.innerHTML).toBe(data.attributes.content);
  });

  it('the Parse method will add an content property to the data object', function() {
    var element = document.createElement('div');
    element.innerHTML = 'some content';

    var textView = new TextView(new TextView.Model({}));
    var dataModel = textView.parse(element);

    expect(dataModel.attributes.content).toBe('some content');
  });

  ViewsCommonParseTests({
    ViewType: TextView,
    viewTypeName: 'TextView',
    type: 'text'
  });
});
