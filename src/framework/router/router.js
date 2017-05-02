'use strict';
var layerJS = require('../layerjs.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');
var StaticRouter = require('./staticrouter.js');
var domhelpers = require('../domhelpers.js');

var Router = Kern.EventManager.extend({
  constructor: function(rootEl) {
    this.rootElement = rootEl || document;
    this.routers = [new StaticRouter()]; // always have a state router
    this._registerLinkClickedListener();
    this.addToHistory = true;
    this.isClickEvent = false;
    this.state = layerJS.getState();
    this.state.on('stateChanged', this._stateChanged, {
      context: this
    });
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

        event.preventDefault(); // prevent default action, i.e. going to link target
        // do not stop propagation; other libraries may listen to link clicks

        that._navigate(href, true, true, domhelpers.findParentViewOfType(this, 'layer')).then(function(result) {
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
   * @param {LayerView} LayerView where the click event originated
   * @param {boolean} noHistory When true, the url will not be added to the browser history
   * @param {boolean} isLink Indicates if the navigate should react as a link click
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  navigate: function(href, layerView, noHistory, isLink) {
    return this._navigate(href, !noHistory, (isLink !== false), layerView);
  },
  /**
   * When the router can navigate to the url, it will do this.
   * @param {string} Url where to navigate
   * @param {boolean} Indicate if the url needs to be added to the history
   * @param {boolean} Indicate if it is a click event
   * @param {LayerView} LayerView where the click event originated
   * @param {boolean} initial when true the router will not do a transition but instead will directly show it
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  _navigate: function(href, addToHistory, isClickEvent, layerView, initial) {

    var parsed = domhelpers.parseQueryString(href);
    var options = {
      url: parsed.url,
      transitions: [],
      context: layerView,
      paths: [],
      globalTransition : parsed.transition || {} // global transition will be used to merge with other transitions that will be added by other routers
    };

    var count = this.routers.length;
    var that = this;
    var promise = new Kern.Promise();
    var state = layerJS.getState();

    var index = 0;

    var handled = false;

    var resolve = function() {
      if (handled) {
        // determine is it was a clickevent and if we need to add this to the history
        that.isClickEvent = true === isClickEvent;
        that.addToHistory = addToHistory;
        if (initial === true) {
          // this is the initial navigation ( page just loaded) so we should do a show
          state.showState(options.paths);
        } else {
          // do a transition
          state.transitionTo(options.paths, options.transitions);
        }
      }

      promise.resolve(handled);
    };

    // iterate all routers
    var callRouter = function() {
      if (index < count) {
        that.routers[index].handle(options.url, options).then(function(result) {
          if (result.handled) {
            // the router handled the url -> add newly found paths to the options
            handled = result.handled;
            Array.prototype.push.apply(options.paths, result.paths);
          }
          if ((result.handled && !result.stop) || (!result.handled)) {
            // when the router couldn't handle the url or when the router indecated that we should try other routers, call other routers
            index++;
            callRouter();
          } else
            // end iteration
            resolve();
        });
      } else {
        // end iteration
        resolve();
      }
    };

    callRouter();

    return promise;
  },
  /**
   * Will be called when the state is changed (stateChanged event).
   * Will create a url to represent the current (changed) state.
   * @param {Array} newState the minimised (changed) state
   */
  _stateChanged: function(newState) {

    newState = newState || {
      state: [],
      ommittedState: []
    };

    var parsed = domhelpers.splitUrl(window.location.href);

    var options = {
      state: newState.state,
      ommittedState: newState.ommittedState,
      url: parsed.location + parsed.queryString
    };

    for (var i = 0; i < this.routers.length && options.state.length > 0; i++) {
      this.routers[i].buildUrl(options);
    }
    if (window.history && this.addToHistory) {
      if (this.isClickEvent) {
        window.history.pushState({}, "", options.url);
      } else {
        window.history.replaceState({}, "", options.url);
      }
    }
    this.isClickEvent = false;
    this.addToHistory = true;
  }
});

module.exports = layerJS.router = new Router();
