'use strict';
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');
/**
 * An extension of CobjData that adds the children property which is an
 * array of CobjData IDs
 *
 * @extends CobjData
 */
var CgroupData = CobjData.extend({
  defaults: Kern._extend({}, CobjData.prototype.defaults, {
    type: 'group',
    children: [],
    tag: 'div'
  }),
  addChildren: function(ids) {
    this.silence();
    if (Array.isArray(ids)) {
      for (var i = 0; i < ids.length; i++) {
        this.addChild(ids[i]);
      }
    }
    this.fire();
  },
  addChild: function(id) {
    this.silence();
    this.update('children').push(id);
    this.fire();
  },
  removeChildren: function(ids) {
    this.silence();
    if (Array.isArray(ids)) {
      for (var i = 0; i < ids.length; i++) {
        this.removeChild(ids[i]);
      }
    }
    this.fire();
  },
  removeChild: function(id) {
    var idx = this.attributes.children.indexOf(id);
    if (idx >= 0) {
      this.silence();
      this.update('children').splice(idx, 1);
      this.fire();
    }
  }
});

module.exports = CgroupData;