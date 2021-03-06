'use strict';
var Kern = require('../../kern/Kern.js');
var $ = require('../domhelpers.js');

var StaticRouter = Kern.EventManager.extend({
  constructor: function() {
    this.routes = {};
  },
  /**
   * add a static route to the routers
   *
   * @param {string} url - the url of the route
   * @param {object} options - contains the state and page title of the route
   * @param {boolean} nomodify - don't modify route if already set
   * @returns {Type} Description
   */
  addRoute: function(url, options, nomodify) {
    url = $.getAbsoluteUrl(url); // make url absolute
    if (!nomodify || !this.routes.hasOwnProperty(url)) {
      this.routes[url] = options;
    }
  },
  /**
   * check if a route for an url is already registered
   *
   * @param {string} url - the url of an route
   * @returns {Type} Description
   */
  hasRoute: function(url) {
    url = $.getAbsoluteUrl(url); // make url absolute
    return this.routes.hasOwnProperty(url);
  },
  /**
   * Will do the actual navigation to the url
   * @param {object} options contains url parts, paths, transitions, globalTransition, context
   * @return {void}
   */
  handle: function(options) {
    var result;
    var url = $.joinUrl(options, true); // we need to include the queryString as this may refer to different files if filerouter is used.
    // if currentl url equals new url and the url was not explicitly given in navigate() we should ignore the static router cache
    var optout = !url || (!options.explLoc && ($.joinUrl($.splitUrl(window.location.href), true) === url));
    result = optout ? false : this.hasRoute(url);
    var promise = new Kern.Promise();
    var activeFrames = [];
    var transitions = [];

    if (result) {
      activeFrames = this.routes[url].state;
      activeFrames.forEach(function() {
        transitions.push(Kern._extend({}, options.globalTransition)); // we need to add a transition record for each path, otherwise we get in trouble if other routers will add paths and transitions as well
      });
    }

    promise.resolve({
      stop: false,
      handled: result,
      transitions: transitions,
      optout: optout,
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
    var state = options.state.concat(options.defaultState); //we only check state and defaultState but not omitted state for equivalence with router states
    var that = this;
    var foundUrl;
    var url = $.joinUrl(options, true);
    foundUrl = url;
    var find = function(path) {
      return that.routes[url] && that.routes[url].state.indexOf(path) !== -1;
    };
    // check how many state paths can be explained by the current url (we need to prefer the current url over other urls)
    var foundPaths = state.filter(find);
    var foundPathsLength = foundPaths.length;
    // search how many of the current state's paths can be explained by the state stored for each url in the routes hash
    for (url in this.routes) {
      if (this.routes.hasOwnProperty(url) && this.routes[url].state.length > foundPathsLength) {
        var found = state.filter(find);
        var count = found.length;
        if (count > foundPathsLength) {
          foundPaths = found;
          foundPathsLength = count;
          foundUrl = url;
        }
      }
    }

    if (this.routes.hasOwnProperty(foundUrl) && this.routes[foundUrl].pageTitle) {
      options.pageTitle = this.routes[foundUrl].pageTitle;
    }

    // update URL to be shown later on
    foundUrl = $.splitUrl(foundUrl);
    options.location = foundUrl.location;
    options.queryString = foundUrl.queryString; // NOTE: this removes all other query params, not sure this is good or not.

    // remove paths from state that are already explained by the cached URL
    foundPaths.forEach(function(path) {
      var index = options.state.indexOf(path);
      if (index !== -1) {
        options.state.splice(index, 1);
      } else {
        options.defaultState.splice(options.defaultState.indexOf(path), 1);
      }
    });
  }
});

module.exports = StaticRouter;
