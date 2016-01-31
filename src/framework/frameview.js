'use strict';
var pluginManager = require('./pluginManager.js')
var CGroupView = require('./cgroupView.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var FrameView = CGroupView.extend({

  });

pluginManager.registerType('frame', FrameView);
module.exports = FrameView;
