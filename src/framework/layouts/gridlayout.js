'use strict';
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var GridLayout = LayerLayout.extend({
  /**
   * initalize CanvasLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    this._frameStyles = {};
  },
  /**
   * get the width of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the width
   */
  getStageWidth: function() {
    var grid = this.layer.grid();
    var framesLength = this.layer.getChildViews().length;
    var width = LayerLayout.prototype.getStageWidth.call(this);
    var colWidth = width;

    if (grid.columns === '*' || grid.columns === undefined) {
      colWidth = width / framesLength;
    } else {
      colWidth = width / grid.columns;
    }

    return colWidth;
  },
  /**
   * get the height of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the height
   */
  getStageHeight: function() {
    var grid = this.layer.grid();
    var height = LayerLayout.prototype.getStageHeight.call(this);
    var colHeight = height;

    if (grid.rows === '*' || grid.rows === undefined) {
      colHeight = height;
    } else {
      colHeight = height / grid.columns;
    }

    return colHeight;
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
    var lastFrameToTransition = frames[framesLength - 1];
    var childFrame;

    var transitionEnd = function() {
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
    };

    if (transition.duration !== '') {
      lastFrameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
        e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
        // console.log("canvaslayout transitionend", transition.transitionID);
        transitionEnd();
      });
    }
    // wait for semaphore as there may be more transitions that need to be setup
    transition.semaphore.sync().then(function() {
      console.log(targetTransform + ' ' + targetFrameTransformData);

      //that._calculateFrameTransforms(frame);

      var cssTransition = {
        transition: transition.duration,
        opacity: 1,
        display: 'block'
      };

      /*if (null === frame) {
        cssTransition.opacity = 0;
      }*/

      that.setLayerTransform('', cssTransition, frame);

      if (transition.duration === '') {
        transitionEnd();
      }
    });

    return finished;
  },
  _calculateFrameTransforms: function(frame) {
    var frames = this.layer.getChildViews();
    var gridName = this.layer.gridName();
    var framesLength = frames.length;
    var gridCol = 0;
    var gridRow = -1;
    var colWidth = this.getStageWidth();
    var rowHeight = this.getStageHeight();
    var grid = this.layer.grid();
    var maxColumns = grid.columns === "*" ? framesLength : grid.columns;
    var childFrame;
    var positionTransform;

    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      var transformData = childFrame.getTransformData(this.layer); // this will initialize dimensions for the frame
      var frameGrid = childFrame.grid(gridName);
      var css = {};

      if (i % maxColumns === 0) {
        gridCol = 0;
        gridRow++;
      }

      var frameCol = frameGrid.columns === '*' ? gridCol : parseInt(frameGrid.columns);
      var frameRow = frameGrid.rows === '*' ? gridRow : parseInt(frameGrid.rows);

      css.width = transformData.applyWidth ? colWidth + 'px' : childFrame.getOriginalWidth();
      css.height = transformData.applyHeight ? rowHeight + 'px' : childFrame.getOriginalHeight();

      this._frameStyles[childFrame.id()] = {
        css: css,
        transform: this._calculateTransform(childFrame, transformData, colWidth, rowHeight, frameCol, frameRow)
      };

      gridCol++;

      if (childFrame === frame || (undefined === frame && childFrame === this.layer.currentFrame)) {
        positionTransform = this._calculatePositionTransform(childFrame, transformData, colWidth, rowHeight, 0, frameRow);
      }
    }

    if (positionTransform) {
      for (i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        this._frameStyles[childFrame.id()].transform = this._frameStyles[childFrame.id()].transform + ' ' + positionTransform;
      }
    }
  },
  /**
   * calculate the transform that transforms a frame into the stage
   *
   * @returns {string} the calculated transform
   */
  _calculateTransform: function(frame, transformData, colWidth, colHeight, gridColumn, gridRow) {
    var rotation = frame.rotation() || 0;
    var shiftX = colWidth * gridColumn;
    var shiftY = colHeight * gridRow;

    var transform = "translate3d(" + (parseInt(transformData.shiftX, 10) + shiftX).toString() + "px," + parseInt(transformData.shiftY, 10) + shiftY + "px,0px) scale(" + transformData.scale / (frame.scaleX() || 1) + "," + transformData.scale / (frame.scaleY() || 1) + ") rotate(" + (rotation || 0) + "deg)";
    return transform;
  },
  /**
   * calculate the transform that transforms a frame into the stage (almost the inverse transform to the actual frame transform)
   *
   * @returns {string} the calculated transform
   */
  _calculatePositionTransform: function(frame, transformData, colWidth, colHeight, gridColumn, gridRow) {
    var shiftX = colWidth * gridColumn * -1;
    var shiftY = colHeight * gridRow * -1;

    var transform = "translate3d(" + shiftX + "px," + shiftY + "px,0px) scale(" + transformData.scale / (frame.scaleX() || 1) + "," + transformData.scale / (frame.scaleY() || 1) + ")";
    return transform;
  },
  /**
   * apply new scrolling transform to layer
   *
   * @param {string} transform - the scrolling transform
   * @param {Object} cssTransiton - css object containing the transition info (currently only single time -> transition: 2s)
   */
  setLayerTransform: function(transform, cssTransition, frame) {
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;
    var p = new Kern.Promise();

    this._calculateFrameTransforms(frame);

    if (cssTransition.transition) { // FIXME is this sufficient? should we rather pipe duration here, but what about other transtion properties like easing
      this.layer.currentFrame.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
        e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
        p.resolve();
      });
    } else {
      p.resolve();
    }


    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      var frameTransform = this._frameStyles[childFrame.id()].transform;
      var css = Kern._extend(cssTransition, this._frameStyles[childFrame.id()].css);

      this._applyTransform(childFrame, frameTransform, transform, css);
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

    if (undefined === this._frameStyles[frame.id()]) {
      this._calculateFrameTransforms();
    }

    if (this._frameStyles[frame.id()] && transform) {
      // currentFrame is initialized -> we need to render the frame at new position
      this._applyTransform(frame, this._frameStyles[frame.id()].transform, this.layer.currentTransform, this._frameStyles[frame.id()].css);
    }

  },
  /**
   * apply transform by combining the frame transform with the reverse transform and the added scroll transform
   *
   * @param {FrameView} frame - the frame that should be transformed
   * @param {string} frameTransform - a transform to position the frame in the grid
   * @param {String} addedTransform - a string to be added to the "transform" style which represents the scroll transform
   * @param {Object} styles - additional styles for example for transition timing.
   * @returns {void}
   */
  _applyTransform: function(frame, frameTransform, addedTransform, styles) {
    frame.applyStyles(styles || {}, {
      transform: (frameTransform || '') + ' ' + (addedTransform || '')
    });
  },
});

layoutManager.registerType('grid', GridLayout);

module.exports = GridLayout;
