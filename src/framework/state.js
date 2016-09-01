'use strict';

var Kern = require('../kern/Kern.js');

/**
 *  class that will contain the state off all the stages, layers, frames
 *
 * @extends Kern.Model
 */
var State = Kern.Model.extend({
  constructor: function() {
    this.tree = {};
  },
  /**
   * Will return the next index of a layerjs object within it's parent
   *
   * @param {object} Represents the parent
   * @param {string} A layerjs type
   * @returns {integer} The index next index for that type
   */
  _getNextChildIndexByType: function(parent, type) {
    var index = -1;
    for (var name in parent) {
      if (parent[name].view && parent[name].view.data.attributes.type === type) {
        ++index;
      }
    }

    return index + 1;
  },
  /**
   * Will add layerjs objects to it's parent structure state
   *
   * @param {object} Represents the parent
   * @param {array} The dom children of the parent
   */
  _buildTree: function(parent, children) {
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.nodeType !== 1) {
        continue;
      }

      var childView = child._ljView;

      if (undefined === childView) {
        this._buildTree(parent, child.children);
      } else if (childView.data.attributes.type === 'stage' || childView.data.attributes.type === 'layer' || childView.data.attributes.type === 'frame') {
        var type = childView.data.attributes.type;

        var name = (childView.data.attributes.name || child.id || type + '[' + this._getNextChildIndexByType(parent, type) + ']');
        parent[name] = {
          view: childView
        };

        if (childView.data.attributes.type === 'layer') {
          childView.on('transitionTo', this._transitionToEvent(parent[name]));
        }

        if (parent.view && parent.view.data.attributes.type === 'layer' && parent[name].view.data.attributes.type === 'frame') {
          parent[name].active = parent.view.currentFrame === parent[name].view;
        }
        this._buildTree(parent[name], childView.innerEl.children);
      }
    }

    if (parent.view && parent.view.data.attributes.type === 'layer' && parent.view.currentFrame === null) {
      parent[0].active = true;
    }

  },
  /**
   * Will build a tree structure to represent the layerjs objects in the current document
   */
  buildTree: function() {
    this.tree = {};
    this._buildTree(this.tree, document.children);
  },
  /**
   * Will return all paths to active frames
   * @returns {array} An array of strings pointing to active frames within the document
   */
  exportStateAsArray: function() {
    return this._getPath(this.tree, '', true);
  },
  /**
   * Will return all paths to frames
   * @returns {array} An array of strings pointing to alle frames within the document
   */
  exportStructureAsArray: function() {
    return this._getPath(this.tree, '', false);
  },
  /**
   * Will return a delimited string that represents the path to all active frames within the document
   * @returns {string} A delimited string pointing to active frames within the document
   */
  exportState: function() {
    return this.exportStateAsArray().join(';');
  },
  /**
   * Will return a delimited string that represents the path to all frames within the document
   * @returns {string} A delimited string pointing to frames within the document
   */
  exportStructure: function() {
    return this.exportStructureAsArray().join(';');
  },
  /**
   * Will build the up the path to the frames
   *
   * @param {object} Represents the parent
   * @param {string} A string that represents to path of the parent object
   * @param {boolean} When true, only the path of active frames are returned
   * @return {array} An array of strings to the frames
   */
  _getPath: function(parent, rootpath, active) {
    var paths = [];
    for (var element in parent) {
      if (parent.hasOwnProperty(element) && parent[element].hasOwnProperty('view')) {
        var path = rootpath;
        if (parent[element].view.data.attributes.type === 'frame' && (parent[element].active || !active)) {
          path = rootpath + element;
          paths.push(path);
          paths = paths.concat(this._getPath(parent[element], path + '.', active));
        } else if (parent[element].view.data.attributes.type !== 'frame') {
          path += element;
          paths = paths.concat(this._getPath(parent[element], path + '.', active));
        }
      }
    }

    return paths;
  },
  /**
   * Will return the handler for a transitionTo event
   *
   * @param {object} representation of the state of a layer
   * @returns {function} function that will be called when transitionFinished event is invoked
   */
  _transitionToEvent: function(layerState) {
    return function(frameName) {
      for (var name in layerState) {
        if (layerState.hasOwnProperty(name) && layerState[name].hasOwnProperty('active')) {
          layerState[name].active = layerState[name].view.data.attributes.name === frameName;
        }
      }
    };
  }
});

module.exports = new State();
