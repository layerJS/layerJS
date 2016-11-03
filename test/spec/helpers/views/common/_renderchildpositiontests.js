var defaults = require('../../../../../src/framework/defaults.js');

var Common_renderChildPositionTests = function(scenario, initFunction) {
  describe('(base test for all objects that implement _renderChildPosition) ' + scenario, function() {

    var ViewType, data, repository;

    beforeEach(function() {
      repository = require('../../../../../src/framework/repository.js');
      var init = initFunction();
      ViewType = init.ViewType;
      repository.importJSON(JSON.parse(JSON.stringify(init.data)), defaults.version);
      data = repository.get(init.parentId, defaults.version);
    });

    it('will implement a _renderChildPosition method', function() {
      var view = new ViewType(data);
      expect(view._renderChildPosition).toBeDefined();
    });

    it('will put the width in the width property of the style of its children DOM element will be set when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        var width = (childData.attributes.width !== undefined && childData.attributes.width != '') ? childData.attributes.width : '';

        expect(childElement.style.width).toBe(width);
      }
    });

    it('will put the height in the height property of the style of its children DOM element will be set when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        var height = (childData.attributes.height !== undefined && childData.attributes.height != '') ? childData.attributes.height : '';

        expect(childElement.style.height).toBe(height);
      }
    });
  })
};
module.exports = Common_renderChildPositionTests;
