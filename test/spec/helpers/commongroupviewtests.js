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

    it("when a childview it's data changes, the _renderChildPosition should be called", function() {
      if (data.attributes.children.length > 0) {
        var parentView = new ViewType(data);
        expect(parentView._myChildListenerCallback).toBeDefined();

        var childView = parentView.childInfo[data.attributes.children[0]].view;
        expect(childView.parent).toBe(parentView);

        childView.data.set('x', 20);
        expect(childView.el.style.left).toBe('20px');
      }
    });

    it("the order of non-layers objects will be kept correct", function() {
      var version = 'test';

      var dataObjects = [{
        "id": 100,
        "type": data.attributes.type,
        "children": [101, 102],
        "version": version
      }, {
        "id": 101,
        "type": "node",
        "version": version
      }, {
        "id": 102,
        "type": "node",
        "version": version
      }];

      repository.importJSON(dataObjects, version);

      setHtml("<html><head><style id='wl-obj-css'></style></head><body>" +
        "<div id='100' data-wl-id='100' data-wl-type='" + data.attributes.type + "'>" +
        "<div id='element1'></div>" +
        "<div id='101' data-wl-id='101' data-wl-type='text'></div>" +
        "<div id='element2'></div>" +
        "<div id='102' data-wl-id='102' data-wl-type='text'></div>" +
        "<div id='element3'></div>" +
        "</div></body></html>");

      var parentData = repository.get(100, version);
      var parentElement = document.getElementById('100');
      var parentView = new ViewType(parentData, {
        el: parentElement
      });

      expect(parentElement.children[0].id).toBe('element1');
      expect(parentElement.children[1].id).toBe('101');
      expect(parentElement.children[2].id).toBe('element2');
      expect(parentElement.children[3].id).toBe('102');
      expect(parentElement.children[4].id).toBe('element3');

      parentData.set('children', [102, 101]);

      expect(parentElement.children[0].id).toBe('element1');
      expect(parentElement.children[1].id).toBe('102');
      expect(parentElement.children[2].id).toBe('element2');
      expect(parentElement.children[3].id).toBe('101');
      expect(parentElement.children[4].id).toBe('element3');
    });

  });
};

module.exports = commonGroupViewTests;
