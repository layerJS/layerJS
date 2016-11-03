'use strict';
var Kern = require('../../kern/kern.js');

var SizeObserver = Kern.Base.extend({
  constructor: function(options) {
    options = options || {};
    this.options = options;
    this.views = {};
    this.checkSize();
  },
  /**
   * Register all views to monitor for dimensions changes
   *
   * @param {array} views - An array of layerjs object to monitor
   * @param {function} callBack - function to execute when a change in dimensions is detected
   * @returns {string} the found ViewType
   */
  register: function(views, callBack) {
    var length = views.length;
    for (var i = 0; i < length; i++) {
      var view = views[i];
      this.views[view.data.attributes.id] = {
        view: view,
        callBack: callBack,
        boundingClientRect: view.innerEl.getBoundingClientRect()
      };
    }
  },
  /**
   * Unregister of views to monitor for dimensions changes
   *
   * @param {array} views - An array of layerjs object to unregister
   */
  unregister: function(views) {
    var length = views.length;
    for (var i = 0; i < length; i++) {
      delete this.views[views[i].data.attributes.id];
    }
  },
  /**
   * Will check if dimensions are changed for specified views
   *  
   */
  checkSize: function() {
    for (var viewId in this.views) {
      if (this.views.hasOwnProperty(viewId)) {
        var boundingClientRect = this.views[viewId].view.innerEl.getBoundingClientRect();
        if (boundingClientRect.width !== this.views[viewId].boundingClientRect.width || boundingClientRect.height !== this.views[viewId].boundingClientRect.height) {
          this.views[viewId].boundingClientRect = boundingClientRect;
          this.views[viewId].callBack();
        }
      }
    }

    var that = this;
    setTimeout(function() {
      that.checkSize();
    }, this.options.timeout || 100);
  }
});

module.exports = new SizeObserver();
