var jsdom = require('jsdom').jsdom;
var WL = require('../../src/framework/wl.js');
var defaults = require('../../src/framework/defaults.js');

xdescribe('ParseMananger', function() {

  var repository = WL.repository;
  var parseManager = WL.parseManager;

  beforeEach(function() {
    repository.clear();
  });


  var document, window, $;

  function setHtml(html) {
    document = global.document =
      jsdom(html);
    window = global.window = document.defaultView;
    $ = document.querySelector;
  }

  it('will fill add stageData to the repository from DOM elements', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body><div data-wl-id='1' data-wl-type='stage'></div><div data-wl-id='2' data-wl-type='stage'><div></body></html>");

    parseManager.parseDocument();

    var stage = repository.get(1, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);

    stage = repository.get(2, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('2');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);
  });

  it('will ask the repository for an id if the DOM element doesn\'t have a data-wl-id attribute', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body><div data-wl-type='stage'></div></body></html>");

    var element = document.querySelector("[data-wl-type='stage']");
    expect(element.hasAttribute('data-wl-id')).toBeFalsy();

    parseManager.parseDocument();
    expect(element._wlView).toBeDefined();
    element._wlView.render();
    expect(element.hasAttribute('data-wl-id')).toBeTruthy();
  });

  it('will go as deep as a frame type by default', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body>" +
      "<div data-wl-id='1' data-wl-type='stage'>" +
      "<div data-wl-id='2' data-wl-type='layer'>" +
      "<div data-wl-id='3' data-wl-type='frame'>" +
      "<div data-wl-id='4' data-wl-type='text'></div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</body></html>");
    parseManager.parseDocument();

    var stage = repository.get(1, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children).toEqual(['2']);

    var layer = repository.get(2, defaults.version);
    expect(layer).toBeDefined();
    expect(layer.attributes.id).toBe('2');
    expect(layer.attributes.type).toBe('layer');
    expect(layer.attributes.children).toEqual(['3']);

    var frame = repository.get(3, defaults.version);
    expect(frame).toBeDefined();
    expect(frame.attributes.id).toBe('3');
    expect(frame.attributes.type).toBe('frame');
    expect(frame.attributes.children.length).toBe(0);
  });

  it('can pass a type where the parse should stop', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body>" +
      "<div data-wl-id='1' data-wl-type='stage'>" +
      "<div data-wl-id='2' data-wl-type='layer'>" +
      "<div data-wl-id='3' data-wl-type='frame'>" +
      "<div data-wl-id='4' data-wl-type='text'></div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</body></html>");

    parseManager.parseDocument({
      stopAt: 'layer'
    });

    var stage = repository.get(1, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children).toEqual(['2']);

    var layer = repository.get(2, defaults.version);
    expect(layer).toBeDefined();
    expect(layer.attributes.id).toBe('2');
    expect(layer.attributes.type).toBe('layer');
    expect(layer.attributes.children.length).toBe(0);
  });

  it('will not look in non layerJS elements by default', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body>" +
      "<div data-wl-id='1' data-wl-type='stage'>" +
      "<div>" +
      "<div data-wl-id='2' data-wl-type='layer'></div>" +
      "</div>" +
      "</div>" +
      "</body></html>");

    parseManager.parseDocument();

    var stage = repository.get(1, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);
  });

  it('will look in non layerJS elements if lookInNonLayerJsElements is true', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body>" +
      "<div data-wl-id='1' data-wl-type='stage'>" +
      "<div>" +
      "<div data-wl-id='2' data-wl-type='layer'></div>" +
      "</div>" +
      "</div>" +
      "</body></html>");

    parseManager.parseDocument({
      lookInNonLayerJsElements: true
    });

    var stage = repository.get(1, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children).toEqual(['2']);

    var layer = repository.get(2, defaults.version);
    expect(layer).toBeDefined();
    expect(layer.attributes.id).toBe('2');
    expect(layer.attributes.type).toBe('layer');
    expect(layer.attributes.children.length).toBe(0);
  });

  it('will put the data object is a specific version if it is passed as a parameter', function() {
    setHtml("<html><head><style id='wl-obj-css'></style></head><body><div data-wl-id='1' data-wl-type='stage'/><div data-wl-id='2' data-wl-type='stage'/></body></html>");

    var version = 'v1';
    parseManager.parseDocument({
      version: version
    });

    var stage = repository.get(1, version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);

    stage = repository.get(2, version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('2');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);
  });

});
