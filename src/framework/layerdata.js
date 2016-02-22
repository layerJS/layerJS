'use strict';
var Kern = require('../kern/Kern.js');
var GroupData = require('./groupdata.js');

/**
 * @extends GroupData
 */
var LayerData = GroupData.extend({
  defaults: Kern._extend({}, GroupData.prototype.defaults, {
    type: 'layer',
    tag: 'div',
    layoutType: 'plain',
    defaultFrame: undefined,
    nativeScroll: true
  })
});

module.exports = LayerData;
