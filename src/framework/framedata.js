'use strict';
var Kern = require('../kern/Kern.js');
var CgroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var FrameData = CgroupData.extend({
  defaults: Kern._extend({}, CgroupData.prototype.defaults, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'frame'
  })
});

module.exports = FrameData;
