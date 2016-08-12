'use strict';
var WL = require('../wl.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');

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
   * When the router can navigate to the url, it will do this.
   * @param {string} Url where to navigate
   * @param {boolean} Indicate if the url needs to be added to the history
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  _navigate: function(href, addToHistory) {
    var navigate = false;
    if (this.currentRouter && this.currentRouter.canHandle(href)) {

      this.currentRouter.handle(href);

      // add to history using push state
      if (window.history && addToHistory) {
        window.history.pushState({}, "", href);
      }


      navigate = true;
    }

    return navigate;
  }
});

module.exports = WL.router = new Router();
