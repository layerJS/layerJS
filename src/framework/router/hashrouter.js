'use strict';
var Kern = require('../../kern/Kern.js');
var urlHelper = require('../urlhelper.js');
var $ = require('../domhelpers.js');
var defaults = require('../defaults.js');

var HashRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to a hash
   * @param {UrlData} an url
   * @return {boolean} True if the router handled the url
   */
  handle: function(url, options) {

    var promise = new Kern.Promise();
    var urlInfo = urlHelper.splitUrl(url);

    if (urlInfo.hash === undefined || urlInfo.hash === '#' || urlInfo.hash === '') {
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
      var state = layerJS.getState();

      for (var i = 0; i < hashPaths.length; i++) {
        if (0 === i) {
          // an anchorId will be the first one in the list
          // check if it is an anchor element
          var anchor = document.getElementById(hashPaths[i]);
          // only proceed when an element is found and if that element is visible
          if (anchor && window.getComputedStyle(anchor).display !== 'none') {
            var frameView = $.findParentViewOfType(anchor, 'frame');
            // parent of the element has to be a frame
            if (undefined !== frameView) {
              var transition;
              var path = state.buildPath(frameView.outerEl, false);
              var index = options.paths.indexOf(path);
              // check if there is already a transition path for this frame
              if (index !== -1) {
                // path found, reuse transition record
                transition = options.transions[index];
              } else if (frameView.parent.currentFrame === frameView) {
                // if frame is active, add path and transition record
                paths.push(state.buildPath(frameView.outerEl, false));
                transition = Kern._extend({}, options.globalTransition);
                options.transitions.push(transition);
              }

              var clientRect = anchor.getBoundingClientRect(),
                bodyRect = document.body.getBoundingClientRect();
              transition.scrollY = clientRect.top - bodyRect.top;
              transition.scrollX = clientRect.left - bodyRect.left;

              continue;
            }
          }
        }

        var frameName = hashPaths[i].split('?')[0].split('&')[0];
        var resolvedPaths = state.resolvePath(frameName);

        for (var x = 0; x < resolvedPaths.length; x++) {
          var resolvedPath = resolvedPaths[x];
          // if a frame and layer is found, add it to the list
          if (resolvedPath.hasOwnProperty('frameName') && resolvedPath.hasOwnProperty('layer')) {
            // push layer path and frameName ( can't use directly the view because !right will not resolve in a view)
            paths.push(state.buildPath(resolvedPath.layer.outerEl, false) + '.' + resolvedPath.frameName);
            var parsed = urlHelper.parseStringForTransitions(hashPaths[x]);
            options.transitions.push(Kern._extend(options.globalTransition, parsed.transition));
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
  },
  /**
   * Will try to resolve the hash part for the url
   *
   * @param {Object} options - contains a url and a state (array)
   * @returns {Promise} a promise that will return the HTML document
   */
  buildUrl: function(options) {
    var hash = '';
    var state = layerJS.getState();
    var paths = [];

    for (var i = 0; i < options.state.length; i++) {
      if (options.state[i].endsWith(defaults.specialFrames.default)) {
        // default frames should not be in the hash
        continue;
      }

      // try to make the hash path as small as possible (hench state.resolvePath should just return 1 path )
      var splittedPath = options.state[i].split('.');
      var path = undefined;
      var ok = false;
      do {
        path = splittedPath.pop() + (path ? '.' + path : '');
        ok = state.resolvePath(path).length === 1;
      }
      while (!ok && splittedPath.length > 0);

      if (ok) {
        paths.push(path);
        options.state.splice(i, 1);
        i--;
      }
    }

    if (paths.length > 0) {
      hash = paths.join(';');
      var parsedUrl = urlHelper.splitUrl(options.url);
      parsedUrl.hash = '#' + hash;
      options.url = parsedUrl.location + parsedUrl.queryString + parsedUrl.hash;
    }
  }
});

module.exports = HashRouter;
