'use strict';
var Kern = require('../../kern/Kern.js');

/**
 * this is the base class for all LayerLayouts
 *
 * @param {LayerView} layer - the layer which is layed out by the layouter
 * @returns {Type} Description
 */
var LayerLayout = Kern.EventManager.extend({
  /**
   * initalize LayerLayout with a layer
   *
   * @param {Type} Name - Description
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
  /**
   * return current frame of associated layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  getCurrentFrame: function() {
    return this.layer.currentFrame;
  },
  /**
   * return staget associated with associated layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  getStage: function() {
    return this.layer.stage;
  }
});

module.exports = LayerLayout;
