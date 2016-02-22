'use strict';
var Kern = require('../kern/Kern.js');
var ObjData = require('./objdata.js');
/**
 * #TextData
 * This data type will contain all the information to render some text
 * @type {Model}
 */
var TextData = ObjData.extend({
  defaults: Kern._extend({}, ObjData.prototype.defaults, {
    type: 'text',
    tag: 'div'
  })
});

module.exports = TextData;
