'use strict';
var pluginManager = require('./pluginmanager.js');
var StageData = require('./stagedata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var StageView = CGroupView.extend({

}, {
  Model: StageData
});
pluginManager.registerType('stage', StageView);
module.exports = StageView;
