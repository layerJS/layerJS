'use strict';
var Kern = require('../../kern/kern.js');

var SizeObserver = Kern.Base.extend({
  constructor: function(options) {
    options = options || {};
    this.options = options;
    this.views = {};
    this.checkSize();
  },
  register: function(view, callBack) {
    this.views[view.data.attributes.id] = {
      view: view,
      callBack: callBack,
      boundingClientRect : view.innerEl.getBoundingClientRect()
    };
  },
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
