module.exports = function(options) {

  var WL = require('../../../../../src/framework/wl.js');
  var ViewType = options.ViewType;
  var DataType = ViewType.Model;
  var type = options.type;
  var expectedChildren = options.expectedChildren;


  describe(options.viewTypeName + ": _parseChildren =>", function() {

    it('will contain a _parseChildren method to read the parse it\'s children from it\'s DOM element', function() {
      var data = new DataType({});
      var view = new ViewType(data, {});
      expect(view._parseChildren).toBeDefined();
    });

    it('will be able the extract it\'s children from it\'s DOM element', function() {

      var element = document.createElement('div');
      element.innerHTML = options.HTML;
      element = element.children[0];

      var data = new DataType({});
      var view = new ViewType(data, {
        el: element
      });
            
      view._parseChildren();

      expect(data.attributes.children).toEqual(expectedChildren);

      var length = expectedChildren.length;

      for (var i = 0; i < length; i++) {
        expect(WL.repository.contains(expectedChildren[i], data.attributes.version)).toBeTruthy();
      }
    });

  });
};
