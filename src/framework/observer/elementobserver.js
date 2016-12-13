'use strict';
var Observer = require('./observer.js');

var ElementObserver = Observer.extend({
  constructor: function(element, options) {
    Observer.call(this, element, options);
  },
  /**
   * Will invoke the callBack if all condition are ok
   *
   * @param {object} result - changes that the observer has detected
   */
  _invokeCallBack: function(result) {
    if (this.options.attributeFilter && result.attributes.length > 0) {
      var attributes = [];

      for (var i = 0; i < result.attributes.length; i++) {
        var attribute = result.attributes[i].toUpperCase();

        for (var x = 0; x < this.options.attributeFilter.length; x++) {
          var attributeFiltered = this.options.attributeFilter[x].toUpperCase();
          // attribute match filter or attribute match filter that ends with '*'
          var isMatch = attributeFiltered === attribute || (attributeFiltered.endsWith('*') && attribute.startsWith(attributeFiltered.slice(0, -1)));

          // when lj-attrbute is passed, also filter for data-lj-attribute
          if ( !isMatch && attributeFiltered.startsWith('LJ-'))
          {
            attributeFiltered = 'DATA-' + attributeFiltered;
            isMatch = attributeFiltered === attribute || (attributeFiltered.endsWith('*') && attribute.startsWith(attributeFiltered.slice(0, -1)));
          }

          if (isMatch) {
            attributes.push(result.attributes[i]);
          }
        }
      }

      result.attributes = attributes;
    }

    if (this.options.callback && ((result.attributes && result.attributes.length > 0) || (result.addedNodes && result.addedNodes.length > 0) || (result.removedNodes && result.removedNodes.length > 0) || result.characterData)) {
      this.options.callback(result);
    }
  }
});

module.exports = ElementObserver;
