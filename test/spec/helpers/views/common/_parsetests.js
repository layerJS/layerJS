var WL = require('../../../../../src/framework/wl.js');
var defaults = require('../../../../../src/framework/defaults.js');

module.exports = function(options) {

  var ViewType = options.ViewType;
  var DataType = ViewType.Model;
  var type = options.type;

  describe(options.viewTypeName + ": _parse =>", function() {

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

    it('has a parse methode that will update the current dataObject and will return it', function() {
      var data = new DataType({});
      var view = new ViewType(data);
      var returnedData = view.parse(element);

      expect(data).toBe(returnedData);

      expect(data.attributes.id).toBe('1');
      expect(data.attributes.type).toBe(type);
      expect(data.attributes.version).toBe(defaults.version);
      expect(data.attributes.tag).toBe('A');
      expect(data.attributes.classes).toBe(' someClass');
      expect(data.attributes.linkTo).toBe('url');
      expect(data.attributes.linkTarget).toBe('_self');
      expect(data.attributes.x).toBe('50px');
      expect(data.attributes.y).toBe('25px');
      expect(data.attributes.hidden).toBe(true);
      expect(data.attributes.zIndex).toBe('2');
      expect(data.attributes.width).toBe('100px');
      expect(data.attributes.height).toBe('200px');
    });

    it('when the view doesn\'t have a  dataObject set,the parse methode will create a new dataObject return it', function() {
      var data = new DataType({});
      var view = new ViewType(data);
      view.data = null;

      var returnedData = view.parse(element);
      expect(view.data).toBe(null);

      expect(returnedData.attributes.id).toBe('1');
      expect(returnedData.attributes.type).toBe(type);
      expect(returnedData.attributes.version).toBe(defaults.version);
      expect(returnedData.attributes.tag).toBe('A');
      expect(returnedData.attributes.classes).toBe(' someClass');
      expect(returnedData.attributes.linkTo).toBe('url');
      expect(returnedData.attributes.linkTarget).toBe('_self');
      expect(returnedData.attributes.x).toBe('50px');
      expect(returnedData.attributes.y).toBe('25px');
      expect(returnedData.attributes.hidden).toBe(true);
      expect(returnedData.attributes.zIndex).toBe('2');
      expect(returnedData.attributes.width).toBe('100px');
      expect(returnedData.attributes.height).toBe('200px');
    });

    it('the Parse method will return a data object with all the data-wl-* attributes from a DOM element', function() {
      element = document.createElement('div');
      element.setAttribute('data-wl-someThing', '1');
      element.setAttribute('data-wl-someThingElse', '2');
      element.setAttribute('data-custom', '3');

      var view = new ViewType(new DataType({}));
      var data = view.parse(element);

      expect(data.attributes.something).toBe('1');
      expect(data.attributes.somethingelse).toBe('2');
      expect(data.attributes.custom).toBeUndefined();
    });

    it('has a parse methode doesn\' t find a data-wl-id, it will create one', function() {
      var data = new DataType({});
      var view = new ViewType(data);
      element.removeAttribute('data-wl-id');

      var returnedData = view.parse(element);

      expect(data).toBe(returnedData);
      expect(data.attributes.id).toBeDefined();
      expect(data.attributes.type).toBe(type);
      expect(data.attributes.version).toBe(defaults.version);
      expect(data.attributes.tag).toBe('A');
      expect(data.attributes.classes).toBe(' someClass');
      expect(data.attributes.linkTo).toBe('url');
      expect(data.attributes.linkTarget).toBe('_self');
      expect(data.attributes.x).toBe('50px');
      expect(data.attributes.y).toBe('25px');
      expect(data.attributes.hidden).toBe(true);
      expect(data.attributes.zIndex).toBe('2');
      expect(data.attributes.width).toBe('100px');
      expect(data.attributes.height).toBe('200px');
    });

    it('the parse methode will add the dataObjects to the repository if it isn\'t already added', function() {
      var view = new ViewType(new DataType({}));

      var returnedData = view.parse(element);
      var data = repository.get(returnedData.attributes.id, returnedData.attributes.version);

      expect(data).toEqual(returnedData);
    });
  });
};
