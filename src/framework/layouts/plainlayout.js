var WL = require('../wl.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var PlainLayout = LayerLayout.extend({
  /**
   * initalize PlainLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    this.transitions = {
      left: this.swipeTransition,
      right: this.swipeTransition,
      top: this.swipeTransition,
      bottom: this.swipeTransition
    }
  },
  /**
   * initial layout of all visible frames when this layout engine becomes active
   *
   * @returns {Type} Description
   */
  init: function(stage) {
    if (this.layer.currentFrame) {
      var t = this.swipeTransition(undefined, PlainLayout.IT, null, this.layer.currentFrame.getTransformData(stage))
      this.layer.currentFrame.applyStyles(t.t1);
    }
  },
  /**
   * transition to a specified frame with given transition
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - the transition object
   * @returns {Type} Description
   */
  transitionTo: function(frame, transition, currentTransformData, targetTransformData) {
    var finished = new Kern.Promise();
    this.prepareTransition(frame, transition.type, currentTransformData, targetTransformData).then(function(t) {
      frame.elWrapper.addEventListener("transitionEnd", function() { // FIXME needs webkitTransitionEnd etc
        finished.resolve();
      });
      return frame.applyStyles(t.t1);
    });
    return finished;
  },
  /**
   * calculate pre and post transforms for current and target frame
   * needed for swipes
   * make sure targetFrame is at pre position
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - the transition object
   * @returns {Promise} will fire when pre  transform to target frame is applied
   */
  prepareTransition: function(frame, type, currentTransformData, targetTransformData) {
    // call the transition type function to calculate all frame positions/transforms
    var t = this.transitions[type](type, PlainLayout.DT, currentTransformData, targetTransformData);
    // var currentFrameCenterX = stageWidth / 2 + currentTransformData.shiftX + currentTransformData.scrollX;
    // var currentFrameCenterY = stageHeight / 2 + currentTransformData.shiftY + currentTransformData.scrollY;
    // var currentFrameCenterX = stageWidth / 2 + currentTransformData.shiftX + currentTransformData.scrollX;
    // var currentFrameCenterY = stageHeight / 2 + currentTransformData.shiftY + currentTransformData.scrollY;
    // create a promise that will wait for the transform being applied
    var finished = new Kern.Promise();
    // apply pre position to target frame
    Kern._extend(frame.elWrapper.style, t.t0, {
      transition: 'none'
    });
    setTimeout(function() {
      finished.resolve();
    }, 1);
    return finished;
  },
  swipeTransition: function(type, which, currentTransformData, targetTransformData) {
    var t = {};
    // target frame transform time 1
    if (which & PlainLayout.TT1) {
      var x = -targetTransformData.shiftX - targetTransformData.scrollX;
      var y = -targetTransformData.shiftY - targetTransformData.scrollY;
      t.t1 = {
        transform: "translate3d(" + x + "," + y + ",0) scale(" + targetTransformData.scale + ")"
      };
    }
    switch (type) {
      case 'left':
        // target frame transform time 0
        if (which & PlainLayout.TT0) {
          var x = currentTransformData.width - currentTransformData.shiftX - currentTransformData.scrollX;
          var y = -targetTransformData.shiftY - targetTransformData.scrollY;
          t.t0 = {
            transform: "translate3d(" + x + "," + y + ",0) scale(" + targetTransformData.scale + ")"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) {
          var x = -targetTransformData.width + currentTransformData.shiftX + currentTransformData.scrollX;
          var y = -currentTransformData.shiftY - currentTransformData.scrollY;
          t.c1 = {
            transform: "translate3d(" + x + "," + y + ",0) scale(" + currentTransformData.scale + ")"
          };
        }
        break;
    }
    return t;
  }
}, {
  // constants for requesting calculation of transforms for frame transitions
  TT0: 1, // target frame transform time 0
  TT1: 2, // target frame transform time 1
  CT0: 4, // current frame transform time 0
  CT1: 8, // current frame transform time 0
  PT: 16, // requesting parametric form
  DT: 11, // default transforms: TT0, TT1, CT1
  IT: 2 // for initial transform only TT1 is needed.
});

layoutManager.registerType('plain', PlainLayout);

module.exports = PlainLayout;
