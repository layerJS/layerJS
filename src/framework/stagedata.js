'use strict';
var Kern = require('../kern/Kern.js');
var CgroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var StageData = CgroupData.extend({
  defaults: Kern._extend({}, CgroupData.prototype.defaults, {
    type: 'stage'
  })
});

module.exports = StageData;