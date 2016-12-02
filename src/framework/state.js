'use strict';

var Kern = require('../kern/Kern.js');
var layerJS = require('./layerjs.js');
var $ = require('./domhelpers.js');
var defaults = require('./defaults.js');

/**
 *  class that will contain the state off all the stages, layers, frames
 *
 * @extends Kern.Model
 */
var State = Kern.Model.extend({
  constructor: function() {
    this.viewTypes = ['stage', 'layer', 'frame'];
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
    for (var name in parent.children) {
      if (parent.children[name].view && parent.children[name].view.type() === type) {
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
      } else if (-1 !== this.viewTypes.indexOf(childView.type())) {
        var type = childView.type();

        var name = (childView.name() || child.id || type + '[' + this._getNextChildIndexByType(parent, type) + ']');
        parent.children[name] = {
          view: childView,
          children: {}
        };

        if (childView.type() === 'layer') {
          childView.on('transitionStarted', this._transitionToEvent(parent.children[name]));
        }

        if (parent.view && parent.view.type() === 'layer' && parent.children[name].view.type() === 'frame') {
          parent.children[name].active = parent.view.currentFrame === parent.children[name].view;
        }
        this._buildTree(parent.children[name], childView.innerEl.children);
      }
    }

    if (parent.view && parent.view.type() === 'layer' && parent.view.currentFrame === null) {
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
  updateChildren: function(view, addedNodes, removedNodes) {

    var viewState = view.outerEl._state;

    if (undefined === viewState) {
      return;
    }

    if (undefined !== addedNodes && addedNodes.length > 0) {
      for (let i = 0; i < addedNodes.length; i++) {
        if (addedNodes[i]._ljView && -1 !== this.viewTypes.indexOf(addedNodes[i]._ljView.type())) {
          this.buildParent(addedNodes[i], view.document);
        }
      }
    }
    if (undefined !== removedNodes && removedNodes.length > 0) {
      for (var i = 0; i < removedNodes.length; i++) {
        if (removedNodes[i]._ljView && -1 !== this.viewTypes.indexOf(removedNodes[i]._ljView.type())) {
          for (var childName in viewState.children) {
            if (viewState.children.hasOwnProperty(childName)) {
              if (viewState.children[childName].view === removedNodes[i]._ljView) {
                delete viewState.children[childName];
              }
            }
          }
        }
      }
    }
  },
  buildParent: function(parentNode, ownerDocument) {
    var currentState = {};

    if (null === parentNode) {
      // if we are at the root of the DOM return the state structure of the document
      currentState = this._getTree(ownerDocument);
    } else if (parentNode._state) {
      // is the state of the element already present?
      return parentNode._state;
    } else {

      // get the state of the parent layer,stage or frame node
      currentState = this.buildParent(parentNode.parentElement, ownerDocument);
      // layer helper divs are special; ignore them; ignoring means to pass the parent state as current state
      if (parentNode._ljView && !$.hasAttributeLJ(parentNode, 'helper')) {
        var view = parentNode._ljView;
        // ignore everything except frames, layers and stages; ignoring means to pass the parent state as current state
        if (view && -1 !== (this.viewTypes.indexOf(view.type()))) {
          var type = view.type();

          var id;
          try {
            id = view.id();
          } catch (e) {
            id = undefined;
          }

          var name = (view.name() || id || type + '[' + this._getNextChildIndexByType(currentState, type) + ']');
          // layerJS object already added
          if (!currentState.children.hasOwnProperty(name)) {
            // create the actual current state datastructure as a child of the parent's state structure
            currentState.children[name] = {
              view: view,
              children: {},
              parent: currentState
            };
            if (view.type() === 'frame') {
              currentState.children[name].active = false;
              // check if the current frame is the active frame
              if (currentState.view && currentState.view.currentFrame) {
                currentState.children[name].active = currentState.view.currentFrame.name() === view.name();
              }
            } else if (view.type() === 'layer') {
              // listen to state changes; state changes when transitions happen in layers
              view.on('transitionStarted', this._transitionToEvent(currentState.children[name]));
            }
          }

          // currentState did contain the parent's state; assing actual current state
          currentState = currentState.children[name];

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
  exportState: function(ownerDocument) {
    return this._getPath(this._getTree(ownerDocument), '', true);
  },
  /**
   * Will return all paths to frames
   * @param {object} the document who's state will be exported
   * @returns {array} An array of strings pointing to alle frames within the document
   */
  exportStructure: function(ownerDocument) {
    return this._getPath(this._getTree(ownerDocument), '', false);
  },
  /**
   * Will register a View with the state
   * @param {object} a layerJSView
   */
  registerView: function(view) {
    if (view.type() === 'frame') {
      var frameViews = this._getRegisteredFrameViews(view.document);
      frameViews.push(view);
    }

    // only add to state structure if the frame is really shown (attached to DOM)
    if (view.document.body.contains(view.outerEl)) {
      this.buildParent(view.outerEl, view.document);
      view.innerEl._state = view.outerEl._state;
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
      if (currentState.children.hasOwnProperty(pathArray[i])) {
        currentState = currentState.children[pathArray[i]];
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
   * Will transition to a state
   *
   * @param {array} states States to transition to
   * @param {object} transition Transition properties
   */
  transitionTo: function(states, transition) {
    var pathsToTransition = this._determineTransitionPaths(states);    
    for (let i = 0; i < pathsToTransition.length; i++) {
      var path = pathsToTransition[i];
      var layerView = this.getViewForPath(path.replace(/\.[^\.]*$/, ""));
      var frameName = path.substr(path.lastIndexOf(".") + 1);
      layerView.transitionTo(frameName, transition);
    }
  },
  /**
   * Will show the state without a transition
   *
   * @param {array} states States to transition to
   */
  showState: function(states) {
    var pathsToTransition = this._determineTransitionPaths(states);
    for (let i = 0; i < pathsToTransition.length; i++) {
      var path = pathsToTransition[i];
      var layerView = this.getViewForPath(path.replace(/\.[^\.]*$/, ""));
      var frameName = path.substr(path.lastIndexOf(".") + 1);
      layerView.showFrame(frameName);
    }
  },
  /**
   * Will build the up the path to the frames
   *
   * @param {object} Represents the parent
   * @param {string} A string that represents to path of the parent object
   * @param {boolean} When true, only the path of active frames are returned
   * @return {array} An array of strings to the frames
   */
  getPathForView: function(view) {
    var paths = [];

    if (view.outerEl._state) {
      var state = view.outerEl._state;
      var parentState = state.parent;

      while (parentState) {
        let found = false;
        for (var childName in parentState.children) {
          if (parentState.children[childName] === state) {
            paths.push(childName);
            state = parentState;
            parentState = state.parent;
            found = true;
          }
        }
        if (!found)
          parentState = undefined;
      }
    }

    return paths.reverse().join('.');
  },

  /**
   * Will return the paths where needs to be transitioned to based on specific states
   *
   * @param {array} states States to transition to
   * @return {array} pathsToTransition
   */
  _determineTransitionPaths: function(states) {
    var length = states.length;
    var currentStructure = this.exportStructure();
    var pathsToTransition = [];

    for (let i = 0; i < length; i++) {
      for (let x = 0; x < currentStructure.length; x++) {
        var tempStructure = currentStructure[x].replace(new RegExp(this._escapeRegex(states[i]) + '$'), '');
        if ('' === tempStructure || (currentStructure[x] !== tempStructure && tempStructure.endsWith('.'))) {
          if (-1 === pathsToTransition.indexOf(currentStructure[x])) {
            pathsToTransition.push(currentStructure[x]);
          }
        } else if (this._pathHasSpecialFrameName(states[i])) {
          var tempState = states[i].substr(0, states[i].lastIndexOf("."));
          var tempStructureNoFrame = currentStructure[x].substr(0, currentStructure[x].lastIndexOf("."));
          tempStructure = tempStructureNoFrame.replace(new RegExp(this._escapeRegex(tempState) + '$'), '');
          if ('' === tempStructure || (currentStructure[x] !== tempStructure && tempStructure.endsWith('.'))) {
            var specialFrameName = states[i].substr(states[i].lastIndexOf(".") + 1);
            if (-1 === pathsToTransition.indexOf(tempStructureNoFrame + '.' + specialFrameName)) {
              pathsToTransition.push(tempStructureNoFrame + '.' + specialFrameName);
            }
          }
        }
      }
    }

    return pathsToTransition;
  },

  /**
   * Will check if a path has special frame name
   *
   * @param {string} path
   * @return {boolean}
   */
  _pathHasSpecialFrameName: function(path) {
    var hasSpecialFrameName = false;
    for (var specialFrame in defaults.specialFrames) {
      if (defaults.specialFrames.hasOwnProperty(specialFrame)) {
        if (path.endsWith(defaults.specialFrames[specialFrame])) {
          hasSpecialFrameName = true;
          break;
        }
      }
    }

    return hasSpecialFrameName;
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
    var hasActiveChildren = false;
    for (var element in parent.children) {
      if (parent.children.hasOwnProperty(element) && parent.children[element].hasOwnProperty('view')) {
        var path = rootpath;
        if (parent.children[element].view.type() === 'frame' && (parent.children[element].active || !active)) {
          if (parent.children[element].active) {
            hasActiveChildren = true;
          }
          path = rootpath + element;
          paths.push(path);
          paths = paths.concat(this._getPath(parent.children[element], path + '.', active));
        } else if (parent.children[element].view.type() !== 'frame') {
          path += element;
          paths = paths.concat(this._getPath(parent.children[element], path + '.', active));
        }
      }
    }

    if (parent.view && parent.view.type() === 'layer' && !hasActiveChildren) {
      paths.push(rootpath + defaults.specialFrames.none);
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
      for (var name in layerState.children) {
        // set new active frame; set all other frames to inactive
        if (layerState.children.hasOwnProperty(name) && layerState.children[name].hasOwnProperty('active')) {
          layerState.children[name].active = layerState.children[name].view.name() === frameName;
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
    var key = '_ljStateTree';

    if (!doc.hasOwnProperty(key)) {
      doc[key] = {
        children: {}
      };
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
    var key = '_ljStateFrameView';

    if (!doc.hasOwnProperty(key)) {
      doc[key] = [];
    }

    return doc[key];
  },
  /**
   * Will escape the brackets in the regex string
   *
   * @param {string} regex string to escape
   * @returns {string} an escaped regex string
   */
  _escapeRegex: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

});

module.exports = layerJS.state = new State();
