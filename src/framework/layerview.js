'use strict';
var pluginManager = require('./pluginmanager.js');
var CGroupView = require('./cgroupView.js');

/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */


var LayerView = CGroupView.extend({

});
pluginManager.registerType('layer', LayerView);
module.exports = LayerView;
