'use strict';
var Kern = require('../../kern/kern.js');

var Observer = Kern.Base.extend({
  constructor: function(element, options) {
    options = options || {};
    this.element = element;
    this.options = options;
    this.counter = 0;
  },
  /**
   * Starts the observer   
   */
  observe: function() {
    throw 'not implemented';
  },
  /**
   * Stops the observer
   */
  stop: function() {
    throw 'not implemented';
  },
  /**
   * Checks if the observer is observing
   *
   * @returns {bool} returns true if observer is observing
   */
  isObserving: function(){
    return this.counter === 0;
  }
});

module.exports = Observer;
