'use strict';

var Kern = require('../kern/Kern.js');
var layerJS = require('./layerjs.js');
var $ = require('./domhelpers.js');

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
          childView.on('transitionStarted', this._transitionToEvent(parent[name]));
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
   *
   * @param {object} Represents the options that con be passed into
   */
  buildTree: function(options) {
    options = options || {
      document: document
    };

    if (undefined === options.document) {
      options.document = document;
    }

    this._buildTree(this._getTree(options.document), options.document.children);
  },
  buildParent: function(parentNode, ownerDocument) {
    var currentState = {};

    if (null === parentNode) {
      currentState = this._getTree(ownerDocument);
    } else if (parentNode._state) {
      return parentNode._state;
    } else {

      currentState = this.buildParent(parentNode.parentElement, ownerDocument);

      if (parentNode._ljView && !$.hasAttributeLJ(parentNode,'helper')) {
        var view = parentNode._ljView;

        if (view && (view.data.attributes.type === 'frame' || view.data.attributes.type === 'layer' || view.data.attributes.type === 'stage')) {
          var type = view.data.attributes.type;
          var name = (view.data.attributes.name || parentNode.id || type + '[' + this._getNextChildIndexByType(currentState, type) + ']');
          // layerJS object already added
          if (!currentState.hasOwnProperty(name)) {
            currentState[name] = {
              view: view
            };
            if (view.data.attributes.type === 'frame') {
              currentState[name].active = false;
              if (currentState.view && currentState.view.currentFrame) {
                currentState[name].active = currentState.view.currentFrame.data.attributes.name === view.data.attributes.name;
              }
            } else if (view.data.attributes.type === 'layer') {
              view.on('transitionStarted', this._transitionToEvent(currentState[name]));
            }
          }

          currentState = currentState[name];

          parentNode._state = currentState;
        }
      }
    }

    return currentState;
  },
  /**
   * Will build a tree structure to represent the layerjs objects in the current document
   * @param {object} Represents the options that con be passed into
   */
  buildTree2: function(options) {
    options = options || {
      document: document
    };

    if (undefined === options.document) {
      options.document = document;
    }

    var frameViews = this._getRegisteredFrameViews(options.document);

    for (var i = 0; i < frameViews.length; i++) {
      if (frameViews[i].document.body.contains(frameViews[i].innerEl)) {
        this.buildParent(frameViews[i].innerEl, options.document);
      }
    }
  },
  /**
   * Will return all paths to active frames
   * @param {object} the document who's state will be exported
   * @returns {array} An array of strings pointing to active frames within the document
   */
  exportStateAsArray: function(ownerDocument) {
    return this._getPath(this._getTree(ownerDocument), '', true);
  },
  /**
   * Will return all paths to frames
   * @param {object} the document who's state will be exported
   * @returns {array} An array of strings pointing to alle frames within the document
   */
  exportStructureAsArray: function(ownerDocument) {
    return this._getPath(this._getTree(ownerDocument), '', false);
  },
  /**
   * Will return a delimited string that represents the path to all active frames within the document
   * @param {object} the document who's state will be exported
   * @returns {string} A delimited string pointing to active frames within the document
   */
  exportState: function(ownerDocument) {
    return this.exportStateAsArray(ownerDocument).join(';');
  },
  /**
   * Will return a delimited string that represents the path to all frames within the document
   * @param {object} the document who's state will be exported
   * @returns {string} A delimited string pointing to frames within the document
   */
  exportStructure: function(ownerDocument) {
    return this.exportStructureAsArray(ownerDocument).join(';');
  },
  /**
   * Will register a FrameView with the state
   * @param {object} a FrameView
   */
  registerFrameView: function(frameView) {
    var frameViews = this._getRegisteredFrameViews(frameView.document);

    frameViews.push(frameView);

    if (frameView.document.body.contains(frameView.innerEl)) {
      this.buildParent(frameView.innerEl, frameView.document);
    }
  },
  /**
   * Will return the state linked to a path
   * @param {Object} a state
   */
  getStateForPath: function(path, ownerDocument) {
    ownerDocument = ownerDocument || document;
    var tree = this._getTree(ownerDocument);

    var pathArray = path.split('.');
    var currentState = tree;

    for (var i = 0; i < pathArray.length; i++) {
      if (currentState.hasOwnProperty(pathArray[i])) {
        currentState = currentState[pathArray[i]];
      } else {
        currentState = undefined;
        break;
      }
    }

    return currentState;
  },
  /**
   * Will return the view linked to a path
   * @param {Object} a layerJS View
   */
  getViewForPath: function(path, ownerDocument) {
    var state = this.getStateForPath(path, ownerDocument);

    return state !== undefined ? state.view : undefined;
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
  },
  /**
   * Will return the generated state tree for a document
   *
   * @param {object} a document object
   * @returns {object} a state tree
   */
  _getTree: function(ownerDocument) {
    var doc = ownerDocument || document;
    var key = '__ljStateTree';

    if (!doc.hasOwnProperty(key)) {
      doc[key] = {};
    }

    return doc[key];
  },
  /**
   * Will return all registered frameViews in a document
   *
   * @param {object} a document object
   * @returns {array} an array of frameViews
   */
  _getRegisteredFrameViews: function(ownerDocument) {
    var doc = ownerDocument || document;
    var key = '__ljStateFrameView';

    if (!doc.hasOwnProperty(key)) {
      doc[key] = [];
    }

    return doc[key];
  }
});

module.exports = layerJS.state = new State();
