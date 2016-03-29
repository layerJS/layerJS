'use strict';
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var CanvasLayout = LayerLayout.extend({
  /**
   * initalize PlainLayout with a layer
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
  setFrame: function(frame, transformData, transform) {
    /*jshint unused: false*/
    var that = this;
    transform = transform || "";
    // call prepareTransition() with target frame data only to get the reverseTransform calculated
    this.prepareTransition(frame, undefined, undefined, transformData, undefined, transform).then(function(reverseTransform) {
      that._currentReverseTransform = reverseTransform;
      var frames = that.layer.getChildViews();
      var framesLength = frames.length;
      var childFrame;
      // now apply all transforms to all frames
      for (var i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        that._applyTransform(childFrame, reverseTransform, transform, {
          transition: ''
        });
      }
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
  executeTransition: function(frame, transition, reverseTransform, currentTransform, targetTransform) {
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
      this._applyTransform(childFrame, reverseTransform, targetTransform, {
        transition: '2s'
      });
    }
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
  /*jshint unused: true*/
  prepareTransition: function(frame, type, currentFrameTransformData, targetFrameTransformData, currentTransform, targetTransform) {
    /*jshint unused: false*/

    var targetFrameX = (parseInt(frame.data.attributes.x, 10) || 0);
    var targetFrameY = (parseInt(frame.data.attributes.y, 10) || 0);

    var transform = "scale(" + targetFrameTransformData.scale + ") rotate(" + (-frame.data.attributes.rotation || 0) + "deg) translate3d(" + (-targetFrameX) + "px," + (-targetFrameY) + "px,0px)";

    var finished = new Kern.Promise();
    finished.resolve(transform);

    return finished;
  },
  /**
   * define the scrolling transform on current frame
   *
   * @param {String} transform - the scrolling transform
   * @returns {Type} Description
   */
  /*jshint unused: true*/
  setTransform: function(transform, currentFrameTransformData) {
    /*jshint unused: false*/
    // FIXME: layout should store the t.c0 somehow
    //var t = this.swipeTransition(undefined, PlainLayout.CT0, currentFrameTransformData, null);
    //this._applyTransform(this.layer.currentFrame, t.c0, transform);
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
      if (this._currentReverseTransform && transform) {
        // currentFrame is initialized -> we need to render the frame at new position
        this._applyTransform(frame, this._currentReverseTransform, this.layer.currentTransform, css);
      } {
        // just apply width and height, everything else the first setFrame() should do
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
}, {
  // constants for requesting calculation of transforms for frame transitions
  TT0: 1, // target frame transform time 0
  TT1: 2, // target frame transform time 1
  CT0: 4, // current frame transform time 0
  CT1: 8, // current frame transform time 0
  PT: 16, // requesting parametric form
  DT: 11, // default transforms: TT0, TT1, CT1
});

layoutManager.registerType('canvas', CanvasLayout);

module.exports = CanvasLayout;
