'use strict';
var Kern = require('../../kern/kern.js');
var state = require('../state.js');

var StateRouter = Kern.EventManager.extend({
  constructor: function() {
    this.routes = {};
  },
  addRoute: function(url, states) {
    this.routes[url] = states;
  },
  /**
   * Will do the actual navigation to the url
   * @param {string} an url
   * @return {void}
   */
    handle: function(href, transition) {
    var result = this.routes.hasOwnProperty(href);

    if (result) {
      var activeFrames = this.routes[href];

      for (var i = 0; i < activeFrames.length; i++) {
        var pathToFrame = activeFrames[i].split('.');
        var parentState = state.tree;
        for (var x = 0; x < pathToFrame.length - 1; x++) {
          parentState = parentState[pathToFrame[x]];
        }
        var frameState = parentState[pathToFrame[pathToFrame.length - 1]];
        var frameName = null;
        if (frameState.view) {
          frameName = frameState.view.data.attributes.name;
        }
        parentState.view.transitionTo(frameName, transition);
      }
    }

    return result;
  }
});

module.exports = StateRouter;
