var repository = require('../../../src/framework/repository.js');
var defaults = require('../../../src/framework/defaults.js');

var commonGroupViewTests = function(initFunction){
  describe('(base tests for views that have children)', function(){

    var ViewType, data;

    beforeEach(function(){
      var init = initFunction();
      ViewType = init.ViewType;

      repository.versions[defaults.version] = init.map;
      data = init.map.get(init.parentId);
    });

    afterEach(function(){
      repository.versions[defaults.version] = {};
    });

    it('will add it\'s children DOM element to its own DOM element', function(){
        var view = new ViewType(data);
        var element = view.el;

        checkChildrenNodes(data, element);
    });

    var checkChildrenNodes = function(dataObj, element){
      expect(element.childNodes.length).toBe(dataObj.attributes.children.length);

      for(var i = 0; i < element.childNodes.length; i++){
        var childNode = element.childNodes[i];
        var childObj = repository.get(parseInt(childNode.id), defaults.version);
        expect(data.attributes.children).toContain(childObj.attributes.id);

        checkChildrenNodes(childObj, childNode);
      }
    };

  });
};

module.exports = commonGroupViewTests;
