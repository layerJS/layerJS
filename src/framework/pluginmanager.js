var WL = require('./wl.js');
var Kern = require('../kern/Kern.js');
var CobjView = require('./cobjview.js');
//var CGroupView = require('./cgroupview.js');

var PluginManager = Kern.EventManager.extend({
  /**
   * create a PluginManager
   * the PluginManager is used to create View objects from cobjdata objects.
   * It contains a list of constructors for the corresponding data types.
   * It can be dynamically extended by further data types.
   *
   * @param {Object} map - an object mapping cobj types to view constructors
   * @returns {This}
   */
  constructor: function(map) {
    this.map = map ||  {}; // maps cobjdata types to View constructors
  },
  /**
   * create a view based on the type in the cobj's model
   *
   * @param {cobjdata} model - the model from which the view should be created
   * @param {Object} [options] - create options
   * @param {HTMLElement} options.el - the element of the view
   * @returns {cobjview} the view object of type CobjView or a sub class
   */
  createView: function(model, options) {
    // return existing view if the provided element already has one
    if (options && options.el && options.el._wlView && options.el._wlView instanceof CobjView) return options.el._wlView;
    if (model.attributes.type && this.map.hasOwnProperty(model.attributes.type)) return new(this.map[model.attributes.type])(model, options);
    throw "no constructor found for cobjects of type '" + model.attributes.type + "'";
  },
  /**
   * register a view class for a cobject type
   *
   * @param {string} type - the name of the type
   * @param {function} constructor - the constructor of the view class of this type
   * @returns {This}
   */
  registerType: function(type, constructor) {
    this.map[type] = constructor;
  }
});
// initialialize pluginManager with default plugins
WL.pluginManager = new PluginManager({
  node: CobjView,
//  group: CGroupView
});
// this module does not return the class but a singleton instance, the pluginmanager for the project.
module.exports = WL.pluginManager;
