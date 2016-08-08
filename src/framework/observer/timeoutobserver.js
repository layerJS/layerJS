'use strict';
var Observer = require('./observer.js');

var TimeoutObserver = Observer.extend({
  constructor: function(element, options) {
    Observer.call(this, element, options);

    this.attributes = {};
    this.childNodes = [];
    this.characterData = undefined;
    this.myTimeout = undefined;
  },
  /**
 * Checks if the elements has changed. Will call the callback method
 * that is provided in the options
 */
  elementModified: function() {
    var result = {
      attributes: [],
      addedNodes: [],
      removedNodes: [],
      characterData: false
    };

    if (this.options.attributes && this.element.nodeType === 1) {
      var attributeName;
      var found = {};
      for (attributeName in this.attributes) {
        if (this.attributes.hasOwnProperty(attributeName)) {
          found[attributeName] = false;
        }
      }
      for (var index = 0; index < this.element.attributes.length; index++) {
        var attribute = this.element.attributes[index];
        // attribute isn't mapped
        if (!this.attributes.hasOwnProperty(attribute.name)) {
          this.attributes[attribute.name] = attribute.value;
          result.attributes.push(attribute.name);
        } else if (this.attributes[attribute.name] !== attribute.value) {
          // attribute is mapped but value has changed
          result.attributes.push(attribute.name);
        }
        found[attribute.name] = true;
      }

      // detect deleted attributes
      for (attributeName in found) {
        if (found.hasOwnProperty(attributeName) && !found[attributeName]) {
          delete this.attributes[attributeName];
          result.attributes.push(attributeName);
        }
      }
    }

    if (this.options.childList && this.element.nodeType === 1) {
      var i, child;
      //detect delete children
      for (i = 0; i < this.childNodes.length; i++) {
        child = this.childNodes[i];
        if (!this.element.contains(child)) {
          this.childNodes.splice(i, 1);
          result.removedNodes.push(child);
        }
      }
      //detect new children
      for (i = 0; i < this.element.childNodes.length; i++) {
        child = this.element.childNodes[i];
        if (-1 === this.childNodes.indexOf(child)) {
          result.addedNodes.push(child);
          this.childNodes.push(child);
        }
      }
    }

    // detect changes in characterData
    if (this.options.characterData && this.element.nodeType === 3) {
      if (this.characterData !== this.element.data) {
        result.characterData = true;
        this.characterData = this.element.data;
      }
    }

    if (this.options.callback && (result.attributes.length > 0 || result.addedNodes.length > 0 || result.removedNodes.length > 0 || result.characterData)) {
      this.options.callback(result);
    }

    this.observe();
  },
  /**
   * Starts the observer
   */
  observe: function() {
    if (this.counter !== 0) {
      this.counter--;
    }

    if (this.counter === 0) {
      this.attributes = {};
      this.childNodes = [];
      this.myTimeout = undefined;

      if (this.element.nodeType === 1) {
        var length = this.element.attributes.length;
        for (var index = 0; index < length; index++) {
          var attribute = this.element.attributes[index];
          this.attributes[attribute.name] = attribute.value;
        }

        length = this.element.childNodes.length;
        for (var i = 0; i < length; i++) {
          this.childNodes.push(this.element.childNodes[i]);
        }
      } else if (this.element.nodeType === 3) {
        this.characterData = this.element.data;
      }

      var that = this;
      this.myTimeout = setTimeout(function() {
        that.elementModified();
      }, this.options.timeout || 1000);
    }
  },
  /**
   * Stops the observer
   */
  stop: function() {
    this.counter++;
    if (this.myTimeout !== undefined) {
      clearTimeout(this.myTimeout);
      this.myTimeout = undefined;
    }
  }
});

module.exports = TimeoutObserver;
