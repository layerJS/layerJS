'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');

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
   * Note: by default this only renders width and height, but no position or transforms.
   * Width and height are needed for getting the frame transform data
   *
   * @param {FrameView} frame - the frame to be positioned
   * @returns {void}
   */
  renderFramePosition: function(frame) {
    var attr = frame.data.attributes,
      diff = frame.data.changedAttributes || frame.data.attributes,
      el = frame.outerEl;
    var css = {};
    // just do width & height for now; FIXME
    if ('width' in diff && attr.width !== undefined) {
      css.width = attr.width;
    }
    if ('height' in diff && attr.height !== undefined) {
      css.height = attr.height;
    }
    Kern._extend(el.style, css);
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

    if (frame === null || (document.body.contains(frame.outerEl) && window.getComputedStyle(frame.outerEl).display !== 'none')) {
      finished.resolve();
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
  prepareTransition: function() {
  },
  // jshint ignore:end
  parametricTransition: function() {
    throw "parametricTransition() not implemented";
  },
  getScrollTransformer: function(){
    return undefined;
  }
});

module.exports = LayerLayout;
