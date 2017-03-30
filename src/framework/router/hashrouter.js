'use strict';
var Kern = require('../../kern/Kern.js');

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
        stop: false,
        paths: []
      });
    } else {
      var paths = [];

      for (var path in urlData.hashTransitions) {
        if (urlData.hashTransitions.hasOwnProperty(path)) {
          paths.push(path);
        }
      }

      promise.resolve({
        stop: true,
        handled: true,
        paths: paths
      });
    }

    return promise;
  }
});

module.exports = HashRouter;
