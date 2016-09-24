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
        var layerPath = activeFrames[i].replace(/^(.*\.)[^\.]*$/, "$1").slice(0, -1);
        var layerView = state.getViewForPath(layerPath);
        var frameView = state.getViewForPath(activeFrames[i]);
        layerView.transitionTo(frameView.data.attributes.name, transition);
      }
    }

    var promise = new Kern.Promise();
    promise.resolve(result);

    return promise;
  }
});

module.exports = StateRouter;
