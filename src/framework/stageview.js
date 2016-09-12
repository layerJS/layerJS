'use strict';
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');
var defaults = require('./defaults.js');

/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var StageView = GroupView.extend({
  constructor: function(dataModel, options) {
    var that = this;
    options = options || {};
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el)) {
      this.render();
    }

    window.addEventListener('resize', function() {
      that.onResize();
    }, false);
  },
  _renderChildPosition: function(childView) {
    if (childView.data.attributes.nodeType === 1) {
      childView.disableObserver();
      childView.outerEl.style.left = "0px";
      childView.outerEl.style.top = "0px";
      childView.enableObserver();
    }
  },
  /**
   * Method will be invoked when a resize event is detected.
   */
  onResize: function() {
    var childViews = this.getChildViews();
    var length = childViews.length;
    for (var i = 0; i < length; i++) {
      var childView = childViews[i];
      childView.onResize();
    }
  }
}, {
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'stage'
  }),
  identify: function(element) {
    var type = element.getAttribute('data-lj-type');
    return null !== type && type.toLowerCase() === StageView.defaultProperties.type;
  }
});
pluginManager.registerType('stage', StageView, defaults.identifyPriority.normal);
module.exports = StageView;
