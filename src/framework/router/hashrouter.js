'use strict';
var Kern = require('../../kern/Kern.js');
var urlHelper = require('../urlhelper.js');

var HashRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to a hash
   * @param {UrlData} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(url, options) {

    var promise = new Kern.Promise();
    var urlInfo = urlHelper.splitUrl(url);

    if (urlInfo.hash === undefined || urlInfo.hash === '') {
      // not the same file or no hash in href
      promise.resolve({
        handled: false,
        stop: false,
        paths: []
      });
    } else {
      var hashPaths = (urlInfo.hash.startsWith('#') ? urlInfo.hash.substr(1) : urlInfo.hash).split(';');
      var hash = '#';
      var paths = [];

      for (var i = 0; i < hashPaths.length; i++) {
        var frameName = hashPaths[i].split('?')[0].split('&')[0];
        var state = layerJS.getState();
        var resolvedPaths = state.resolvePath(frameName);

        for (var x = 0; x < resolvedPaths.length; x++) {
          var resolvedPath = resolvedPaths[x];
          // if a frame and layer is found, add it to the list
          if (resolvedPath.hasOwnProperty('frameName') && resolvedPath.hasOwnProperty('layer')) {
            // push layer path and frameName ( can't use directly the view because !right will not resolve in a view)
            paths.push(state.buildPath(resolvedPath.layer.outerEl, false) + '.' + resolvedPath.frameName);
            var parsed = urlHelper.parseStringForTransitions(hashPaths[x]);
            options.transitions.push(parsed.transition);
          }
        }

        if (undefined === resolvedPaths || resolvedPaths.length === 0) {
          hash = hash + ((hash !== '#') ? ';' : '') + hashPaths[x];
        }
      }

      // remove the resolved paths from the hash
      options.url = urlInfo.location + ((urlInfo.queryString.length > 0) ? '?' : '') + urlInfo.queryString + hash;

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
