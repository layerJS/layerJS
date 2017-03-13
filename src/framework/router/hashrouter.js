'use strict';
var Kern = require('../../kern/Kern.js');
var state = require("../state.js");

var HashRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to a hash
   * @param {UrlData} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(urlData) {

    var promise = new Kern.Promise();
    if (!urlData.hasHashTransitions) {
      // not the same file or no hash in href
      promise.resolve({
        handled: false,
        stop: false
      });
    } else {
      var paths = [];
      var transitions =[urlData.transition];

      for (var path in urlData.hashTransitions) {
        if (urlData.hashTransitions.hasOwnProperty(path)) {
          paths.push(path);
          transitions.push(urlData.hashTransitions[path]);
        }
      }

      var result = true;

      if (paths.length > 0) {
        result = state.transitionTo(paths, transitions);
      }

      promise.resolve({
        stop: result,
        handled: result
      });
    }

    return promise;
  }
});

module.exports = HashRouter;
