'use strict';
var CobjView = require('./cobjview.js');
var CimageData = require('./cimagedata.js');
var pluginManager = require('./pluginmanager.js');

/**
 * A View which can render images
 * @param {CimageData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CimageView = CobjView.extend({
  constructor:function(dataModel, options){
        CobjView.call(this, dataModel, options);
  }

  ,

  render : function(options){
      var attr = this.data.attributes,
          diff = this.data.changedAttributes || this.data.attributes,
          el = this.el;

     CobjView.prototype.render.call(this,options);

     if ('src' in diff) {
       el.setAttribute("src", attr.src);
     }

     if ('alt' in diff) {
       el.setAttribute("alt", attr.alt);
     }
  }

},{
  Model: CimageData
});

pluginManager.registerType('image', CimageView);
module.exports = CimageView;
