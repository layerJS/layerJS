'use strict';
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');

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
    childView.disableObserver();
    childView.outerEl.style.left = "0px";
    childView.outerEl.style.top = "0px";
    childView.enableObserver();
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
  defaults: Kern._extend({}, GroupView.defaults, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'stage'
  })
});
pluginManager.registerType('stage', StageView);
module.exports = StageView;
