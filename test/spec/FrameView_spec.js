var LayerView = require('../../src/framework/layerview.js');
var FrameView = require('../../src/framework/frameview.js');
var state = require('../../src/framework/state.js');
var utilities = require("./helpers/utilities.js");

var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js')

describe("FrameView", function() {

  ViewsCommonViewTests('simple_frame_1.js', function() {
    return {
      ViewType: FrameView,
      htmlElement: require('./htmlelements/simple_frame_1.js')
    }
  });

  ViewsCommonIdentifyTests('div data-lj-type="frame"', FrameView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'frame');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', FrameView, function() {
    return document.createElement('div');
  }, false);

  describe('event', function() {

    describe('sizeChanged', function() {
      it('will remove cached transformData and will trigger a renderRequired event', function(done) {
        var element = utilities.appendChildHTML(require('./htmlelements/simple_layer_1.js'));
        var layerView = new LayerView({
          el: element
        });
        var frameView = layerView.getChildViews()[0];

        frameView.transformData = {};

        frameView.on('renderRequired', function() {
          expect(frameView.transformData).toBe(undefined);
          done();
        });

        frameView.trigger('sizeChanged');
      });

    });

    describe('attributesChanged', function() {
      function renderRequiredTriggered(action, done) {
        var element = utilities.appendChildHTML(require('./htmlelements/simple_frame_1.js'));
        var frameView = new FrameView({
          el: element
        });

        frameView.transformData = {};
        frameView.on('renderRequired', function(name) {
          expect(name).toBe(frameView.name());
          expect(frameView.transformData).toBe(undefined);
          done();
        });
        action(element);
      }

      it('fit-to will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('data-lj-fit-to', 'width');
        }, done);
      });

      it('elastic-left will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('data-lj-elastic-left', '10');
        }, done);
      });

      it('elastic-right will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('data-lj-elastic-right', '10');
        }, done);
      });

      it('elastic-top will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('data-lj-elastic-top', '10');
        }, done);
      });

      it('elastic-bottom will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('data-lj-elastic-bottom', '10');
        }, done);
      });

      it('width will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-width', '10');
        }, done);
      });

      it('height will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-height', '10');
        }, done);
      });

      it('rotation will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-rotation', '10');
        }, done);
      });

      it('x will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-x', '10');
        }, done);
      });

      it('y will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-y', '10');
        }, done);
      });

      it('scale-x will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-scale-x', '10');
        }, done);
      });

      it('scale-y will remove the cached transformData and will trigger a renderRequired event', function(done) {
        renderRequiredTriggered(function(element) {
          element.setAttribute('lj-scale-y', '10');
        }, done);
      });
    });


    describe('renderRequired', function() {
      it('will call the renderChildPosition and showFrame method of it\'s layer', function(done) {
        var layerView = new LayerView({
          el: utilities.appendChildHTML(require('./htmlelements/simple_layer_1.js'))
        });

        spyOn(layerView, '_renderChildPosition');
        spyOn(layerView, 'showFrame');

        var frameView = layerView.innerEl.children[0]._ljView;

        frameView.on('renderRequired', function() {
          expect(layerView._renderChildPosition).toHaveBeenCalled();
          expect(layerView.showFrame).toHaveBeenCalled();

          done();
        });

        frameView.trigger('renderRequired', frameView.name());
      });

    });
  });

  describe('dimensions', function() {
    var sourceElement;

    beforeEach(function() {
      sourceElement = utilities.appendChildHTML(require('./htmlelements/simple_frame_1.js'));
    });

    it('will add the margin to the height', function() {
      var view = new FrameView({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.height = '100px';

      var height = view.height();
      element.style.marginTop = '50px';
      element.style.marginBottom = '20px';

      expect(view.height()).toBe(height + 70);
    });

    it('will add the margin to the width', function() {
      var view = new FrameView({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.width = '100px';

      var width = view.width();
      element.style.marginLeft = '50px';
      element.style.marginRight = '20px';

      expect(view.width()).toBe(width + 70);
    });

    it('will subtract the margin when setting the height', function() {
      var view = new FrameView({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.marginTop = '50px';
      element.style.marginBottom = '20px';
      view.setHeight(170);
      expect(element.style.height).toBe('100px');
    });

    it('will subtract the margin when setting the width', function() {
      var view = new FrameView({
        el: sourceElement
      });
      var element = view.outerEl;
      element.style.marginLeft = '50px';
      element.style.marginRight = '20px';
      view.setWidth(170);
      expect(element.style.width).toBe('100px');
    });

  });
})
