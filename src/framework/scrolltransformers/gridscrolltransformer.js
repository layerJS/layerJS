'use strict';
var $ = require('../domhelpers.js');
var ScrollTransformer = require('./scrolltransformer.js');

/**
 * this is the ScrollTransformer which handles native and transform scrolling for Layers.
 *
 */
var GridScrollTransformer = ScrollTransformer.extend({
  /**
   * create a ScrollTransformer which handles native and transform scrolling for Layers.
   *
   * @param {GridLayout} layout - a reference to the gridlayout
   * @returns {Type} Description
   */
  constructor: function(layout) {
    ScrollTransformer.call(this, layout.layer);
    this._layout = layout;
    this.scrollX = this.scrollY = 0;
  },
  /**
   * Will be invoked when a scroll event is triggered
   *
   */
  _scrollListener: function() {
    if (this.layer.nativeScroll()) {
      this._layout.scrollX = this.layer.outerEl.scrollLeft;
      this._layout.scrollY = this.layer.outerEl.scrollTop;
      this.layer.trigger("scroll");
    }
  },
  isScrollX: function() {
    return this._layout.isScrollX;
  },
  isScrollY: function() {
    return this._layout.isScrollY;
  },
  maxScrollX: function() {
    return this._layout.maxScrollX;
  },
  maxScrollY: function() {
    return this._layout.maxScrollY;
  },
  /**
   * calculate current transform based on gesture
   *
   * @param {Gesture} gesture - the input gesture to be interpreted as scroll transform
   * @returns {string} the transform or false to indicate no scrolling
   */
  scrollGestureListener: function(gesture) {

    if (gesture.first) {
      this.scrollStartX = this._layout.scrollX;
      this.scrollStartY = this._layout.scrollY;
      return true;
    }
    // detect nested scrolling
    if (this._detectInnerScrolling(gesture)) return true;
    // primary direction
    var axis = (Math.abs(gesture.shift.x) > Math.abs(gesture.shift.y) ? "x" : "y");
    // check if can't scroll in primary direction
    if (axis === "x" && !this.isScrollX()) return false;
    if (axis === "y" && !this.isScrollY()) return false;
    if (this.layer.nativeScroll()) {
      if (Math.abs(gesture.shift.x) + Math.abs(gesture.shift.y) < 10) return true;
      if (axis === 'y') {
        if (gesture.shift.y > 0) { // Note: gesture.shift is negative
          return this._layout.scrollY > 0; // return true if can scroll; false otherwise
        } else {
          return (this.layer.outerEl.scrollHeight - this.layer.outerEl.clientHeight - 1 > this.layer.outerEl.scrollTop);
        }
      } else if (axis === 'x') {
        if (gesture.shift.x > 0) {
          return this._layout.scrollX > 0;
        } else {
          return (this.layer.outerEl.scrollWidth - this.layer.outerEl.clientWidth - 1 > this.layer.outerEl.scrollLeft);
        }
      }
    } else {
      if (axis === 'y') {
        if (gesture.shift.y > 0) { // Note: gesture.shift is negative
          if (this._layout.scrollY === 0) return false; // return false if cannot scroll
        } else {
          if (this.maxScrollY() - this._layout.scrollY < 1) return false;
        }
      } else if (axis === 'x') {
        if (gesture.shift.x > 0) {
          if (this._layout.scrollX === 0) return false;
        } else {
          if (this.maxScrollX() - this._layout.scrollX < 1) return false;
        }
      }
      this._layout.scrollX = this.scrollStartX - gesture.shift.x;
      this._layout.scrollY = this.scrollStartY - gesture.shift.y;
      if (!this.isScrollX()) this._layout.scrollX = this.scrollStartX;
      if (!this.isScrollY()) this._layout.scrollY = this.scrollStartY;
      if (this._layout.scrollX < 0) this._layout.scrollX = 0;
      if (this._layout.scrollX > this.maxScrollX()) this._layout.scrollX = this.maxScrollX();
      if (this._layout.scrollY < 0) this._layout.scrollY = 0;
      if (this._layout.scrollY > this.maxScrollY()) this._layout.scrollY = this.maxScrollY();
      return this.scrollTransform(-this._layout.scrollX, -this._layout.scrollY);
    }
  },
  /**
   * Calculate the scroll transform and, in case of native scrolling, set the inner dimensions and scroll position.
   *
   * @param {Object} tfd - the transformdata of the frame for which the scrolling should be calculated / set
   * @param {Number} scrollX - the scroll x position in the frame
   * @param {Number} scrollY - the scroll y position in the frame
   * @param {Boolean} intermediate - true if the scroll transform should be calculated before the transition ends.
                                     here, the (possibly wrong/old native scroll position is taken into account)
   * @returns {Type} Description
   */
  getScrollTransform: function(tfd, transition, intermediate) {

    var scrollX = this._layout.scrollX;
    var scrollY = this._layout.scrollY;

    if (transition) {
      scrollX = transition.scrollX || this._layout.scrollX;
      scrollY = transition.scrollY || this._layout.scrollY;
    }

    /*if (!intermediate) {
      scrollX = transition.scrollX || tfd.initialScrollX;
      scrollY = transition.scrollY || tfd.initialScrollY;
    }*/

    // update frameTransformData
    this._layout.scrollX = scrollX !== undefined ? scrollX : tfd.scrollX;
    this._layout.scrollY = scrollY !== undefined ? scrollY : tfd.scrollY;
    // limit scrolling to [0,maxScroll]
    if (this._layout.scrollX > this.maxScrollX()) {
      this._layout.scrollX = this.maxScrollX();
    }
    if (this._layout.scrollY > this.maxScrollY()) {
      this._layout.scrollY = this.maxScrollY();
    }
    if (this._layout.scrollX < 0) {
      this._layout.scrollX = 0;
    }
    if (this._layout.scrollY < 0) {
      this._layout.scrollY = 0;
    }
    if (this.layer.nativeScroll()) {
      if (intermediate) {
        // in nativescroll, the scroll position is not applied via transform, but we need to compensate for a displacement due to the different scrollTop/Left values in the current frame and the target frame. This displacement is set to 0 after correcting the scrollTop/Left in the transitionEnd listener in transitionTo()
        var shiftX = 0;
        var shiftY = 0;

        shiftX = (this.layer.outerEl.scrollLeft || 0) - (this._layout.scrollX || 0);
        shiftY = (this.layer.outerEl.scrollTop || 0) - (this._layout.scrollY || 0);

        return this.scrollTransform(shiftX, shiftY);
      } else {
        // set inner size to set up native scrolling
        // FIXME: we shouldn't set the dimension in that we don't scroll
        if (this.isScrollY()) {
          this.layer.innerEl.style.height = this.maxScrollY() + "px";
        } else {
          this.layer.innerEl.style.height = "100%";
        }
        if (this.isScrollX()) {
          this.layer.innerEl.style.width = this.maxScrollX() + "px";
        } else {
          this.layer.innerEl.style.width = "100%";
        }
        // apply inital scroll position
        this.layer.outerEl.scrollLeft = this.scrollX;
        this.layer.outerEl.scrollTop = this.scrollY;
        // fix ios scroll bug
        if ($.browser === 'ios') {
          // ios safari will by default not have inertial scrolling on nested scrolling divs
          // this can be activated by -webkit-overflow-scrolling:touch on the container
          // however this introduces a bug: if the content is changed causing a change of the scrolling behaviour
          // e.g. a div smaller than the container enlarges to be larger than the container, the scrolling will not be switch on anymore
          // when temporarily switching off -webkit-overflow-scrolling this will be fixed.
          this.layer.outerEl.style['-webkit-overflow-scrolling'] = "auto";
          var that = this;
          setTimeout(function() {
            that.layer.outerEl.style['-webkit-overflow-scrolling'] = "touch";
          }, 1);
        }
        // needed by iOS safari; otherwise scrolling will be disabled if the scrollhelper was too small for scrolling before
        return this.scrollTransform(0, 0); // no transforms as scrolling is achieved by native scrolling
      }
    } else {
      // in transformscroll we add a transform representing the scroll position.
      return this.scrollTransform(-this._layout.scrollX, -this._layout.scrollY);
    }
  },
  getCurrentScroll: function() {
    return {
      scrollX: this._layout.scrollX,
      scrollY: this._layout.scrollY
    };
  }
});

module.exports = GridScrollTransformer;
