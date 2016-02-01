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
      debugger;
      var view = new ViewType(data);
      var element = view.el;
      checkChildrenNodes(data, element);
    });

    var checkChildrenNodes = function(dataObj, element) {
      expect(element.childNodes.length).toBe(dataObj.attributes.children.length);

      for (var i = 0; i < element.childNodes.length; i++) {
        var childNode = element.childNodes[i];
        var childObj = repository.get(parseInt(childNode.id), defaults.version);
        expect(data.attributes.children).toContain(childObj.attributes.id);

        checkChildrenNodes(childObj, childNode);
      }
    };

  });
};

module.exports = commonGroupViewTests;
