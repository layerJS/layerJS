'use strict';
var Kern = require('../../kern/kern.js');
var Gesture = require('./gesture.js');
var WL = require('../wl.js');

var GestureManager = Kern.EventManager.extend({
  constructor: function() {
    this.gesture = null;
    this.element = null;

    this.timeoutWheel = null;

  },
  /**
   * Will register a layerView for events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  register: function(element, callback, options) {
    options = options || {};
    this._registerTouchEvents(element, callback, options);
    this._registerWheelEvents(element, callback, options);
  },
  /**
   * Will register a layerView for mouse/touche events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _registerWheelEvents: function(element, callback, options) {
    var that = this;
    var wheel = function(e) {
      return that._wheel(e, element, callback, options);
    };

    element.addEventListener('wheel', wheel);
  },
  /**
   * Will register a layerView for mouse/touche events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _registerTouchEvents: function(element, callback, options) {
    var that = this;
    var tap = function(e) {
      return that._tap(e, element, callback, options);
    };
    var drag = function(e) {
      return that._drag(e, element, callback, options);
    };
    var release = function(e) {
      return that._release(e, element, callback, options);
    };

    if (typeof window.ontouchstart !== 'undefined') {
      element.addEventListener('touchstart', tap);
      element.addEventListener('touchend', release);
      if (options.dragging) {
        element.addEventListener('touchmove', drag);
      }
    }

    element.addEventListener('mousedown', tap);
    element.addEventListener('mouseup', release);
    if (options.dragging) {
      element.addEventListener('mousemove', drag);
    }
  },
  /**
   * Users starts a wheel event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _wheel: function(event, element, callback, options) { //jshint unused:false
    var that = this;

    if (this.timeoutWheel) {
      clearTimeout(this.timeoutWheel);
    }

    if (!this.gesture || !this.gesture.wheel || this.element !== element) {
      this.gesture = new Gesture();
      this.gesture.first = true;
      this.gesture.scroll = true;
      this.gesture.start.x = this._xPosition(event);
      this.gesture.start.y = this._yPosition(event);
      this.element = element;
    } else {
      this.gesture.first = false;
      this.gesture.startTime = new Date().getTime();
    }

    this.gesture.wheelDelta = this._wheelDelta(event);

    event.preventDefault();
    event.stopPropagation();

    this._raiseGesture(callback);

    this.timeoutWheel = setTimeout(function() {
      if (that.gesture && that.gesture.wheel && that.gesture.lifeTime() > 300) {
        that.gesture = that.element = null;
      }

      that.timeoutWheel = null;
    }, 300);

    return false;
  },
  /**
   * return the wheel delta
   * @param {event} Actual dom event
   */
  _wheelDelta: function(event) {
    if (event.deltaY) {
      return event.deltaY / 3;
    } else if (event.wheelDelta) {
      return event.wheelDelta / 120;
    } else if (event.detail) {
      return event.detail / 3;
    }
  },
  /**
   * Users starts a touch event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _tap: function(event, element, callback, options) { //jshint unused:false
    this.element = element;
    this.gesture = new Gesture();
    this.gesture.first = true;
    this.gesture.start.x = this._xPosition(event);
    this.gesture.start.y = this._yPosition(event);
    this.gesture.touch = event.type !== "mousedown";
    this.gesture.click = event.type === "mousedown";
    this._raiseGesture(callback);

    event.preventDefault();
    event.stopPropagation();
    return false;
  },
  /**
   * Users stops a touch event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _release: function(event, element, callback, options) { //jshint unused:false
    this.gesture.move = false;
    this.gesture.end = true;
    this.gesture.position.x = this._xPosition(event);
    this.gesture.position.y = this._yPosition(event);
    this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
    this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;

    this._raiseGesture(callback);

    this.gesture = this.element = null;
    event.preventDefault();
    event.stopPropagation();
    return false;
  },
  /**
   * Users is dragging
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _drag: function(event, element, callback, options) { //jshint unused:false
    if (this.gesture !== null && (this.gesture.click || this.gesture.touch)) {
      this.gesture.first = false;
      this.gesture.move = true;
      this.gesture.position.x = this._xPosition(event);
      this.gesture.position.y = this._yPosition(event);
      this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
      this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;
      this._raiseGesture(callback);
    }
    event.preventDefault();
    event.stopPropagation();
    return false;
  },

  /**
   * Will get the Y postion (horizontal) of an avent
   * @param {event} Actual dom event
   */
  _yPosition: function(event) {
    // touch event
    if (event.targetTouches && (event.targetTouches.length >= 1)) {
      return event.targetTouches[0].clientY;
    }

    // mouse event
    return event.clientY;
  },
  /**
   * Will get the X postion (vertical) of an avent
   * @param {event} Actual dom event
   */
  _xPosition: function(event) {
    // touch event
    if (event.targetTouches && (event.targetTouches.length >= 1)) {
      return event.targetTouches[0].clientX;
    }

    // mouse event
    return event.clientX;
  },
  /**
   * Passes the gesture to the callback method
   * @param {callback} The callback method
   */
  _raiseGesture: function(callback) {
    if (callback && this.gesture) {
      callback(this.gesture);
    }
  }
});

WL.gestureManager2 = new GestureManager();

module.exports = WL.gestureManager2;
