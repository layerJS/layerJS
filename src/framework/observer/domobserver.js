'use strict';
var Kern = require('../../kern/Kern.js');
//var $ = require('./domhelpers.js');
var observerFactory = require('./observerfactory.js');

var DOMObserver = Kern.EventManager.extend({
  constructor: function() {
    Kern.EventManager.call(this);
  },
  _domElementChanged: function(result) {
    if (result.attributes.length > 0) {
      this.trigger('attributesChanged', result.attributes);
    }

    if (result.removedNodes.length > 0 || result.addedNodes.length > 0) {
      this.trigger('childrenChanged', {
        addedNodes: result.addedNodes,
        removedNodes: result.removedNodes
      });
    }
  },
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
  unobserve: function() {
    if (this._observer) {
      this._observer.stop();
    }

    if (this._sizeObserver) {
      this._sizeObserver.stop();
    }
  },
  isObserving: function() {
    return (undefined !== this._observer && this._observer.isObserving()) || (undefined !== this._sizeObserver && this._sizeObserver.isObserving());
  }
});

module.exports = DOMObserver;
