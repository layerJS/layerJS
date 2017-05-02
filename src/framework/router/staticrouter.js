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
   * @param {string} url an url
   * @param {object} options contains url, paths, transitions, globalTransition, context
   * @return {void}
   */
  handle: function(url, options) {
    var result = this.routes.hasOwnProperty(url);
    var promise = new Kern.Promise();
    var activeFrames = [];

    if (result) {
      activeFrames = this.routes[url];
      activeFrames.forEach(function() {
        options.transitions.push(Kern._extend({}, options.globalTransition));
      });
    }

    promise.resolve({
      stop: result,
      handled: result,
      paths: activeFrames
    });

    return promise;
  },
  /**
   * Will try to resolve an url based on it's cached states
   *
   * @param {Object} options - contains a url and a state (array)
   * @returns {Promise} a promise that will return the HTML document
   */
  buildUrl: function(options) {
    var state = options.state.concat(options.ommittedState);
    var that = this;
    var foundPathsLength = 0;
    var foundPaths = [];
    var url;
    var find = function(path) {
      return that.routes[url].indexOf(path) !== -1;
    };

    for (url in this.routes) {
      if (this.routes.hasOwnProperty(url) && this.routes[url].length > foundPathsLength) {
        var found = state.filter(find);
        var count = found.length;
        if (count > foundPathsLength) {
          foundPaths = found;
          foundPathsLength = count;
          options.url = url;
        }
      }
    }

    foundPaths.forEach(function(path) {
      var index = options.state.indexOf(path);
      if (index !== -1) {
        options.state.splice(index, 1);
      } else {
        options.ommittedState.splice(options.ommittedState.indexOf(path), 1);
      }
    });
  }
});

module.exports = StaticRouter;
