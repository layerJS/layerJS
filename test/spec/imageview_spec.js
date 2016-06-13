var CommonViewTests = require('./helpers/Commonviewtests.js');
var ImageView = require('../../src/framework/imageview.js');
var pluginManager = require('../../src/framework/pluginmanager.js');
var WL = require('../../src/framework/wl.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe("ImageView", function() {

  CommonViewTests('simple_imagedata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_imagedata.js')[0])),
      ViewType: ImageView
    };
  });

  it('can be created', function() {
    var cv = new ImageView(new ImageView.Model(ImageView));
    expect(cv).toBeDefined();
  });

  it('will set the src attribute of the DOM element', function() {
    var data = new ImageView.Model(JSON.parse(JSON.stringify(require('./datasets/simple_imagedata.js')[0])));
    var view = new ImageView(data);
    view.render();

    var element = view.outerEl;

    expect(element.getAttribute('src')).toBe(WL.imagePath + data.attributes.src);
  });

  it('will set the alt attribute of the DOM element', function() {
    var data = new ImageView.Model(JSON.parse(JSON.stringify(require('./datasets/simple_imagedata.js')[0])));
    var view = new ImageView(data);
    view.render();

    var element = view.outerEl;

    expect(element.getAttribute('alt')).toBe(data.attributes.alt);
  });

  it('the parse method will add an src property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('src', 'some source');

    var imageView = new ImageView(new ImageView.Model(ImageView), {el:element});

    expect(imageView.data.attributes.src).toBe('some source');
  });

  it('the parse method will add an alt property to the data object', function() {
    var element = document.createElement('img');
    element.setAttribute('alt', 'some alt');

    var imageView = new ImageView(new ImageView.Model(ImageView), {el:element});

    expect(imageView.data.attributes.alt).toBe('some alt');
  });

  it('the parse method doesn\'t generate a change event on the dataObjects', function() {
    var element = document.createElement('img');
    element.setAttribute('alt', 'some alt');
    element.setAttribute('src', 'some source');

    var imageView = new ImageView(new ImageView.Model(ImageView));

    var isFired = false;

    imageView.render = function() {
      isFired = true;
    };

    imageView.parse(element);
    expect(isFired).toBeFalsy();
  });

  ViewsCommonParseTests({
    ViewType: ImageView
  });
});
