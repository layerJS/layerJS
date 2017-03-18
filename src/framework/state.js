'use strict';

var Kern = require('../kern/Kern.js');
var layerJS = require('./layerjs.js');
var $ = require('./domhelpers.js');

/**
 *  class that will contain the state off all the stages, layers, frames
 *
 * @extends Kern.Base
 */
var State = Kern.Base.extend({
  constructor: function(doc) {
    this.document = doc || document;
    this.document._ljState = this;
    this.viewTypes = ['stage', 'layer', 'frame'];
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
      if (view.type() === 'layer') this.layer.push(id);
      view.on('childAdded', function(child) {
        that.registerView(child);
      }, {
        context: this
      });
      view.on('childRemoved', function(child) {
        that.unregisgterView(child.name(), child);
      }, {
        context: this
      });
      view.on('transitionStarted', function() {
        // FIXME: need to wait for multi transition
        that.trigger("stateChanged");
      }, {
        context: this
      });
      view.on('attributesChanged', this._attributesChangedEvent(view), {
        context: this
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
      id = this.id,
      that = this;
    this.getTrailingPaths(this.views[id]).forEach(function(tp) {
      var i = that.paths[tp].indexOf(id);
      that.paths[tp].splice(i, 1);
      if (that.paths[tp].length === 0) delete that.paths[tp];
    });
    if (view.type() === 'layer') {
      i = this.layers.indexOf(id);
      this.layers.splice(i, 1);
    }
    view.off(undefined, undefined, this);
  },
  /**
   * Will return all paths to active frames
   * @param {object} the document who's state will be exported
   * @returns {array} An array of strings pointing to active frames within the document
   */
  exportState: function() {
    var state = [];
    for (var i = 0; i < this.layers.length; i++) {
      var layer = this.views[this.layers[i]].view;
      if (layer.currentFrame) {
        state.push(this.views[layer.currentFrame.id()].path);
      } else {
        state.push(this.views[layer.id()].path + "!none");
      }
    }
    return state;
  },
  /**
   * Will return all paths to frames, layers and stages. Will be sorted in DOM order
   * @returns {array} An array of strings pointing to alle frames within the document
   */
  exportStructure: function() {
    return Object.keys(this.views).sort($.comparePosition);
  },
  /**
   * Will transition to a state
   *
   * @param {array} states State paths to transition to
   * @param {object} transitions Array of transition records, one per state path, or a single transition record for all paths. Can be undefined in which case a default transition is triggered
   */
  transitionTo: function(states, transitions) {
    transitions = Array.isArray(transitions) && transitions || [transitions || {}];
    var that = this;
    // build an array that contains all layer/frame combinations that need to transition including their transitions records
    transitions = states.map(function(state) {
      return that.resolvePath(state);
    }).reduce(function(collection, layerframe, index) {
      for (var i = 0; i < layerframe.length; i++) {
        if (!layerframe[i].active) collection.push({ // ignore currently active frames
          layer: layerframe[i].layer,
          frameName: layerframe[i].frameName,
          transition: transitions[Math.min(index, transitions.length - 1)]
        });
      }
    }, []);
    var semaphore = new Kern.Semaphore(transitions.length); // semaphore is necessary to let all transition run in sync
    for (var i = 0; i < transitions.length; i++) { // FIXME: this will trigger possibly a lot of non-necessary transitions
      transitions[i].semaphore = semaphore;
      transitions[i].layer.transitionTo(transitions[i].frame, transitions[i].transition); // run the transition on the corresponding layer
    }
    return transitions.length > 0;
  },
  /**
   * Will transition to a state without animation
   *
   * @param {array} states State paths to transition to
   */
  showState: function(states) {
    transitions = Array.isArray(transitions) && transitions || [transitions || {}];
    var that = this;
    // build an array that contains all layer/frame combinations that need to transition including their transitions records
    var transitions = states.map(function(state) {
      return that.resolvePath(state);
    }).reduce(function(collection, layerframe) {
      for (var i = 0; i < layerframe.length; i++) {
        if (!layerframe[i].active) collection.push({ // ignore currently active frames
          layer: layerframe[i].layer,
          frameName: layerframe[i].frameName
        });
      }
    }, []);
    // switch all layers
    for (var i = 0; i < transitions.length; i++) { // FIXME: this will trigger possibly a lot of non-necessary transitions
      transitions[i].layer.showFrame(transitions[i].frame); // switch to frame
    }
    return transitions.length > 0;
  },
  /**
   * create the path of a particular view
   *
   * @param {HTMLElement} node - the HTML node for which the layerJS path should be build
   * @returns {string} the path
   */
  buildPath: function(node) {
    if (!node) return "";
    var parent = this.buildParent(node.parentElement);
    if (node._ljView) {
      var name = node._ljView.name();
      return ((parent ? parent + "." : "") + name);
    } else {
      return parent;
    }
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
    var i, contextpath = context && this.buildPath(context),
      segments = path.split('.'),
      frameName = segments.pop(),
      isSpecial = (frameName[0] === '!'),
      layerpath = segments.join('.'),
      candidates = (isSpecial ? (layerpath ? this.paths[layerpath] : this.layers) : this.paths[path]); // if special frame name, only search for layer
    if (!candidates || candidates.length === 0) throw "state: could not resolve path '" + path + "'";
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
      var view = this.views[candidates[i]];
      if (isSpecial) {
        if (view.type() !== 'layer') throw "state: expected layer name in front of '" + frameName + "'";
        result.push({
          layer: view,
          frameName: frameName
        });
      } else {
        if (view.type() === 'frame') { // for frames return a bit more information which is helpful to trigger the transition
          result.push({
            layer: view.parent,
            view: view,
            frameName: frameName,
            active: view.parent.currentFrame.name() === frameName
          });
        } else {
          result.push({
            view: view
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
});

module.exports = layerJS.state = new State();
