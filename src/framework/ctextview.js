'use strict';
var CobjView = require('./cobjview.js');
var CtextData = require('./ctextdata.js');
var pluginManager = require('./pluginmanager.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can render images
 * @param {CtextData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CtextView = CobjView.extend({
  constructor: function(dataModel, options) {
    options = options || {};

    CobjView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true,
      observeElement: false
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

    if ('content' in diff) {
      el.innerHTML = attr.content;
    }

    this.observeElement = options.observeElement || true;
  }

}, {
  Model: CtextData,
  parse: function(element) {
    var data = CobjView.parse(element);
    data.content = element.innerHTML;

    return data;
  }
});


pluginManager.registerType('text', CtextView);
module.exports = CtextView;
