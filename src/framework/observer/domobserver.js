'use strict';
var Kern = require('../../kern/Kern.js');
var observerFactory = require('./observerfactory.js');


/**
 * Base class that will observe a DOM element for attribute or children changes
 *
 */
var DOMObserver = Kern.EventManager.extend({
  /**
   * Will initialise the DOMObserver
   */
  constructor: function() {
    Kern.EventManager.call(this);
  },
  /**
   * Method that will be called when the DOM element has changed. Will trigger an "attributesChanged" and/or
   * a "childrenChanged" event when needed.
   *
   * @param {Object} result - An object that will contain which attributes have been changed
   *                          and which childnodes have been added or removed.
   */
  _domElementChanged: function(result) {
    if (Object.getOwnPropertyNames(result.attributes).length > 0) {
      this.trigger('attributesChanged', result.attributes);
    }

    if (result.removedNodes.length > 0 || result.addedNodes.length > 0) {
      this.trigger('childrenChanged', {
        addedNodes: result.addedNodes,
        removedNodes: result.removedNodes
      });
    }
  },
  /**
   * Will start observing a DOM Element. Depending on the options it will listen for
   * atribute changes, child changes and size changes.
   *
   * @param {domElement} domElement - the dom element to listen to
   * @param {Object} options - Will contain the option configuration
   */
  observe: function(domElement, options) {
    this.unobserve();
    var that = this;
    if (options.attributes || options.children) {
      this._observer = observerFactory.getObserver(domElement, {
        attributes: options.attributes,
        attributeFilter: options.attributeFilter,
        childList: options.children || false,
        timeout: options.timeout,
        callback: function(result) {
          that._domElementChanged(result);
        }
      });

      this._observer.observe();
    }

    if (options.size) {
      this._sizeObserver = observerFactory.getSizeObserver(domElement, {
        timeout: options.timeout,
        callback: function() {
          that.trigger('sizeChanged');
        }
      });

      this._sizeObserver.observe();
    }

  },
  /**
   * Will stop listening to modifications on the current DOM Element
   */
  unobserve: function() {
    if (this._observer) {
      this._observer.stop();
    }

    if (this._sizeObserver) {
      this._sizeObserver.stop();
    }
  },
  /**
   * Will return if we are observing a DOM Element at the moment
   *
   * @returns {boolean} True if it is still observing
   */
  isObserving: function() {
    return (undefined !== this._observer && this._observer.isObserving()) || (undefined !== this._sizeObserver && this._sizeObserver.isObserving());
  }
});

module.exports = DOMObserver;
