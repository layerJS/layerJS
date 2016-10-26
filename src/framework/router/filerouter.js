'use strict';
var Kern = require('../../kern/Kern.js');
var parseManager = require("../parsemanager.js");
var state = require("../state.js");
var $ = require('../domhelpers.js');

var FileRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to the url
   * @param {string} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(href, transition) {

    var promise = new Kern.Promise();
    var canHandle = true;

    if (href.match(/^\w+:/)) { // absolute URL
      if (!href.match(new RegExp('^' + window.location.origin))) {
        canHandle = false;
        promise.resolve({
          handled: false,
          stop: false
        });
      }
    }
    var splitted = href.split('#');
    if (canHandle && window.location.href.indexOf(splitted[0]) !== -1) {
      // same file
      canHandle = false;
      promise.resolve({
        handled: false,
        stop: false
      });
    }

    if (canHandle) {
      this._loadHTML(href).then(function(doc) {
        parseManager.parseDocument(doc);
        var loadedFrames = state.exportStructureAsArray(doc);
        var toParseChildren = {};
        var alreadyImported = {};

        for (var x = 0; x < loadedFrames.length; x++) {
          var orginalView = state.getViewForPath(loadedFrames[x], document);
          if (undefined !== orginalView) {
            // already imported
            continue;
          }

          let parentView;
          let parentPath = loadedFrames[x];
          let pathToImport;

          while (undefined === parentView && parentPath.indexOf('.') > 0 && !alreadyImported.hasOwnProperty(parentPath)) {
            pathToImport = parentPath;
            parentPath = pathToImport.replace(/\.[^\.]*$/, "");
            parentView = state.getViewForPath(parentPath, document);
            // find parent in existing document or check if it has just been added
          }

          if (undefined !== parentView && !alreadyImported.hasOwnProperty[parentPath]) {
            // parent found and not yet imported, add it's child (pathToImport) to it
            var stateToImport = state.getStateForPath(pathToImport, doc);
            parentView.innerEl.insertAdjacentHTML('beforeend', stateToImport.view.outerEl.outerHTML);
            toParseChildren[parentPath] = true;
            alreadyImported[pathToImport] = true;
          }
        }

        var framesToTransitionTo = state.exportStateAsArray(doc);

        if (framesToTransitionTo.length > 0) {
          $.postAnimationFrame(function() {
            state.transitionTo(framesToTransitionTo, transition);
            promise.resolve({
              stop: false,
              handled: true
            });
          });
        } else {
          promise.resolve({
            stop: false,
            handled: true
          });
        }
      }, function() {
        promise.resolve({
          stop: false,
          handled: false
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
        var doc = document.implementation.createHTMLDocument("framedoc");
        doc.documentElement.innerHTML = xhr.responseText;

        p.resolve(doc);
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
