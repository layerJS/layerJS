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

    if (href.match(/^\w+:/)) { // absolute URL
      if (!href.match(new RegExp('^' + window.location.origin))) {
        promise.resolve(false);
      }
    }

    this._loadHTML(href).then(function(doc) {
      parseManager.parseDocument(doc);
      var loadedFrames = state.exportStructureAsArray(doc);

      var toTransitionTo = {};
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
          if (stateToImport.active || (toTransitionTo[parentPath] === undefined && stateToImport.view.data.attributes.type === 'frame')) {
            toTransitionTo[parentPath] = stateToImport.view.data.attributes.name;
          }
        }
      }

      // call the parse children only one time per parent
      for (var parentPath in toParseChildren) {
        if (toParseChildren.hasOwnProperty(parentPath)) {
          state.getViewForPath(parentPath)._parseChildren();
        }
      }

      if (Object.keys(toTransitionTo).length > 0) {
        $.postAnimationFrame(function() {
          for (var path in toTransitionTo) {
            if (toTransitionTo.hasOwnProperty(path) && toTransitionTo[path] !== undefined) {
              var layerView = state.getViewForPath(path);
              layerView.transitionTo(toTransitionTo[path], transition);
            }
          }
          promise.resolve(true);
        });
      } else {
        promise.resolve(true);
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
    var xhr = new XMLHttpRequest();
    var p = new Kern.Promise();
    xhr.onload = function() {
      var doc = document.implementation.createHTMLDocument("framedoc");
      doc.documentElement.innerHTML = xhr.responseText;

      p.resolve(doc);
    };
    xhr.open("GET", URL);
    xhr.responseType = "text";
    xhr.send();
    return p;
  }
});

module.exports = FileRouter;
