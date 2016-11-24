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
      if (!this.views.hasOwnProperty(view.id()) || this.views[view.id()].callBack !== callBack) { // only register if view does not exist already in list
        this.views[view.id()] = {
          view: view,
          callBack: callBack,
          size_inner: {
            width: view.innerEl.scrollWidth,
            height: view.innerEl.scrollHeight
          },
          size: {
            width: view.innerEl.clientWidth,
            height: view.innerEl.clientHeight
          }
        };
      }
    }
  },
  /**
   * Unregister of views to monitor for dimensions changes
   *
   * @param {array} views - An array of layerjs object to unregister
   */
  unRegister: function(views) {
    var length = views.length;
    for (var i = 0; i < length; i++) {
      delete this.views[views[i].id()];
    }
  },
  /**
   * Will check if dimensions are changed for specified views
   *
   */
  checkSize: function() {
    for (var viewId in this.views) {
      if (this.views.hasOwnProperty(viewId)) {
        var el = this.views[viewId].view.innerEl;
        var iwidth = el.scrollWidth;
        var iheight = el.scrollHeight;
        var width = el.clientWidth;
        var height = el.clientHeight;
        if (width !== this.views[viewId].size.width || height !== this.views[viewId].size.height || iwidth !== this.views[viewId].size_inner.width || iheight !== this.views[viewId].size_inner.height) {
          this.views[viewId].size = {
            width: width,
            height: height
          };
          this.views[viewId].size_inner = {
            width: iwidth,
            height: iheight
          };
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
