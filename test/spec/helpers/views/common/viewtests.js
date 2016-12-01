var utilities = require("../../utilities.js");
var state = require('../../../../../src/framework/state.js');

module.exports = function(scenario, initFunction) {

  describe('(basis view tests) ' + scenario, function() {

    var data, ViewType, defaultProperties, pluginManager, sourceElement;

    beforeEach(function() {
      pluginManager = require('../../../../../src/framework/pluginmanager.js');
      var init = initFunction();
      ViewType = init.ViewType;
      sourceElement = utilities.appendChildHTML(init.htmlElement);
      defaultProperties = JSON.parse(JSON.stringify(ViewType.defaultProperties));
    });

    it('will have a defaultProperties static property which will contain all default properties for the data', function() {
      expect(ViewType.defaultProperties).toBeDefined();
    });

    it('can be created', function() {
      var cv = new ViewType({
        el: sourceElement
      });
      expect(cv).not.toBeUndefined();
    });

    it('will register itself with the state', function() {
      spyOn(state, 'registerView');
      var view = new ViewType({el: sourceElement});
      expect(state.registerView).toHaveBeenCalledWith(view);
    });

    xit('will add a new DOM element when no element is provided', function() {
      var view = new ViewType(data);
      expect(view.innerEl).not.toBeUndefined();
      expect(view.outerEl).not.toBeUndefined();
    });

    xit('the DOM element will have the same tag as defined in the data model', function() {
      var view = new ViewType(data);
      expect(view.innerEl.tagName.toUpperCase()).toBe(data.attributes.tag.toUpperCase());
      expect(view.outerEl.tagName.toUpperCase()).toBe(data.attributes.tag.toUpperCase());
    });

    it('will add a _ljView property to the DOM element', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.innerEl;
      expect(element._ljView === view).toBeTruthy();
      expect(element === sourceElement).toBeTruthy();
    });

    xit('when initialized with the noRender option true, the view doesn\'t get rendered', function() {
      var view = new ViewType(data, {
        noRender: true
      });

      expect(view.outerEl).toBeDefined();
      expect(view.outerEl.id).toBe('');
    });

    xit('can be initialized with an existing element, without re-rendering', function() {
      var element = document.createElement('div');
      element.id = '1000';

      var view = new ViewType(data, {
        el: element
      });
      expect(view.outerEl).toBe(element);
      expect(view.outerEl.id).not.toBe(data.attributes.id);
    });


    xit('will not automatic render the DOM element with data from it\'s dataModel', function() {
      var view = new ViewType(data);
      var element = view.outerEl;

      expect(element.id).not.toBe(data.attributes.id);
    });


    xit('can be initialized with an existing element, forcing re-rendering', function() {
      var element = document.createElement('div');
      element.id = '1000';
      var view = new ViewType(data, {
        el: element,
        forceRender: true
      });
      expect(view.outerEl).toBe(element);
      expect(view.outerEl.id).toBe('1000');
    });

    it('cannot add view to existing element if that is already connected to another view', function() {
      var element = document.createElement('div');
      element.id = '1000';
      element._ljView = {};
      var options = {
        el: element
      };

      var fun = function() {
        var cv = new viewType(options);
      };
      expect(fun).toThrow()
    });

    xit('is styled in a separte stylesheet if a style is defined', function() {
      var view = new ViewType(data);

      var expected = expect(document.getElementById('wl-obj-css').innerHTML);
      if (data.attributes.style) {
        expected.toContain("#wl-obj-" + data.attributes.id + "{" + data.attributes.style + "}");
      } else {
        expected.not.toContain("#wl-obj-" + data.attributes.id);
      }
    });

    xit('will add a data-lj-id attribute DOM element', function() {
      var view = new ViewType(data);

      var element = view.outerEl;
      var data_wl_id = element.getAttribute('data-lj-id');
      expect(data_wl_id).toBe(data.attributes.id.toString());
    });

    xit('will add a data-lj-type attribute DOM element', function() {
      var view = new ViewType(data);

      var element = view.outerEl;
      var data_wl_type = element.getAttribute('data-lj-type');
      expect(data_wl_type).toBe(data.attributes.type.toString());
    });

    xit('will add a default class to the DOM element', function() {
      var view = new ViewType(data);

      var element = view.innerEl;
      var classAttribute = element.getAttribute('class');
      expect(classAttribute).toContain('object-default object-' + data.attributes.type);
    });

    xit('will add classes that are defined in a data to the DOM element', function() {
      var view = new ViewType(data);

      var element = view.innerEl;
      var classAttribute = element.getAttribute('class');
      expect(classAttribute).toContain(data.attributes.classes);
    });

    xit('will add classes that are defined in a data to the DOM element', function() {
      var view = new ViewType(data);

      var element = view.outerEl;
      var classAttribute = element.getAttribute('class');
      expect(classAttribute).toContain(data.attributes.classes);
    });

    it('will remove the linked DOM element from is parent when destroy is called', function() {
      var parent = document.createElement('div');
      var child = document.createElement('div');
      parent.appendChild(child);

      expect(parent.children.length).toBe(1);

      var view = new ViewType({
        el: child
      });
      view.destroy();

      expect(parent.children.length).toBe(0);
      expect(child.parent).toBeUndefined();
    });

    xit('will set the href attribute of the anchor DOM element to the link_to attribute of the data model', function() {
      var view = new ViewType(data);
      var element = view.outerEl;

      if (data.attributes.tag.toUpperCase() == 'A') {
        expect(element.hasAttribute('href')).toBeTruthy();
        expect(element.getAttribute('href')).toBe(data.attributes.linkTo ? data.attributes.linkTo : '');
      } else {
        expect(element.hasAttribute('href')).toBeFalsy();
      }
    });

    xit('will set the target attribute of the anchor DOM element to the link_target attribute of the data model', function() {
      var view = new ViewType(data);
      var element = view.outerEl;

      if (data.attributes.tag.toUpperCase() == 'A') {
        expect(element.hasAttribute('target')).toBeTruthy();
        expect(element.getAttribute('target')).toBe(data.attributes.linkTarget ? data.attributes.linkTarget : '_self');
      } else {
        expect(element.hasAttribute('target')).toBeFalsy();
      }
    });

    it('will listen for changes on its DOM element by default', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.outerEl;

      expect(view._observer).toBeDefined();
      expect(view._observer.isObserving()).toBe(true);
    });

    xit('will put the htmlAttributes from the dataObject into the DOM element as attributes', function() {
      data.attributes.htmlAttributes.id = 'id';
      data.attributes.htmlAttributes.custom = 'custom';
      data.attributes.htmlAttributes.someThing = 'someThing';

      var view = new ViewType(data);
      var element = view.outerEl;

      expect(element.hasAttribute('id')).toBeTruthy();
      expect(element.getAttribute('id')).toBe(data.attributes.htmlAttributes.id);

      expect(element.hasAttribute('custom')).toBeTruthy();
      expect(element.getAttribute('custom')).toBe(data.attributes.htmlAttributes.custom);

      expect(element.hasAttribute('some-thing')).toBeTruthy();
      expect(element.getAttribute('some-thing')).toBe(data.attributes.htmlAttributes.someThing);
    });

    it('when the options parameter has no document, the global document will be taken', function() {
      var view = new ViewType({
        el: sourceElement
      });
      expect(view.document).toBe(document);
    });

    it('can pas in a custom document in the options parameter', function() {
      var view = new ViewType({
        el: sourceElement,
        document: document
      });
      expect(view.document).toBe(document);
    });

    it('will have a identify static property which can be used to identify is an element is of a specific View class', function() {
      expect(ViewType.identify).toBeDefined();
      expect(typeof ViewType.identify).toBe('function');
    });
  });
};
