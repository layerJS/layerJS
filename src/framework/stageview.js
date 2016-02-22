'use strict';
var pluginManager = require('./pluginmanager.js');
var StageData = require('./stagedata.js');
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
    options = options || {};
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
  _renderChildPosition: function(childView){
    childView.disableObserver();
    childView.elWrapper.style.left="0px";
    childView.elWrapper.style.top="0px";
    childView.enableObserver();
  }

}, {
  Model: StageData,
  parse: GroupView.parse
});
pluginManager.registerType('stage', StageView);
module.exports = StageView;
