module.exports = function(options) {

  var ViewType = options.ViewType;
  var DataType = ViewType.Model;
  var expectedChildren = options.expectedChildren;
  var defaultProperties;

  describe(": _parseChildren =>", function() {

    beforeEach(function() {
      defaultProperties = JSON.parse(JSON.stringify(ViewType.defaultProperties));
    });

    it('will contain a _parseChildren method to read the parse it\'s children from it\'s DOM element', function() {
      var view = new ViewType(new DataType(defaultProperties), {});
      expect(view._parseChildren).toBeDefined();
    });

    it('will be able the extract it\'s children from it\'s DOM element', function() {

      var element = document.createElement('div');
      element.innerHTML = options.HTML;
      element = element.children[0];

      var view = new ViewType(undefined, {
        el: element
      });

      var data = view.data;
      expect(data.attributes.children).toEqual(expectedChildren);

      var length = expectedChildren.length;

      for (var i = 0; i < length; i++) {
        expect(WL.repository.contains(expectedChildren[i], data.attributes.version)).toBeTruthy();
      }
    });

  });
};
