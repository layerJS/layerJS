'use strict';
var Kern = require('../../kern/Kern.js');
var state = require("../state.js");

var HashRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to a hash
   * @param {string} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(options) {

    var promise = new Kern.Promise();
    var splitted = options.url.split('#');

    if (window.location.href.indexOf(splitted[0]) === -1 || splitted.length !== 2) {
      // not the same file or no hash in href
      promise.resolve({
        handled: false,
        stop: false
      });
    } else {
      var hash = splitted[1];
      var states = hash.split(';');

      var stateParameters = [];
      for (var index = 0; index < states.length; index++) {
        var frameView = state.getViewForPath(states[index]);
        if (!frameView.parent.noUrl()) {
          stateParameters.push(states[index]);
        }
      }

      options.url = options.url.replace(states.join(';'), stateParameters.join(';'));

      var result = state.transitionTo(states, options.transition);
      promise.resolve({
        stop: result,
        handled: result
      });
    }

    return promise;
  }
});

module.exports = HashRouter;
