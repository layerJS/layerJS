'use strict';
var layerJS = require('./layerjs.js');
var pluginManager = require('./pluginmanager.js');
var state = require('./state.js');

var ParseManager = function() {
  /**
   * Parses a document for layerJs object
   * @param {HTMLDocument} doc - an optional root document
   *
   * @returns {void}
   */
  this.parseDocument = function(doc) {
    doc = doc || document;
    var stageElements = doc.querySelectorAll("[data-lj-type='stage'],[lj-type='stage']");

    var length = stageElements.length;

    for (var index = 0; index < length; index++) {
      pluginManager.createView('stage', {
        el: stageElements[index],
        document: doc
      });
    }
    state.buildTree2({ document : doc});
  };
};


layerJS.parseManager = new ParseManager();
module.exports = layerJS.parseManager;
