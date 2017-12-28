'use strict';
var ElementObserver = require('./elementobserver.js');

/**
 * Will observer the attributes and children of a DOM Element. This class
 * will not use the MutationObserver but will use a timeout to periodically
 * check the DOM ELement for modifications.
 */
var TimeoutObserver = ElementObserver.extend({
  constructor: function(element, options) {
    ElementObserver.call(this, element, options);
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
      attributes: {},
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
          result.attributes[attribute.name] = {
            oldValue: undefined,
            newValue: attribute.value
          };
          this.attributes[attribute.name] = attribute.value;

        } else if (this.attributes[attribute.name] !== attribute.value) {
          // attribute is mapped but value has changed
          result.attributes[attribute.name] = {
            oldValue: this.attributes[attribute.name],
            newValue: attribute.value
          };
          this.attributes[attribute.name] = attribute.value;
        }
        found[attribute.name] = true;
      }

      // detect deleted attributes
      for (attributeName in found) {
        if (found.hasOwnProperty(attributeName) && !found[attributeName]) {
          result.attributes[attributeName] = {
            oldValue: this.attributes[attributeName],
            newValue: undefined
          };
          delete this.attributes[attributeName];
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

    this._invokeCallBack(result);

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

      if (this.element.nodeType === 1 && this.options.attributes) {
        this._initalizeAttributes();
      }

      if (this.element.nodeType === 3) {
        this.characterData = this.element.data;
      }

      this.childNodes = [];
      this.myTimeout = undefined;

      var length = this.element.childNodes.length;
      for (var i = 0; i < length; i++) {
        this.childNodes.push(this.element.childNodes[i]);
      }

      var that = this;
      this.myTimeout = setTimeout(function() {
        that.elementModified();
      }, this.options.timeout || 25);
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
