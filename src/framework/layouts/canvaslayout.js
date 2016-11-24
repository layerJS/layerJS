'use strict';
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
   * transforms immidiately to the specified frame.
   *
   * @param {FrameView} frame - the frame to activate
   * @param {Object} transfromData - transform data of current frame
   * @param {string} transform - a string representing the scroll transform of the current frame
   * @returns {void}
   */
  /*jshint unused: true*/
  showFrame: function(frame, targetFrameTransformData, transform) {
    /*jshint unused: false*/
    transform = transform || "";
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;

    if (null !== frame) {
      this._reverseTransform = this._calculateReverseTransform(frame, targetFrameTransformData);
      // now apply all transforms to all frames
      for (var i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        this._applyTransform(childFrame, this._reverseTransform, transform, {
          transition: 'none',
          opacity: 1,
          display: 'block'
        });
      }
    } else {
      for (var x = 0; x < framesLength; x++) {
        childFrame = frames[x];
        childFrame.applyStyles({
          opacity: 0,
          transition: 'none'
        });
      }
    }
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

    // we only listen to the transitionend of the target frame and hope that's fine
    // NOTE: other frame transitions may end closely afterwards and setting transition time to 0 will let
    // them jump to the final positions (hopefully jump will not be visible)

    // NOTE: Maybe this is a solution for not stopping the transitions
    var lastFrameToTransition = frames[framesLength - 1];

    lastFrameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
      e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
      // console.log("canvaslayout transitionend", transition.transitionID);
      if (transition.transitionID === that.layer.transitionID) {
        for (var i = 0; i < framesLength; i++) {
          childFrame = frames[i];
          // console.log("canvaslayout transition off", transition.transitionID);
          childFrame.applyStyles({
            transition: 'none' // deactivate transitions for all frames
          });
        }
      }
      finished.resolve();
    });

    if (null !== frame) {
      this._reverseTransform = this._calculateReverseTransform(frame, targetFrameTransformData);
      // now apply all transforms to all frames
      for (var i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        this._applyTransform(childFrame, this._reverseTransform, targetTransform, {
          transition: transition.duration,
          opacity: 1
        });
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

    var transform = "translate3d(" + parseInt(-targetFrameTransformData.shiftX, 10) + "px," + parseInt(-targetFrameTransformData.shiftY, 10) + "px,0px) scale(" + targetFrameTransformData.scale / (frame.data.attributes.scaleX || 1) + "," + targetFrameTransformData.scale / (frame.data.attributes.scaleY || 1) + ") rotate(" + (-frame.data.attributes.rotation || 0) + "deg) translate3d(" + (-targetFrameX) + "px," + (-targetFrameY) + "px,0px)";
    return transform;
  },
  /**
   * apply new scrolling transform to layer
   *
   * @param {string} transform - the scrolling transform
   */
  setLayerTransform: function(transform) {
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;
    // console.log('canvaslayout: setLayerTransform');
    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, transform, this.layer.inTransition() ? {
        transition: this.layer.getRemainingTransitionTime() + 'ms'
      } : {});
    }
  },
  /**
   * this functions puts a frame at its default position. It's called by layer's render() renderChildPosition()
   * and and will also react to changes in the child frames
   *
   * @param {FrameView} frame - the frame to be positioned
   * @returns {void}
   */
  renderFramePosition: function(frame, transform) {
    var css = {};
    // just do width & height for now; FIXME
    //if ('width' in diff && attr.width !== undefined) {
      css.width = frame.width();
    //}
    //if ('height' in diff && attr.height !== undefined) {
      css.height = frame.height();
    //}
    //if ('x' in diff || 'y' in diff || 'rotation' in diff) {
      // calculate frameTransform of frame and store it in this._frameTransforms
      delete this._frameTransforms[attr.id]; // this will be recalculated in _applyTransform
      if (this._reverseTransform && transform) {
        // currentFrame is initialized -> we need to render the frame at new position
        this._applyTransform(frame, this._currentReverseTransform, this.layer.currentTransform, css);
      } {
        // just apply width and height, everything else the first showFrame() should do
        Kern._extend(el.style, css);
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
    var attr = frame.data.attributes;
    // console.log('canvaslayout: applystyles', frame.data.attributes.name, styles.transition);
    // we need to add the frame transform (x,y,rot,scale) the reverse transform (that moves the current frame into the stage) and the transform representing the current scroll/displacement
    frame.applyStyles(styles || {}, {
      transform: addedTransform + " " + reverseTransform + " " + (this._frameTransforms[frame.id()] || (this._frameTransforms[frame.id()] = "translate3d(" + (frame.x() || 0) + "px," + (frame.y() || 0) + "px,0px) rotate(" + (frame.rotation() || 0) + "deg) scale(" + attr.scaleX + "," + attr.scaleY + ")"))
    });
  },
});

layoutManager.registerType('canvas', CanvasLayout);

module.exports = CanvasLayout;
