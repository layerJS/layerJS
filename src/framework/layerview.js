'use strict';
var pluginManager = require('./pluginmanager.js');
var LayerData = require('./layerdata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */

var LayerView = CGroupView.extend({
}, {
  Model: LayerData
});

pluginManager.registerType('layer', LayerView);

module.exports = LayerView;
