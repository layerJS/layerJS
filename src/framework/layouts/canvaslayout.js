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

    this.executeTransition(frame, null, null, null, transformData);

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
  executeTransition: function(frame, transition, t, currentTransformData, targetTransformData) {
    var finished = new Kern.Promise();

    var transformation = {};
    var frameTransformData = frame.getTransformData(this.layer.stage);

    var targetFrameX = (parseInt(frame.data.attributes.x) || 0) * -1;
    var targetFrameY = (parseInt(frame.data.attributes.y) || 0) * -1;

    transformation[frame.data.attributes.id] = {
      transform: "translate3d(0px,0px,0px) scale(" + frameTransformData.scale + ")",
      'transform-origin': "0 0"
    };

    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;

    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      if (!transformation.hasOwnProperty(childFrame.data.attributes.id)) {
        var frameX = (parseInt(childFrame.data.attributes.x) || 0) + targetFrameX;
        var frameY = (parseInt(childFrame.data.attributes.y) || 0) + targetFrameY;

        transformation[childFrame.data.attributes.id] = {
          transform: "translate3d(" + frameX + "px," + frameY + "px,0px) scale(" + 1 + ")",
          'transform-origin': "0 0"
        };
      }
    }

    setTimeout(function() {
      finished.resolve();
    }, 2000);

    for (var index = 0; index < framesLength; index++) {
      childFrame = frames[index];
      if (transformation.hasOwnProperty(childFrame.data.attributes.id)) {
        if (childFrame.data.attributes.id === frame.data.attributes.id) {
          this._applyTransform(childFrame, transformation[childFrame.data.attributes.id], targetTransformData, {
            transition: '2s'
          });
        } else {
          this._applyTransform(childFrame, transformation[childFrame.data.attributes.id], transformation[frame.data.attributes.id].transform, {
            transition: '2s'
          });
        }
      }
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
    var finished = new Kern.Promise();
    finished.resolve({});

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
