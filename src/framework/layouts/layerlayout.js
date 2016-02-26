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
   * get the width of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the width
   */
  getStageWidth: function() {
    return this.layer.stage.getWidth();
  },
  /**
   * get the height of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the height
   */
  getStageHeight: function() {
    return this.layer.stage.getHeight();
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
  getStage: function(){
    return this.layer.stage;
  }
});

module.exports = LayerLayout;
