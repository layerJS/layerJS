'use strict';
var Kern = require('../kern/Kern.js');
var CgroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var LayerData = CgroupData.extend({
  defaults: Kern._extend({}, CgroupData.prototype.defaults, {
    type: 'layer'
  })
});

module.exports = LayerData;