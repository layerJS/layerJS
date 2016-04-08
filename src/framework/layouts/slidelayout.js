'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var SlideLayout = LayerLayout.extend({
  /**
   * initalize SlideLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    var that = this;

    var swipeTransition = function(type, which, currentFrameTransformData, targetFrameTransformData) {
      return that.swipeTransition(type, which, currentFrameTransformData, targetFrameTransformData);
    };

    this.transitions = {
      left: swipeTransition,
      right: swipeTransition,
      up: swipeTransition,
      down: swipeTransition
    };
  },
  /**
   * transforms immidiately to the specified frame. hides all other frames
   *
   * @param {FrameView} frame - the frame to activate
   * @param {Object} transfromData - transform data of current frame
   * @param {string} transform - a string representing the scroll transform of the current frame
   * @returns {void}
   */
  showFrame: function(frame, transformData, transform) {
    for (var i = 0; i < this.layer.innerEl.children.length; i++) {
      this.layer.innerEl.children[i].style.display = 'none';
    }
    var t = this.swipeTransition(undefined, SlideLayout.TT1, null, transformData);
    this._applyTransform(frame, t.t1, transform, {
      display: '',
      opacity: 1,
      visibility: ''
    });
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
    frame.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
      e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
      currentFrame.applyStyles({
        transition: '',
        display: 'none'
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
    // currentFrame.applyStyles(t.c1);
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
    var t = this.transitions[type](type, SlideLayout.DT, currentFrameTransformData, targetFrameTransformData);
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
   * define the scrolling transform on current frame
   *
   * @param {String} transform - the scrolling transform
   * @returns {Type} Description
   */
  setTransform: function(transform, currentFrameTransformData) {
    // FIXME: layout should store the t.c0 somehow
    var t = this.swipeTransition(undefined, SlideLayout.CT0, currentFrameTransformData, null);
    this._applyTransform(this.layer.currentFrame, t.c0, transform);
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
    frame.applyStyles(styles || {}, baseTransform, {
      transform: addedTransform + " " + baseTransform.transform
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
    if (which & SlideLayout.TT1) { // jshint ignore:line
      x = -targetFrameTransformData.shiftX;
      y = -targetFrameTransformData.shiftY;
      t.t1 = {
        transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
        'transform-origin': "0 0"
      };
    }
    if (which & SlideLayout.CT0) { // jshint ignore:line
      x = -currentFrameTransformData.shiftX;
      y = -currentFrameTransformData.shiftY;
      t.c0 = {
        transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
        'transform-origin': "0 0"
      };
    }
    switch (type) {
      case 'default':
      case 'left':
        // target frame transform time 0
        if (which & SlideLayout.TT0) { // jshint ignore:line
          x = Math.max(this.getStageWidth(), currentFrameTransformData.width) - currentFrameTransformData.shiftX;
          y = -targetFrameTransformData.shiftY;
          t.t0 = {
            // FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & SlideLayout.CT1) { // jshint ignore:line
          x = -Math.max(this.getStageWidth(), targetFrameTransformData.width) + currentFrameTransformData.shiftX;
          y = -currentFrameTransformData.shiftY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'right':
        // target frame transform time 0
        if (which & SlideLayout.TT0) { // jshint ignore:line
          x = -Math.max(this.getStageWidth(), currentFrameTransformData.width) + currentFrameTransformData.shiftX;
          y = -targetFrameTransformData.shiftY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & SlideLayout.CT1) { // jshint ignore:line
          x = Math.max(this.getStageWidth(), targetFrameTransformData.width) - currentFrameTransformData.shiftX;
          y = currentFrameTransformData.shiftY;
          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'down':
        // target frame transform time 0
        if (which & SlideLayout.TT0) { // jshint ignore:line
          x = -targetFrameTransformData.shiftX;
          y = -Math.max(this.getStageHeight(), currentFrameTransformData.height, targetFrameTransformData.height) + currentFrameTransformData.shiftY;
          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & SlideLayout.CT1) { // jshint ignore:line
          x = currentFrameTransformData.shiftX;
          y = Math.max(this.getStageHeight(), currentFrameTransformData.height, targetFrameTransformData.height) - currentFrameTransformData.shiftY;

          t.c1 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + currentFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        break;

      case 'up':
        // target frame transform time 0
        if (which & SlideLayout.TT0) { // jshint ignore:line
          x = -targetFrameTransformData.shiftX;
          y = Math.max(this.getStageHeight(), currentFrameTransformData.height, targetFrameTransformData.height) - targetFrameTransformData.shiftY;

          t.t0 = {
            transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + targetFrameTransformData.scale + ")",
            'transform-origin': "0 0"
          };
        }
        // current frame transform time 1
        if (which & SlideLayout.CT1) { // jshint ignore:line
          x = -currentFrameTransformData.shiftX;
          y = -Math.max(this.getStageHeight(), currentFrameTransformData.height, targetFrameTransformData.height) - currentFrameTransformData.shiftY;
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
});

layoutManager.registerType('slide', SlideLayout);

module.exports = SlideLayout;
