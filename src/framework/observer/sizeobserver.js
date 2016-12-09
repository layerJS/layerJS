'use strict';
var Kern = require('../../kern/kern.js');

var SizeObserver = Kern.Base.extend({
  constructor: function(element, options) {
    this.element = element;
    this.options = options || {};
    this.dimensions = undefined;
    this.counter = 0;
  },
  /**
   * Register the dimensions
   *
   */
  observe: function() {
    if (this.counter !== 0) {
      this.counter--;
    }

    if (this.counter === 0 && !this.isObserving()) {
      this.dimensions = {
        size_inner: {
          width: this.element.scrollWidth,
          height: this.element.scrollHeight
        },
        size: {
          width: this.element.clientWidth,
          height: this.element.clientHeight
        }
      };

      this.checkSize();
    }
  },
  /**
   * Stop observing the size
   *
   */
  stop: function() {
    this.counter++;

    if (this.isObserving()) {
      clearTimeout(this.myTimeout);
      this.myTimeout = undefined;
    }
  },
  /**
   * Checks if the observer is observing
   *
   * @returns {bool} returns true if observer is observing
   */
  isObserving: function() {
    return this.myTimeout !== undefined;
  },
  /**
   * Will check if dimensions are changed for specified views
   *
   */
  checkSize: function() {

    var el = this.element;
    var iwidth = el.scrollWidth;
    var iheight = el.scrollHeight;
    var width = el.clientWidth;
    var height = el.clientHeight;
    if (width !== this.dimensions.size.width || height !== this.dimensions.size.height || iwidth !== this.dimensions.size_inner.width || iheight !== this.dimensions.size_inner.height) {
      this.dimensions.size = {
        width: width,
        height: height
      };
      this.dimensions.size_inner = {
        width: iwidth,
        height: iheight
      };
      this.options.callback();
    }

    var that = this;
    this.myTimeout = setTimeout(function() {
      that.checkSize();
    }, this.options.timeout || 100);
  }
});

module.exports = SizeObserver;
