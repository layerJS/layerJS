var pluginManager = require('../../../src/framework/pluginmanager.js');

var commonViewTests = function(initFunction){

describe('(basis view tests)', function(){

  var data, ViewType;

  beforeEach(function(){
    var init = initFunction();
    data = pluginManager.createModel(JSON.parse(JSON.stringify(init.data)));
    ViewType = init.ViewType;
    });

  it('will add a new DOM element when no element is provided', function(){
    var view = new ViewType(data);
    expect(view.el).not.toBeUndefined();
  });

  it('will add a _wlView property to the DOM element', function(){
      var view = new ViewType(data);
      var element = view.el;
      expect(element._wlView === view).toBeTruthy();
  });

  it('can be initialized with an existing element, without re-rendering', function() {
    var element = document.createElement('div');
    element.id = '1000';

    var view = new ViewType(data, {
      el: element
    });
    expect(view.el).toBe(element);
    expect(view.el.id).toBe('1000');
  });

  it('can be initialized with an existing element, forcing re-rendering', function() {
    var element = document.createElement('div');
    element.id = '1000';
    var view = new ViewType(data, {
      el: element,
      forceRender: true
    });
    expect(view.el).toBe(element);
    expect(view.el.id).toBe(data.attributes.id.toString()); // changed
  });

  it('cannot add view to existing element if that is already connected to another view', function() {
    var element = document.createElement('div');
    element.id = '1000';
    element._wlView = {};
    var options = { el : element };

    var fun=function(){
      var cv = new viewType(data, options);
    };
    expect(fun).toThrow()
  });

  it('is styled in a separte stylesheet', function(){
    var view = new ViewType(data);

    expect(document.getElementById('wl-obj-css').innerHTML)
            .toContain("#wl-obj-" + data.attributes.id +"{" + data.attributes.style +"}");
  });

  it('will add a data-wl-id attribute DOM element', function(){
    var view = new ViewType(data);
    var element = view.el;
    var data_wl_id = element.getAttribute('data-wl-id');
    expect(data_wl_id).toBe(data.attributes.id.toString());
  });

  it('will add a default class to the DOM element', function(){
    var view = new ViewType(data);
    var element = view.el;
    var classAttribute = element.getAttribute('class');
    expect(classAttribute).toContain('object-default object-' + data.attributes.type);
  });

  it('will add classes that are defined in a data to the DOM element', function(){
    var view = new ViewType(data);
    var element = view.el;
    var classAttribute = element.getAttribute('class');
    expect(classAttribute).toContain(data.attributes.classes);
  });

  it('will add classes that are defined in a data to the DOM element', function(){
    var view = new ViewType(data);
    var element = view.el;
    var classAttribute = element.getAttribute('class');
    expect(classAttribute).toContain(data.attributes.classes);
  });

  it('will put the x property as the left property of the style of the DOM element when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.left).toBe(data.attributes.x +'px');
  });

  it('will put the y property as the top property of the style of the DOM element when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.top).toBe(data.attributes.y +'px');
  });

  it('when the y property is undefined the position property will be absolute of the style of the DOM element when renderPosition is called', function(){
    data.attributes.y = undefined;
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.position).toBe('absolute');
  });

  it('when the x property is undefined the position property will be absolute of the style of the DOM element when renderPosition is called', function(){
    data.attributes.x = undefined;

    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.position).toBe('absolute');
  });

  it('when the x and y property are undefined the position property will be static of the style of the DOM element when renderPosition is called', function(){
    data.attributes.y = undefined;
    data.attributes.x = undefined;
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.position).toBe('static');
  });

  it('will put a scaleX, scaleY in the transform property of the style of the DOM element will be set when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.transform).toContain('scale(' + data.attributes.scaleX+ ',' + data.attributes.scaleY +')');
  });

  it('will put the rotation in the transform property of the style of the DOM element will be set when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.transform).toContain('rotate(' + Math.round(data.attributes.rotation) + 'deg)');
  });

  it('will put the zIndex in the zIndex property of the style of the DOM element will be set when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    expect(element.style.zIndex).toBe(data.attributes.zIndex !== undefined ? data.attributes.zIndex.toString() : '');
  });

  it('will set the display property in the style of the DOM element when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    var displaySetting = data.attributes.hidden ? 'none' : '';

    expect(element.style.display).toBe(displaySetting);
  });

  it('will put the width in the width property of the style of the DOM element will be set when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    var width = data.attributes.width !== undefined ? data.attributes.width +'px' : '';

    expect(element.style.width).toBe(width);
  });

  it('will put the width in the width property of the style of the DOM element will be set when renderPosition is called', function(){
    var view = new ViewType(data);
    view.renderPosition();
    var element = view.el;
    var style = element.style;

    var height = data.attributes.height !== undefined ? data.attributes.height +'px' : '';

    expect(element.style.height).toBe(height);
  });

  it('will remove the linked DOM element from is parent when destroy is called', function(){
      var parent = document.createElement('div');
      var child = document.createElement('div');
      parent.appendChild(child);

      expect(parent.children.length).toBe(1);

      var view = new ViewType(data, { el : child});
      view.destroy();

      expect(parent.children.length).toBe(0);
      expect(child.parent).toBeUndefined();
    });
  });
};

module.exports = commonViewTests;
