'use strict';
var WL = require('./wl.js');

/**
 *  Will attach eventhandlers to identify gestures made on a DOM element
 *
 * @param {Object} element - element to add eventhandlers to
 * @param {func} callback - Function that will be invoked when a gesture is found
 */
var GestureManager = function() {

  /**
   * Method that returns the current location based on an event
   *
   * @returns {Object} - contains coordindates to the current location
   */
  var getTouchLocation = function(e) {
    var x, y;
    if (e.changedTouches) {
      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;
    } else {
      if (e.pageX === undefined && e.clientX !== undefined) {
        eventDoc = e.target.ownerDocument || document;
        doc = eventDoc.documentElement;
        body = eventDoc.body;
        e.pageX = e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
        e.pageY = e.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
      }
      x = e.pageX;
      y = e.pageY;
    }
    return {
      x: x,
      y: y
    };
  };

  var touchStart;

  /**
   * Method that needs to be invoked when an element is touched
   *
   * @param {Object} e - event
   */
  var startTouchHandler = function(e) {
    touchStart = getTouchLocation(e);
  };

  /**
   * Method that needs to be invoked when the touche event is ended
   *
   * @param {Object} e - event
   */
  var endTouchHandler = function(e, callBack) {
    var direction;
    var touchEnd = getTouchLocation(e);
    var distanceX = touchEnd.x - touchStart.x,
      distanceY = touchEnd.y - touchStart.y;

    if (Math.abs(distanceX) >= Math.abs(distanceY)) {
      direction = (distanceX < 0) ? 'left' : 'right'
    } else { // 2nd condition for vertical swipe met
      direction = (distanceY < 0) ? 'up' : 'down'
    }

    if (null != callBack || undefined != callBack) {
      callBack(direction);
    }
  };

  var lastGesture;
  var wheelListener = function(e, callBack) {

    var gesture = (lastGesture && new Date().getTime() - lastGesture.startTime <= 300) ? lastGesture : undefined,
      delta = 0,
      deltaX = 0;

    if (gesture && gesture.scale === undefined) {
      gesture.scale = 1;
    }

    if (e.wheelDelta) { /* IE/Opera. */
      delta = e.wheelDelta / 120;
    } else if (e.detail) { /** Mozilla case. */
      /** In Mozilla, sign of delta is different than in IE.
       * Also, delta is multiple of 3.
       */
      delta = -e.detail / 3;
    }
    // If we have x data we do not want to collect the y data
    // or we will scroll sideways on some cumputers
    if (e.deltaX || e.wheelDeltaX) {
      delta = 0;
      // on my version of Firefox the a deprecated scroll api is
      // only implented sending axis values and only one delta.
    } else if (e.axis == 1) {
      deltaX = delta;
      delta = 0;
    }

    if (e.deltaX || e.deltaY || e.wheelDeltaX || e.wheelDeltaY) {
      if (e.deltaY) delta = e.deltaY / 120;
      if (e.wheelDeltaY) delta = e.wheelDeltaY / 120;
      if (e.deltaX) deltaX = e.deltaX / 120;
      if (e.wheelDeltaX) deltaX = e.wheelDeltaX / 120;
    }

    if (gesture) {
      var distanceX = gesture.deltaX + deltaX,
        distanceY = gesture.delta + delta;
      var direction;
      if (distanceX != 0) {
        direction = (distanceX < 0) ? 'left' : 'right'
      } else if (distanceY != 0) { // 2nd condition for vertical swipe met
        direction = (distanceY > 0) ? 'up' : 'down'
      }

      if (direction)
        callBack(direction);
    } else {
      lastGesture = {
        startTime: new Date().getTime(),
        deltaX: deltaX,
        delta: delta
      };
    }
  };

  var addEventListeners = function(element, callBack) {

    element.addEventListener('touchstart', startTouchHandler, false);
    element.addEventListener('mouseDown', startTouchHandler, false);

    element.addEventListener('touchmove', function(e) {
      e.preventDefault() // prevent scrolling when inside DIV
    }, false)

    element.addEventListener('touchend', function(e) {
      endTouchHandler(e, callBack)
    }, false);
    element.addEventListener('mouseUp', function(e) {
      endTouchHandler(e, callBack)
    }, false);

    element.addEventListener('mousewheel', function(e) {
      wheelListener(e, callBack)
    }, false);
    element.addEventListener('DOMMouseScroll ', function(e) {
      wheelListener(e, callBack)
    }, false);
  };

  this.register = function() {

    var layerElements = document.querySelectorAll("[data-wl-type='layer']");
    var length = layerElements.length;

    for (var i = 0; i < length; i++) {
      var layerElement = layerElements[i];
      addEventListeners(layerElement, function(direction) {
        //console.log(layerElement._wlView);
        var layerView = layerElement._wlView;
        var currentFrameView = layerView.currentFrame;
        var targetFrameName = null;
        console.log(direction);

        switch (direction) {
          case 'up':
            if (currentFrameView.data.attributes.neighbors && typeof currentFrameView.data.attributes.neighbors.u == 'string') {
              targetFrameName = currentFrameView.data.attributes.neighbors.u;
            }
            break;
          case 'down':
            if (currentFrameView.data.attributes.neighbors && typeof currentFrameView.data.attributes.neighbors.d == 'string') {
              targetFrameName = currentFrameView.data.attributes.neighbors.d;
            }
            break;
          case 'left':
            if (currentFrameView.data.attributes.neighbors && typeof currentFrameView.data.attributes.neighbors.l == 'string') {
              targetFrameName = currentFrameView.data.attributes.neighbors.l;
            }
            break;
          case 'right':
            if (currentFrameView.data.attributes.neighbors && typeof currentFrameView.data.attributes.neighbors.r == 'string') {
              targetFrameName = currentFrameView.data.attributes.neighbors.r;
            }
            break;
          default:
        }

        if (null != targetFrameName) {
          console.log('current framename ' + currentFrameView.data.attributes.name);
          console.log('target framename ' + targetFrameName);

          layerView.transitionTo({
            framename: targetFrameName,
            type: direction
          })
        }
      });
    }
  }
};
WL.gestureManager = new GestureManager();
module.exports = WL.gestureManager;
