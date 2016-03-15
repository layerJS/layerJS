var repository = require('../../../src/framework/repository.js');
var defaults = require('../../../src/framework/defaults.js');
var jsdom = require('jsdom').jsdom;

var commonGroupViewTests = function(scenario, initFunction) {
  describe('(base tests for views that have children) ' + scenario, function() {

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

    function setHtml(html) {
      document = global.document =
        jsdom(html);
      window = global.window = document.defaultView;
      $ = document.querySelector;
    }

    afterEach(function() {
      repository.clear();
    });

    it('will add it\'s children DOM element to its own DOM element when the render method is called', function() {
      var view = new ViewType(data);

      checkChildrenDataNodes(data, view);
      checkChildrenViews(view);
    });

    var checkChildrenDataNodes = function(dataObj, view) {

      if (dataObj.attributes.children) {
        expect(view.innerEl.childNodes.length).toBe(dataObj.attributes.children.length);

        for (var i = 0; i < view.innerEl.childNodes.length; i++) {
          var childNode = view.innerEl.childNodes[i];
          expect(childNode._wlView).toBeDefined();
          var childNodeId = childNode._wlView.data.attributes.id;
          expect(childNode.id).toBe('wl-obj-' + childNodeId);
          var childObj = repository.get(childNodeId, defaults.version);
          expect(dataObj.attributes.children).toContain(childObj.attributes.id);
          expect(childNode._wlView.data).toBe(childObj);

          checkChildrenDataNodes(childObj, childNode._wlView);
        }
      } else {
        // When the data doesn't have any children, the innerHTML should be empty or equal at the content if data type is text
        expect(view.innerEl.innerHTML).toBe(dataObj.attributes.content ? dataObj.attributes.content : '');
      }
    };

    var checkChildrenViews = function(view) {
      if (view.data.attributes.children) {
        expect(view.innerEl.childNodes.length).toBe(view.data.attributes.children.length);

        for (var i = 0; i < view.innerEl.childNodes.length; i++) {
          var childNode = view.innerEl.childNodes[i];
          var childView = childNode._wlView;
          expect(childView.parent).toBe(view);

          checkChildrenViews(childView);
        }
      } else {
        //When the data doesn't have children, it's childnodes should have a view attached.
        for (var index = 0; index < view.innerEl.childNodes.length; index++) {
          var element = view.innerEl.childNodes[index];
          expect(element._wlView).toBeUndefined();
        }
      }
    };
  });
};

module.exports = commonGroupViewTests;
