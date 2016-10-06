'use strict';
var layerJS = require('../layerjs.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');
var defaults = require('../defaults.js');
var StaticRouter = require('./staticrouter.js');
var state = require('../state.js');

var Router = Kern.EventManager.extend({
  constructor: function(rootEl, options) {
    this.rootElement = rootEl || document;
    this.routers = [new StaticRouter()]; // always have a state router
    this.cache = (options ? options.cache : true);
    this._registerLinkClickedListener();
    this.previousUrl = undefined;
  },
  /**
   * Will add a new router to the lists of routers
   * @param {object} A new router
   */
  addRouter: function(router) {
    if (this.routers.length === 0) {
      this.routers.push(new StaticRouter());
    }
    this.routers.push(router);
  },
  /**
   * convenience function to add a static route to the StaticRouter
   *
   * @param {string} url - the url for the route
   * @param {Array} state - the state for the route
   * @param {boolean} nomodify - don't modify route if already set
   * @returns {Type} Description
   */
  addStaticRoute: function(url, state, nomodify) {
    this.routers[0].addRoute(this._parseUrl(url).url, state, nomodify);
  },
  /**
   * Will clear all registered routers except the StaticRouter
   */
  clearRouters: function() {
    this.routers = [new StaticRouter()];
  },
  /**
   * register a listener to all link cliks that decides if the link target can be resolved using a layerJS transition or needs to be followed by a browser reload
   *
   * @returns {Type} Description
   */
  _registerLinkClickedListener: function() {
    var that = this;

    // listen to history buttons
    window.onpopstate = function() {
      that._navigate(document.location.href, false);
    };

    // register link listener
    $.addDelegtedListener(this.rootElement, 'click', 'a', function(event) {
      var href = this.href;
      event.preventDefault();
      event.stopPropagation();

      that._navigate(href, true).then(function(result) {
        if (!result) { // if no router could handle the url just load the url in the browser
          window.location.href = href;
        }
      });
    });
  },
  /**
   * Will parse the url for transition parameters and will return a cleaned up url and parameters
   * @param {string} Url where to navigate
   * @return {Object} An object containing a cleaned up url and transitionOptions
   */
  _parseUrl: function(href) {
    var result = {
      url: href,
      transitionOptions: {}
    };

    for (var parameter in defaults.transitionParameters) {
      if (defaults.transitionParameters.hasOwnProperty(parameter)) {
        var parameterName = defaults.transitionParameters[parameter];
        var regEx = new RegExp("[?&]" + parameterName + "=([^&]+)");
        var match = result.url.match(regEx);
        if (match) {
          result.transitionOptions[parameter] = match[1];
          result.url = result.url.replace(regEx, '');
        }
      }
    }

    result.url = result.url.replace(window.location.origin, '');

    var pattern = /^((http|https):\/\/)/;
    if (!pattern.test(result.url) && (result.url.indexOf('~/') !== -1 || result.url.indexOf('./') !== -1 || result.url.indexOf('../') !== -1)) {
      result.url = this._getAbsoluteUrl(result.url);
    }

    return result;
  },
  /**
   *  Will transform a relative url to an absolute url
   * https://developer.mozilla.org/en-US/docs/Web/API/document/cookie#Using_relative_URLs_in_the_path_parameter
   * @param {string} url to tranform to an absolute url
   * @return {string} an absolute url
   */
  _getAbsoluteUrl: function(sRelPath) {

    if (sRelPath.startsWith('~/')) {
      return sRelPath.substr(1);
    } else if (sRelPath.indexOf('/~/') !== -1) {
      return sRelPath.substr(sRelPath.indexOf('/~/') + 2);
    }

    var nUpLn, sDir = "",
      sPath = window.location.pathname.replace(/[^\/]*$/, sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1"));
    for (var nEnd, nStart = 0; nEnd = sPath.indexOf("/../", nStart), nEnd > -1; nStart = nEnd + nUpLn) {
      nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
      sDir = (sDir + sPath.substring(nStart, nEnd)).replace(new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$"), "/");
    }
    return sDir + sPath.substr(nStart);
  },
  /**
   * When the router can navigate to the url, it will do this.
   * @param {string} Url where to navigate
   * @param {boolean} Indicate if the url needs to be added to the history
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  _navigate: function(href, addToHistory) {
    //var navigate = false;
    var options = this._parseUrl(href);
    var count = this.routers.length;
    var that = this;
    var promise = new Kern.Promise();

    var index = 0;

    // save the exiting state; we need previousUrl as in case of popState, the window.location.href is already the new one
    if (this.previousUrl === undefined) {
      this.previousUrl = window.location.href;
    }
    if (this.cache) {
      this.addStaticRoute(this.previousUrl, state.exportStateAsArray(), true);
    }

    var callRouter = function() {
      if (index < count) {
        that.routers[index].handle(options.url, options.transitionOptions).then(function(result) {
          if (!result) {
            index++;
            callRouter();
          } else {
            if (window.history && addToHistory) {
              window.history.pushState({}, "", options.url);
            }
            that.previousUrl = href;
            promise.resolve(true);
          }
        });
      } else {
        promise.resolve(false);
      }
    };

    callRouter();

    return promise;
  }
});

module.exports = layerJS.router = new Router();
