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
        var targetElement = this.layer.outerEl;
        var commonParent = $.commonParent(frame.innerEl, targetElement);

        var calculateMatrix = function(element, stopElement) {
          var parentMatrix = new TMat();

          if (element !== stopElement) {
            parentMatrix = calculateMatrix(element.parentNode, stopElement);
          }

          var elementMatrix = $.getScaleAndRotationMatrix(element);
          var result = parentMatrix.prod(elementMatrix);
          return result;
        };

        var frameMatrix = calculateMatrix(frame.outerEl, commonParent);
        frameMatrix = $.applyTopLeftOnMatrix(frame.outerEl, frameMatrix);

        var targetLayerMatrix = calculateMatrix(targetElement, commonParent);
        targetLayerMatrix = $.applyTopLeftOnMatrix(targetElement, targetLayerMatrix);

        var resultMatrix = targetLayerMatrix.invert().prod(frameMatrix);
        var that = this;

        frame.parent.innerEl.removeChild(frame.outerEl);
        if (frame.parent.currentFrame === frame) {
          frame.parent.currentFrame = null;
        }

        $.postAnimationFrame(function() {
          that.layer.innerEl.appendChild(frame.outerEl);
          frame.transformData = undefined;

          frame.applyStyles({
            transform: resultMatrix.transform_nomatrix(),
          }, {}, {});

          // wait until rendered;
          $.postAnimationFrame(function() {
            finished.resolve();
          });
        });

      } else {
        // FIXME: add to dom if not in dom
        // set display block
        frame.outerEl.style.display = 'block';
        // frame should not be visible; opacity is the best as "visibility" can be reverted by nested elements
        frame.outerEl.style.opacity = '0';

        // wait until rendered;
        $.postAnimationFrame(function() {
          finished.resolve();
        });
      }


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
