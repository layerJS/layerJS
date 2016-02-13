'use strict';
var Kern = require('../kern/Kern.js');
var CGroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var LayerData = CGroupData.extend({
  defaults: Kern._extend({}, CGroupData.prototype.defaults, {
    type: 'layer',
    tag: 'div',
    layoutType: 'plain',
    defaultFrame: undefined,
    nativeScroll: true
  })
});

module.exports = LayerData;
