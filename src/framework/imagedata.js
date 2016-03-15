'use strict';
var Kern = require('../kern/Kern.js');
var ObjData = require('./objdata.js');
/**
 * #ImageData
 * This data type will contain all the information to render a image
 * @type {Model}
 */
var ImageData = ObjData.extend({
  defaults: Kern._extend({}, ObjData.prototype.defaults, {
    type: 'image',
    tag: 'img'
  })
});

module.exports = ImageData;
