var nodeView = function() {
  return require('../../src/framework/nodeview.js')
};
var ViewsNodeViewTests = require('./helpers/views/node/viewtests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe('NodeView', function() {

  ViewsCommonParseTests(function() {
    return {
      ViewType: nodeView()
    };
  });

  ViewsNodeViewTests('simple_nodedata.js', nodeView, require('./datasets/simple_nodedata.js')[0]);

  describe(': parse =>', function() {

    var NodeView;
    beforeEach(function() {
      NodeView = nodeView();
    });

    it('the Parse method will add an content property to the data object', function() {
      var element = document.createTextNode('some content');

      var nodeView = new NodeView(undefined, {
        el: element
      });

      expect(nodeView.data.attributes.content).toBe('some content');
    });

    it('the Parse method will add an nodeType property to the data object', function() {
      var element = document.createTextNode('some content');

      var nodeView = new NodeView(undefined, {
        el: element
      });

      expect(nodeView.data.attributes.nodeType).toBe(element.nodeType);
    });
  });

  ViewsCommonIdentifyTests('textNode', nodeView, function() {
    return document.createTextNode('')
  }, true);
  ViewsCommonIdentifyTests('commentNode', nodeView, function() {
    return document.createComment('')
  }, true);

  ViewsCommonIdentifyTests('div', nodeView, function() {
    return document.createElement('div');
  }, false);

  /*
    it('listens for changes on its DOM element when _observerCounter is 0', function() {
      var view = new NodeView(new NodeView.Model(require('./datasets/simple_nodedata.js')[0]));
      var element = view.outerEl;
      view.render();

      expect(view._observer).toBeDefined();
      expect(view._observerCounter).toBe(0);

      element.data = 'some thing';

      expect(view.data.attributes.content).toBe('some thing');
    });

    it('doesn\'t listen for changes on its DOM element when _observerCounter is greater then 0', function() {
      var view = new NodeView(new NodeView.Model(require('./datasets/simple_nodedata.js')[0]));
      var element = view.outerEl;

      view.render();
      view.disableObserver();

      expect(view._observer).toBeDefined();
      expect(view._observerCounter).toBe(1);

      element.data = 'some thing';

      expect(view.data.attributes.content).not.toBe('some thing');
    });
  */
  /*
    it('will remove the linked DOM element from is parent when destroy is called', function() {
      var parent = document.createElement('div');
      var child = document.createTextNode('');
      parent.appendChild(child);

      expect(parent.children.length).toBe(1);

      var view = new NodeView(undefined, {
        el: child
      });
      view.destroy();

      expect(parent.childNodes.length).toBe(0);
      expect(child.parent).toBeUndefined();
    });
  */
  /*
    it('can be initialized with an existing element, forcing re-rendering', function() {
      var element = document.createTextNode('some thing');
      var data = new NodeView.Model(require('./datasets/simple_nodedata.js')[0]);
      var view = new NodeView(undefined, {
        el: element,
        forceRender: true
      });
      expect(view.outerEl).toBe(element);
      expect(view.outerEl.data).toBe(data.attributes.content);
    });

    it('can be initialized with an existing element, without re-rendering', function() {
      var element = document.createTextNode('some thing');
      var data = new NodeView.Model(require('./datasets/simple_nodedata.js')[0]);
      var view = new NodeView(data, {
        el: element
      });
      expect(view.outerEl).toBe(element);
      expect(view.outerEl.data).not.toBe(data.attributes.content);
    });
  */
});
