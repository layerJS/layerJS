'use strict';
var Kern = require('../kern/Kern.js');
var CGroupView = require('./cgroupView.js');

/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */


var LayerView = CGroupView.extend({
  constructor: function(dataModel, options) {
    // call super constructor
    CGroupView.call(this, dataModel, options);
  }
});

module.exports = LayerView;
