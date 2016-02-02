'use strict';
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');
/**
 * #CtextData
 * This data type will contain all the information to render some text
 * @type {Model}
 */
var CtextData = CobjData.extend({
  defaults: Kern._extend({}, CobjData.prototype.defaults, {
    type: 'text',
    tag: 'div'
  })
});

module.exports = CtextData;
