'use strict';
var Kern = require('../../kern/kern.js');

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
  handle: function(url) {
    var result = this.routes.hasOwnProperty(url);
    var promise = new Kern.Promise();
    var activeFrames = [];

    if (result) {
      activeFrames = this.routes[url];
    }

    promise.resolve({
      stop: result,
      handled: result,
      paths: activeFrames
    });

    return promise;
  }
});

module.exports = StaticRouter;
