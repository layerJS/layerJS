'use strict';
var WL = require('./wl.js');
var Kern = require('../kern/Kern.js');

var LayoutManager = Kern.EventManager.extend({
  /**
   * create a LayoutManager
   * the LayoutManager is used to provide Layer layout function for specified layout types.
   * It can be dynamically extended by further layout types.
   *
   * @param {Object} map - a mapping from type to Function
   * @returns {This}
   */
  constructor: function(map) {
    Kern.EventManager.call(this);
    this.map = map || {}; // maps ObjData types to View constructors
  },
  /**
   * register a new layout function
   *
   * @param {string} type - the layout type as given in the layer data model
   * @param {LayerLayout} fn - the layout engine
   * @returns {Type} Description
   */
  registerType: function(type, layouter) {
    this.map[type] = layouter;
  },
  /**
   * return the layout function for a given layout type
   *
   * @param {string} type - the layout type
   * @returns {LayerLayout} the layout engine
   */
  get: function(type){
    return this.map[type];
  }
});
// initialialize layoutManager with default plugins
WL.layoutManager = new LayoutManager();
// this module does not return the class but a singleton instance, the layoutManager for the project.
module.exports = WL.layoutManager;
