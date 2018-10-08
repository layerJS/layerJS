'use strict';
var ElementObserver = require('./elementobserver.js');

/**
 * Class that will observe a DOM Element using a MutationObserver
 */
var MutationsObserver = ElementObserver.extend({
  constructor: function(element, options) {
    ElementObserver.call(this, element, options);

    var that = this;
    var elementWindow = element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
    this.mutationObserver = new elementWindow.MutationObserver(function(mutations) {
      that.mutationCallback(mutations);
    });
  },
  /**
   * Will analyse if the element has changed. Will call the callback method that
   * is provided in the options.
   */
  mutationCallback: function(mutations) {
    var result = {
      attributes: [],
      addedNodes: [],
      removedNodes: []
    };
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (this.options.attributes && mutation.type === 'attributes') {
        result.attributes[mutation.attributeName] = {
          oldValue: this.attributes[mutation.attributeName],
          newValue: this.element.getAttribute(mutation.attributeName)
        };
        this.attributes[mutation.attributeName] = result.attributes[mutation.attributeName].newValue;
      }
      if (this.options.childList && mutation.type === 'childList') {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (var x = 0; x < mutation.addedNodes.length; x++) {
            result.addedNodes.push(mutation.addedNodes[x]);
          }
        }
        if (mutation.removedNodes && mutation.removedNodes.length > 0) {
          for (var y = 0; y < mutation.removedNodes.length; y++) {
            result.removedNodes.push(mutation.removedNodes[y]);
          }
        }
      }
    }

    this._invokeCallBack(result);
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

      this.mutationObserver.observe(this.element, {
        attributes: this.options.attributes || false,
        childList: this.options.childList || false,
        characterData: this.options.characterData || false
      });
    }
  },
  /**
   * Stops the observer
   */
  stop: function() {
    if (this.counter === 0) {
      this.mutationObserver.disconnect();
    }

    this.counter++;
  }
});

module.exports = MutationsObserver;
