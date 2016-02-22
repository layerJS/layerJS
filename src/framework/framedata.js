'use strict';
var Kern = require('../kern/Kern.js');
var GroupData = require('./groupdata.js');

/**
 * @extends GroupData
 */
var FrameData = GroupData.extend({
  defaults: Kern._extend({}, GroupData.prototype.defaults, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'frame'
  })
});

module.exports = FrameData;
