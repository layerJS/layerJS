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
