var WL = require('../wl.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
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
      up: this.swipeTransition,
      down: this.swipeTransition
    }
  },
  /**
   * initial layout of all visible frames when this layout engine becomes active
   *
   * @returns {Type} Description
   */
  init: function(stage) {
    for (var i = 0; i < this.layer.el.children.length; i++) {
      this.layer.el.children[i].style.visibility = 'hidden';
    }
    if (this.layer.currentFrame) {
      var t = this.swipeTransition(undefined, PlainLayout.IT, null, this.layer.currentFrame.getTransformData(stage))
      this.layer.currentFrame.applyStyles(t.t1);
      this.layer.currentFrame.elWrapper.style.visibility = 'initial';
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
    var currentFrame = this.layer.currentFrame;
    this.prepareTransition(frame, transition.type, currentTransformData, targetTransformData).then(function(t) {
      console.log('now for real');
      currentFrame.applyStyles({
        transition: '2s'
      });
      frame.applyStyles({
        transition: '2s'
      });
      frame.elWrapper.addEventListener("transitionEnd", function() { // FIXME needs webkitTransitionEnd etc
        currentFrame.applyStyles({
          transition: 'none',
          visibility: 'hidden'
        });
        frame.applyStyles({
          transition: 'none'
        });
        finished.resolve();
      });
      frame.applyStyles(t.t1);
      currentFrame.applyStyles(t.c1);
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
    Kern._extend(frame.elWrapper.style, {
      transition: 'none',
      visibility: 'initial'
    }, t.t0);
    console.log(t.t0);
    $.postAnimationFrame(function() {
      console.log('resolve');
      finished.resolve(t);
    });
    return finished;
  },
  swipeTransition: function(type, which, currentTransformData, targetTransformData) {
    var t = {};
    // target frame transform time 1
    if (which & PlainLayout.TT1) {
      var x = -targetTransformData.shiftX - targetTransformData.scrollX;
      var y = -targetTransformData.shiftY - targetTransformData.scrollY;
      t.t1 = {
        transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetTransformData.scale + ")",
        'transform-origin': "0 0"
      };
    }
    switch (type) {
      case 'left':
        // target frame transform time 0
        if (which & PlainLayout.TT0) {
          var x = currentTransformData.width - currentTransformData.shiftX - currentTransformData.scrollX;
          var y = -targetTransformData.shiftY - targetTransformData.scrollY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) {
          var x = -targetTransformData.width + currentTransformData.shiftX + currentTransformData.scrollX;
          var y = -currentTransformData.shiftY - currentTransformData.scrollY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;
        
      case 'right':
        // target frame transform time 0
        if (which & PlainLayout.TT0) {
          var x = -currentTransformData.width + currentTransformData.shiftX + currentTransformData.scrollX;
          var y = -targetTransformData.shiftY - targetTransformData.scrollY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) {
          var x = targetTransformData.width - currentTransformData.shiftX - currentTransformData.scrollX;
          var y = currentTransformData.shiftY + currentTransformData.scrollY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'down':
        // target frame transform time 0
        if (which & PlainLayout.TT0) {
          var x = -targetTransformData.shiftX - targetTransformData.scrollX;
          var y = -currentTransformData.height + currentTransformData.shiftY + currentTransformData.scrollY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) {
          var x = currentTransformData.shiftX + currentTransformData.scrollX;
          var y = targetTransformData.height - currentTransformData.shiftY - currentTransformData.scrollY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'up':
        // target frame transform time 0
        if (which & PlainLayout.TT0) {
          var x = -targetTransformData.shiftX - targetTransformData.scrollX;
          var y = currentTransformData.height - targetTransformData.shiftY - targetTransformData.scrollY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) {
          var x = -currentTransformData.shiftX - currentTransformData.scrollY;
          var y = -targetTransformData.height - currentTransformData.shiftY - currentTransformData.scrollY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentTransformData.scale + ")",
            'transform-origin': "0 0"
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
