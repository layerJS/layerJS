'use strict';
var pluginManager = require('./pluginmanager.js');
var layoutManager = require('./layoutmanager.js');
var LayerData = require('./layerdata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */

var LayerView = CGroupView.extend({
  constructor: function(dataModel, options) {
    this.frames = {};
    this.layout = new(layoutManager.get(dataModel.attributes.layoutType))(this);
    CGroupView.call(this, dataModel, options);
    this.stage = this.parent;
    this.currentFrame = (this.data.attributes.defaultFrame && this.findChildView(this.data.attributes.defaultFrame)) ||  (this.data.attributes.children[0] && this.getChildView(this.data.attributes.children[0]));
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {string} framename - (optional) frame name to transition to
   * @param {Object} transition - (optional) transition object
   * @returns {Type} Description
   */
  transformTo: function(framename, transition) {
    // is framename  omitted?
    if (typeof framename === 'object') {
      transition = framename;
      framename = transition.frame;
    };
    transition = transition || {};
    framename = framename || transition.framename;
    if (!framename) throw "transformTo: no frame given";
    var frame = this.frames[framename];
    if (!frame) throw "transformTo: " + framename + " does not exist in layer";
    var transformData = frame.getTransformData(this.stage, transition);
    var shift = { // this will be non-zero if we have to switch scroll position in native scrolling
      x: 0,
      y: 0
    }
    this.layout.transitionTo(frame, shift, transition);
  }
}, {
  Model: LayerData
});

pluginManager.registerType('layer', LayerView);

module.exports = LayerView;
