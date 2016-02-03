var repository = require('../../../src/framework/repository.js');
var defaults = require('../../../src/framework/defaults.js');
var jsdom = require('jsdom').jsdom;

var commonGroupViewTests = function (initFunction) {
    describe('(base tests for views that have children)', function () {

        var document, window, $;
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

        beforeEach(function () {
            var init = initFunction();
            ViewType = init.ViewType;
            repository.clear();
            repository.importJSON(init.data, defaults.version);
            data = repository.get(init.parentId, defaults.version);
        });

        afterEach(function () {
            repository.clear();
        });

        it('will add it\'s children DOM element to its own DOM element', function () {
            var view = new ViewType(data);
            var element = view.elWrapper;
            checkChildrenDataNodes(data, element);
            checkChildrenViews(view);
        });

        var checkChildrenDataNodes = function (dataObj, element) {

            if (dataObj.attributes.children) {
                expect(element.childNodes.length).toBe(dataObj.attributes.children.length);

                for (var i = 0; i < element.childNodes.length; i++) {
                    var childNode = element.childNodes[i];
                    var childObj = repository.get(parseInt(childNode.id), defaults.version);
                    expect(dataObj.attributes.children).toContain(childObj.attributes.id);
                    expect(childNode._wlView).toBeDefined();
                    expect(childNode._wlView.data).toBe(childObj);

                    checkChildrenDataNodes(childObj, childNode);
                }
            }
            else {
                 // When the data doesn't have any children, the innerHTML should be empty or equal at the content if data type is text
                expect(element.innerHTML).toBe(dataObj.attributes.content ? dataObj.attributes.content : '');
            }
        };

        var checkChildrenViews = function (view) {
            if (view.data.attributes.children) {
                expect(view.elWrapper.childNodes.length).toBe(view.data.attributes.children.length);

                for (var i = 0; i < view.elWrapper.childNodes.length; i++) {
                    var childNode = view.elWrapper.childNodes[i];
                    var childView = childNode._wlView;
                    expect(childView.parent).toBe(view);

                    checkChildrenViews(childView);
                }
            }            
        };
    });
};

module.exports = commonGroupViewTests;

