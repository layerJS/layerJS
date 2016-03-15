var WL = require('../../../../../src/framework/wl.js');
var defaults = require('../../../../../src/framework/defaults.js');

module.exports = function(options) {

  var ViewType = options.ViewType;
  var DataType = ViewType.Model;
  var type = options.type;

  describe(options.viewTypeName + ": parse =>", function() {

    var element;
    var repository = WL.repository;

    beforeEach(function() {
      element = document.createElement('a');
      element.setAttribute('data-wl-id', 1);
      element.setAttribute('data-wl-type', type);
      element.setAttribute('data-wl-version', defaults.version);
      element.style.display = 'none';
      element.style.zIndex = 2;
      element.style.width = '100px';
      element.style.height = '200px';
      element.style.left = '50px';
      element.style.top = '25px';
      element.className = 'object-default object-' + type + ' someClass';
      element.setAttribute('href', 'url');
      element.setAttribute('target', '_self');
    });

    it('will contain a Parse method to read the data from a DOM element', function() {
      var data = new DataType({});
      var view = new ViewType(data, {});
      expect(view.parse).toBeDefined();
    });

    it('when no dataObject is passed and no DOM element is passed, a dataObject can\'t be found', function() {
      var error = function() {
        var view = new ViewType(undefined, {});
      };

      expect(error).toThrow('data object must exist when creating a view');
    });

    it('when no dataObject is passed and a DOM element is passed, this DOM element will be parsed to get a dataObject', function() {
      var view = new ViewType(undefined, {
        el: element
      });

      var dataObject = view.data;
      expect(dataObject).toBeDefined();
    });

    it('has a parse method that will update the current dataObject and will return it', function() {
      var data = new DataType({});
      var view = new ViewType(data);
      view.parse(element);

      expect(data.attributes.id).toBe('1');
      expect(data.attributes.type).toBe(type);
      expect(data.attributes.version).toBe(defaults.version);
      expect(data.attributes.tag).toBe('A');
      expect(data.attributes.classes).toBe('someClass');
      expect(data.attributes.linkTo).toBe('url');
      expect(data.attributes.linkTarget).toBe('_self');
      expect(data.attributes.x).toBe('50px');
      expect(data.attributes.y).toBe('25px');
      expect(data.attributes.hidden).toBe(true);
      expect(data.attributes.zIndex).toBe('2');
      expect(data.attributes.width).toBe('100px');
      expect(data.attributes.height).toBe('200px');
    });

    it('the Parse method will return a data object with all the data-wl-* attributes (camelcased) from a DOM element', function() {
      element = document.createElement('div');
      element.setAttribute('data-wl-some-thing', '1');
      element.setAttribute('data-wl-some-thing-else', '2');
      element.setAttribute('data-custom', '3');

      var view = new ViewType(new DataType({}), {
        el: element
      });

      expect(view.data.attributes.someThing).toBe('1');
      expect(view.data.attributes.someThingElse).toBe('2');
      expect(view.data.attributes.custom).toBeUndefined();
    });

    it('the Parse method will create a object with propertiesin the dataModel is the DOM element contains an attribute of formate data-wl-*.* ', function() {
      element = document.createElement('div');
      element.setAttribute('data-wl-some.thing', '1');
      element.setAttribute('data-wl-some.thing-else', '2');

      var view = new ViewType(new DataType({}), {
        el: element
      });

      expect(view.data.attributes.some.thing).toBe('1');
      expect(view.data.attributes.some.thingElse).toBe('2');
    });

    it('has a parse method doesn\' t find a data-wl-id, it will create one', function() {
      element.removeAttribute('data-wl-id');
      var view = new ViewType(null, {
        el: element
      });
      var data = view.data;
      // var returnedData = view.parse(element);

      // expect(data).toBe(returnedData);
      expect(data.attributes.id).toBeDefined();
      expect(data.attributes.type).toBe(type);
      expect(data.attributes.version).toBe(defaults.version);
      expect(data.attributes.tag).toBe('A');
      expect(data.attributes.classes).toContain('someClass');
      expect(data.attributes.linkTo).toBe('url');
      expect(data.attributes.linkTarget).toBe('_self');
      expect(data.attributes.x).toBe('50px');
      expect(data.attributes.y).toBe('25px');
      expect(data.attributes.hidden).toBe(true);
      expect(data.attributes.zIndex).toBe('2');
      expect(data.attributes.width).toBe('100px');
      expect(data.attributes.height).toBe('200px');
    });

    it('the parse method will add the dataObjects to the repository if it isn\'t already added', function() {
      debugger;
      var view = new ViewType(null, {
        el: element
      });
      var data = repository.get(view.data.attributes.id, view.data.attributes.version);

      expect(data).toEqual(view.data);
    });

    it('the parse method will not invoke a render when the dataObjects are updated', function() {
      var data = new DataType({});
      var view = new ViewType(data);
      var isFired = false;
      view.render = function() {
        isFired = true;
      };

      var returnedData = view.parse(element);
      expect(isFired).toBeFalsy();
    });
  });
};
