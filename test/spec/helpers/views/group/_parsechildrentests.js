module.exports = function(options) {

  var utilities = require('../../utilities');

  var ViewType = options.ViewType;
  var DataType = ViewType.Model;
  var expectedChildren = options.expectedChildren;
  var defaultProperties;

  describe(": _parseChildren =>", function() {

    beforeEach(function() {
      defaultProperties = JSON.parse(JSON.stringify(ViewType.defaultProperties));
    });

    it('will contain a _parseChildren method to read the parse it\'s children from it\'s DOM element', function() {
      var view = new ViewType(new DataType(defaultProperties), {});
      expect(view._parseChildren).toBeDefined();
    });

    it('will be able the extract it\'s know children from it\'s DOM element when the parseFull option in false', function() {

      var element = document.createElement('div');
      element.innerHTML = options.HTML;
      element = element.children[0];

      var view = new ViewType(undefined, {
        el: element
      });

      var data = view.data;
      expect(data.attributes.children).toEqual(expectedChildren);

      var length = expectedChildren.length;

      for (var i = 0; i < length; i++) {
        expect(WL.repository.contains(expectedChildren[i], data.attributes.version)).toBeTruthy();
      }
    });

    it('will be able the extract it\'s unknow children from it\'s DOM element when the parseFull option in true', function() {

      var element = document.createElement('div');
      element.innerHTML = options.HTML;
      element = element.children[0];
      element.appendChild(document.createElement('div'));

      var view = new ViewType(undefined, {
        el: element,
        parseFull: true
      });

      expect(view.data.attributes.children.length).toEqual(view.innerEl.childNodes.length);

      var length = view.innerEl.childNodes.length;

      for (var i = 0; i < length; i++) {
        var childView = view.innerEl.childNodes[i]._wlView;
        expect(WL.repository.contains(childView.data.attributes.id, view.data.attributes.version)).toBeTruthy();
        expect(view.data.attributes.children).toContain(childView.data.attributes.id);
      }
    });


    function canParseUnkownElements(html, groupId, unkownId, nodeType) {
      utilities.setHtml(html);
      var groupEl = document.getElementById(groupId);
      var groupView = new ViewType(null, {
        el: groupEl,
        parseFull: true
      });

      var testEl = document.getElementById(unkownId);
      var testView = testEl._wlView;

      expect(testView).toBeDefined();
      expect(testView.data.attributes.type).toBe(nodeType);
      expect(WL.repository.get(testView.data.attributes.id, testView.data.attributes.version)).toBeDefined();
    }

    it('can detect a group as nodeType', function() {
      canParseUnkownElements('<div id="group" data-wl-type="' + ViewType.defaultProperties.type + '" data-wl-version="1"><div id="test"><div/></div></div>', 'group', 'test', 'group');
    });

    it('can detect an image as nodeType', function() {
      canParseUnkownElements('<div id="group" data-wl-type="' + ViewType.defaultProperties.type + '" data-wl-version="1"><img id="test"/></div>', 'group', 'test', 'element');
    });

    it('can detect a text as nodeType', function() {
      canParseUnkownElements('<div id="group" data-wl-type="' + ViewType.defaultProperties.type + '" data-wl-version="1"><div id="test">some text</div></div>', 'group', 'test', 'group');
    });

    it('can detect a node as nodeType', function() {
      canParseUnkownElements('<div id="group" data-wl-type="' + ViewType.defaultProperties.type + '" data-wl-version="1"><div id="test"/></div>', 'group', 'test', 'group');
    });

  });
};
