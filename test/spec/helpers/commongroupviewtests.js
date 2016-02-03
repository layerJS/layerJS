var repository = require('../../../src/framework/repository.js');
var defaults = require('../../../src/framework/defaults.js');

var commonGroupViewTests = function(initFunction) {
  describe('(base tests for views that have children)', function() {

    var ViewType, data;

    beforeEach(function() {
      var init = initFunction();
      ViewType = init.ViewType;
      repository.clear();
      repository.importJSON(init.data, defaults.version);
      data = repository.get(init.parentId, defaults.version);
    });

    afterEach(function() {
      repository.clear();
    });

    it('will add it\'s children DOM element to its own DOM element', function() {
      var view = new ViewType(data);
      var element = view.elWrapper;
      checkChildrenDataNodes(data, element);
      checkChildrenViews(view);
    });

    var checkChildrenDataNodes = function(dataObj, element) {
      expect(element.childNodes.length).toBe(dataObj.attributes.children.length);

      for (var i = 0; i < element.childNodes.length; i++) {
        var childNode = element.childNodes[i];
        var childObj = repository.get(parseInt(childNode.id), defaults.version);
        expect(data.attributes.children).toContain(childObj.attributes.id);
        expect(childNode._wlView).toBeDefined();
        expect(childNode._wlView.data).toBe(childObj);

        checkChildrenDataNodes(childObj, childNode);
      }
    };

    var checkChildrenViews = function(view) {
      expect(view.elWrapper.childNodes.length).toBe(view.data.attributes.children.length);

      for (var i = 0; i < view.elWrapper.childNodes.length; i++) {
        var childNode = view.elWrapper.childNodes[i];
        var childView = childNode._wlView;
        expect(childView.parent).toBe(view);

        checkChildrenViews(childView);
      }
    };
  });
};

module.exports = commonGroupViewTests;
