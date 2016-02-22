'use strict';
var Kern = require('../kern/Kern.js');
var GroupData = require('./groupdata.js');

/**
 * @extends GroupData
 */
var StageData = GroupData.extend({
  defaults: Kern._extend({}, GroupData.prototype.defaults, {
    type: 'stage'
  })
});

module.exports = StageData;
