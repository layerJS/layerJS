'use strict';
var pluginManager = require('./pluginmanager.js')
var FrameData = require('./framedata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var FrameView = CGroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    CGroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));


    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
}, {
  Model: FrameData,
  Parse: CGroupView.Parse
});

pluginManager.registerType('frame', FrameView);
module.exports = FrameView;
