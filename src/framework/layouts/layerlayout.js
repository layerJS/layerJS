'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var TMat = require('../tmat.js');

/**
 * this is the base class for all LayerLayouts
 *
 */
var LayerLayout = Kern.EventManager.extend({
  /**
   * initalize LayerLayout with a layer
   *
   * @param {LayerView} layer - the layer to which this layout belongs
   * @returns {Type} Description
   */
  constructor: function(layer) {
    Kern.EventManager.call(this);
    if (!layer) throw "provide a layer";
    this.layer = layer;
  },
  /**
   * this functions puts a frame at its default position
   *
   * @param {FrameView} frame - the frame to be positioned
   * @returns {void}
   */
  renderFramePosition: function(frame) {
    // we need to initialize positions and dimensions, if they are defined through attributes
    frame.x();
    frame.y();
    frame.width();
    frame.height();
  },
  /**
   * make sure frame is rendered (i.e. has display: block)
   * Later: make sure frame is loaded and added to document
   * FIXME: should that go into layout?
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  loadFrame: function(frame) {
    var finished = new Kern.Promise();
    var computedStyle = (null !== frame && frame.document.defaultView && frame.document.defaultView.getComputedStyle) || function(el) {
      return el.style;
    };
    if (frame === null || (frame.document.body.contains(frame.outerEl) && computedStyle(frame.outerEl).display !== 'none' && frame.parent === this.layer)) {
      finished.resolve();
    } else {

      // frame not in the layer
      if (frame.parent !== this.layer) {
        var targetElement = this.layer.currentFrame && null !== this.layer.currentFrame ? this.layer.currentFrame.innerEl : this.layer.outerEl;
        var commonParent = $.commonParent(frame.innerEl, targetElement);

        var calculateMatrix = function(element, stopElement){
          var parentMatrix = new TMat();

          if (element.parentNode !== stopElement){
            parentMatrix = calculateMatrix(element.parentNode, stopElement);
          }

          var elementMatrix = $.getMatrix(element);
          var result = parentMatrix.prod(elementMatrix);
          return result;
        };


        var frameMatrix = calculateMatrix(frame.outerEl, commonParent);

        /*var parent = frame.outerEl.parentNode;
        var parentMatrix;
        while (parent !== commonParent) {
          parentMatrix = $.getMatrix(parent);
          frameMatrix = parentMatrix.prod(frameMatrix);
          parent = parent.parentNode;
        }*/


        var resultMatrix = frameMatrix;
      /*  var coordinatesOldLayer = frame.parent.outerEl.getBoundingClientRect();
        var coordinatesNewLayer = this.layer.outerEl.getBoundingClientRect();
        var difference = TMat.Ttrans(coordinatesOldLayer.left - coordinatesNewLayer.left, coordinatesOldLayer.top - coordinatesNewLayer.top);
        difference = difference.prod(TMat.Tscalexy(frameMatrix.a, frameMatrix.d));
        console.log(difference);*/

        //  resultMatrix = frameMatrix.prod(difference);

        if (commonParent !== targetElement) {
          var parent = targetElement === this.layer.outerEl ? targetElement : targetElement.parentNode /* is inside a frame*/;
          var targetLayerMatrix = calculateMatrix(parent, commonParent);

          /*
          var targetLayerMatrix = TMat.Tscalexy(1, 1);
          parent = targetElement === this.layer.outerEl ? targetElement : targetElement.parentNode;
          while (parent !== commonParent) {
            parentMatrix = $.getMatrix(parent);
            targetLayerMatrix = parentMatrix.prod(targetLayerMatrix);
            parent = parent.parentNode;
          }*/

          resultMatrix = targetLayerMatrix.invert().prod(frameMatrix);
        }

        //  resultMatrix = difference;

        this.layer.innerEl.appendChild(frame.outerEl);

        frame.applyStyles({
          transform: resultMatrix.transform_nomatrix(),
        }, {}, {});
      } else {
        // FIXME: add to dom if not in dom
        // set display block
        frame.outerEl.style.display = 'block';
        // frame should not be visible; opacity is the best as "visibility" can be reverted by nested elements
        frame.outerEl.style.opacity = '0';
      }

      // wait until rendered;
      $.postAnimationFrame(function() {
        finished.resolve();
      });
    }
    return finished;
  },
  /**
   * get the width of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the width
   */
  getStageWidth: function() {
    return this.layer.stage.width();
  },
  /**
   * get the height of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the height
   */
  getStageHeight: function() {
    return this.layer.stage.height();
  },
  showFrame: function() {
    throw "showFrame() not implemented";
  },
  transitionTo: function() {
    throw "transitionTo() not implemented";
  },
  // jshint ignore:start
  prepareTransition: function() {},
  // jshint ignore:end
  parametricTransition: function() {
    throw "parametricTransition() not implemented";
  },
  getScrollTransformer: function() {
    return undefined;
  }
});

module.exports = LayerLayout;
