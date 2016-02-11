'use strict';
var CobjView = require('./cobjview.js');
var CimageData = require('./cimagedata.js');
var pluginManager = require('./pluginmanager.js');
var Kern = require('../kern/Kern.js');
var WL = require('./wl.js');

/**
 * A View which can render images
 * @param {CimageData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CimageView = CobjView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    CobjView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true,
      observeElement:false
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();

      this.observeElement = options.observeElement || true;
  },
  render: function(options) {
    options = options || {};
    this.observeElement = false;
    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.el;

    CobjView.prototype.render.call(this, Kern._extend({}, options, {
      observeElement: false
    }));

    if ('src' in diff) {
      el.setAttribute("src", WL.imagePath + attr.src);
    }

    if ('alt' in diff) {
      el.setAttribute("alt", attr.alt);
    }

    this.observeElement = options.observeElement || true;
  }

}, {
  Model: CimageData,
  parse: function(element) {
    var data = CobjView.parse(element);

    var src = element.getAttribute('src');
    var alt = element.getAttribute('alt');

    data.src = src ? src.replace(WL.imagePath, '') : undefined;
    data.alt = alt ? alt : undefined;

    return data;
  }
});


pluginManager.registerType('image', CimageView);
module.exports = CimageView;
