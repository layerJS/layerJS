'use strict';
var Kern = require('../../kern/Kern.js');
var parseManager = require("../parsemanager.js");
var state = require("../state.js");

var FileRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to the url
   * @param {string} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(href, transition) {
    if (href.match(/^\w+:/)) { // absolute URL
      if (!href.match(new RegExp('^' + window.location.origin))) {
        return false;
      }
    }

    this._loadHTML(href).then(function(doc) {
      parseManager.parseDocument(doc);
      var loadedActiveFrames = state.exportStateAsArray(doc);
      var currentActiveFrames = state.exportStateAsArray(document);

      var toImport = {};

      for (var y = 0; y < currentActiveFrames.length; y++) {
        var layerPath = currentActiveFrames[y].replace(/^(.*\.)[^\.]*$/, "$1").slice(0, -1);

        for (var x = 0; x < loadedActiveFrames.length; x++) {
          var frameToImportPath = loadedActiveFrames[x].replace(/^(.*\.)[^\.]*$/, "$1").slice(0, -1);

          if (layerPath === frameToImportPath && currentActiveFrames[y] !== loadedActiveFrames[x]) {
            toImport[layerPath] = loadedActiveFrames[x];
            break;
          }
        }
      }

      console.log(toImport);
      var imported = false;
      for (var path in toImport) {
        if (toImport.hasOwnProperty(path)) {
          var layerView = state.getViewForPath(path, document);
          var frameViewToImport = state.getViewForPath(toImport[path], doc);

          var adoptedEl = document.adoptNode(frameViewToImport.outerEl);
          frameViewToImport.document = document;
          layerView.innerEl.appendChild(adoptedEl);
          layerView._parseChildren();

          layerView.transitionTo(frameViewToImport.data.attributes.name, transition);
          imported = true;
        }
      }

      if (!imported) {
        window.location.href = href;
      }
    });

    return true;
  },
  /**
   * load an HTML document by AJAX and return it through a promise
   *
   * @param {string} URL - the url of the HMTL document
   * @returns {Promise} a promise that will return the HTML document
   */
  _loadHTML : function(URL) {
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
