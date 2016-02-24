var repository = require('../../../src/framework/repository.js');
var defaults = require('../../../src/framework/defaults.js');
var jsdom = require('jsdom').jsdom;

var GroupView_renderChildPositionTests = function(scenario, initFunction) {
  describe('(base test for _renderChildPosition for objects the inherit from GroupView) ' + scenario, function() {

    var document, window, $;
    var ViewType, data;

    beforeEach(function() {
      var init = initFunction();
      ViewType = init.ViewType;
      repository.clear();
      repository.importJSON(init.data, defaults.version);
      data = repository.get(init.parentId, defaults.version);

      document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
      window = global.window = document.defaultView;
      $ = document.querySelector;
    });

    it('will put the x property of its children as the left property of the style of its children DOM element when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.left).toBe(childData.attributes.x + 'px');
      }
    });

    it('will put the y property of its children as the top property of the style of its children DOM element when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.top).toBe(data.attributes.y + 'px');
      }
    });

    it('when the y property of its children is undefined the position property will be absolute of the style of its children DOM element when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        childData.attributes.y = undefined;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.position).toBe('absolute');
      }
    });

    it('when the x property of its children is undefined the position property will be absolute of the style of its children DOM element when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        childData.attributes.x = undefined;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.position).toBe('absolute');
      }
    });

    it('when the x and y property of its children is undefined the position property will be static of the style of its children DOM element when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        childData.attributes.x = undefined;
        childData.attributes.y = undefined;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.position).toBe('static');
      }
    });

    it('will put a scaleX, scaleY in the transform property of the style of its children DOM element will be set when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.transform).toContain('scale(' + data.attributes.scaleX + ',' + data.attributes.scaleY + ')');
      }
    });

    it('will put the rotation in the transform property of the style of its children DOM element will be set when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        if (childData.attributes.rotation)
          expect(childElement.style.transform).toContain('rotate(' + Math.round(childData.attributes.rotation) + 'deg)');
        else
          expect(childElement.style.transform).not.toContain('rotate');
      }
    });

    it('will put the zIndex in the zIndex property of the style of its children DOM element will be set when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        expect(childElement.style.zIndex).toBe(childData.attributes.zIndex !== undefined ? childData.attributes.zIndex.toString() : '');
      }
    });

    it('will set the display property in the style of its children DOM element when _renderChildPosition is called', function() {
      var view = new ViewType(data);

      var childrenIds = data.attributes.children;
      var childrenLength = childrenIds.length;

      for (var i = 0; i < childrenLength; i++) {
        var childView = view.getChildView(childrenIds[i]);
        var childData = childView.data;
        view._renderChildPosition(childView);
        var childElement = childView.outerEl;

        var displaySetting = data.attributes.hidden ? 'none' : '';

        expect(childElement.style.display).toBe(displaySetting);
      }
    });
  })
};
module.exports = GroupView_renderChildPositionTests;
