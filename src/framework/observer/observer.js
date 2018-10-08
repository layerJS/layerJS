'use strict';
var Kern = require('../../kern/Kern.js');

/**
 * Base class for an Observer
 */
var Observer = Kern.Base.extend({
  constructor: function(element, options) {
    options = options || {};
    this.element = element;
    this.options = options;
    this.counter = 1;
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
  isObserving: function() {
    return this.counter === 0;
  },
  /**
   * Will invoke the callBack
   */
  _invokeCallBack: function() {
    if (this.options && this.options.callback) {
      this.options.callback();
    }
  }
});

module.exports = Observer;
