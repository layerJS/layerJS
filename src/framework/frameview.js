'use strict';
var pluginManager = require('./pluginmanager.js');
var $ = require('./domhelpers.js');
var BaseView = require('./baseview.js');
var defaults = require('./defaults.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var FrameView = BaseView.extend({
  constructor: function(options) {
    this.renderRequiredAttributes = ['lj-fit-to', 'lj-elastic-left', 'lj-elastic-right', 'lj-elastic-top', 'lj-elastic-bottom', 'lj-width', 'lj-height', 'lj-x', 'lj-y', 'lj-scale-x', 'lj-scale-y', 'lj-rotation', 'lj-start-position'];
    this.transformData = undefined;

    BaseView.call(this, options);
    this.originalParent = this.parent;
  },
  /**
   * Specifies what will need to be observed on the DOM element. (Attributes, Children and size)
   */
  startObserving: function() {
    BaseView.prototype.observe.call(this, this.innerEl, {
      attributes: true,
      attributeFilter: ['name', 'lj-name', 'id'].concat(this.renderRequiredAttributes),
      children: true,
      size: true
    });
  },
  /**
   * Will add eventhandlers to specific events. It will handle a 'childrenChanged', 'sizeChanged' and
   * 'attributesChanged' event.
   */
  registerEventHandlers: function() {
    var that = this;

    BaseView.prototype.registerEventHandlers.call(this);

    this.on('sizeChanged', function() {
      if (that.parent) {
        that.trigger('renderRequired', that.name());
      }
    });

    this.on('attributesChanged', this.attributesChanged);
  },
  /**
   * Will be invoked the an 'attributesChanged' event is triggered. Will trigger a 'renderRequired' when needed.
   * @param {Object} attributes - a hash object the contains the changed attributes
   */
  attributesChanged: function(attributes) {
    for (var i = 0; i < this.renderRequiredAttributes.length; i++) {
      var attributeNames = Object.getOwnPropertyNames(attributes);
      if (attributeNames.indexOf(this.renderRequiredAttributes[i]) !== -1 || attributeNames.indexOf('data-' + this.renderRequiredAttributes[i]) !== -1) {
        this.trigger('renderRequired', this.name());
        break;
      }
    }
  },
  /**
   * get the transformData of the frame that describes how to fit the frame into the stage
   *
   * @param {LayerView} layer - the layer of the frame
   * @param {String} transitionStartPosition -  [optional] the transition data for the current transition, only startPosition is considered
   * @param {Boolean} keepScroll - if true, scrollX and scrollY are not reset to their initial positions (unless transitionStartPosition requests a full recalculation)
   * @returns {TransformData} the transform data
   */
  getTransformData: function(layer, transitionStartPosition, keepScroll) {
    // check if we can return cached version of transfromData
    var d = this.transformData;
    if (!d || d.isDirty || d.layer !== layer || (transitionStartPosition && transitionStartPosition !== d.startPosition)) {
      // calculate transformData
      if (d) delete d.isDirty;
      return (this.transformData = this.calculateTransformData(layer, transitionStartPosition));
    }
    if (!keepScroll) {
      d.scrollX = d.initialScrollX;
      d.scrollY = d.initialScrollY;
    }
    return d;
  },
  /**
   * Returns the scroll data for this frame in form of a transition record with only the values for scroll positions and startPosition set.   *
   * @returns {object} contains the scrollX and scrollY
   */
  getScrollData: function() {

    var scrollData = this.transformData ? {
      //  startPosition: this.transformData.startPosition,
      scrollX: this.transformData.scrollX,
      scrollY: this.transformData.scrollY
    } : {};
    return scrollData;
  },
  /**
   * calculate transform data (scale, scoll position and displacement) when fitting current frame into associated stage.
   * Note: this ignores the frame's scale and rotation property which have to be dealt with in the layer layout if necessary.
   *
   * @param {LayerView} layer - the layer the frame belongs to
   * @param {string} [transitionStartPosition] - the scroll position at start
   * @returns {TransformData} the transform data
   */
  calculateTransformData: function(layer, transitionStartPosition) {
    var stage = layer.parent;
    var stageWidth = stage ? stage.width() : 0;
    var stageHeight = stage ? stage.height() : 0;
    // data record contianing transformation and scrolling information of frame within given stage
    var d = this.transformData = {};
    d.stage = stage;
    d.layer = layer;
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

    var fitTo = this.fitTo(false) || layer.fitTo();
    switch (fitTo) {
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
        if (stageWidth <= d.frameWidth && stageWidth >= d.frameWidth - this.elasticLeft() - this.elasticRight()) {
          d.scale = 1;
          d.shiftX = this.elasticLeft() * (d.frameWidth - stageWidth) / (parseInt(this.elasticLeft()) + parseInt(this.elasticRight()));
        } else if (stageWidth > d.frameWidth) {
          d.scale = stageWidth / d.frameWidth;
        } else {
          d.scale = stageWidth / (d.frameWidth - this.elasticLeft() - this.elasticRight());
          d.shiftX = this.elasticLeft();
        }
        d.isScrollY = true;
        break;
      case 'elastic-height':
        if (stageHeight <= d.frameHeight && stageHeight >= d.frameHeight - this.elasticTop() - this.elasticBottom()) {
          d.scale = 1;
          d.shiftY = this.elasticTop() * (d.frameHeight - stageHeight) / (parseInt(this.elasticTop()) + parseInt(this.elasticBottom()));
        } else if (stageHeight > d.frameHeight) {
          d.scale = stageHeight / d.frameHeight;
        } else {
          d.scale = stageHeight / (d.frameHeight - this.elasticTop() - this.elasticBottom());
          d.shiftY = this.elasticTop();
        }
        d.isScrollY = true;
        break;
      case 'responsive':
        d.scale = 1;
        //if (d.frameWidth !== stageWidth) {
        d.frameWidth = stageWidth;
        d.applyWidth = true;
        //}
        //if (d.frameHeight !== stageHeight) {
        d.applyHeight = true;
        d.frameHeight = stageHeight;
        //}
        break;
      case 'responsive-width':
        d.scale = 1;
        d.isScrollY = true;
        //if (d.frameWidth !== stageWidth) {
        d.applyWidth = true;
        d.frameWidth = stageWidth;
        // NOTE: Afterward the height of the frame most likely changed which is not reflected in the transformData; however, this should be dealt with by the sizechanged handler
        //}
        break;
      case 'responsive-height':
        d.scale = 1;
        d.isScrollX = true;
        //if (d.frameHeight !== stageHeight) {
        d.applyHeight = true;
        d.frameHeight = stageHeight;
        //}
        break;
      default:
        throw "unkown fitTo type '" + fitTo + "'";
    }

    if (d.isScrollY && this.parent.autoWidth()) {
      throw 'we can\'t adapt stage width if we fit to width';
    } else if (d.isScrollX && this.parent.autoHeight()) {
      throw 'we can\'t adapt stage height if we fit to height';
    }


    // calculate actual frame width height in stage space
    d.width = d.frameWidth * d.scale;
    d.height = d.frameHeight * d.scale;

    if (stage && stage.autoWidth()) {
      stageWidth = d.width;
    } else if (stage && stage.autoHeight()) {
      stageHeight = d.height;
    }
    // calculate maximum scroll positions (depend on frame and stage dimensions)
    // WARN: allow negative maxScroll for now
    d.maxScrollY = 0;
    d.maxScrollX = 0;
    if (d.isScrollY) d.maxScrollY = d.frameHeight - stageHeight / d.scale;
    if (d.isScrollX) d.maxScrollX = d.frameWidth - stageWidth / d.scale;
    // define initial positioning
    // take startPosition from transition or from frame
    d.startPosition = transitionStartPosition || this.startPosition();
    var partials = ({ // get startPositions for x and y direction from generic startPosition string
      top: ['top', 'center'],
      bottom: ['bottom', 'center'],
      left: ['left', 'middle'],
      right: ['right', 'middle'],
      'top-left': ['top', 'left'],
      'top-right': ['top', 'right'],
      'bottom-left': ['bottom', 'left'],
      'bottom-right': ['bottom', 'right'],
      'middle-center': ['middle', 'center'],
      middle: ['middle', 'center'],
      center: ['middle', 'center'],
    })[d.startPosition];
    for (var p = 0; p < partials.length; p++) {
      switch (partials[p]) {
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
        case 'center':
          if (d.isScrollX) {
            d.scrollX = (d.frameWidth - stageWidth / d.scale) / 2;
            if (d.scrollX < 0) {
              d.shiftX = d.scrollX;
              d.scrollX = 0;
            }
          }
          break;
        case 'middle':
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
    }
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
    if (this.noScrolling()) {
      d.shiftX += d.scrollX;
      d.shiftY += d.scrollY;
      d.scrollX = 0;
      d.scrollY = 0;
      d.isScrollX = false;
      d.isScrollY = false;
      d.maxScrollX = 0;
      d.maxScrollY = 0;
    }

    d.shiftX *= d.scale;
    d.shiftY *= d.scale;

    // save inital scroll position to be able to reset this without recalculating the full transform data
    d.initialScrollX = d.scrollX;
    d.initialScrollY = d.scrollY;
    d.frame = this;
    return (this.transformData = d);
  },
  /**
   * Will return the width of the view (including the margins)
   *
   * @return {Number} the width of the view
   */
  width: function() {
    var margin = this.getMargin();
    var marginToAdd = margin.left + margin.right;
    return BaseView.prototype.width.call(this) + marginToAdd; // we always return width incl. margin to also fit margin into stage
  },
  /**
   * Will return the height of the view (including the margins)
   *
   * @return {Number} the height of the view
   */
  height: function() {
    var margin = this.getMargin();
    var marginToAdd = margin.top + margin.bottom;
    return BaseView.prototype.height.call(this) + marginToAdd; // we always return height incl. margin to also fit margin into stage
  },

}, {
  defaultProperties: {
    type: 'frame'
  },
  identify: function(element) {
    var type = $.getAttributeLJ(element, 'type');
    return null !== type && type.toLowerCase() === FrameView.defaultProperties.type;
  }
});

pluginManager.registerType('frame', FrameView, defaults.identifyPriority.normal);
module.exports = FrameView;
