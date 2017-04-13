var utilities = require("../../utilities.js");
;

module.exports = function(scenario, initFunction) {

  describe('(basis view tests) ' + scenario, function() {

    var data, ViewType, defaultProperties, pluginManager, sourceElement, state;

    beforeEach(function() {
      pluginManager = require('../../../../../src/framework/pluginmanager.js');
      var init = initFunction();
      ViewType = init.ViewType;
      sourceElement = utilities.appendChildHTML(init.htmlElement);
      defaultProperties = JSON.parse(JSON.stringify(ViewType.defaultProperties));
      state = layerJS.getState();
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
      var view = new ViewType({
        el: sourceElement
      });
      expect(state.registerView).toHaveBeenCalledWith(view);
    });

    it('will add a _ljView property to the DOM element', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var innerElement = view.innerEl;
      expect(innerElement._ljView === view).toBeTruthy();
      var outerElement = view.outerEl;
      expect(outerElement._ljView === view).toBeTruthy();
      expect(outerElement === sourceElement).toBeTruthy();
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

    it('will listen for changes on its DOM element by default', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.outerEl;
      expect(view.isObserving()).toBe(true);
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

    it('will add the margin to the height', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.height = '100px';

      var height = view.height();
      element.style.marginTop = '50px';
      element.style.marginBottom = '20px';

      expect(view.height()).toBe(height + 70);
    });

    it('will add the margin to the width', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.width = '100px';

      var width = view.width();
      element.style.marginLeft = '50px';
      element.style.marginRight = '20px';

      expect(view.width()).toBe(width + 70);
    });

    it('will subtract the margin when setting the height', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.marginTop = '50px';
      element.style.marginBottom = '20px';
      view.setHeight(170);
      expect(element.style.height).toBe('100px');
    });

    it('will subtract the margin when setting the width', function() {
      var view = new ViewType({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.marginLeft = '50px';
      element.style.marginRight = '20px';
      view.setWidth(170);
      expect(element.style.width).toBe('100px');
    });
  });
};
