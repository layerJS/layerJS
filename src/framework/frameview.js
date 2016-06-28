'use strict';
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');
var identifyPriority = require('./identifypriority.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var FrameView = GroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    this.transformData = undefined;
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
  /**
   * get the transformData of the frame that describes how to fit the frame into the stage
   *
   * @param {StageView} stage - the stage to be fit into
   * @param {String} transitionStartPosition -  [optional] the transition data for the current transition, only startPosition is considered
   * @param {Boolean} keepScroll - if true, scrollX and scrollY are not reset to their initial positions (unless transitionStartPosition requests a full recalculation)
   * @returns {TransformData} the transform data
   */
  getTransformData: function(stage, transitionStartPosition, keepScroll) {
    // check if we can return cached version of transfromData
    var d = this.transformData;
    if (!d || d.stage !== stage || (transitionStartPosition && transitionStartPosition !== d.startPosition)) {
      // calculate transformData
      return (this.transformData = this.calculateTransformData(stage, transitionStartPosition));
    }
    if (!keepScroll) {
      d.scrollX = d.initialScrollX;
      d.scrollY = d.initialScrollY;
    }
    return d;
  },
  /**
   * Returns the scroll data for this frame
   *
   * @returns {object} contains the the startPosition, scrollX and scrollY
   */
  getScrollData: function() {

    var scrollData = this.transformData ? {
      startPosition: this.transformData.startPosition,
      scrollX: this.transformData.scrollX,
      scrollY: this.transformData.scrollY
    } : {};
    return scrollData;
  },
  /**
   * calculate transform data (scale, scoll position and displacement) when fitting current frame into associated stage.
   * Note: this ignores the frame's scale and rotation property which have to be dealt with in the layer layout if necessary.
   *
   * @param {StageView} stage - the stage to be fit into
   * @param {string} [transitionStartPosition] - the scroll position at start
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
        if (stageWidth < d.frameWidth && stageWidth > d.frameWidth - this.data.attributes.elasticLeft - this.data.attributes.elasticRight) {
          d.scale = 1;
          d.shiftX = this.data.attributes.elasticLeft * (d.frameWidth - stageWidth) / (this.data.attributes.elasticLeft + this.data.attributes.elasticRight);
        } else if (stageWidth > d.frameWidth) {
          d.scale = stageWidth / d.frameWidth;
        } else {
          d.scale = stageWidth / (d.frameWidth - this.data.attributes.elasticLeft - this.data.attributes.elasticRight);
          d.shiftX = this.data.attributes.elasticLeft;
        }
        d.isScrollY = true;
        break;
      case 'elastic-height':
        if (stageHeight < d.frameHeight && stageHeight > d.frameHeight - this.data.attributes.elasticTop - this.data.attributes.elasticBottom) {
          d.scale = 1;
          d.shiftY = this.data.attributes.elasticTop * (d.frameHeight - stageHeight) / (this.data.attributes.elasticTop + this.data.attributes.elasticBottom);
        } else if (stageHeight > d.frameHeight) {
          d.scale = stageHeight / d.frameHeight;
        } else {
          d.scale = stageHeight / (d.frameHeight - this.data.attributes.elasticTop - this.data.attributes.elasticBottom);
          d.shiftY = this.data.attributes.elasticTop;
        }
        d.isScrollY = true;
        break;
      case 'responsive':
        d.scale = 1;
        this.innerEl.style.width = d.frameWidth = stageWidth;
        this.innerEl.style.height = d.frameHeight = stageHeight;
        break;
      case 'responsive-width':
        d.scale = 1;
        d.isScrollY = true;
        this.innerEl.style.width = d.frameWidth = stageWidth;
        break;
      case 'responsive-height':
        d.scale = 1;
        d.isScrollX = true;
        this.innerEl.style.height = d.frameHeight = stageHeight;
        break;
      default:
        throw "unkown fitTo type '" + this.attributes.fitTo + "'";
    }
    // calculate maximum scroll positions (depend on frame and stage dimensions)
    // WARN: allow negative maxScroll for now
    if (d.isScrollY) d.maxScrollY = d.frameHeight - stageHeight / d.scale;
    if (d.isScrollX) d.maxScrollX = d.frameWidth - stageWidth / d.scale;
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
            // FIXME disable isScrollY????
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
          d.scrollX = (d.frameWidth - stageWidth / d.scale) / 2;
          if (d.scrollX < 0) {
            d.shiftX = d.scrollX;
            d.scrollX = 0;
          }
        }
        if (d.isScrollY) {
          d.scrollY = (d.frameHeight - stageHeight / d.scale) / 2;
          if (d.scrollY < 0) {
            d.shiftY = d.scrollY;
            d.scrollY = 0;
          }
        }
        break;
      default:
        if (d.isScrollX) d.scrollX = 0;
        if (d.isScrollY) d.scrollY = 0;
        break;
    }
    // calculate actual frame width height in stage space
    d.width = d.frameWidth * d.scale;
    d.height = d.frameHeight * d.scale;
    // disable scrolling if maxscroll < 0
    if (d.maxScrollX <= 0) {
      d.shiftX += d.scrollX;
      d.scrollX = 0;
      d.maxScrollX = 0;
      d.isScrollX = false;
    }
    if (d.maxScrollY <= 0) {
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

    d.shiftX *= d.scale;
    d.shiftY *= d.scale;

    // save inital scroll position to be able to reset this without recalculating the full transform data
    d.initialScrollX = d.scrollX;
    d.initialScrollY = d.scrollY;
    return (this.transformData = d);
  }
}, {
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'frame'
  }),
  identify: function(element) {
    var type = element.getAttribute('data-wl-type');
    return null !== type && type.toLowerCase() === FrameView.defaultProperties.type;
  }
});

pluginManager.registerType('frame', FrameView, identifyPriority.normal);
module.exports = FrameView;
