'use strict';
var layerJS = require('../layerjs.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');
var defaults = require('../defaults.js');

var Router = Kern.EventManager.extend({
  constructor: function(rootEl) {
    this.rootElement = rootEl || document;
    this.currentRouter = undefined;
    this._registerLinkClickedListener();
  },
  /**
   * Will set the current router that will be used to navigate
   * @param {object} A new router
   */
  setCurrentRouter: function(router) {
    this.currentRouter = router;
  },
  _registerLinkClickedListener: function() {
    var that = this;

    window.onpopstate = function() {
      that._navigate(document.location.href, false);
    };

    $.addDelegtedListener(this.rootElement, 'click', 'a', function(event) {
      var href = this.href;

      if (that._navigate(href, true)) {
        event.preventDefault();
        event.stopPropagation();
      }
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


    return result;
  },
  /**
   * When the router can navigate to the url, it will do this.
   * @param {string} Url where to navigate
   * @param {boolean} Indicate if the url needs to be added to the history
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  _navigate: function(href, addToHistory) {
    var navigate = false;
    if (this.currentRouter && this.currentRouter.canHandle(href)) {

      var options = this._parseUrl(href);
      this.currentRouter.handle(href, options.transitionOptions);

      // add to history using push state
      if (window.history && addToHistory) {
        window.history.pushState({}, "", options.url);
      }


      navigate = true;
    }

    return navigate;
  }
});

module.exports = layerJS.router = new Router();
