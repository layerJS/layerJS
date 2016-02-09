'use strict';
var pluginManager = require('./pluginmanager.js');
var StageData = require('./stagedata.js');
var CGroupView = require('./cgroupview.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var StageView = CGroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    CGroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },

}, {
  Model: StageData,
  parse: CGroupView.parse
});
pluginManager.registerType('stage', StageView);
module.exports = StageView;
