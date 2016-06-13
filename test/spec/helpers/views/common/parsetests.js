var WL = require('../../../../../src/framework/wl.js');
var utilities = require("../../utilities.js");

module.exports = function(options) {

  var ViewType = options.ViewType;
  var DataType = ViewType.Model;

  describe(": parse =>", function() {

    var element;
    var repository = WL.repository;
    var type, defaultProperties;

    beforeEach(function() {
      defaultProperties = JSON.parse(JSON.stringify(ViewType.defaultProperties));
      type = defaultProperties.type;

      if (defaultProperties.type !== "node") {
        element = document.createElement(defaultProperties.tag);
      } else {
        // text node
        element = document.createTextNode('');
      }
    });

    it('will contain a Parse method to read the data from a DOM element', function() {
      var data = new DataType(ViewType);
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
  });
};
