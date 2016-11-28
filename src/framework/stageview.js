'use strict';
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');
var defaults = require('./defaults.js');
var $ = require('./domhelpers.js');
var state = require('./state.js');
var BaseView = require('./baseview.js');


/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var StageView = BaseView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    options.childType = 'layer';
    BaseView.call(this, options);

    var that = this;
    window.addEventListener('resize', function() {
      that.onResize();
    }, false);

    var children = this._getChildViews();

    for (var i = 0; i < children.length; i++) {
      this._renderChildPosition(children[i]);
    }

  },
  _renderChildPosition: function(childView) {
    if (childView.nodeType() === 1) {
      //  childView.disableObserver();
      childView.outerEl.style.left = "0px";
      childView.outerEl.style.top = "0px";
      //childView.enableObserver();
    }
  },
  /**
   * Method will be invoked when a resize event is detected.
   */
  onResize: function() {
    //var childViews = this.getChildViews();
    //var length = childViews.length;
    //for (var i = 0; i < length; i++) {
    //  var childView = childViews[i];
    //childView.onResize();
    //}
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
    var type = $.getAttributeLJ(element, 'type');
    return null !== type && type.toLowerCase() === StageView.defaultProperties.type;
  }
});
pluginManager.registerType('stage', StageView, defaults.identifyPriority.normal);
module.exports = StageView;
