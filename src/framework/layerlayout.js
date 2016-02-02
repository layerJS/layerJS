var WL = require('./wl.js');
var Kern = require('../kern/Kern.js');

/**
 * this is the base class for all LayerLayouts
 *
 * @param {LayerView} layer - the layer which is layed out by the layouter
 * @returns {Type} Description
 */
var LayerLayout = Kern.EventManager.extend({
  constructor: function(layer){
    if (!layer) throw "provide a layer";
    this.layer=layer;
  }
});

module.exports = LayerLayout;
