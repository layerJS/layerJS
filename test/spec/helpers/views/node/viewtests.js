var viewTests = function(scenario, ViewType, scenarioData) {

  describe('(nodeview tests) ' + scenario, function() {

    var data;

    beforeEach(function() {
      data = new ViewType.Model(scenarioData);
    });

    it('will have a defaultProperties static property which will contain all default properties for the data', function() {
      expect(ViewType.defaultProperties).toBeDefined();
    });

    it('can be created', function() {
      //console.log(data);
      var cv = new ViewType(data);
      expect(cv).not.toBeUndefined();
    });

    it('will add a new DOM element when no element is provided', function() {
      var view = new ViewType(data);
      expect(view.innerEl).not.toBeUndefined();
      expect(view.outerEl).not.toBeUndefined();
    });

    it('will add a _wlView property to the DOM element', function() {
      var view = new ViewType(data);
      var element = view.innerEl;
      expect(element._wlView === view).toBeTruthy();
    });

    it('cannot add view to existing element if that is already connected to another view', function() {
      var element = document.createElement('div');
      element.id = '1000';
      element._wlView = {};
      var options = {
        el: element
      };

      var fun = function() {
        var cv = new viewType(data, options);
      };
      expect(fun).toThrow()
    });


    it('will listen for changes on its DOM element by default', function() {
      var view = new ViewType(data);
      var element = view.outerEl;

      expect(view._observer).toBeDefined();
      expect(view._observer.isObserving).toBeTruthy();
    });

    it('will have a identify static property which can be used to identify is an element is of a specific View class', function() {
      expect(ViewType.identify).toBeDefined();
      expect(typeof ViewType.identify).toBe('function');
    });
  });
};

module.exports = viewTests;
