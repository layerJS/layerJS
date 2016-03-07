'use strict';
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
    };
  },
  /**
   * initial layout of all visible frames when this layout engine becomes active
   *
   * @returns {Type} Description
   */
  init: function(stage) {
    for (var i = 0; i < this.layer.innerEl.children.length; i++) {
      this.layer.innerEl.children[i].style.display = 'none';
    }
    if (this.layer.currentFrame) {
      this.layer.currentFrame.outerEl.style.display = '';
      var t = this.swipeTransition(undefined, PlainLayout.IT, null, this.layer.currentFrame.getTransformData(stage));
      this.layer.currentFrame.applyStyles(t.t1);
    }
  },
  /**
   * transition to a specified frame with given transition. The transitions needs to be prepared with prepareTransition().
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - the transition object
   * @param {Object} t - the record containing pre and post transforms
   * @param {string} currentTransform - a string representing the scroll transform of the current frame
   * @param {string} targetTransform - a string representing the scroll transform of the target frame
   * @returns {Type} Description
   */
  executeTransition: function(frame, transition, t, currentTransform, targetTransform) {
    var finished = new Kern.Promise();
    var currentFrame = this.layer.currentFrame;
    console.log('now for real');
    frame.outerEl.addEventListener("transitionend", function() { // FIXME needs webkitTransitionEnd etc
      currentFrame.applyStyles({
        transition: '',
        display: ''
      });
      frame.applyStyles({
        transition: ''
      });
      finished.resolve();
    });
    this._applyTransform(frame, t.t1, targetTransform, {
      transition: '2s'
    });
    this._applyTransform(currentFrame, t.c1, currentTransform, {
      transition: '2s'
    });
    currentFrame.applyStyles(t.c1);
    return finished;
  },
  /**
   * calculate pre and post transforms for current and target frame
   * needed for swipes
   * make sure targetFrame is at pre position
   *
   * @param {ViewFrame} frame - the target frame
   * @param {string} type - the transition type
   * @param {Object} currentFrameTransformData - transform data of current frame
   * @param {Object} targetFrameTransformData - transform data of target frame
   * @param {string} currentTransform - a string representing the scroll transform of the current frame
   * @param {string} targetTransform - a string representing the scroll transform of the target frame
   * @returns {Promise} will fire when pre transform to target frame is applied
   */
  prepareTransition: function(frame, type, currentFrameTransformData, targetFrameTransformData, currentTransform, targetTransform) {
    // call the transition type function to calculate all frame positions/transforms
    var t = this.transitions[type](type, PlainLayout.DT, currentFrameTransformData, targetFrameTransformData);
    // create a promise that will wait for the transform being applied
    var finished = new Kern.Promise();
    // apply pre position to target frame
    this._applyTransform(frame, t.t0, targetTransform, {
      transition: '',
      opacity: '1',
      visibility: ''
    });
    console.log(t.t0);
    // wait until new postions are rendered then resolve promise
    $.postAnimationFrame(function() {
      console.log('resolve');
      finished.resolve(t);
    });
    return finished;
  },
  /**
   * apply transform by combining the frames base transform with the added scroll transform
   *
   * @param {FrameView} frame - the frame that should be transformed
   * @param {Object} baseTransform - a plain object containing the styles for the frame transform
   * @param {String} addedTransform - a string to be added to the "transform" style which represents the scroll transform
   * @param {Object} styles - additional styles for example for transition timing.
   * @returns {void}
   */
  _applyTransform: function(frame, baseTransform, addedTransform, styles) {
    frame.applyStyles(styles, baseTransform, {
      transform: baseTransform.transform + " " + addedTransform
    });
  },
  /**
   * calculates pre and post positions for simple swipe transitions.
   *
   * @param {string} type - the transition type (e.g. "left")
   * @param {Integer} which - Boolean mask describing which positions need to be calculated
   * @param {Object} currentFrameTransformData - transform data of current frame
   * @param {Object} targetFrameTransformData - transform data of target frame
   * @returns {Object} the "t" record containing pre and post transforms
   */
  swipeTransition: function(type, which, currentFrameTransformData, targetFrameTransformData) {
    var t = {}; // record taking pre and post positions
    var x, y;
    // target frame transform time 1
    if (which & PlainLayout.TT1) { // jshint ignore:line
      x = -targetFrameTransformData.shiftX;
      y = -targetFrameTransformData.shiftY;
      t.t1 = {
        transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
        'transform-origin': "0 0"
      };
    }
    switch (type) {
      case 'left':
        // target frame transform time 0
        if (which & PlainLayout.TT0) { // jshint ignore:line
          x = currentFrameTransformData.width - currentFrameTransformData.shiftX;
          y = -targetFrameTransformData.shiftY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) { // jshint ignore:line
          x = -targetFrameTransformData.width + currentFrameTransformData.shiftX;
          y = -currentFrameTransformData.shiftY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'right':
        // target frame transform time 0
        if (which & PlainLayout.TT0) { // jshint ignore:line
          x = -currentFrameTransformData.width + currentFrameTransformData.shiftX;
          y = -targetFrameTransformData.shiftY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) { // jshint ignore:line
          x = targetFrameTransformData.width - currentFrameTransformData.shiftX;
          y = currentFrameTransformData.shiftY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'down':
        // target frame transform time 0
        if (which & PlainLayout.TT0) { // jshint ignore:line
          x = -targetFrameTransformData.shiftX;
          y = -(currentFrameTransformData.height > targetFrameTransformData.height ? currentFrameTransformData.height : targetFrameTransformData.height) + currentFrameTransformData.shiftY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) { // jshint ignore:line
          x = currentFrameTransformData.shiftX;
          y = (currentFrameTransformData.height > targetFrameTransformData.height ? currentFrameTransformData.height : targetFrameTransformData.height) - currentFrameTransformData.shiftY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'up':
        // target frame transform time 0
        if (which & PlainLayout.TT0) { // jshint ignore:line
          x = -targetFrameTransformData.shiftX;
          y = (currentFrameTransformData.height > targetFrameTransformData.height ? currentFrameTransformData.height : targetFrameTransformData.height) - targetFrameTransformData.shiftY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & PlainLayout.CT1) { // jshint ignore:line
          x = -currentFrameTransformData.shiftX;
          y = -(currentFrameTransformData.height > targetFrameTransformData.height ? currentFrameTransformData.height : targetFrameTransformData.height) - currentFrameTransformData.shiftY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
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
