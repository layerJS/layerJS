'use strict';
var Kern = require('../kern/Kern.js');

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
      if (that.layer.nativeScroll) {
        that.layer.currentFrameTransformData.scrollX = that.layer.outerEl.scrollLeft;
        that.layer.currentFrameTransformData.scrollY = that.layer.outerEl.scrollTop;
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
    // first: calculate primary direction
    if (true) { // check if can scroll
      if (this.layer.nativeScroll) {
        return true; //let the browser do the work
      }
      // project to primary direction
      // var newX = (gesture.axis!=='y' ? this.scrollStartX - gesture.shift.x / tfd.scale : this.scrollStartX;
      // var newY = (gesture.axis!=='x' ? this.scrollStartY - gesture.shift.y / tfd.scale : this.scrollStartY;
      var newX = this.scrollStartX - gesture.shift.x / tfd.scale;
      var newY = this.scrollStartY - gesture.shift.y / tfd.scale;
      var borderX = gesture.axis === 'y', // indicate that we cannot scroll in 'x' direction
        borderY = gesture.axis === 'x'; // indicate that we cannot scroll in 'y' direction
      if (tfd.isScrollX) {
        if (newX < 0) {
          newX = 0;
          if (this.scrollStartX === 0) {
            borderX = true;
          }
        }
        if (newX > tfd.maxScrollX) {
          newX = tfd.maxScrollX;
          if (this.scrollStartX === tfd.maxScrollX) {
            borderX = true;
          }
        }
      } else {
        newX = 0;
        borderX = true;
      }
      if (tfd.isScrollY) {
        if (newY < 0) {
          newY = 0;
          if (this.scrollStartY === 0) {
            borderY = true;
          }
        }
        if (newY > tfd.maxScrollY) {
          newY = tfd.maxScrollY;
          if (this.scrollStartY === tfd.maxScrollY) {
            borderY = true;
          }
        }
      } else {
        newY = 0;
        borderY = true;
      }
      if (borderX && borderY) { // we cannot scroll -> return false to let layer go into swiping
        return false;
      }
      return this.scrollTransform(-(tfd.scrollX = newX) * tfd.scale, -(tfd.scrollY = newY) * tfd.scale);
    }
    return false;
  },
  switchNativeScroll: function(nativeScroll) { //jshint ignore:line

  },
  /**
   * Calculate the scroll transform and, in case of native scrolling, set the inner dimensions and scroll position.
   *
   * @param {Object} tfd - the transformdata of the frame for which the scrolling should be calculated / set

   * @returns {Type} Description
   */
  getScrollTransform: function(tfd, scrollX, scrollY, intermediate) {
    if (this.layer.nativeScroll) {
      if (intermediate) {
        // in nativescroll, the scroll position is not applied via transform, but we need to compensate for a displacement due to the different scrollTop/Left values in the current frame and the target frame. This displacement is set to 0 after correcting the scrollTop/Left in the transitionEnd listener in transitionTo()
        var shiftX = this.layer.outerEl.scrollLeft - ((scrollX || tfd.scrollX) * tfd.scale || 0);
        var shiftY = this.layer.outerEl.scrollTop - ((scrollY || tfd.scrollY) * tfd.scale || 0);
        return this.scrollTransform(shiftX, shiftY);
      } else {
        // set inner size to set up native scrolling
        // FIXME: we shouldn't set the dimension in that we don't scroll
        if (tfd.isScrollY) {
          this.layer.innerEl.style.height = tfd.height;
        } else {
          this.layer.innerEl.style.height = "100%";
        }
        if (tfd.isScrollX) {
          this.layer.innerEl.style.width = tfd.width;
        } else {
          this.layer.innerEl.style.width = "100%";
        }
        // apply inital scroll position
        this.layer.outerEl.scrollLeft = (scrollX || tfd.scrollX) * tfd.scale;
        this.layer.outerEl.scrollTop = (scrollY || tfd.scrollY) * tfd.scale;
        return this.scrollTransform(0, 0); // no transforms as scrolling is achieved by native scrolling
      }
    } else {
      this.layer.innerEl.style.height = 0;
      this.layer.innerEl.style.width = 0;

      // in transformscroll we add a transform representing the scroll position.
      return this.scrollTransform(-(scrollX || tfd.scrollX) * tfd.scale, -(scrollY || tfd.scrollY) * tfd.scale);
    }
  }
});

module.exports = ScrollTransformer;
