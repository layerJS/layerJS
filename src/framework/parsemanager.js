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

    var stageElements = (doc || document).querySelectorAll("[data-lj-type='stage']");

    var length = stageElements.length;

    for (var index = 0; index < length; index++) {
      pluginManager.createView('stage', {
        el: stageElements[index]
      });
    }
    state.buildTree2();
  };
};


layerJS.parseManager = new ParseManager();
module.exports = layerJS.parseManager;
