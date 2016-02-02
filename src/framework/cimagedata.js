'use strict';
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');
/**
 * #CimageData
 * This data type will contain all the information to render a image
 * @type {Model}
 */
var CimageData = CobjData.extend({
  defaults: Kern._extend({}, CobjData.prototype.defaults, {
    type: 'image',
    tag: 'img'
  })
});

module.exports = CimageData;
