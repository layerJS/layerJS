'use strict';
var Kern = require('../../kern/kern.js');

var Gesture = Kern.Base.extend({
  constructor: function() {
    //this.altKey = false;
    this.buttons = [false, false, false];
    this.cancel = false; //
    this.click = false;
    //this.ctrlKey = false;
    //this.dbl = false;
    this.doubleClick = false;
    //this.event = null; // real event
    this.first = false;
    this.id = 0;
    this.last = false;
    //this.lng = false;
    //this.longClick = false;
    this.move = false;
    //this.multi = false;
    //this.rotation = 0;
    //this.scale = 1;

    this.shift = {
      x: 0,
      y: 0
    };
    this.shiftKey = false;
    this.start = {
      x: 0,
      y: 0
    };
    this.startTime = new Date().getTime();
    this.touch = false; // from finger not from mouse
    //this.transform = false;
    this.wheel = false;
    this.wheelDelta = 0; // orginal value from the event
    this.position = {
      x: 0,
      y: 0
    };
  },
  /**
   * Returns how long a go the event got fired
   */
  lifeTime: function() {
    return new Date().getTime() - this.startTime;

  },
  /**
   * Returns if the gesture has made enough distance to lock a direction
   */
  enoughDistance: function() {
    return Math.abs(this.shift.x) + Math.abs(this.shift.y) > 10;
  }
}, {});

module.exports = Gesture;
