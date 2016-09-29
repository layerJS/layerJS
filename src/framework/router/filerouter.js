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
      var currentActiveFrames = state.exportStateAsArray(document);

      var toTransitionTo = {};
      var layerView;

      for (var y = 0; y < currentActiveFrames.length; y++) {
        var layerPath = currentActiveFrames[y].replace(/^(.*\.)[^\.]*$/, "$1").slice(0, -1);
        layerView = state.getViewForPath(layerPath);
        toTransitionTo[layerPath] = undefined;

        for (var x = 0; x < loadedFrames.length; x++) {
          var frameToImportLayerPath = loadedFrames[x].replace(/^(.*\.)[^\.]*$/, "$1").slice(0, -1);
          if (layerPath === frameToImportLayerPath && currentActiveFrames[y] !== loadedFrames[x]) {
            var frameState = state.getStateForPath(loadedFrames[x], doc);
            var frameViewToImport = frameState.view;
            var adoptedEl = document.adoptNode(frameViewToImport.outerEl);
            frameViewToImport.document = document;
            frameViewToImport.outerEl = frameViewToImport.innerEl = adoptedEl;
            delete adoptedEl._state;
            layerView.innerEl.appendChild(adoptedEl);
            // TODO: update state
            state.registerView(frameViewToImport);
            if (frameState.active || toTransitionTo[layerPath] === undefined) {
              toTransitionTo[layerPath] = frameViewToImport.data.attributes.name;
            }
          }
        }

        layerView._parseChildren();
      }

      $.postAnimationFrame(function() {
        for (var path in toTransitionTo) {
          if (toTransitionTo.hasOwnProperty(path) && toTransitionTo[path] !== undefined) {
            layerView = state.getViewForPath(path);
            layerView.transitionTo(toTransitionTo[path], transition);
          }
        }

        promise.resolve(true);
      });
    });

    return promise;
  //  return true;
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
