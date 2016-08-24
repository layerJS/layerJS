var utilities = require("./utilities.js");

var commonGroupViewTests = function(scenario, initFunction) {
  describe('(base tests for views that have children) ' + scenario, function() {


    var ViewType, data, repository, defaults;

    beforeEach(function() {
      repository = require('../../../src/framework/repository.js');
      defaults = require('../../../src/framework/defaults.js');

      var init = initFunction();
      ViewType = init.ViewType;
      repository.importJSON(init.data, defaults.version);
      data = repository.get(init.parentId, defaults.version);
    });


    it('will add it\'s children DOM element to its own DOM element when the render method is called', function() {
      var view = new ViewType(data);

      checkChildrenDataNodes(data, view);
      checkChildrenViews(view);
    });

    var checkChildrenDataNodes = function(dataObj, view) {

      if (dataObj.attributes.children) {

        if (view.innerEl.childNodes.length === 1 &&  dataObj.attributes.children.length ===0 ){
          console.log(view.innerEl.outerHTML);
          console.log(dataObj.attributes);
        }
        expect(view.innerEl.childNodes.length).toBe(dataObj.attributes.children.length);

        for (var i = 0; i < view.innerEl.childNodes.length; i++) {
          var childNode = view.innerEl.childNodes[i];
          expect(childNode._ljView).toBeDefined();
          var childNodeId = childNode._ljView.data.attributes.id;
          expect(childNode.id).toBe('wl-obj-' + childNodeId);
          var childObj = repository.get(childNodeId, defaults.version);
          expect(dataObj.attributes.children).toContain(childObj.attributes.id);
          expect(childNode._ljView.data).toBe(childObj);

          checkChildrenDataNodes(childObj, childNode._ljView);
        }
      } else if (dataObj.attributes.type === "node") {
        // When the data doesn't have any children, the innerHTML should be empty or equal at the content if data type is text
        expect(view.innerEl.data).toBe(dataObj.attributes.content ? dataObj.attributes.content : '');
      }
    };

    var checkChildrenViews = function(view) {
      if (view.data.attributes.children) {
        expect(view.innerEl.childNodes.length).toBe(view.data.attributes.children.length);

        for (var i = 0; i < view.innerEl.childNodes.length; i++) {
          var childNode = view.innerEl.childNodes[i];
          var childView = childNode._ljView;
          expect(childView.parent).toBe(view);

          checkChildrenViews(childView);
        }
      } else {
        //When the data doesn't have children, it's childnodes should have a view attached.
        for (var index = 0; index < view.innerEl.childNodes.length; index++) {
          var element = view.innerEl.childNodes[index];
          expect(element._ljView).toBeUndefined();
        }
      }
    };
  });
};

module.exports = commonGroupViewTests;
