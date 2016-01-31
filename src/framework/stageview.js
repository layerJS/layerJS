'use strict';
var pluginManager = require('./pluginmanager.js');
var CGroupView = require('./cgroupView.js');

/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var StageView = CGroupView.extend({

});
pluginManager.registerType('stage',StageView);
module.exports = StageView;
