'use strict';

var Kern = require('../kern/Kern.js');
var defaults = require('./defaults.js');

/**
 * Base data class of all view classed
 *
 * @extends Kern.Model
 */
var NodeData = Kern.Model.extend({
  constructor: function(param) {
    var data = param || {};

    if (data.defaultProperties)
      data = param.defaultProperties;

    Kern.Model.call(this, JSON.parse(JSON.stringify(Kern._extend({}, defaults, data))));
  },

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

module.exports = NodeData;
