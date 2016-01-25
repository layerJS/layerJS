var jsdom = require("jsdom").jsdom;
var CobjView = require('../../src/framework/cobjview.js');
var CobjData = require('../../src/framework/cobjdata.js');

describe("CobjView", function() {

  var document, window,$;

  beforeEach(function() {
     document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body><div id='outer'><div id='6'></div><div id='7'></div></div></body></html>");
     window = global.window = document.defaultView;
     $ = document.querySelector;
  });

  it('can be created', function() {
    var cv = new CobjView(new CobjData);
    expect(cv).not.toBeUndefined();
    expect(cv.el.outerHTML).toBe('<div class="object-default object-node"></div>');
    expect(document.getElementById('wl-obj-css').innerHTML).toBe('');
  });
  it('can be initialized with an CobjData object', function() {
    var cd = new CobjData({
      "id": 5,
      "type": "text",
      "text": "Frame 1:1",
      "scaleX": 1,
      "scaleY": 1,
      "height": 2000,
      "zIndex": 500,
      "width": 626,
      "y": 100,
      "x": 100,
      "rotation": 0
    });
    expect(cd).not.toBeUndefined();
    var cv = new CobjView(cd);
    expect(cv).not.toBeUndefined();
    expect(cv.el.getAttribute('data-wl-id')).toBe("5");
    expect(cv.el.id).toBe("5");
    expect(cv.el.className).toBe('object-default object-text');
    expect(cv.el.outerHTML).toBe('<div data-wl-id="5" id="5" class="object-default object-text"></div>'); // remove this expect if we get trouble with attribute orders
  });
  it('can be initialized with an existing element, without re-rendering', function() {
    var cd = new CobjData({
      "id": 5,
      "type": "text",
      "text": "Frame 1:1",
      "scaleX": 1,
      "scaleY": 1,
      "height": 2000,
      "zIndex": 500,
      "width": 626,
      "y": 100,
      "x": 100,
      "rotation": 0
    });
    var element = document.getElementById('6')
    var cv = new CobjView(cd, {
      el: element
    });
    expect(cv.el).toBe(element);
    expect(cv.el.id).toBe('6'); // not changed
  });
  it('cannot add view to existing element if that is already connected to another view', function() {
    var data = {
      "id": 5,
      "type": "text",
      "text": "Frame 1:1",
      "scaleX": 1,
      "scaleY": 1,
      "height": 2000,
      "zIndex": 500,
      "width": 626,
      "y": 100,
      "x": 100,
      "rotation": 0
    };
    var options = { el : document.getElementById('5') };

    var cd1 = new CobjData(data);
    var cv1 = new CobjView(cd1, options);
    var cd2 = new CobjData(data);

    var fun=function(){
      var cv = new CobjView(cd, options);
    };
    expect(fun).toThrow()
  });
  it('can be initialized with an existing element, forcing re-rendering', function() {
    var cd = new CobjData({
      "id": 5,
      "type": "text",
      "text": "Frame 1:1",
      "scaleX": 1,
      "scaleY": 1,
      "height": 2000,
      "zIndex": 500,
      "width": 626,
      "y": 100,
      "x": 100,
      "rotation": 0
    });
    var element = document.getElementById('7')
    var cv = new CobjView(cd, {
      el: element,
      forceRender: true
    });
    expect(cv.el).toBe(element);
    expect(cv.el.id).toBe('5'); // changed
  });
  it('is styled in a separate stylesheet', function() {
    var cd = new CobjData({
      "id": 9,
      "type": "text",
      "text": "Frame 1:1",
      "scaleX": 1,
      "scaleY": 1,
      "height": 2000,
      "zIndex": 500,
      "width": 626,
      "style": "color: red",
      "y": 100,
      "x": 100,
      "rotation": 0
    });
    var cv = new CobjView(cd);
    expect(document.getElementById('wl-obj-css').innerHTML).toContain("#wl-obj-9{color: red}");

  })
})
