'use strict';
var Kern = require('../kern/Kern.js');
var $ = require('./domhelpers.js');

/**
 * this is the ScrollTransformer which handles native and transform scrolling for Layers.
 *
 */
var ScrollTransformer = Kern.EventManager.extend({
  /**
   * create a ScrollTransformer which handles native and transform scrolling for Layers.
   *
   * @param {LayerView} layer - the layer this ScrollTransformer belongs to
   * @returns {Type} Description
   */
  constructor: function(layer) {
    Kern.EventManager.call(this);
    var that = this;
    if (!layer) throw "provide a layer";
    this.layer = layer;

    // listen to scroll events
    this.layer.outerEl.addEventListener('scroll', function() {
      if (that.layer.nativeScroll()) {
        var tfd = that.layer.currentFrameTransformData;
        tfd.scrollX = that.layer.outerEl.scrollLeft / tfd.scale;
        tfd.scrollY = that.layer.outerEl.scrollTop / tfd.scale;
        that.layer.trigger("scroll");
      }
    });
  },

  /**
   * returns a transform for a specified scroll position
   *
   * @param {Number} scrollX - the scroll in x direction
   * @param {Number} scrollY - the scroll in y direction
   * @returns {string} the transform
   */
  scrollTransform: function(scrollX, scrollY) {
    return "translate3d(" + scrollX + "px," + scrollY + "px,0px)";
  },
  /**
   * calculate current transform based on gesture
   *
   * @param {Gesture} gesture - the input gesture to be interpreted as scroll transform
   * @returns {string} the transform or false to indicate no scrolling
   */
  scrollGestureListener: function(gesture) {
    var tfd = this.layer.currentFrameTransformData;
    if (gesture.first) {
      this.scrollStartX = tfd.scrollX;
      this.scrollStartY = tfd.scrollY;
      return true;
    }
    // primary direction
    var axis = (Math.abs(gesture.shift.x) > Math.abs(gesture.shift.y) ? "x" : "y");
    // check if can't scroll in primary direction
    if (axis === "x" && !tfd.isScrollX) return false;
    if (axis === "y" && !tfd.isScrollY) return false;
    if (this.layer.nativeScroll()) {
      if (axis === 'y') {
        if (gesture.shift.y > 0) { // Note: gesture.shift is negative
          return tfd.scrollY > 0; // return true if can scroll; false otherwise
        } else {
          return (this.layer.outerEl.scrollHeight - this.layer.outerEl.clientHeight - 1 > this.layer.outerEl.scrollTop);
        }
      } else if (axis === 'x') {
        if (gesture.shift.x > 0) {
          return tfd.scrollX > 0;
        } else {
          return (this.layer.outerEl.scrollWidth - this.layer.outerEl.clientWidth - 1 > this.layer.outerEl.scrollLeft);
        }
      }
    } else {
      if (axis === 'y') {
        if (gesture.shift.y > 0) { // Note: gesture.shift is negative
          if (tfd.scrollY === 0) return false; // return false if cannot scroll
        } else {
          if (tfd.maxScrollY - tfd.scrollY < 1) return false;
        }
      } else if (axis === 'x') {
        if (gesture.shift.x > 0) {
          if (tfd.scrollX === 0) return false;
        } else {
          if (tfd.maxScrollX - tfd.scrollX < 1) return false;
        }
      }
      tfd.scrollX = this.scrollStartX - gesture.shift.x / tfd.scale;
      tfd.scrollY = this.scrollStartY - gesture.shift.y / tfd.scale;
      if (!tfd.isScrollX) tfd.scrollX = this.scrollStartX;
      if (!tfd.isScrollY) tfd.scrollY = this.scrollStartY;
      if (tfd.scrollX < 0) tfd.scrollX = 0;
      if (tfd.scrollX > tfd.maxScrollX) tfd.scrollX = tfd.maxScrollX;
      if (tfd.scrollY < 0) tfd.scrollY = 0;
      if (tfd.scrollY > tfd.maxScrollY) tfd.scrollY = tfd.maxScrollY;
      return this.scrollTransform(-tfd.scrollX * tfd.scale, -tfd.scrollY * tfd.scale);
    }
  },
  switchNativeScroll: function(nativeScroll) { //jshint ignore:line

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
  getScrollTransform: function(tfd, scrollX, scrollY, intermediate) {
    // update frameTransformData
    tfd.scrollX = scrollX || tfd.scrollX;
    tfd.scrollY = scrollY || tfd.scrollY;
    // limit scrolling to [0,maxScroll]
    if (tfd.scrollX > tfd.maxScrollX) {
      tfd.scrollX = tfd.maxScrollX;
    }
    if (tfd.scrollY > tfd.maxScrollY) {
      tfd.scrollY = tfd.maxScrollY;
    }
    if (tfd.scrollX < 0) {
      tfd.scrollX = 0;
    }
    if (tfd.scrollY < 0) {
      tfd.scrollY = 0;
    }
    if (this.layer.nativeScroll()) {
      if (intermediate) {
        // in nativescroll, the scroll position is not applied via transform, but we need to compensate for a displacement due to the different scrollTop/Left values in the current frame and the target frame. This displacement is set to 0 after correcting the scrollTop/Left in the transitionEnd listener in transitionTo()
        var shiftX = this.layer.outerEl.scrollLeft - (tfd.scrollX * tfd.scale || 0);
        var shiftY = this.layer.outerEl.scrollTop - (tfd.scrollY * tfd.scale || 0);
        return this.scrollTransform(shiftX, shiftY);
      } else {
        // set inner size to set up native scrolling
        // FIXME: we shouldn't set the dimension in that we don't scroll
        if (tfd.isScrollY) {
          this.layer.innerEl.style.height = tfd.height + "px";
        } else {
          this.layer.innerEl.style.height = "100%";
        }
        if (tfd.isScrollX) {
          this.layer.innerEl.style.width = tfd.width + "px";
        } else {
          this.layer.innerEl.style.width = "100%";
        }

        this._nativeScrollTo(tfd.scrollY * tfd.scale, tfd.scrollX * tfd.scale, this.layer.getRemainingTransitionTime());

        return this.scrollTransform(0, 0); // no transforms as scrolling is achieved by native scrolling
      }
    } else {
      // in transformscroll we add a transform representing the scroll position.
      return this.scrollTransform(-tfd.scrollX * tfd.scale, -tfd.scrollY * tfd.scale);
    }
  },
  /**
   * Will get the scroll position of the current frame
   *
   * @returns {object} contains the current scroll positions
   */
  getScrollPosition: function() {
    var result = {
      scrollX: 0,
      scrollY: 0
    };

    var tfd = this.layer.currentFrameTransformData;

    if (this.layer.nativeScroll()) {
      result.scrollX = this.layer.outerEl.scrollLeft / tfd.scale;
      result.scrollY = this.layer.outerEl.scrollTop / tfd.scale;
    } else {
      var bounderies = this.layer.currentFrame.outerEl.getBoundingClientRect();
      result.scrollX = bounderies.left / tfd.scale;
      result.scrollY = bounderies.top / tfd.scale;
    }

    return result;
  },
  /**
   * Will scroll to a specific location
   *
   * @param {Object} tfd - the transformdata of the frame for which the scrolling should be calculated / set
   * @param {Object} transition - contains information about a transition
   * @returns {Promise} returns a promise
   */
  scrollTo: function(tfd, transition) {
    var promise;

    tfd.scrollX = transition.scrollX || tfd.scrollX;
    tfd.scrollY = transition.scrollY || tfd.scrollY;
    // limit scrolling to [0,maxScroll]
    if (tfd.scrollX > tfd.maxScrollX) {
      tfd.scrollX = tfd.maxScrollX;
    }
    if (tfd.scrollY > tfd.maxScrollY) {
      tfd.scrollY = tfd.maxScrollY;
    }
    if (tfd.scrollX < 0) {
      tfd.scrollX = 0;
    }
    if (tfd.scrollY < 0) {
      tfd.scrollY = 0;
    }

    if (this.layer.nativeScroll()) {
      promise = this._nativeScrollTo(tfd.scrollY * tfd.scale, tfd.scrollX * tfd.scale, $.timeToMS(transition.duration));
    } else {
      promise = this._nonNativeScrollTo(tfd.scrollY * tfd.scale, tfd.scrollX * tfd.scale);
    }

    return promise;
  },
  /**
   * Will scroll to a specific location
   *
   * @param {Number} scrollLeft - the scroll in x direction
   * @param {Number} scrollTop - the scroll in y direction
   * @returns {Promise} returns a promise
   */
  _nonNativeScrollTo: function(scrollTop, scrollLeft) {
    var promise = new Kern.Promise();

    var scrollTransform = this.scrollTransform(scrollLeft, scrollTop);

    this.layer._layout.setLayerTransform(scrollTransform);

    setTimeout(function(){
      promise.resolve(scrollTransform);
    }, this.layer.getRemainingTransitionTime());


    return promise;
  },
  /**
   * Will scroll to a specific location
   *
   * @param {Number} scrollLeft - the scroll in x direction
   * @param {Number} scrollTop - the scroll in y direction
   * @returns {Promise} returns a promise
   */
  _nativeScrollTo: function(scrollTop, scrollLeft, duration) {
    var promise = new Kern.Promise();
    var element = this.layer.outerEl;
    duration = Math.round(duration);
    if (duration < 0) {
      promise.reject('invalid duration ' + duration);
      return promise;
    }
    if (duration === 0) {
      element.scrollTop = scrollTop;
      element.scrollLeft = scrollLeft;
      promise.resolve(this.scrollTransform(0, 0));
      return promise;
    }

    var start_time = Date.now();
    var end_time = start_time + duration;

    var start_top = element.scrollTop;
    var start_left = element.scrollLeft;
    var distance_top = scrollTop - start_top;
    var distance_left = scrollLeft - start_left;

    // based on http://en.wikipedia.org/wiki/Smoothstep
    var smooth_step = function(start, end, point) {
      if (point <= start) {
        return 0;
      }
      if (point >= end) {
        return 1;
      }
      var x = (point - start) / (end - start); // interpolation
      return x * x * (3 - 2 * x);
    };

    // This is to keep track of where the element's scrollTop is
    // supposed to be, based on what we're doing
    var previous_top = element.scrollTop;
    var previous_left = element.scrollLeft;

    var scroll_frame = function() {
      if (element.scrollTop !== previous_top || element.scrollLeft !== previous_left) {
        promise.reject('interrupted');
        return promise;
      }

      // set the scrollTop for this frame
      var now = Date.now();
      var point = smooth_step(start_time, end_time, now);
      var frameTop = Math.round(start_top + (distance_top * point));
      var frameLeft = Math.round(start_left + (distance_left * point));
      element.scrollTop = frameTop;
      element.scrollLeft = frameLeft;

      // check if we're done!
      if (now >= end_time) {
        promise.resolve(this.scrollTransform(0, 0));
        return promise;
      }

      // If we were supposed to scroll but didn't, then we
      // probably hit the limit, so consider it done; not
      // interrupted.
      if (element.scrollTop === previous_top &&
        element.scrollTop !== frameTop && element.scrollLeft === previous_left &&
        element.scrollLeft !== frameLeft) {
        promise.resolve();
        return;
      }
      previous_top = element.scrollTop;
      previous_left = element.scrollLeft;

      // schedule next frame for execution
      setTimeout(scroll_frame, 0);
    };

    setTimeout(scroll_frame, 0);

    return promise;
  }
});

module.exports = ScrollTransformer;
