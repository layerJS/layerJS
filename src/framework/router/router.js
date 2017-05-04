'use strict';
var layerJS = require('../layerjs.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');
var StaticRouter = require('./staticrouter.js');

var Router = Kern.EventManager.extend({
  constructor: function(rootEl) {
    this.rootElement = rootEl || document;
    this.routers = [];
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
    this.routers.push(router);
    if (router instanceof StaticRouter) {
      this.staticRouter = router; // mark if we have a static router
    }
  },
  /**
   * convenience function to add a static route to the StaticRouter. It will create a static router if none is present for convenience. Note, some routers like filerouter are also static routers
   *
   * @param {string} url - the url for the route
   * @param {Array} state - the state for the route
   * @param {boolean} nomodify - don't modify route if already set
   * @returns {Type} Description
   */
  // addStaticRoute: function(url, state, nomodify) {
  //   if (!this.staticRouter) this.addRouter(new StaticRouter);
  //   this.staticRouter.addRoute(url, state, nomodify);
  // },
  /**
   * Will clear all registered routers except the StaticRouter
   */
  clearRouters: function() {
    this.routers = [];
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
      that.navigate(document.location.href, true);
    };

    // register link listener
    $.addDelegtedListener(this.rootElement, 'click', 'a', function(event) {

      if (this.href !== '') {
        var href = this.href;

        event.preventDefault(); // prevent default action, i.e. going to link target
        // do not stop propagation; other libraries may listen to link clicks

        that.navigate(href, $.findParentViewOfType(this, 'layer')).then(function(result) {
          if (!result) {
            setTimeout(function() { // why do we have to get at the end of the queue?
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
   * @param {LayerView} context where the click event originated
   * @param {boolean} noHistory Indicate if the url should to be added to the history
   * @param {boolean} initial when true the router will not do a transition but instead will directly show it
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  navigate: function(href, context, noHistory, initial) {

    var options = Kern._extend($.splitUrl(href), {
      transitions: [],
      context: context,
      paths: [],
      globalTransition: {}
    });
    // make sure if location is given that it is a fully qualified url (not a relative)
    if (options.location || options.queryString) {
      Kern._extend(options, $.getAbsoluteUrl(href));
    }
    // check if there are layerjs params in the querystring
    var qsljparams = options.queryString && $.parseStringForTransitions(options.queryString, true);
    if (qsljparams) {
      options.globalTransition = qsljparams.transition; // transition will be used to merge with other transitions that will be added by other routers
      options.queryString = qsljparams.string; // remove layerJS params from queryString
    }

    var count = this.routers.length;
    var that = this;
    var promise = new Kern.Promise();
    var handled = false;

    var resolve = function() {
      if (handled) {
        // determine is it was a clickevent and if we need to add this to the history
        that.addToHistory = !noHistory;
        if (initial === true) {
          // this is the initial navigation ( page just loaded) so we should do a show
          that.state.showState(options.paths);
        } else {
          // do a transition
          that.state.transitionTo(options.paths, options.transitions);
        }
      }

      promise.resolve(handled);
    };

    // iterate all routers
    var callRouter = function(index) {
      if (index < count) {
        that.routers[index].handle(options).then(function(result) {
          if (result.handled) {
            // the router handled the url -> add newly found paths to the options
            handled = result.handled;
            Array.prototype.push.apply(options.paths, result.paths);
            Array.prototype.push.apply(options.transitions, result.transitions);
          }
          if ((result.handled && !result.stop) || (!result.handled)) {
            // when the router couldn't handle the url or when the router indecated that we should try other routers, call other routers
            callRouter(index + 1);
          } else
            // end iteration
            resolve();
        });
      } else {
        // end iteration
        resolve();
      }
    };
    // if url is not of same domain as current document do not handle
    if (options.location.match(/^\w+:/) && !options.location.match(new RegExp('^' + window.location.origin))) {
      promise.resolve(false);
    } else {
      callRouter(0);
    }
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
    // prepare data for the routers
    var options = Kern._extend($.splitUrl(window.location.href), newState);

    // remove layerjs params from queryString
    options.queryString = $.parseStringForTransitions(options.queryString, true).string;

    for (var i = 0; i < this.routers.length; i++) {
      this.routers[i].buildUrl(options);
    }

    var url = $.joinUrl(options);

    if (window.history && this.addToHistory) {
      window.history.pushState({}, "", url);
    }
    this.addToHistory = true;
  }
});

module.exports = layerJS.router = new Router();
