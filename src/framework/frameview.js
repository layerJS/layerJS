'use strict';
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js')
var FrameData = require('./framedata.js');
var CGroupView = require('./cgroupview.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var FrameView = CGroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    this.transformData = undefined;
    CGroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
  /**
   * get the transformData of the frame that describes how to fit the frame into the stage
   *
   * @param {StageView} stage - the stage to be fit into
   * @param {Transtion} transition -  [optional] the transition data for the current transition, only startPosition is considered
   * @returns {TransformData} the transform data
   */
  getTransformData: function(stage, transitionStartPosition) {
    // check if we can return cached version of transfromData
    var d = this.transformData;
    if (!d || d.stage !== stage || (transitionStartPosition && transitionStartPosition !== d.startPosition)) {
      // calculate transformData
      return this.calculateTransformData(stage, transitionStartPosition);
    }
    return d;
  },
  /**
   * calculate transform data (scale, scoll position and displacement) when fitting current frame into associated stage
   *
   * @param {StageView} stage - the stage to be fit into
   * @param {Transtion} transition - optional, the transition data for the current transition
   * @returns {TransformData} the transform data
   */
  calculateTransformData: function(stage, transitionStartPosition) {
    var stageWidth = stage.width();
    var stageHeight = stage.height();
    // data record contianing transformation and scrolling information of frame within given stage
    var d = this.transformData = {};
    d.stage = stage;
    // scaling of frame needed to fit frame into stage
    d.scale = 1;
    d.frameWidth = this.width();
    d.frameHeight = this.height();
    // d.shiftX/Y indicate how much the top-left corner of the frame should be shifted from
    // the stage top-left corner (in stage space)
    d.shiftX = 0;
    d.shiftY = 0;
    // d.scrollX/Y give the initial scroll position in X and/or Y direction.
    d.scrollX = 0;
    d.scrollY = 0;
    // indicate whether scrolling in x or y directions is active
    d.isScrollX = false;
    d.isScrollY = false;
    switch (this.data.attributes.fitTo) {
      case 'width':
        d.scale = stageWidth / d.frameWidth;
        d.isScrollY = true;
        break;
      case 'height':
        d.scale = stageHeight / d.frameHeight;
        d.isScrollX = true;
        break;
      case 'fixed':
        d.scale = 1;
        d.isScrollX = true;
        d.isScrollY = true;
        break;
      case 'contain':
        d.scaleX = stageWidth / d.frameWidth;
        d.scaleY = stageHeight / d.frameHeight;
        if (d.scaleX < d.scaleY) {
          d.scale = d.scaleX;
          d.isScrollY = true;
        } else {
          d.scale = d.scaleY;
          d.isScrollX = true;
        }
        break;
      case 'cover':
        d.scaleX = stageWidth / d.frameWidth;
        d.scaleY = stageHeight / d.frameHeight;
        if (d.scaleX > d.scaleY) {
          d.scale = d.scaleX;
          d.isScrollY = true;
        } else {
          d.scale = d.scaleY;
          d.isScrollX = true;
        }
        break;
      case 'elastic-width':
        if (stageWidth < d.frameWidth && stageWidth > d.frameWidth - this.attributes['elastic-left'] - this.attributes['elastic-right']) {
          d.scale = 1;
          d.shiftX = this.attributes['elastic-left'] * (d.frameWidth - stageWidth) / (this.attributes['elastic-left'] + this.attributes['elastic-right']);
        } else if (stageWidth > d.frameWidth) {
          d.scale = stageWidth / d.frameWidth;
        } else {
          d.scale = stageWidth / (d.frameWidth - this.attributes['elastic-left'] - this.attributes['elastic-right']);
          d.shiftX = this.attributes['elastic-left'];
        };
        d.isScrollY = true;
        break;
      case 'elastic-height':
        if (stageHeight < d.frameHeight && stageHeight > d.frameHeight - this.attributes['elastic-top'] - this.attributes['elastic-bottom']) {
          d.scale = 1;
          d.shiftY = this.attributes['elastic-top'] * (d.frameHeight - stageHeight) / (this.attributes['elastic-top'] + this.attributes['elastic-bottom']);
        } else if (stageHeight > d.frameHeight) {
          d.scale = stageHeight / d.frameHeight;
        } else {
          d.scale = stageHeight / (d.frameHeight - this.attributes['elastic-top'] - this.attributes['elastic-bottom']);
          d.shiftX = this.attributes['elastic-top'];
        };
        d.isScrollX = true;
        break;
      case 'responsive':
        d.scale = 1;
        this.el.style.width = d.frameWidth = stageWidth;
        this.el.style.height = d.frameHeight = stageHeight;
        break;
      case 'responsive-width':
        d.scale = 1;
        d.isScrollY = true;
        this.el.style.width = d.frameWidth = stageWidth;
        break;
      case 'responsive-height':
        d.scale = 1;
        d.isScrollX = true;
        this.el.style.height = d.frameHeight = stageHeight;
        break;
      default:
        throw "unkown fitTo type '" + this.attributes.fitTo + "'";
    }
    // calculate maximum scroll positions (depend on frame and stage dimensions)
    // WARN: allow negative maxScroll for now
    if (d.isScrollY) d.maxScrollY = d.frameHeight * d.scale - stageHeight;
    if (d.isScrollX) d.maxScrollX = d.frameWidth * d.scale - stageWidth;
    // define initial positioning
    // take startPosition from transition or from frame
    d.startPosition = transitionStartPosition || this.data.attributes.startPosition;
    switch (d.startPosition) {
      case 'top':
        if (d.isScrollY) d.scrollY = 0;
        break;
      case 'bottom':
        if (d.isScrollY) {
          d.scrollY = d.maxScrollY;
          if (d.scrollY < 0) {
            d.shiftY = d.scrollY;
            d.scrollY = 0;
          }
        }
        break;
      case 'left':
        if (d.isScrollX) d.scrollX = 0;
        break;
      case 'right':
        if (d.isScrollX) {
          d.scrollX = d.maxScrollX;
          if (d.scrollX < 0) {
            d.shiftX = d.scrollX;
            d.scrollX = 0;
          }
        }
        break;
      case 'middle': // middle and center act the same
      case 'center':
        if (d.isScrollX) {
          d.scrollX = (d.frameWidth * d.scale - stageWidth) / 2;
          if (d.scrollX < 0) {
            d.shiftX = d.scrollX;
            d.scrollX = 0;
          }
        }
        if (d.isScrollY) {
          d.scrollY = (d.frameHeight * d.scale - stageHeight) / 2;
          if (d.scrollY < 0) {
            d.shiftY = d.scrollY;
            d.scrollY = 0;
          }
        }
        break;
      default:
        // same as 'top'
        if (d.isScrollY) d.scrollY = 0;
        break;
    }
    // calculate actual frame width height in stage space
    d.width = d.frameWidth * d.scale;
    d.height = d.frameHeight * d.scale;
    // disable scrolling if maxscroll < 0
    if (d.maxScrollX < 0) {
      d.shiftX += d.scrollX;
      d.scrollX = 0;
      d.maxScrollX = 0;
      d.isScrollX = false;
    }
    if (d.maxScrollY < 0) {
      d.shiftY += d.scrollY;
      d.scrollY = 0;
      d.maxScrollY = 0;
      d.isScrollY = false;
    }
    // disable scrolling if configured in frame
    if (this.data.attributes.noScrolling) {
      d.shiftX += d.scrollX;
      d.shiftY += d.scrollY;
      d.scrollX = 0;
      d.scrollY = 0;
      d.isScrollX = false;
      d.isScrollY = false;
      d.maxScrollX = 0;
      d.maxScrollY = 0;
      // } else if (transition) {
      //   // apply transition scroll information if available
      //   // support transition.scroll as direction ambivalent scroll position
      //   if (d.isScrollX) {
      //     if (transition.scroll !== undefined) d.scrollX = transition.scroll * d.scale;
      //     if (transition.scrollX !== undefined) d.scrollX = transition.scrollX * d.scale;
      //     if (d.scrollX > d.maxScrollX) d.scrollX = d.maxScrollX;
      //   }
      //   if (d.isScrollY) {
      //     if (transition.scroll !== undefined) d.scrollY = transition.scroll * d.scale;
      //     if (transition.scrollY !== undefined) d.scrollY = transition.scrollY * d.scale;
      //     if (d.scrollY > d.maxScrollY) d.scrollY = d.maxScrollY;
      //   }
    }
    return this.transformData = d;
  }
}, {
  Model: FrameData,
  parse: CGroupView.parse
});

pluginManager.registerType('frame', FrameView);
module.exports = FrameView;
