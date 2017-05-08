'use strict';
var Kern = require('../../kern/Kern.js');
var parseManager = require("../parsemanager.js");
var $ = require('../domhelpers.js');
var StaticRouter = require('./staticrouter.js');

var FileRouter = StaticRouter.extend({
  constructor: function(options) {
    options = options || {};

    this._state = layerJS.getState();
    StaticRouter.call(this, options);

    if (options.cacheCurrent) {
      // remove layerJS parameters from the url before caching it the fist time
      var parsed = $.splitUrl($.getAbsoluteUrl(window.location.href));
      parsed.queryString = $.parseStringForTransitions(parsed.queryString, true).string;
      // FIXME: this need to wait for state.initialized
      this.addRoute($.joinUrl(parsed, true), this._state.exportState().state);
    }
  },
  /**
   * Will do the actual navigation to the url
   * @param {string} url an url
   * @param {object} options contains url, paths, transitions, globalTransition, context
   * @return {boolean} True if the router handled the url
   */
  handle: function(options) {
    var that = this;
    var promise = new Kern.Promise();

    // check static router if we have cached this url

    StaticRouter.prototype.handle.call(this, options).then(function(result) {
      if (result.handled || result.optout) {
        promise.resolve(result);
      } else {
        that._loadHTML($.joinUrl(options, true)).then(function(doc) {
            parseManager.parseDocument(doc);
            var globalStructureHash = {};

            var state = that._state;
            // create a hash that contains all paths for the current document
            state.exportStructure().forEach(function(path) {
              globalStructureHash[path] = {};
            });

            var fileState = layerJS.getState(doc);
            var addedHash = [];

            fileState.exportStructure().forEach(function(path) {
              // check if new path exists in current state
              if (!globalStructureHash[path]) {
                // check if the parent is already added in this run
                var found = addedHash.filter(function(addedPath) {
                  return path.startsWith(addedPath);
                }).length > 0;

                if (!found) {
                  // Path not yet added, get parent path
                  var parentPath = path.replace(/\.[^\.]*$/, '');
                  // only add the new path if the parent exists in current state
                  if (globalStructureHash[parentPath]) {
                    var html = fileState.resolvePath(path)[0].view.outerEl.outerHTML; // this should always resolve to a single view
                    var parentView = state.resolvePath(parentPath)[0].view;
                    parentView.innerEl.insertAdjacentHTML('beforeend', html);
                    addedHash.push(path);
                  }
                }
              }
            });

            var framesToTransitionTo = fileState.exportState().state;
            // create a transition record for each frame path.
            var transitions = framesToTransitionTo.map(function() {
              return Kern._extend({}, options.globalTransition);
            });
            // cache the new state so that we don't need to request the same page again.
            that.addRoute(options.location + options.queryString, framesToTransitionTo);

            // we modified HTML. need to wait for rerender and mutation observers
            $.postAnimationFrame(function() {
              promise.resolve({
                stop: false,
                handled: true,
                paths: framesToTransitionTo,
                transitions: transitions
              });
            });
          },
          function() { // if load failed resolve with handled false
            promise.resolve({
              stop: false,
              handled: false,
              paths: [],
              transitions: []
            });
          });
      }
    });

    return promise;
  },
  /**
   * load an HTML document by AJAX and return it through a promise
   *
   * @param {string} URL - the url of the HMTL document
   * @returns {Promise} a promise that will return the HTML document
   */
  _loadHTML: function(URL) {
    var p = new Kern.Promise();

    try {
      var xhr = new XMLHttpRequest();
      xhr.onerror = function() {
        p.reject();
      };
      xhr.onload = function() {

        if (xhr.status === 200) {
          var doc = document.implementation.createHTMLDocument("framedoc");
          doc.documentElement.innerHTML = xhr.responseText;
          p.resolve(doc);
        } else {
          p.reject();
        }
      };
      xhr.open("GET", URL);
      xhr.responseType = "text";
      xhr.send();
    } catch (e) {
      p.reject(e);
    }

    return p;
  }
});

module.exports = FileRouter;
