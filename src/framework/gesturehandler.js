'use strict';

/**
 *  Will attach eventhandlers to identify gestures made on a DOM element
 *
 * @param {Object} element - element to add eventhandlers to
 * @param {func} callback - Function that will be invoked when a gesture is found
 */
var dectectGestures = function(element, callBack) {

  var touchStart = null;

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
  var endTouchHandler = function(e) {
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

  /**
   * Method  will be called when a mouse wheel event is raised
   *
   * @param {Object} e - event
   */
  var wheellistener = function(e) {

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
      if (Math.abs(distanceX) >= Math.abs(distanceY)) {
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
  }

  element.addEventListener('touchstart', startTouchHandler, false);
  element.addEventListener('mouseDown', startTouchHandler, false);

  element.addEventListener('touchmove', function(e) {
    e.preventDefault() // prevent scrolling when inside DIV
  }, false)

  element.addEventListener('touchend', endTouchHandler, false);
  element.addEventListener('mouseUp', endTouchHandler, false);

  element.addEventListener('mousewheel', wheellistener, false);
  element.addEventListener('DOMMouseScroll ', wheellistener, false);
};

module.exports = dectectGestures;
