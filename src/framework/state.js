'use strict';

var Kern = require('../kern/Kern.js');
var layerJS = require('./layerjs.js');
var $ = require('./domhelpers.js');
/**
 *  class that will contain the state off all the stages, layers, frames
 *
 * @extends Kern.EventManager
 */
var State = Kern.EventManager.extend({
  constructor: function(doc) {
    this.document = doc || document;
    this.document._ljState = this;
    this.viewTypes = ['stage', 'layer', 'frame'];
    this.views = {}; // contains view and path; indexed by id
    this.layers = []; // list of all layers (ids)
    this.paths = {}; // lookup by path (and all path endings) for all ids
    this._transitionGroup = {};

    Kern.EventManager.call(this);
    this.previousState = undefined;
  },
  /**
   * Will register a View with the state
   * @param {object} a layerJSView
   */
  registerView: function(view) {
    // only add to state structure if the frame is really shown (attached to DOM)
    if (view.document.body.contains(view.outerEl)) {
      var id = view.id();
      if (this.views[id]) {
        if (this.views[id].view !== view) throw "state.registerView: duplicate HTML id '" + id + "'";
        return; // already registered;
      }
      var path = this.buildPath(view.outerEl); // get full path of view
      this.views[id] = {
        view: view,
        path: path
      };
      var that = this;
      this.getTrailingPaths(path).forEach(function(tp) { // add paths index for all path endings
        (that.paths[tp] = that.paths[tp] || []).push(id);
      });
      if (view.type() === 'layer') this.layers.push(id);
      view.on('childRemoved', function(child) {
        if ((child.parent && view.id() === child.parent.id()) || undefined === child.parent) { // only unregister if the parent of the child is still (WARN: this assumes, that the parent hasn't been removed yet)
          that.unregisterView(child);
        }
      }, {
        context: this
      });
      view.on('childAdded', function(child) {
        if (that.views[child.id()]) { // need to unregister view, happens with interstage, where the childAdded comes before childRemoved
          that.unregisterView(child);
        }
        that.registerView(child);
      }, {
        context: this
      });
      view.on('transitionStarted', function(frameName, transition) {
        var trigger = true;
        var payload = {};
        // check if state really changed
        if (transition && transition.lastFrameName === frameName && !(transition.hasOwnProperty('groupId') && this._transitionGroup.hasOwnProperty(transition.groupId))) return;
        // when a transitiongroup is defined, only call stateChanged when all layers in group have invoked 'transitionStarted'
        //  console.log(transition);
        if (transition && transition.hasOwnProperty('groupId') && this._transitionGroup.hasOwnProperty(transition.groupId)) {
          //  console.log(this._transitionGroup);
          this._transitionGroup[transition.groupId].length--;
          if (transition.lastFrameName !== frameName) this._transitionGroup[transition.groupId].changed = true; // remember if any of the transitions in this group really changed the state
          trigger = this._transitionGroup[transition.groupId].length === 0 && this._transitionGroup[transition.groupId].changed;
          payload = this._transitionGroup[transition.groupId].payload;
        }
        if (trigger && (!transition || (transition && !transition.isEvent))) {
          // statechanged should not be triggered it the transition is triggered by an event
          // trigger the event and keep a copy of the new state to compare it to next time
          this.trigger("stateChanged", this, payload);
        }
      }, {
        context: this
      });
      view.on('attributesChanged', this._attributesChangedEvent(view), {
        context: this
      });
      view.getChildViews().forEach(function(v) {
        that.registerView(v);
      });
    }
  },
  /**
   * unregisters a view
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  unregisterView: function(view) {
    var i,
      id = view.id(),
      that = this;
    this.getTrailingPaths(this.views[id].path).forEach(function(tp) {
      var i = that.paths[tp].indexOf(id);
      that.paths[tp].splice(i, 1);
      if (that.paths[tp].length === 0) delete that.paths[tp];
    });
    if (view.type() === 'layer') {
      i = this.layers.indexOf(view);
      this.layers.splice(i, 1);
    }
    delete this.views[id]; // remove from views hash
    view.off(undefined, undefined, this);

    view.getChildViews().forEach(function(v) {
      that.unregisterView(v);
    });
  },
  /**
   * Will return all paths to active frames. Will be sorted in DOM order
   * @returns {array} An array than contains the paths of the active frames
   */
  exportState: function() {
    return this._exportState().state;
  },
  /**
   * Will return all paths to active frames. Will be sorted in DOM order. layers at default frame or with noURL will be given in "omittedStates", all relevant active frames are retunred in "state"
   * @returns {object} An object than contains an array of active states and an array of omittedStates.
   */
  exportMinimizedState: function() {
    return this._exportState(true);
  },
  /**
   * Will return all paths to active frames. Will be sorted in DOM order
   * @param {boolean} minimize When true, minimize the returned paths
   * @returns {object} An object than contains an array of active states and an array of omittedStates.
   */
  _exportState: function(minimize) {
    minimize = minimize || false;
    var result = {
      state: [],
      omittedState: []
    };
    var that = this;

    var framePaths = that.exportStructure('frame');

    framePaths.forEach(function(framePath) {

      var notActive = framePath.endsWith('$');
      var path = framePath;
      if (notActive) {
        path = path.substr(0, path.length - 1);
      }

      var frames = that.paths[path];

      if (frames.length > 1)
        throw "state.exportState: multiple frames found for " + framePath;

      var frame = that.views[frames[0]].view;
      var layer = frame.parent;
      if (frame === layer.currentFrame) {
        if ((true === minimize) && (layer.noUrl() || layer.currentFrame.name() === layer.defaultFrame() ||
            (null === layer.defaultFrame() && null === layer.currentFrame.outerEl.previousElementSibling))) {
          result.omittedState.push(framePath);
        } else {
          result.state.push(framePath);
        }
      } else if (notActive && frame.parent !== frame.originalParent) {
        result.state.push(framePath);
      } else if (notActive) {
        result.omittedState.push(framePath);
      }

    });

    this.layers.map(function(layerId) {
      return that.views[layerId].view; // get the a list of the layer dom element
    }).filter(function(layer) {
      return layer.currentFrame === null || layer.currentFrame === undefined;
    }).forEach(function(layer) {
      if (true === minimize && (layer.noUrl() || layer.defaultFrame() === '!none')) {
        result.omittedState.push(that.views[layer.id()].path + ".!none");
      } else {
        result.state.push(that.views[layer.id()].path + ".!none");
      }
    });

    return result;
  },
  /**
   * Will return all paths to frames, layers and stages. Will be sorted in DOM order
   * @param {string} type type of views to return the path of
   * @returns {array} An array of strings pointing to alle frames within the document
   */
  exportStructure: function(type) {
    var that = this;
    var elements = Object.keys(this.views).map(function(key) {
      return that.views[key].view.outerEl;
    }).sort($.comparePosition);

    if (type) {
      elements = elements.filter(function(element) {
        return element._ljView.type() === type;
      });
    }
    return elements.map(function(element) {
      var active = true;
      if (element._ljView.type() === 'frame') {
        var frameView = element._ljView;
        var layerView = frameView.parent;

        active = layerView.currentFrame === frameView;
      }

      return that.views[element._ljView.id()].path + (active ? '' : '$');
    });
  },
  /**
   * Will transition to a state
   *
   * @param {array} states State paths to transition to
   * @param {object} transitions Array of transition records, one per state path, or a single transition record for all paths. Can be undefined in which case a default transition is triggered
   */
  transitionTo: function(states, transitions, payload) {
    this._transitionTo(false, states, transitions, payload);
  },
  /**
   * Will transition to a state without with showframe or transitionTo
   *
   * @param {array} states State paths to transition to
   */
  showState: function(states, transitions, payload) {
    return this._transitionTo(true, states, transitions, payload);
  },
  /**
   * Will transition to a state without with showframe or transitionTo
   *
   * @param {boolean} showframe use showFrame? transitionTo otherwise
   * @param {array} states State paths to transition to
   * @param {object} transitions Array of transition records, one per state path, or a single transition record for all
   * @param {object} payload data object that will be passed on to the stateChanged handler
   */
  _transitionTo: function(showFrame, states, transitions, payload) {
    var that = this;
    transitions = transitions || [];
    payload = payload || {};
    payload.state = states;
    payload.transitions = transitions.map(function(transition) {
      return Kern._extend({}, transition);
    });

    // map the given state (list of (reduced) paths) into a list of fully specified paths (may be more paths than in states list)
    var paths = {}; // path to transition to
    var seenLayers = {}; // for deduplicating paths
    var seenTransition = {};

    var seenPath = function(path) {
      var originalLayer = paths[path].layer.id();
      seenTransition = paths[path].transition;
      delete paths[path];
      delete seenLayers[originalLayer];
    };


    states.map(function(state) {
      return that.resolvePath(state);
    }).forEach(function(layerframes, index) {
      for (var i = 0; i < layerframes.length; i++) {
        var layerframe = layerframes[i];
        var layer = layerframe.layer.id();
        seenTransition = {};
        var transition = Kern._extend(seenTransition, transitions[Math.min(index, transitions.length - 1)] || {});


        if (layerframe.noActivation !== true) {
          if (layerframe.isInterStage && paths.hasOwnProperty(layerframe.originalPath)) {
            seenPath(layerframe.originalPath);
          }

          if (paths.hasOwnProperty(layerframe.path)) {
            seenPath(layerframe.path);
          }

          if (seenLayers.hasOwnProperty(layer)) {
            seenPath(seenLayers[layer]);
          }

          seenLayers[layer] = layerframe.path;
        }
        if (layerframe.noActivation !== true || layerframe.isInterStage) { // only do the transition if its an activating transitions or an non activating transition that actually really leads to a frame moving to a new layer -> reason: the history machanism will do transitions to the full state which will create a lot on "non-sense" interstage transitons (frames should move to layer in which they already are)
          paths[layerframe.path] = { // ignore currently active frames
            layer: layerframe.layer,
            frameName: layerframe.frameName,
            transition: Kern._extend({
              noActivation: layerframe.noActivation
            }, seenTransition, transition)
          };
        }

      }
    });



    var pathRoutes = Object.getOwnPropertyNames(paths);
    // semaphore is necessary to let all transition run in sync
    var semaphore = new Kern.Semaphore(pathRoutes.length);
    // group transitions to fire only one stateChanged event for all transitions triggered in this call
    var groupId = $.uniqueID('group');
    this._transitionGroup[groupId] = {
      length: pathRoutes.length,
      payload: payload
    };

    // execute transition
    for (var i = 0; i < pathRoutes.length; i++) {
      var path = paths[pathRoutes[i]];
      path.transition.semaphore = semaphore;
      path.transition.groupId = groupId;

      if (showFrame) {
        path.layer.showFrame(path.frameName, path.transition); // switch to frame
      } else {
        path.layer.transitionTo(path.frameName, path.transition); // switch to frame
      }
    }
    return transitions.length > 0;
  },
  /**
   * create the path of a particular view
   *
   * @param {HTMLElement} node - the HTML node for which the layerJS path should be build
   * @param {boolean} reCalculate - if true, no lookups will be used
   * @returns {string} the path
   */
  buildPath: function(node, reCalculate) {
    if (!node) return "";

    if (!node._ljView)
      return this.buildPath(node.parentNode);

    var parentView = node._ljView.parent;

    var parentPath = (!reCalculate && parentView) ? this.views[parentView.id()].path : this.buildPath(node.parentNode);

    if (parentPath !== '')
      parentPath += '.';

    var path = parentPath + node._ljView.name();

    return path;
  },
  /**
   * calculate all different endings of a path
   *
   * @param {string} path - the full path
   * @returns {Array} array of path endings
   */
  getTrailingPaths: function(path) {
    var paths = [path];
    while ((path = path.replace(/^[^\.]*\.?/, ''))) {
      paths.push(path);
    }
    return paths;
  },
  /**
   * Resolves the layer that will execute the transition for a given path and the frame name (could be a special name)
   *
   * @param {string} path - a path of the state
   * @param {HTMLElement} context - the HTML context where the name should be resolved (e.g. where the link was located)
   * @returns {Array} Array of layerViews and the frameNames;
   */
  resolvePath: function(path, context) {

    var noActivation = path.endsWith('$');

    if (noActivation) {
      path = path.substr(0, path.length - 1);
    }

    var i, contextpath = context && this.buildPath(context),
      segments = path.split('.'),
      frameName = segments.pop(),
      isSpecial = (frameName[0] === '!'),
      layerpath = segments.join('.'),
      candidates = (isSpecial ? (layerpath ? this.paths[layerpath] : this.layers) : this.paths[path]); // if special frame name, only search for layer

    if (!isSpecial && (!candidates || candidates.length === 0) && layerpath) {
      candidates = this.paths[layerpath];
    }

    if (!candidates || candidates.length === 0) return []; // couldn't find any matchin path; return empty array
    if (candidates.length > 1 && contextpath) { // check whether we can reduce list of candidates be resolving relative to the context path
      var reduced = [];
      while (reduced.length === 0 && contextpath) { // if we don't find any frames in context, move context path one up and try again
        for (i = 0; i < candidates.length; i++) {
          if (this.views[candidates[i]].path.startsWith(contextpath)) reduced.push(candidates[i]);
        }
        contextpath = contextpath.replace(/\.?[^\.]$/, '');
      }
      candidates = (reduced.length ? reduced : candidates); // take original candidates if context didn't contain any
    }
    var result = [];
    for (i = 0; i < candidates.length; i++) {
      var view = this.views[candidates[i]].view;
      var fullPath = this.views[candidates[i]].path;
      if (isSpecial) {
        if (view.type() !== 'layer') throw "state: expected layer name in front of '" + frameName + "'";
        result.push({
          layer: view,
          frameName: frameName,
          path: fullPath + "." + frameName + (noActivation ? '$' : '')
        });
      } else {
        if (view.type() === 'frame') { // for frames return a bit more information which is helpful to trigger the transition
          result.push({
            layer: view.parent,
            view: view,
            frameName: frameName,
            path: fullPath + (noActivation ? '$' : ''),
            active: (undefined !== view.parent.currentFrame && null !== view.parent.currentFrame) ? view.parent.currentFrame.name() === frameName : false,
            noActivation: noActivation
          });
        } else if (view.type() === 'layer') {

          if (fullPath.endsWith(path)) {
            result.push({
              view: view,
              path: fullPath
            });
          } else {
            var paths = this.resolvePath(frameName);

            if (paths.length === 1) {
              result.push({
                layer: view,
                frameName: frameName,
                view: paths[0].view,
                path: fullPath + '.' + frameName + (noActivation ? '$' : ''),
                active: false,
                isInterStage: true,
                originalPath: paths[0].path,
                noActivation: noActivation
              });
            }
          }
        } else {
          //stages
          result.push({
            view: view,
            path: fullPath
          });
        }
      }
    }

    return result;
  },
  /**
   * Will return the handler for an attributesChanged event
   *
   * @param {object}  a view
   * @returns {function} function that will be called when an attributesChanged event is invoked
   */
  _attributesChangedEvent: function(view) {
    var that = this;
    return function(attributes) {
      if (attributes['lj-name'] || attributes['data-lj-name'] || attributes.id) {
        that.unregisterView(view);
        that.registerView(view);
      }
    };
  },
  /**
   * Will return a view based on the path
   * @param {string} path document who's state will be exported
   * @returns {Object} A view
   */
  // getViewByPath: function(path) { // FIXME, shouldn't resolvePath be used for this? This may be faster, but then we could integrate this shortcut into resolvePath
  //   var result;
  //   if (undefined !== this.paths[path]) {
  //     for (var i = 0; i < this.paths[path].length; i++) {
  //       var id = this.paths[path][i];
  //       if (this.views[id].path === path) {
  //         result = this.views[id].view;
  //       }
  //     }
  //   }
  //
  //   return result;
  // }
});
/**
 * Resolves the state for a specific document
 *
 * @param {object} doc - A document where the state needs to be retrieved, if undefined the global document will be used
 * @returns {object} The current state object for the document
 */
layerJS.getState = function(doc) {
  doc = doc || document;
  return doc._ljState || new State(doc);
};
module.exports = State;
