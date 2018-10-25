'use strict';
var Kern = require('../../kern/Kern.js');
var Gesture = require('./gesture.js');
var layerJS = require('../layerjs.js');

var GestureManager = Kern.EventManager.extend({
  constructor: function () {
    this.gesture = null;
    this.element = null;
    this.gesturecc = 0;
    this.timeoutWheel = null;

  },
  /**
   * Will register a layerView for events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  register: function (element, callback, options) {
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
  _registerWheelEvents: function (element, callback, options) {
    var that = this;
    var wheel = function (e) {
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
  _registerTouchEvents: function (element, callback, options) {
    var that = this;
    var tap = function (e) {
      return that._tap(e, element, callback, options);
    };
    var drag = function (e) {
      return that._drag(e, element, callback, options);
    };
    var release = function (e) {
      return that._release(e, element, callback, options);
    };

    if (typeof window.ontouchstart !== 'undefined') {
      element.addEventListener('touchstart', tap);
      element.addEventListener('touchend', release);
      if (options.dragging) {
        element.addEventListener('touchmove', drag);
      }
    }

    if (options.mouseDragging) {
      element.addEventListener('mousedown', tap);
      element.addEventListener('mouseup', release);
      if (options.dragging) {
        element.addEventListener('mousemove', drag);
      }
    }
  },
  /**
   * Users starts a wheel event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _wheel: function (event, element, callback, options) { //jshint unused:false
    var that = this;

    if (this.timeoutWheel) {
      clearTimeout(this.timeoutWheel);
    }
    // WARN: temporarily always create a new gesture on every wheel event. The gesture continuation leads
    // to hanging if gesture canceling is implemented
    if (true || !this.gesture || !this.gesture.wheel || this.element !== element) {
      this.gesture = new Gesture();
      this.gesture.wheel = !event.ctrlKey;
      this.gesture.isScale = event.ctrlKey;
      this.gesture.first = true;
      this.gesture.start.x = this.gesture.position.x = this._xPosition(event);
      this.gesture.start.y = this.gesture.position.y = this._yPosition(event);
      this.element = element;
      this._raiseGesture(event, callback); // first
      //    } else {
      //      this.gesture.startTime = new Date().getTime();
    }
    this.gesture.first = false;
    this.gesture.wheelDelta = this._wheelDelta(event);

    if (this.gesture.isScale) {
      this.gesture.scale-= 1/((this.gesture.wheelDelta.y < 0 ? 1 : 0) + this.gesture.wheelDelta.y * 0.2); 
    }
    else{      
      this.gesture.position = {
        x: this.gesture.position.x + this.gesture.wheelDelta.x * 6,
        y: this.gesture.position.y + this.gesture.wheelDelta.y * 6
      };
      this.gesture.shift = {
        x: this.gesture.position.x - this.gesture.start.x,
        y: this.gesture.position.y - this.gesture.start.y
      };
    }
    // temporary set gesture.last here as gesture continuation has been disabled
    this.gesture.last = true;
    this._raiseGesture(event, callback);
    // var thisgesture = this.gesturecc;
    // this.gesturecc++;
    // this.timeoutWheel = setTimeout(function() {
    //   if (that.gesture && that.gesture.wheel && that.gesture.gesturecc === thisgesture) {
    //     that.gesture = that.element = null; // FIXME we need to notify the listener that this gesture ended (either by sending another gesture with .last set or .cancel )
    //   }
    //   that.timeoutWheel = null;
    // }, 300);

    return false;
  },
  /**
   * return the wheel delta for the x- and y-axis
   * @param {event} Actual dom event
   */
  _wheelDelta: function (event) {
    var wheelDelta = {
      x: 0,
      y: 0
    };

    if (event.deltaY !== undefined && event.deltaX !== undefined) {
      wheelDelta.y = -event.deltaY / 3;
      wheelDelta.x = -event.deltaX / 3;
    } else if (event.wheelDeltaY !== undefined && event.wheelDeltaX !== undefined) {
      wheelDelta.y = -event.wheelDeltaY / 120;
      wheelDelta.x = -event.wheelDeltaX / 120;
    } else if (event.detail !== undefined) {
      // doesn't have an x and y variant, so by default we use it for the y axis
      wheelDelta.Y = -event.detail / 3;
    }
    return wheelDelta;
  },
  /**
   * Users starts a touch event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _tap: function (event, element, callback, options) { //jshint unused:false
    this.element = element;
    this.gesture = new Gesture();
    this.gesture.first = true;
    this.gesture.start.x = this._xPosition(event);
    this.gesture.start.y = this._yPosition(event);
    this.gesture.touch = event.type !== "mousedown";
    this.gesture.click = event.type === "mousedown";
    this._raiseGesture(event, callback);

    return false;
  },
  /**
   * Users stops a touch event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _release: function (event, element, callback, options) { //jshint unused:false
    this.gesture.move = false;
    this.gesture.last = true;
    this.gesture.position.x = this._xPosition(event);
    this.gesture.position.y = this._yPosition(event);
    this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
    this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;

    this._raiseGesture(event, callback);

    this.gesture = this.element = null;
    return false;
  },
  /**
   * Users is dragging
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _drag: function (event, element, callback, options) { //jshint unused:false
    if (this.gesture !== null && (this.gesture.click || this.gesture.touch)) {
      this.gesture.first = false;
      this.gesture.move = true;
      this.gesture.position.x = this._xPosition(event);
      this.gesture.position.y = this._yPosition(event);
      this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
      this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;
      this._raiseGesture(event, callback);
    }
    return false;
  },

  /**
   * Will get the Y postion (horizontal) of an avent
   * @param {event} Actual dom event
   */
  _yPosition: function (event) {
    // touch event
    if (event.targetTouches && (event.targetTouches.length >= 1)) {
      return event.targetTouches[0].clientY;
    } else if (event.changedTouches && (event.changedTouches.length >= 1)) {
      return event.changedTouches[0].clientY;
    }

    // mouse event
    return event.clientY;
  },
  /**
   * Will get the X postion (vertical) of an avent
   * @param {event} Actual dom event
   */
  _xPosition: function (event) {
    // touch event
    if (event.targetTouches && (event.targetTouches.length >= 1)) {
      return event.targetTouches[0].clientX;
    } else if (event.changedTouches && (event.changedTouches.length >= 1)) {
      return event.changedTouches[0].clientX;
    }

    // mouse event
    return event.clientX;
  },
  /**
   * Passes the gesture to the callback method
   * @param {callback} The callback method
   */
  _raiseGesture: function (event, callback) {
    if (callback && this.gesture) {
      this.gesture.event = event;
      if (!this.gesture.direction) { // is direction locked?
        var x = this.gesture.shift.x;
        var y = this.gesture.shift.y;
        if (this.gesture.enoughDistance()) { // has it moved considerably to lock direction?
          if (Math.abs(x) > Math.abs(y)) {
            this.gesture.direction = (x < 0 ? 'left' : 'right');
            this.gesture.axis = 'x';
          } else {
            this.gesture.direction = (y < 0 ? 'up' : 'down');
            this.gesture.axis = 'y';
          }
        }
      }
      // console.log(this.gesture.shift.x, this.gesture.shift.y);
      callback(this.gesture);

      if (this.gesture.preventDefault) { // should we stop propagation and prevent default?
        // console.log("gesturemanager: preventing default");
        event.preventDefault();
        event.stopPropagation();
      }
      if (this.gesture.cancelled) {
        // console.log("gesture cancelled");
        this.gesture = this.element = null;
      }
    }
  }
});

layerJS.gestureManager2 = new GestureManager();

module.exports = layerJS.gestureManager2;