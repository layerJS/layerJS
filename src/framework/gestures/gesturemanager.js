'use strict';
var Kern = require('../../kern/kern.js');
var Gesture = require('./gesture.js');
var WL = require('../wl.js');

var GestureManager = Kern.EventManager.extend({
  constructor: function() {
    this.gesture = null;
    this.element = null;

  },
  /**
   * Will register a layerView for events
   * @param {layerView} layerView
   */
  register: function(layerView) {
    this._registerTouchEvents(layerView);
  },
  /**
   * Will register a layerView for mouse/touche events
   * @param {layerView} layerView
   */
  _registerTouchEvents: function(layerView) {
    var that = this;
    var tap = function(e) {
      return that._tap(e);
    };
    var drag = function(e) {
      return that._drag(e);
    };
    var release = function(e) {
      return that._release(e);
    };

    var element = layerView;
    if (typeof window.ontouchstart !== 'undefined') {
      element.addEventListener('touchstart', tap);
      element.addEventListener('touchmove', drag);
      element.addEventListener('touchend', release);
    }

    element.addEventListener('mousedown', tap);
    element.addEventListener('mousemove', drag);
    element.addEventListener('mouseup', release);
  },
  /**
   * Users starts a touch event
   * @param {event} Actual dom event
   */
  _tap: function(event) {
    this.element = event.target || event.srcElement;
    this.gesture = new Gesture();
    this.gesture.first = true;
    this.gesture.click = true;
    this.gesture.start.x = this._xPosition(event);
    this.gesture.start.y = this._yPosition(event);
    this.gesture.touch = event.type !== "mousedown";
    //pressed = true;
    //reference = ypos(e);
    event.preventDefault();
    event.stopPropagation();

    this._raiseGesture();
    return false;
  },
  /**
   * Users stops a touch event
   * @param {event} Actual dom event
   */
  _release: function(event) {
    this.gesture.click = false;
    this.gesture.move= false;
    this.gesture.end = true;
    this.gesture.position.x = this._xPosition(event);
    this.gesture.position.y = this._yPosition(event);
    this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
    this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;
    this._raiseGesture();

    this.gesture = this.element = null;
    event.preventDefault();
    event.stopPropagation();
    return false;
  },
  /**
   * Users is dragging
   * @param {event} Actual dom event
   */
  _drag: function(event) {
    if (this.gesture !== null) {
      this.gesture.first = false;
      this.gesture.move = true;
      this.gesture.position.x = this._xPosition(event);
      this.gesture.position.y = this._yPosition(event);
      this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
      this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;
      this._raiseGesture();
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
   * Passes the gesture to the correct layer
   */
  _raiseGesture: function() {
    console.log("Raise Gesture on element " + this.element.id);
    console.log(this.gesture);
    //var wlView = this.element.wlView;
    //wlView.onGesture(this.gesture);
  }
});

WL.gestureManager2 = new GestureManager();

module.exports = WL.gestureManager2;
