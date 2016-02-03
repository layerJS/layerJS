var repository = require('../../../src/framework/repository.js');
var defaults = require('../../../src/framework/defaults.js');
var jsdom = require('jsdom').jsdom;

var commonGroupViewTests = function (initFunction) {
    describe('(base tests for views that have children)', function () {

        var document, window,$;
        var ViewType, data;
      
        beforeEach(function () {
            var init = initFunction();
            ViewType = init.ViewType;
            repository.clear();
            repository.importJSON(init.data, defaults.version);
            data = repository.get(init.parentId, defaults.version);
            
            document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
            window = global.window = document.defaultView;
            $ = document.querySelector;
        });

        afterEach(function () {
            repository.clear();
        });

        it('will add it\'s children DOM element to its own DOM element', function () {
            var view = new ViewType(data);
            var element = view.el;
            checkChildrenNodes(data, element);
        });

        var checkChildrenNodes = function (dataObj, element) {

            if (dataObj.attributes.children) {
                expect(element.children.length).toBe(dataObj.attributes.children.length);

                for (var i = 0; i < element.children.length; i++) {
                    var childNode = element.children[i];
                    var childObj = repository.get(parseInt(childNode.id), defaults.version);
                    
                    expect(dataObj.attributes.children).toContain(childObj.attributes.id);
                    checkChildrenNodes(childObj, childNode);
                }
            }
            else
            {                
                 expect(element.innerHTML).toBe(dataObj.attributes.content ? dataObj.attributes.content : '' );
            }
        };

    });
};

module.exports = commonGroupViewTests;
