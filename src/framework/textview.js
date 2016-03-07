'use strict';
var ObjView = require('./objview.js');
var TextData = require('./textdata.js');
var pluginManager = require('./pluginmanager.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can render images
 * @param {TextData} dataModel
 * @param {object}        options
 * @extends ObjView
 */
var TextView = ObjView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    ObjView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el)) {
      this.render();
    }
  },
  render: function(options) {
    options = options || {};
    this.disableObserver();

    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.innerEl;

    ObjView.prototype.render.call(this, options);

    if ('content' in diff) {
      el.innerHTML = attr.content;
    }

    this.enableObserver();
  },
  /**
   * Will create a dataobject based on a DOM element
   *
   * @param {element} DOM element to needs to be parsed
   * @return  {data} a javascript data object
   */
  parse: function(element) {
    var dataModel = ObjView.prototype.parse.call(this, element);
    dataModel.silence();
    dataModel.attributes.content = element.innerHTML;
    dataModel.ignore();

    return dataModel;
  }
}, {
  Model: TextData
});


pluginManager.registerType('text', TextView);
module.exports = TextView;
