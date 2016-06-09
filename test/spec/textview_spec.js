var CommonViewTests = require('./helpers/Commonviewtests.js');
var TextView = require('../../src/framework/textview.js');
var pluginManager = require('../../src/framework/pluginmanager.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe("TextView", function() {

  CommonViewTests('simple_textdata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_textdata.js')[0])),
      ViewType: TextView
    };
  });

  it('can be created', function() {
    var cv = new TextView(new TextView.Model(TextView));
    expect(cv).toBeDefined();
  });

  it('will put the text attribute in the innerHTML the DOM element', function() {
    var data = new TextView.Model(require('./datasets/simple_textdata.js')[0]);
    var view = new TextView(data);
    view.render();
    var element = view.innerEl;

    expect(element.innerHTML).toBe(data.attributes.content);
  });

  it('the Parse method will add an content property to the data object', function() {
    var element = document.createElement('div');
    element.innerHTML = 'some content';

    var textView = new TextView(new TextView.Model({}), {
      el: element
    });

    expect(textView.data.attributes.content).toBe('some content');
  });

  it('the parse method doesn\'t generate a change event on the dataObjects', function() {
    var element = document.createElement('div');
    element.innerHTML = 'some content';

    var textView = new TextView(new TextView.Model({}));

    var isFired = false;
    textView.render = function() {
      isFired = true;
    };

    var returnedData = textView.parse(element);
    expect(isFired).toBeFalsy();
  });

  ViewsCommonParseTests({
    ViewType: TextView
  });
});
