'use strict';
var ElementView = require('./elementview.js');
var pluginManager = require('./pluginmanager.js');
var Kern = require('../kern/Kern.js');

/**
 * A View which can render images
 * @param {NodeData} dataModel
 * @param {object}        options
 * @extends ElementView
 */
var TextView = ElementView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    ElementView.call(this, dataModel, Kern._extend({}, options, {
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

    ElementView.prototype.render.call(this, options);

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
    ElementView.prototype.parse.call(this, element);
    this.disableDataObserver();
    this.data.set("content", element.innerHTML);
    this.enableDataObserver();
  }
}, {
  /*
    inherits from ObjectView
    Model: NodeData,
    */
  defaults: Kern._extend({}, ElementView.defaults, {
    type: 'text',
    content: ''
  })
});


pluginManager.registerType('text', TextView);
module.exports = TextView;
