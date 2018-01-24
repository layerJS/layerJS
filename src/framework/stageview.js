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

    this.autoLengthAttributes = ["lj-auto-width", "lj-auto-height", "lj-auto-length"];
    this.renderRequiredAttribute = [].concat(this.autoLengthAttributes);
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

    this.on('attributesChanged', this.attributesChanged, {
      context: this
    });
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
    //var that = this;
    //var autoLength = this.autoWidth() || this.autoHeight() || this.autoLength();
    /*
        var layerTransitioned = function(layerView) {
          return function(frameName, transition) {
            transition = transition || {};
            var apply = false;
            var style = {
              transition: transition.duration || ''
            };
            if (that.autoWidth() === layerView.name()) {
              //that.setWidth(currentFrameTransformData.width);
              style.width = layerView.getCurrentFrameWidth();
              apply = true;
              //style.transform = 'scaleX(' + (1 / that.width()) * currentFrameTransformData.width + ')';
            } else if (that.autoHeight() === layerView.name()) {
              //that.setHeight(currentFrameTransformData.height);
              style.height = layerView.getCurrentFrameHeight();
              apply = true;
              //style.transform = 'scaleY(' + (1 / that.height()) * currentFrameTransformData.height + ')';
            } else if (that.autoLength() === layerView.name()) {
              style.width = layerView.getCurrentFrameWidth();
              style.height = layerView.getCurrentFrameHeight();
              apply = true;
            }

            if (apply) {
              that.applyStyles(style);
            }

          };
        };*/

    BaseView.prototype._parseChildren.call(this, options);

    /*    //if (autoLength) {
        for (var x = 0; x < this._cache.children.length; x++) {
          //if (this._cache.children[x].name() === autoLength) {
          this._cache.children[x].on('transitionStarted', layerTransitioned(this._cache.children[x]));
          //}
        }
        //}
        */
  },
  /**
   * Will be invoked when an 'transitionStarted' event is triggered on the autoLength layer.
   * @param {FrameView} frame - a hash object the contains the changed attributes
   */
  _applyAutoLength: function(frame, transition) {
    transition = transition || {};
    var apply = false;
    var style = {
      transition: transition.duration || ''
    };
    var layerView = this.autoLengthLayer;
    if (this.autoWidth()) {
      style.width = layerView.getCurrentFrameWidth();
      apply = true;
    } else if (this.autoHeight()) {
      style.height = layerView.getCurrentFrameHeight();
      apply = true;
    } else if (this.autoLength()) {
      style.width = layerView.getCurrentFrameWidth();
      style.height = layerView.getCurrentFrameHeight();
      apply = true;
    }

    if (apply) {
      this.applyStyles(style);
    }
  },
  /**
   * Will be invoked the an 'attributesChanged' event is triggered. Will trigger a 'renderRequired' when needed.
   * @param {Object} attributes - a hash object the contains the changed attributes
   */
  attributesChanged: function(attributes) {

    var attributeNames = Object.getOwnPropertyNames(attributes);
    var autoLengthChanged = false;

    for (var x = 0; x < this.autoLengthAttributes.length; x++) {
      if (attributeNames.indexOf(this.autoLengthAttributes[x]) !== -1 || attributeNames.indexOf('data-' + this.autoLengthAttributes[x]) !== -1) {
        autoLengthChanged = true;
        if (this.autoLengthLayer) {
          this.autoLengthLayer.off('transitionStarted', this._applyAutoLength);
        }
        break;
      }
    }

    if (autoLengthChanged) {
      var layer = this.autoLength() || this.autoWidth() || this.autoHeight();
      if (layer) {
        var layerView = this.getChildViewByName(layer);
        layerView.on('transitionStarted', this._applyAutoLength, {
          context: this
        });
        this.autoLengthLayer = layerView;
      }
    }
    /*
    for (var i = 0; i < this.renderRequiredAttributes.length; i++) {
      if (attributeNames.indexOf(this.renderRequiredAttributes[i]) !== -1 || attributeNames.indexOf('data-' + this.renderRequiredAttributes[i]) !== -1) {
        this.trigger('renderRequired', this.name());
        break;
      }
    }*/
  }
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
