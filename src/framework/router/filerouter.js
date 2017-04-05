'use strict';
var Kern = require('../../kern/Kern.js');
var parseManager = require("../parsemanager.js");
var $ = require('../domhelpers.js');

var FileRouter = Kern.EventManager.extend({
  constructor: function(options) {
    options = options || {};

    this._cache = {};
    this._state = layerJS.getState();

    if (options.cacheCurrent) {
      var url = window.location.href.split('#')[0].replace(window.location.origin, '');
      this._cache[url] = this._state.exportState();
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
    if (canHandle && window.location.href.indexOf(splitted[0]) !== -1 && splitted.length > 1) {
      // same file and with a hash
      canHandle = false;
    }

    if (canHandle && this._cache.hasOwnProperty(url)) {
      canHandle = false;
      var framesToTransitionTo = this._cache[url];
      promise.resolve({
        stop: false,
        handled: true,
        paths : framesToTransitionTo
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

        that._cache[url] = framesToTransitionTo;

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
