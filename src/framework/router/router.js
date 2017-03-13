'use strict';
var layerJS = require('../layerjs.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');
var UrlData = require('../url/urldata.js');
var StaticRouter = require('./staticrouter.js');
var state = require('../state.js');
var domhelpers = require('../domhelpers.js');

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
    this.routers[0].addRoute(url, state, nomodify);
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

      if (event.nonlayerJS !== true && this.href !== '') {
        var href = this.href;

        event.preventDefault();

        that._navigate(href, true, domhelpers.findParentViewOfType(this, 'layer')).then(function(result) {
          if (!result) {
            setTimeout(function() {
              window.location.href = href;
            }, 1);
          }
        });
      }
    });
  },
  /**
   * When the router can navigate to the url, it will do this.
   * @param {string} Url where to navigate
   * @param {boolean} Indicate if the url needs to be added to the history
   * @param {LayerView} LayerView where the click event originated
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  _navigate: function(href, addToHistory, layerView) {
    //var navigate = false;
    var urlData = new UrlData(href, layerView);
    var count = this.routers.length;
    var that = this;
    var promise = new Kern.Promise();

    var index = 0;

    // save the exiting state; we need previousUrl as in case of popState, the window.location.href is already the new one
    if (this.previousUrl === undefined) {
      this.previousUrl = window.location.href;
    }
    if (this.cache) {
      this.addStaticRoute(this.previousUrl, state.exportState(), true);
    }

    var handled = false;

    var callRouter = function() {
      if (index < count) {
        that.routers[index].handle(urlData).then(function(result) {
          if (!handled && result.handled) {
            if (window.history && addToHistory) {
              window.history.pushState({}, "", urlData.url);
            }
            that.previousUrl = href;
            handled = result.handled;
          }

          if ((result.handled && !result.stop) || (!result.handled)) {
            index++;
            callRouter();
          } else
            promise.resolve(handled);
        });
      } else {
        promise.resolve(handled);
      }
    };

    callRouter();

    return promise;
  }
});

module.exports = layerJS.router = new Router();
