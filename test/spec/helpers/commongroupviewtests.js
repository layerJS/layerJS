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

      var element = view.el;
      checkChildrenDataNodes(data, element);
      checkChildrenViews(view);
    });

    var checkChildrenDataNodes = function(dataObj, element) {

      if (dataObj.attributes.children) {
        expect(element.childNodes.length).toBe(dataObj.attributes.children.length);

        for (var i = 0; i < element.childNodes.length; i++) {
          var childNode = element.childNodes[i];
          var childObj = repository.get(childNode.id, defaults.version);
          expect(dataObj.attributes.children).toContain(childObj.attributes.id);
          expect(childNode._wlView).toBeDefined();
          expect(childNode._wlView.data).toBe(childObj);

          checkChildrenDataNodes(childObj, childNode);
        }
      } else {
        // When the data doesn't have any children, the innerHTML should be empty or equal at the content if data type is text
        expect(element.innerHTML).toBe(dataObj.attributes.content ? dataObj.attributes.content : '');
      }
    };

    var checkChildrenViews = function(view) {
      if (view.data.attributes.children) {
        expect(view.el.childNodes.length).toBe(view.data.attributes.children.length);

        for (var i = 0; i < view.el.childNodes.length; i++) {
          var childNode = view.el.childNodes[i];
          var childView = childNode._wlView;
          expect(childView.parent).toBe(view);

          checkChildrenViews(childView);
        }
      } else {
        //When the data doesn't have children, it's childnodes should have a view attached.
        for (var index = 0; index < view.el.childNodes.length; index++) {
          var element = view.el.childNodes[index];
          expect(element._wlView).toBeUndefined();
        }
      }
    };

    it('the Parse method will return a data object based on a DOM element with a children collection ', function() {
      var type = data.attributes.type;

      setHtml("<html><body><div id='test' data-wl-type='" + type + "'><div data-wl-type='text' data-wl-id='1'></div><div><div data-wl-type='group' data-wl-id='2'></div><div data-wl-type='group' data-wl-id='3'></div></div><div data-wl-type='text' data-wl-id='4'></div></div><div/></body></html>");

      var element = document.getElementById('test');
      var dataObject = ViewType.Parse(element);

      expect(dataObject).toBeDefined();
      expect(dataObject.children).toEqual([1, 4, 2, 3]);
    });
  });
};

module.exports = commonGroupViewTests;
