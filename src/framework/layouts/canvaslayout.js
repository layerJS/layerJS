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
    this._reverseTransform = this._calculateReverseTransform(frame, targetFrameTransformData);
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;
    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, transform, {
        transition: ''
      });
    }
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {FrameView} [frame] - frame to transition to
   * @param {Object} [transition] - transition object
   * @param {string} [targetTransform] - transform representing the scrolling after transition
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transtion before the first one finished, this promise will not be resolved.
   */
  transitionTo(frame, transition, targetFrameTransformData, targetTransform) {
    this._reverseTransform = this._calculateReverseTransform(frame, targetFrameTransformData);
    var finished = new Kern.Promise();

    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;

    // we only listen to the transitionend of the target frame and hope that's fine
    // NOTE: other frame transitions may end closely afterwards and setting transition time to 0 will let
    // them jump to the final positions (hopefully jump will not be visible)
    frame.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
      e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
      for (var i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        childFrame.applyStyles({
          transition: '' // deactivate transitions for all frames
        });
      }
      finished.resolve();
    });

    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, targetTransform, {
        transition: transition.duration
      });
    }
    return finished;
  },
  /**
   * calculate the transform that transforms a frame into the stage (almost the inverse transform to the actual frame transform)
   *
   * @returns {string} the calculated transform
   */
  _calculateReverseTransform: function(frame, targetFrameTransformData) {
    var targetFrameX = (parseInt(frame.data.attributes.x, 10) || 0);
    var targetFrameY = (parseInt(frame.data.attributes.y, 10) || 0);

    var transform = "scale(" + targetFrameTransformData.scale / (frame.data.attributes.scaleX || 1) + "," + targetFrameTransformData.scale / (frame.data.attributes.scaleY || 1) + ") rotate(" + (-frame.data.attributes.rotation || 0) + "deg) translate3d(" + (-targetFrameX) + "px," + (-targetFrameY) + "px,0px)";
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
    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, transform, {
        transition: ''
      });
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
    var attr = frame.data.attributes,
      diff = frame.data.changedAttributes || frame.data.attributes,
      el = frame.outerEl;
    var css = {};
    // just do width & height for now; FIXME
    if ('width' in diff && attr.width !== undefined) {
      css.width = attr.width;
    }
    if ('height' in diff && attr.height !== undefined) {
      css.height = attr.height;
    }
    if ('x' in diff || 'y' in diff || 'rotation' in diff) {
      // calculate frameTransform of frame and store it in this._frameTransforms
      delete this._frameTransforms[attr.id]; // this will be recalculated in _applyTransform
      if (this._reverseTransform && transform) {
        // currentFrame is initialized -> we need to render the frame at new position
        this._applyTransform(frame, this._currentReverseTransform, this.layer.currentTransform, css);
      } {
        // just apply width and height, everything else the first showFrame() should do
        Kern._extend(el.style, css);
      }
    }
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
    // we need to add the frame transform (x,y,rot,scale) the reverse transform (that moves the current frame into the stage) and the transform representing the current scroll/displacement
    frame.applyStyles(styles || {}, {
      transform: addedTransform + " " + reverseTransform + " " + (this._frameTransforms[attr.id] || (this._frameTransforms[attr.id] = "translate3d(" + (attr.x || 0) + "px," + (attr.y || 0) + "px,0px) rotate(" + (attr.rotation || 0) + "deg) scale(" + attr.scaleX + "," + attr.scaleY + ")"))
    });
  },
});

layoutManager.registerType('canvas', CanvasLayout);

module.exports = CanvasLayout;
