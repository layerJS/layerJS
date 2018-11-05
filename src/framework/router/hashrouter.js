'use strict';
var Kern = require('../../kern/Kern.js');
var $ = require('../domhelpers.js');

var HashRouter = Kern.EventManager.extend({
  /**
   * Will do the actual navigation to a hash
   * @param {Object} options
   * @return {boolean} True if the router handled the url
   */
  handle: function(options) {

    var promise = new Kern.Promise();

    if (options.hash === undefined || options.hash === '#' || options.hash === '') {
      // not the same file or no hash in href
      promise.resolve({
        handled: false,
        stop: false,
        paths: []
      });
    } else {
      // split hash part by ";". This allows different transitions at the same time "#frame1&t=1s&p=left;menu&t=0.5"
      var hashPaths = (options.hash.startsWith('#') ? options.hash.substr(1) : options.hash).split(';');
      var paths = [];
      var transitions = [];
      var state = layerJS.getState();

      var filterFramesWithSameLayer = function(layerPath) {
        return function(framePath) {
          return layerPath === framePath.replace(/\.[^\.]*$/, '');
        };
      };

      for (var i = 0; i < hashPaths.length; i++) {
        var hashPath = hashPaths[i].split('?')[0].split('&')[0].replace('(', '').replace(')', '');
        var parsed = $.parseStringForTransitions(hashPaths[i]);
        var resolved = false;
        try {
          var resolvedPaths = state.resolvePath(hashPath);

          for (var x = 0; x < resolvedPaths.length; x++) {
            var resolvedPath = resolvedPaths[x];
            // if a frame and layer is found, add it to the list
            if (resolvedPath.hasOwnProperty('frameName') && resolvedPath.hasOwnProperty('layer')) {
              // push layer path and frameName ( can't use directly the view because !right will not resolve in a view)
              paths.push(resolvedPath.path);
              transitions.push(Kern._extend(options.globalTransition, parsed.transition));
              resolved = true;
            }
          }
        } catch (e) {

        }
        if (!resolved) {
          // if we didn't find any frame try to find a matching anchor element
          // an anchorId will be the first one in the list
          // check if it is an anchor element
          var anchor = document.getElementsByName(hashPath);
          anchor = anchor && anchor[0] || document.getElementById(hashPath); //anchor name or id
          // only proceed when an element is found and if that element is visible
          if (anchor && window.getComputedStyle(anchor).display !== 'none') {
            var frameView = $.findParentViewOfType(anchor, 'frame'); // the frame that contains the anchor
            // parent of the element has to be a frame
            if (undefined !== frameView) { // is part of a frame
              var transition;
              var path = state.buildPath(frameView.outerEl, false);
              var index = paths.indexOf(path);
              // check if there is already a transition path for this frame
              // FIXME: this only works if that path has been found already in this hashrouter run
              if (index !== -1) {
                // path found, reuse transition record
                // this happens when you want to go to a new frame and immideately scroll to an anchor. "#framename;#anchorname"
                transition = transitions[index];
              } else if (index === -1) {
                // check is the layer is getting a new current frame an verify if anchor also exists
                // in the new frame
                // FIXME: i don't know why this branch is here. The index!==-1 branch should already find a new current frame with the anchor inside. Why searching for the anchor again in another frame in the same layer??????
                var layerPath = path.replace(/\.[^\.]*$/, '');
                var framesWithSameLayer = options.paths.filter(filterFramesWithSameLayer(layerPath)); // find frames that will be transitoned to in the same layer as the frame which contains the anchor

                if (framesWithSameLayer.length === 1) {
                  var frameViewTemp = state.resolvePath(framesWithSameLayer[0])[0].view; // get the first of those frames
                  var anchorTemp = frameViewTemp.outerEl.querySelectorAll('[name=' + hashPath + '], #' + hashPath); // get the anchor element in that frame (name or id)
                  anchorTemp = anchorTemp && anchorTemp[0]; 

                  if (anchorTemp && window.getComputedStyle(anchorTemp).display !== 'none') { // if we have an anchor in this frame
                    var hidden = window.getComputedStyle(frameViewTemp.outerEl).display === 'none';

                    if ( hidden) // temporarily display the frame if hidden
                    {
                      frameViewTemp.outerEl.style.opacity = 0;
                      frameViewTemp.outerEl.style.display = '';
                    }

                      anchor = anchorTemp;
                      index = options.paths.indexOf(framesWithSameLayer[0]);
                      transition = options.transitions[index]; // get the transition record of the new frame

                      anchor = { // create fake anchor element with offsets
                        offsetTop: anchorTemp.offsetTop,
                        offsetLeft: anchorTemp.offsetLeft
                      };

                      if (hidden) // hide frame again
                      {
                        frameViewTemp.outerEl.style.display = 'none';
                        frameViewTemp.outerEl.style.opacity = 1;
                      }
                  }
                }
              }

              if (index === -1 && frameView.parent.currentFrame === frameView) { // if nothing is found; wee need to add a new path to the current frame with the transtion to the new sroll positions
                // if frame is active, add path and transition record
                paths.push(state.buildPath(frameView.outerEl, false));
                transition = Kern._extend({}, options.globalTransition, parsed.transition);
                transitions.push(transition);
              }
              // add scroll position of anchor to the transition record
              if (transition) {
                transition.scrollY = anchor.offsetTop;
                transition.scrollX = anchor.offsetLeft;
              }
            }
          }
        }
      }

      promise.resolve({
        stop: false,
        handled: paths.length > 0,
        paths: paths,
        transitions: transitions
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
    var state = layerJS.getState();
    var paths = [];

    for (var i = 0; i < options.state.length; i++) {
      // try to make the hash path as small as possible (still state.resolvePath should just return 1 path )
      var splittedPath = options.state[i].split('.');
      var path = undefined;
      var resolvedPaths = undefined;
      var ok = false;
      do {
        path = splittedPath.pop() + (path ? '.' + path : '');
        resolvedPaths = state.resolvePath(path);

        if (resolvedPaths.length === 1) { // if this returns 1 then the path is unique
          ok = true;
          path = resolvedPaths[0].view && resolvedPaths[0].view.originalParent && resolvedPaths[0].view.originalParent !== resolvedPaths[0].view.parent ? options.state[i] : path;
        }
      }
      while (!ok && splittedPath.length > 0);

      if (ok) {
        paths.push(path);
        options.state.splice(i, 1);
        i--;
      }
    }

    // NOTE: reset hash part; removes als all non-layerjs parts; not sure this is good or not.
    options.hash = paths.join(';');
  }
});

module.exports = HashRouter;
