'use strict';
var Observer = require('./observer.js');

var SizeObserver = Observer.extend({
  constructor: function(element, options) {
    Observer.call(this, element, options);
    this.dimensions = undefined;
  },
  /**
   * Register the dimensions
   *
   */
  observe: function() {
    if (this.counter !== 0) {
      this.counter--;
    }

    if (this.counter === 0) {
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

    if (this.counter === 1) {
      clearTimeout(this.myTimeout);
      this.myTimeout = undefined;
    }
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
      this._invokeCallBack();

    }

    var that = this;
    this.myTimeout = setTimeout(function() {
      that.checkSize();
    }, this.options.timeout || 100);
  }
});

module.exports = SizeObserver;
