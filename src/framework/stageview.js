'use strict';
var pluginManager = require('./pluginmanager.js');
var defaults = require('./defaults.js');
var $ = require('./domhelpers.js');
var BaseView = require('./baseview.js');
/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var StageView = BaseView.extend({
  constructor: function(options) {
    options = options || {};
    options.childType = 'layer';
    BaseView.call(this, options);
  },
  /**
   * Will add eventhandlers to specific events. It will handle a 'childrenChanged', 'sizeChanged' and
   * 'attributesChanged' event. It will also handle it's parent 'renderRequired' event.
   */
  registerEventHandlers: function() {
    var that = this;

    var onResize = function() {
      that.trigger('renderRequired');
    };

    BaseView.prototype.registerEventHandlers.call(this);

    window.addEventListener('resize', onResize, false);

    this.on('sizeChanged', onResize);
  },
  /**
   * Specifies what will need to be observed on the DOM element. (Attributes, Children and size)
   */
  startObserving: function() {
    BaseView.prototype.observe.call(this, this.innerEl, {
      attributes: true,
      children: true,
      size: true
    });
  },
  /** Will place a child view at the correct position.
   * @param {Object} childView - the childView
   */
  _renderChildPosition: function(childView) {
    if (childView.nodeType() === 1) {
      childView.unobserve();
      childView.outerEl.style.left = "0px";
      childView.outerEl.style.top = "0px";
      childView.startObserving();
    }
  },
  /**
   * Will parse the current DOM Element it's children.
   * @param {object} options - optional: includes addedNodes
   */
  _parseChildren: function(options) {
    var that = this;
    var autoLength = this.autoWidth() || this.autoHeight() || this.autoLength();

    var layerTransitioned = function(layerView) {
      return function(frameName, transition) {
        transition = transition || {};
        var style = {
          transition: transition.duration || ''
        };
        if (that.autoWidth()) {
          //that.setWidth(currentFrameTransformData.width);
          style.width = layerView.getCurrentFrameWidth();
          //style.transform = 'scaleX(' + (1 / that.width()) * currentFrameTransformData.width + ')';
        } else if (that.autoHeight()) {
          //that.setHeight(currentFrameTransformData.height);
          style.height = layerView.getCurrentFrameHeight();
          //style.transform = 'scaleY(' + (1 / that.height()) * currentFrameTransformData.height + ')';
        } else if (that.autoLength()) {
          style.width = layerView.getCurrentFrameWidth();
          style.height = layerView.getCurrentFrameHeight();
        }
        that.applyStyles(style);

      };
    };

    BaseView.prototype._parseChildren.call(this, options);

    if (autoLength) {
      for (var x = 0; x < this._cache.children.length; x++) {
        if (this._cache.children[x].name() === autoLength) {
          this._cache.children[x].on('transitionStarted', layerTransitioned(this._cache.children[x]));
        }
      }
    }
  },
}, {
  defaultProperties: {
    type: 'stage'
  },
  identify: function(element) {
    var type = $.getAttributeLJ(element, 'type');
    return null !== type && type.toLowerCase() === StageView.defaultProperties.type;
  }
});
pluginManager.registerType('stage', StageView, defaults.identifyPriority.normal);
module.exports = StageView;
