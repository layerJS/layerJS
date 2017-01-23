'use strict';
var Observer = require('./observer.js');

/**
 * Base class for observing a DOM Element
 */
var ElementObserver = Observer.extend({
  constructor: function(element, options) {
    this.attributes = {};
    Observer.call(this, element, options);
  },
  /**
   * Will iterate over all the element attributes and will store them. This way
   * the old attribute value can be returned in the callback.
   */
  _initalizeAttributes: function() {
    this.attributes = {};

    var length = this.element.attributes.length;

    for (var i = 0; i < length; i++) {
      var attribute = this.element.attributes[i];
      this.attributes[attribute.name] = attribute.value;
    }
  },
  /**
   * Will invoke the callBack if all condition are ok
   *
   * @param {object} result - changes that the observer has detected
   */
  _invokeCallBack: function(result) {

    if (this.options.attributeFilter && result.attributes && Object.getOwnPropertyNames(result.attributes).length > 0) {
      var attributes = {};

      for (var attributeName in result.attributes) {

        if (result.attributes.hasOwnProperty(attributeName)) {
          var attribute = attributeName.toUpperCase();

          for (var x = 0; x < this.options.attributeFilter.length; x++) {
            var attributeFiltered = this.options.attributeFilter[x].toUpperCase();
            // attribute match filter or attribute match filter that ends with '*'
            var isMatch = attributeFiltered === attribute || (attributeFiltered.endsWith('*') && attribute.startsWith(attributeFiltered.slice(0, -1)));

            // when lj-attrbute is passed, also filter for data-lj-attribute
            if (!isMatch && attributeFiltered.startsWith('LJ-')) {
              attributeFiltered = 'DATA-' + attributeFiltered;
              isMatch = attributeFiltered === attribute || (attributeFiltered.endsWith('*') && attribute.startsWith(attributeFiltered.slice(0, -1)));
            }

            if (isMatch) {
              attributes[attributeName] = result.attributes[attributeName];
            }
          }
        }
      }

      result.attributes = attributes;
    }

    if (this.options.callback && ((result.attributes && Object.getOwnPropertyNames(result.attributes).length > 0) || (result.addedNodes && result.addedNodes.length > 0) || (result.removedNodes && result.removedNodes.length > 0) || result.characterData)) {
      this.options.callback(result);
    }
  }
});

module.exports = ElementObserver;
