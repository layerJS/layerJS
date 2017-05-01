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
      var parsed = $.parseQueryString(window.location.href.split('#')[0]);
      this.addRoute(parsed.url, this._state.exportState());
    }
  },
  /**
   * Will do the actual navigation to the url
   * @param {string} url an url
   * @param {object} options contains url, paths, transitions, globalTransition, context
   * @return {boolean} True if the router handled the url
   */
  handle: function(url, options) {
    var that = this;
    var promise = new Kern.Promise();
    var canHandle = true;
    var paths = [];

    // check it the passed in url is in the same domain
    if (url.match(/^\w+:/) && !url.match(new RegExp('^' + window.location.origin))) {
      canHandle = false;
    }

    var splitted = url.split('#');
    var urlNoHash = splitted[0];
    if (canHandle && window.location.href.indexOf(urlNoHash) !== -1 && splitted.length > 1) {
      // same file and with a hash
      canHandle = false;
    }

    // url has been handled before, read the state from the cache
    if (canHandle && this.hasRoute(urlNoHash)) {
      canHandle = false;
      StaticRouter.prototype.handle.call(this, urlNoHash, options).then(function(result) {
        promise.resolve({
          stop: false,
          handled: true,
          paths: result.paths
        });
      });
    }

    if (!canHandle) {
      promise.resolve({
        handled: false,
        stop: false,
        paths: paths
      });
    } else {
      this._loadHTML(url).then(function(doc) {
        parseManager.parseDocument(doc);
        var globalStructureHash = {};

        var state = that._state;
        // create a hash that contains all paths for the current document
        state.exportStructure().forEach(function(path) {
          globalStructureHash[path] = {};
        });

        var fileState = layerJS.getState(doc);
        var addedHash = {};

        fileState.exportStructure().forEach(function(path) {
          // check if new path exists in current state
          if (!globalStructureHash[path]) {
            // check if the parent is already added
            var found = Object.keys(addedHash).filter(function(addedPath) {
              return path.startsWith(addedPath);
            }).length > 0;

            if (!found) {
              // Path not yet added, get parent path
              var parentPath = path.replace(/\.[^\.]*$/, '');
              // only add the new path if the parent exists in current state
              if (globalStructureHash[parentPath]) {
                var html = fileState.getViewByPath(path).outerEl.outerHTML;
                var parentView = state.getViewByPath(parentPath);
                parentView.innerEl.insertAdjacentHTML('beforeend', html);
                addedHash[path] = {};
              }
            }
          }
        });

        var framesToTransitionTo = fileState.exportState();
        for (var i = 0; i < framesToTransitionTo.length; i++) {
          var isSpecial = framesToTransitionTo[i].split('.').pop()[0] === '!';
          // only transition to frames the already existed or just have been added
          if (!(globalStructureHash[framesToTransitionTo[i]] || addedHash[framesToTransitionTo[i]] || isSpecial)) {
            framesToTransitionTo.splice(i, 1);
            i--;
          } else {
            options.transitions.push(Kern._extend({}, options.globalTransition));
          }
        }

        that.addRoute(urlNoHash, framesToTransitionTo);

        if (framesToTransitionTo.length > 0) {
          $.postAnimationFrame(function() {
            promise.resolve({
              stop: false,
              handled: true,
              paths: framesToTransitionTo
            });
          });
        } else {
          promise.resolve({
            stop: false,
            handled: true,
            paths: []
          });
        }
      }, function() {
        promise.resolve({
          stop: false,
          handled: false,
          paths: []
        });
      });
    }


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
