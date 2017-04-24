'use strict';
var Kern = require('../../kern/Kern.js');
var parseManager = require("../parsemanager.js");
var urlHelper = require('../urlhelper.js');
var $ = require('../domhelpers.js');

var FileRouter = Kern.EventManager.extend({
  constructor: function(options) {
    options = options || {};

    this._cache = {};
    this._state = layerJS.getState();

    if (options.cacheCurrent) {
      // remove layerJS parameters from the url before caching it the fist time
      var parsed = urlHelper.parseQueryString(window.location.href.split('#')[0]);
      this._cache[parsed.url] = this._state.exportState();
    }
  },
  /**
   * Will do the actual navigation to the url
   * @param {url} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(url) {
    var that = this;
    var promise = new Kern.Promise();
    var canHandle = true;
    var paths = [];

    if (url.match(/^\w+:/) && !url.match(new RegExp('^' + window.location.origin))) {
      canHandle = false;
    }

    var splitted = url.split('#');
    var urlNoHash = splitted[0];
    if (canHandle && window.location.href.indexOf(urlNoHash) !== -1 && splitted.length > 1) {
      // same file and with a hash
      canHandle = false;
    }

    if (canHandle && this._cache.hasOwnProperty(urlNoHash)) {
      canHandle = false;
      var framesToTransitionTo = this._cache[urlNoHash];
      promise.resolve({
        stop: false,
        handled: true,
        paths: framesToTransitionTo
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
          }
        }

        that._cache[urlNoHash] = framesToTransitionTo;

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
  },
  /**
   * Will try to resolve an url based on it's cached states
   *
   * @param {Object} options - contains a url and a state (array)
   * @returns {Promise} a promise that will return the HTML document
   */
  buildUrl: function(options) {
    var foundPathsLength = 0;
    var foundPaths = [];
    var find = function(path) {
      return options.state.indexOf(path) !== -1;
    };

    for (var url in this._cache) {
      if (this._cache.hasOwnProperty(url) && this._cache[url].length > foundPathsLength) {
        var found = this._cache[url].filter(find);
        var count = found.length;
        if (count > foundPathsLength) {
          foundPaths = found;
          foundPathsLength = count;
          options.url = url;
        }
      }
    }

    foundPaths.forEach(function(path) {
      options.state.splice(options.state.indexOf(path), 1);
    });
  }
});

module.exports = FileRouter;
