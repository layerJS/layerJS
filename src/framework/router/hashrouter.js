'use strict';
var Kern = require('../../kern/Kern.js');
var state = require("../state.js");

var HashRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to a hash
   * @param {string} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(href, transition) {

    var promise = new Kern.Promise();
    var splitted = href.split('#');

    if (window.location.href.indexOf(splitted[0]) === -1 || splitted.length !== 2) {
      // not the same file or no hash in href
      promise.resolve({
        handled: false,
        stop: false
      });
    } else {
      var hash = splitted[1];
      var states = hash.split(';');
      state.transitionTo(states, transition);
      promise.resolve({
        stop: true,
        handled: true
      });
    }

    return promise;
  }
});

module.exports = HashRouter;
