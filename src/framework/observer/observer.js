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
  isObserving: function() {
    return this.counter === 0;
  },
  /**
   * Will invoke the callBack if all condition are ok
   *
   * @param {object} result - changes that the observer has detected
   */
  _invokeCallBack: function(result) {
    if (this.options.attributeFilter && result.attributes.length > 0) {
      var attributes = [];

      for (let i = 0; i < result.attributes.length; i++) {
        var attribute = result.attributes[i].toUpperCase();

        for (let x = 0; x < this.options.attributeFilter.length; x++) {
          let attributeFiltered = this.options.attributeFilter[x].toUpperCase();
          // attribute match filter or attribute match filter that ends with '*'
          let isMatch = attributeFiltered === attribute || (attributeFiltered.endsWith('*') && attribute.startsWith(attributeFiltered.slice(0, -1)));
          if (isMatch) {
            attributes.push(result.attributes[i]);
          }
        }
      }

      result.attributes = attributes;
    }

    if (this.options.callback && (result.attributes.length > 0 || result.addedNodes.length > 0 || result.removedNodes.length > 0 || result.characterData)) {
      this.options.callback(result);
    }
  }
});

module.exports = Observer;
