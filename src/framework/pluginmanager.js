'use strict';
var WL = require('./wl.js');
var Kern = require('../kern/Kern.js');

var PluginManager = Kern.EventManager.extend({
  /**
   * create a PluginManager
   * the PluginManager is used to create View objects from ObjData objects.
   * It contains a list of constructors for the corresponding data types.
   * It can be dynamically extended by further data types.
   *
   * @param {Object} map - an object mapping Obj types to {view:constructor, model: contructor} data sets
   * @returns {This}
   */
  constructor: function(map) {
    Kern.EventManager.call(this);
    this.map = map || {}; // maps ObjData types to View constructors
  },
  /**
   * create a view based on the type in the Obj's model
   *
   * @param {NodeData} model - the model from which the view should be created
   * @param {Object} [options] - create options
   * @param {HTMLElement} options.el - the element of the view
   * @returns {NodeView} the view object of type NodeView or a sub class
   */
  createView: function(model, options) {
    // return existing view if the provided element already has one
    if (options && options.el && options.el._wlView) {
      return options.el._wlView;
    }
    if (typeof model === 'string') {
      var type = model;
      if (this.map.hasOwnProperty(type)) {
        return new(this.map[type].view)(null, options);
      }
      throw "no constructor found for objects of type '" + type + "'";
    } else if (model.attributes.type && this.map.hasOwnProperty(model.attributes.type)) {
      return new(this.map[model.attributes.type].view)(model, options);
    }
    throw "no constructor found for objects of type '" + model.attributes.type + "'";
  },
  /**
   * create a data model based on a json object (and it's type property)
   *
   * @param {Object} data - JSON data of data model
   * @param {Object} options - options passed to the model constructor
   * @returns {ObjData} the new data model
   */
  createModel: function(data, options) {
    if (data.type && this.map.hasOwnProperty(data.type)) {
      return new(this.map[data.type].model)(data, options);
    }
    throw "no constructor found for ObjData of type '" + data.type + "'";
  },
  /**
   * register a view class for a ObjData type
   *
   * @param {string} type - the name of the type
   * @param {function} constructor - the constructor of the view class of this type
   * @returns {This}
   */
  registerType: function(type, constructor) {
    this.map[type] = {
      view: constructor,
      model: constructor.Model,
      identify: constructor.identify
    };
  },
  /**
   * Will iterate over the registered ViewTypes and call it's identify
   * method to find the ViewType of a DOM element
   *
   * @param {object} element - A DOM element
   * @returns {string} the found ViewType
   */
  identify: function(element) {
      var type;
      var found = false;

      for (type in this.map) {
        if (this.map.hasOwnProperty(type) && this.map[type].identify(element)) {
          found = true;
          break;
        }
      }

      if (!found) {
        throw "no ViewType found for element '" + element + "'";
      }

      return type;
    }
    /**
     * make sure a certain plugin is available, continue with callback
     *
     * @param {string} type - the type that shoud be present
     * @param {Function} callback - call when plugins is there
     * @returns {Type} Description
     */
    // requireType: function(type, callback) {
    //   if (!this.map[type]) throw "type " + type + " unkonw in pluginmanager. Have no means to load it"; //FIXME at some point this should dynamically load plugins
    //   return callback(); // FIXME should be refactored with promises or ES 6 yield
    // }
});
// initialialize pluginManager with default plugins
WL.pluginManager = new PluginManager({});
// this module does not return the class but a singleton instance, the pluginmanager for the project.
module.exports = WL.pluginManager;
