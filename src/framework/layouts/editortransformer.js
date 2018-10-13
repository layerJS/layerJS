var ScrollTranformer = require('../scrolltransformer');

var EditorTransformer = ScrollTranformer.extend({
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
    // detect nested scrolling
    if (this._detectInnerScrolling(gesture)) return true;
    // primary direction
    var axis = (Math.abs(gesture.shift.x) > Math.abs(gesture.shift.y) ? "x" : "y");
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
//      if (Math.abs(gesture.shift.x) + Math.abs(gesture.shift.y) < 10) return false;
  
      tfd.scrollX = this.scrollStartX - gesture.shift.x / tfd.scale;
      tfd.scrollY = this.scrollStartY - gesture.shift.y / tfd.scale;
      return this.scrollTransform(-tfd.scrollX * tfd.scale, -tfd.scrollY * tfd.scale);
    }
  },
  getScrollTransform: function(tfd, transition, intermediate) {

    var scrollX = transition.scrollX || tfd.scrollX;
    var scrollY = transition.scrollY || tfd.scrollY;

    if (!intermediate) {
      scrollX = transition.scrollX || tfd.initialScrollX;
      scrollY = transition.scrollY || tfd.initialScrollY;
    }

    // update frameTransformData
    tfd.scrollX = scrollX !== undefined ? scrollX : tfd.scrollX;
    tfd.scrollY = scrollY !== undefined ? scrollY : tfd.scrollY;
    // Note: we don't limit scrolling to frame boundaries
    if (this.layer.nativeScroll()) {
      // this shouldn't happen. native scroll is not supported as we want to scroll outside of the frame
    } else {
      // in transformscroll we add a transform representing the scroll position.
      return this.scrollTransform(-tfd.scrollX * tfd.scale, -tfd.scrollY * tfd.scale);
    }
  }

});

module.exports = EditorTransformer;
