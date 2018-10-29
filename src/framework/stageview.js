'use strict';
var pluginManager = require('./pluginmanager.js');
var gestureManager = require('./gestures/gesturemanager.js');
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
  constructor: function (options) {
    options = options || {};
    options.childType = 'layer';
    BaseView.call(this, options);
        // get upper layer where unuseable gestures should be sent to.
    // this.parentLayer = this.getParentOfType('layer');
    // register for gestures
    gestureManager.register(this.outerEl, this.gestureListener.bind(this), {
      dragging: true,
      mouseDragging: this.draggable()
    });
  },
  /**
   * send gestures to child layers or send them up
   * @param {object} gesture 
   */
  gestureListener(gesture){
    // if (gesture.event._ljEvtHndld) return; // check if some inner layer has already dealt with the gesture/event
    this.getChildViews()[0].gestureListener(gesture); // FIXME: currently only supports sending to first layer
  },
  /**
   * Will add eventhandlers to specific events. It will handle a 'childrenChanged', 'sizeChanged' and
   * 'attributesChanged' event. It will also handle it's parent 'renderRequired' event.
   */
  registerEventHandlers: function () {
    var that = this;

    var onResize = function () {
      that.trigger('renderRequired');
    };

    BaseView.prototype.registerEventHandlers.call(this);

    window.addEventListener('resize', onResize, false);

    this.on('sizeChanged', onResize);
  },
  /**
   * Specifies what will need to be observed on the DOM element. (Attributes, Children and size)
   */
  startObserving: function () {
    BaseView.prototype.observe.call(this, this.innerEl, {
      attributes: true,
      children: true,
      size: true
    });
  },
  /** Will place a child view at the correct position.
   * @param {Object} childView - the childView
   */
  _renderChildPosition: function (childView) {
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
  _parseChildren: function (options) {
    var that = this;
    var autoLength = this.autoWidth() || this.autoHeight();

    var layerTransitioned = function (layerView) {
      return function (frameName, transition) {
        transition = transition || {};
        var currentFrameTransformData = layerView.currentFrameTransformData;
        var style = {
          transition: transition.duration || ''
        };
        if (that.autoWidth()) {
          //that.setWidth(currentFrameTransformData.width);
          style.width = currentFrameTransformData.width;
          //style.transform = 'scaleX(' + (1 / that.width()) * currentFrameTransformData.width + ')';
        } else if (that.autoHeight()) {
          //that.setHeight(currentFrameTransformData.height);
          style.height = currentFrameTransformData.height;
          //style.transform = 'scaleY(' + (1 / that.height()) * currentFrameTransformData.height + ')';
        }
        that.applyStyles(style);

      };
    };

    BaseView.prototype._parseChildren.call(this, options);

    if (autoLength) {
      var found = null;
      for (var x = 0; x < this._cache.children.length; x++) {
        if (this._cache.children[x].name() === autoLength) {
          this._cache.children[x].on('transitionStarted', layerTransitioned(this._cache.children[x]));
          found = this._cache.children[x];
        }
      }
      if (!found && this._cache.children[0]) {
        this._cache.children[0].on('transitionStarted', layerTransitioned(this._cache.children[0]));
        found = this._cache.children[0];
      }
      // initial call to set autolength 
      if (found) (layerTransitioned(found))(); // Note this should work w/o parameters

    }
  },
}, {
    defaultProperties: {
      type: 'stage'
    },
    identify: function (element) {
      var type = $.getAttributeLJ(element, 'type');
      return null !== type && type.toLowerCase() === StageView.defaultProperties.type;
    }
  });
pluginManager.registerType('stage', StageView, defaults.identifyPriority.normal);
module.exports = StageView;
