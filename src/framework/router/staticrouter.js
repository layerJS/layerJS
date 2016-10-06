'use strict';
var Kern = require('../../kern/kern.js');
var state = require('../state.js');

var StaticRouter = Kern.EventManager.extend({
  constructor: function() {
    this.routes = {};
  },
  /**
   * add a static route to the routers
   *
   * @param {string} url - the url of the route
   * @param {Array} state - the state of the route
   * @param {boolean} nomodify - don't modify route if already set
   * @returns {Type} Description
   */
  addRoute: function(url, state, nomodify) {
    if (!nomodify || !this.routes.hasOwnProperty(url)) {
      this.routes[url] = state;
    }
  },
  /**
   * check if a route for an url is already registered
   *
   * @param {string} url - the url of an route
   * @returns {Type} Description
   */
  hasRoute: function(url) {
    return this.routes.hasOwnProperty(url);
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

module.exports = StaticRouter;
