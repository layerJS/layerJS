
var utilities = require("../../utilities.js");

module.exports = function(initFunction) {

  describe("(elementview tests) parse =>", function() {

    var element;
    var layerJS;
    var repository;
    var type,defaultProperties,ViewType,DataType;

    beforeEach(function() {
      var options = initFunction();
      ViewType = options.ViewType;
      DataType = ViewType.Model;
      defaultProperties = JSON.parse(JSON.stringify(ViewType.defaultProperties));
      type = defaultProperties.type;

      element = document.createElement('a');
      element.setAttribute('data-lj-id', 1);
      element.setAttribute('data-lj-type', type);
      element.setAttribute('data-lj-version', defaultProperties.version);
      element.style.display = 'none';
      element.style.zIndex = 2;
      element.style.width = '100px';
      element.style.height = '200px';
      element.style.left = '50px';
      element.style.top = '25px';
      element.className = 'object-default object-' + type + ' someClass';
      element.setAttribute('href', 'url');
      element.setAttribute('target', '_self');

      layerJS = require('../../../../../src/framework/layerjs.js');
      repository = layerJS.repository;
    });

    it('has a parse method that will update the current dataObject and will return it', function() {
      var data = new DataType(ViewType);
      var view = new ViewType(data);
      view.parse(element);

      expect(data.attributes.id).toBe('1');
      expect(data.attributes.type).toBe(type);
      expect(data.attributes.version).toBe(defaultProperties.version);
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

    it('the Parse method will return a data object with all the data-lj-* attributes (camelcased) from a DOM element', function() {
      element = document.createElement('div');
      element.setAttribute('data-lj-some-thing', '1');
      element.setAttribute('data-lj-some-thing-else', '2');
      element.setAttribute('data-custom', '3');

      var view = new ViewType(null, {
        el: element
      });

      expect(view.data.attributes.someThing).toBe('1');
      expect(view.data.attributes.someThingElse).toBe('2');
      expect(view.data.attributes.custom).toBeUndefined();
    });

    it('the Parse method will create a object with properties in the dataModel is the DOM element contains an attribute of formate data-lj-*.* ', function() {
      element = document.createElement('div');
      element.setAttribute('data-lj-some.thing', '1');
      element.setAttribute('data-lj-some.thing-else', '2');

      var view = new ViewType(null, {
        el: element
      });

      expect(view.data.attributes.some.thing).toBe('1');
      expect(view.data.attributes.some.thingElse).toBe('2');
    });

    it('if the parse method doesn\' t find a data-lj-id, it will create one', function() {
      element.removeAttribute('data-lj-id');
      var view = new ViewType(null, {
        el: element
      });
      var data = view.data;
      // var returnedData = view.parse(element);

      // expect(data).toBe(returnedData);
      expect(data.attributes.id).toBeDefined();
      expect(data.attributes.type).toBe(type);
      expect(data.attributes.version).toBe(defaultProperties.version);
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
      var view = new ViewType(null, {
        el: element
      });
      var data = repository.get(view.data.attributes.id, view.data.attributes.version);

      expect(data).toEqual(view.data);
    });

    it('the parse method will not invoke a render when the dataObjects are updated', function() {
      var data = new DataType(ViewType);
      var view = new ViewType(data);
      var isFired = false;
      view.render = function() {
        isFired = true;
      };

      var returnedData = view.parse(element);
      expect(isFired).toBeFalsy();
    });

    it('the parse method will store non data-lj-* attributes of a DOM element in the htmlAttributes property with camelcased properties', function() {
      element = document.createElement('div');
      element.setAttribute('name', '1');
      element.setAttribute('data-ng', '2');
      element.setAttribute('custom', '3');
      element.setAttribute('data-lj-thing', '4');

      var view = new ViewType(null, {
        el: element
      });

      expect(view.data.attributes.htmlAttributes).toBeDefined();
      expect(view.data.attributes.htmlAttributes.name).toBe('1');
      expect(view.data.attributes.htmlAttributes.dataNg).toBe('2');
      expect(view.data.attributes.htmlAttributes.custom).toBe('3');
      expect(view.data.attributes.htmlAttributes.thing).toBeUndefined();
    });

    it('the Parse method will create a object with properties in the dataModel is the DOM element contains an attribute of formate *.* ', function() {
      element = document.createElement('div');
      element.setAttribute('some.thing', '1');
      element.setAttribute('some.thing-else', '2');

      var view = new ViewType(null, {
        el: element
      });

      expect(view.data.attributes.htmlAttributes.some.thing).toBe('1');
      expect(view.data.attributes.htmlAttributes.some.thingElse).toBe('2');
    });
  });
};
