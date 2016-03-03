'use strict';
var WL = require('./wl.js');
var pluginManager = require('./pluginmanager.js');

var ParseManager = function() {
  /**
   * Parses a document for layerJs object
   *
   * @returns {void}
   */
  this.parseDocument = function() {

    var stageElements = document.querySelectorAll("[data-wl-type='stage']");

    var length = stageElements.length;

    for (var index = 0; index < length; index++) {
      pluginManager.createView('stage', {
        el: stageElements[index]
      });
    }
  };
};


WL.parseManager = new ParseManager();
module.exports = WL.parseManager;
