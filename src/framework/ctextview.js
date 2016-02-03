'use strict';
var CobjView = require('./cobjview.js');
var CtextData = require('./ctextdata.js');
var pluginManager = require('./pluginmanager.js');

/**
 * A View which can render images
 * @param {CtextData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CtextView = CobjView.extend({
  render : function(options){
      var attr = this.data.attributes,
          diff = this.data.changedAttributes || this.data.attributes,
          el = this.el;

     CobjView.prototype.render.call(this,options);

     if ('text' in diff) {
       el.innerHTML = attr.text;
     }
  }

},{
  Model: CtextData
});

pluginManager.registerType('text', CtextView);
module.exports = CtextView;
