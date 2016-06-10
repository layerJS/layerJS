'use strict';
var ElementView = require('./elementview.js');
var pluginManager = require('./pluginmanager.js');
var Kern = require('../kern/Kern.js');
var WL = require('./wl.js');

/**
 * A View which can render images
 * @param {ImageData} dataModel
 * @param {object}        options
 * @extends ElementView
 */
var ImageView = ElementView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    ElementView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
  render: function(options) {
    options = options || {};
    this.disableObserver();

    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.outerEl;

    ElementView.prototype.render.call(this, options);

    if ('src' in diff) {
      el.setAttribute("src", WL.imagePath + attr.src);
    }

    if ('alt' in diff) {
      el.setAttribute("alt", attr.alt);
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

    var src = element.getAttribute('src');
    var alt = element.getAttribute('alt');

    this.disableDataObserver();
    this.data.set("src", src ? src.replace(WL.imagePath, '') : undefined);
    this.data.set("alt", alt ? alt : undefined);
    this.enableDataObserver();
  }
}, {
  /*
  Model: ImageData*/
  defaults: Kern._extend({}, ElementView.defaults, {
    type: 'image',
    alt: '',
    src: ''
  })
});


pluginManager.registerType('image', ImageView);
module.exports = ImageView;
