'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var CanvasLayout = LayerLayout.extend({
  /**
   * initalize CanvasLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    this._frameTransforms = {};
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {FrameView} frame - frame to transition to
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform representing the scrolling after transition
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transtion before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    var finished = new Kern.Promise();
    var that = this;

    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;

    var transformFrame = function(childFrame, duration) {
      var tfd = childFrame.getTransformData(that.layer); // this will NOT initialize dimensions for the frame; we need to check if we have to set them
      var otherCss = {
        transition: duration !== undefined ? duration : transition.duration,
        opacity: 1,
        display: 'block'
      };

      otherCss.width = tfd.applyWidth ? (tfd.frameWidth - tfd.margin.left - tfd.margin.right) + 'px' : tfd.frameOriginalWidth;
      otherCss.height = tfd.applyHeight ? (tfd.frameHeight - tfd.margin.top - tfd.margin.bottom) + 'px' : tfd.frameOriginalHeight;

      that._applyTransform(childFrame, that._reverseTransform, targetTransform, otherCss);
    };

    var currentFrame = that.layer.currentFrame;
    if (currentFrame && currentFrame.transformData.isDirty) { // we need to do a transition to current frame first if current frame isDirty. This may happen if the whole canvas layer was hidden before
      // now apply all transforms to all frames
      that._reverseTransform = that._calculateReverseTransform(currentFrame, currentFrame.getTransformData(that.layer, undefined, true));
      for (var i = 0; i < framesLength; i++) {
        transformFrame(frames[i],'none');
      }
      //force reflow;
      var reflowed = false;
      for (i = 0; i < framesLength; i++) {
        if (window.getComputedStyle(frames[i].outerEl).transform) {
          reflowed = true;
        }
      }


    }
    // we only listen to the transitionend of the target frame and hope that's fine
    // NOTE: other frame transitions may end closely afterwards and setting transition time to 0 will let
    // them jump to the final positions (hopefully jump will not be visible)

    // NOTE: Maybe this is a solution for not stopping the transitions
    var lastFrameToTransition = transition.noActivation ? frame : frames[framesLength - 1];

    var transitionEnd = function() {
      if (transition.transitionID === that.layer.transitionID) {
        for (var i = 0; i < (transition.noActivation ? 1 : framesLength); i++) {
          childFrame = transition.noActivation ? frame : frames[i];
          // console.log("canvaslayout transition off", transition.transitionID);
          childFrame.applyStyles({
            transition: 'none' // deactivate transitions for all frames
          });
        }
      }
      finished.resolve();
    };

    if (transition.duration !== '') {
      lastFrameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
        if (lastFrameToTransition.outerEl === e.target) {
          e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
          // console.log("canvaslayout transitionend", transition.transitionID);
          transitionEnd();
        }
      });
    }
    // wait for semaphore as there may be more transitions that need to be setup
    transition.semaphore.sync().then(function() {

      if (null !== frame) {

        if (transition.noActivation) {
          transformFrame(frame);
        } else {
          // now apply all transforms to all frames
          that._reverseTransform = that._calculateReverseTransform(frame, targetFrameTransformData);
          for (var i = 0; i < framesLength; i++) {
            transformFrame(frames[i]);
          }
        }
      } else {
        for (var x = 0; x < framesLength; x++) {
          childFrame = frames[x];
          childFrame.applyStyles({
            opacity: 0,
            transition: transition.duration
          });
        }
      }

      if (transition.duration === '') {
        transitionEnd();
      }
    });

    return finished;
  },
  /**
   * calculate the transform that transforms a frame into the stage (almost the inverse transform to the actual frame transform)
   *
   * @returns {string} the calculated transform
   */
  _calculateReverseTransform: function(frame, targetFrameTransformData) {
    var targetFrameX = (parseInt(frame.x(), 10) || 0);
    var targetFrameY = (parseInt(frame.y(), 10) || 0);

    // this block will make sure that the difference between the current rotation of the canvas and the new rotation is <=180° (so the animation will not rotate the long way)
    var rotation = frame.rotation() || 0;
    if (this._currentRotation) {
      if (rotation > this._currentRotation + 180) {
        rotation -= 360 * (1 + Math.floor((rotation - this._currentRotation) / 360));
      }
      if (rotation < this._currentRotation - 180) {
        rotation += 360 * (1 + Math.floor((this._currentRotation - rotation) / 360));
      }
    }
    this._currentRotation = rotation;

    var transform = "translate3d(" + parseInt(-targetFrameTransformData.shiftX, 10) + "px," + parseInt(-targetFrameTransformData.shiftY, 10) + "px,0px) scale(" + targetFrameTransformData.scale / (frame.scaleX() || 1) + "," + targetFrameTransformData.scale / (frame.scaleY() || 1) + ") rotate(" + (-rotation || 0) + "deg)  translate3d(" + (-targetFrameX) + "px," + (-targetFrameY) + "px,0px)";
    return transform;
  },
  /**
   * apply new scrolling transform to layer
   *
   * @param {string} transform - the scrolling transform
   * @param {Object} cssTransiton - css object containing the transition info (currently only single time -> transition: 2s)
   */
  setLayerTransform: function(transform, cssTransition) {
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;
    var p = new Kern.Promise();
    if (cssTransition.transition) { // FIXME is this sufficient? should we rather pipe duration here, but what about other transtion properties like easing
      this.layer.currentFrame.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
        e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
        p.resolve();
      });
    } else {
      p.resolve();
    }
    // console.log('canvaslayout: setLayerTransform');
    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, transform, cssTransition);
    }
    return p;
  },
  /**
   * this functions puts a frame at its default position. It's called by layer's render() renderChildPosition()
   * and and will also react to changes in the child frames
   *
   * @param {FrameView} frame - the frame to be positioned
   * @returns {void}
   */
  renderFramePosition: function(frame, transform) {
    LayerLayout.prototype.renderFramePosition.call(this, frame, transform);
    delete this._frameTransforms[frame.id()]; // this will be recalculated in _applyTransform
    if (this._reverseTransform && transform) {
      // currentFrame is initialized -> we need to render the frame at new position
      this._applyTransform(frame, this._reverseTransform, this.layer.currentTransform, {});
    }
    //}
  },
  /**
   * apply transform by combining the frame transform with the reverse transform and the added scroll transform
   *
   * @param {FrameView} frame - the frame that should be transformed
   * @param {Object} baseTransform - a plain object containing the styles for the frame transform
   * @param {String} addedTransform - a string to be added to the "transform" style which represents the scroll transform
   * @param {Object} styles - additional styles for example for transition timing.
   * @returns {void}
   */
  _applyTransform: function(frame, reverseTransform, addedTransform, styles) {
    // console.log('canvaslayout: applystyles', frame.data.attributes.name, styles.transition);
    // we need to add the frame transform (x,y,rot,scale) the reverse transform (that moves the current frame into the stage) and the transform representing the current scroll/displacement
    styles = styles || {};
    var x = frame.x();
    var y = frame.y();
    if (x !== undefined) styles.left = $.parseDimension(x) + 'px';
    if (y !== undefined) styles.top = $.parseDimension(y) + 'px';
    frame.applyStyles(styles || {}, {
      transform: "translate3d(" + (-frame.x() || 0) + "px," + (-frame.y() || 0) + "px,0px)" + addedTransform + " " + reverseTransform + " " + (this._frameTransforms[frame.id()] = "translate3d(" + (frame.x() || 0) + "px," + (frame.y() || 0) + "px,0px) rotate(" + (frame.rotation() || 0) + "deg) scale(" + frame.scaleX() + "," + frame.scaleY() + ")")
    });
  },
});

layoutManager.registerType('canvas', CanvasLayout);

module.exports = CanvasLayout;
