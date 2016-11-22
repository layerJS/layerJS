'use strict';
var Kern = require('../kern/Kern.js');
var repository = require('./repository.js');
var defaults = require('./defaults.js');

var baseView = Kern.EventManager.extend({

  constructor: function(options) {
    options = options || {};
    this.eval = eval;

    Kern.EventManager.call(this);
    this.outerEl = this.innerEl = undefined;
  },
  _parseDimension: function(value) {
    var match;
    if (value && typeof value === 'string' && (match = value.match(/(.*)(?:px)?$/))) return parseInt(match[1]);
    if (value && typeof value === 'number') return value;
    return undefined;
  },
  getAttributeLJ: function(name) {
    name = 'lj-' + name;

    return this.outerEl.getAttribute(name) || this.outerEl.getAttribute('data-' + name);
  },
  id: function() {
    var id = this.getAttributeLJ('id');

    if (!id) {
      this._id = this._id || repository.getId();
      id = this._id;
    }

    return id;
  },
  elementId: function() {
    return this.outerEl.id;
  },
  name: function() {
    return this.getAttributeLJ('name');
  },
  type: function() {
    return this.getAttributeLJ('type');
  },
  nodeType: function() {
    return this.outerEl && this.outerEl.nodeType;
  },
  version: function() {
    var version = this.getAttributeLJ('version');

    if (!version) {
      this._version = this._version || defaults.version;
      version = this._version;
    }
    return version;
  },
  width: function() {
    var width = this.outerEl.offsetWidth;

    if (!width && this.outerEl.style.width !== undefined)
      width = this.outerEl.style.width;

    if (!width) {
      width = this.getAttributeLJ('width');
    }

    if (!width) {
      width = this.getAttribute('width');
    }

    return this._parseDimension(width);
  },
  height: function() {
    var height = this.outerEl.offsetHeight;

    if (!height && this.outerEl.style.height !== undefined)
      height = this.outerEl.style.height;

    if (!height) {
      height = this.getAttributeLJ('height');
    }

    if (!height) {
      height = this.getAttribute('height');
    }

    return this._parseDimension(height);
  },
  x: function() {
    var x = this.getAttributeLJ('x');

    if (this.outerEl.style.left) {
      x = this.outerEl.style.left;
    }

    return this.outerEl.offsetLeft || this._parseDimension(x);
  },
  y: function() {
    var y = this.getAttributeLJ('y');

    if (this.outerEl.style.top) {
      y = this.outerEl.style.top;
    }

    return this.outerEl.offsetTop || this._parseDimension(y);
  },
  hidden: function() {
    return this.outerEl.style.display === 'none';
  },
  zindex: function() {
    return this.outerEl.style.zIndex;
  },
  tag: function() {
    return this.nodeType() === 1 ? this.outerEl.tagName : '';
  },
  classes: function() {
    return this.getAttributeLJ('classes') || '';
  },
  children: function() {
    var children = this.getAttributeLJ('children');

    return children ? this.eval(children) : [];
  },
  scaleX: function() {
    var scaleX = this.getAttributeLJ('scale-x');

    return scaleX ? this.eval(scaleX) : 1;
  },
  scaleY: function() {
      var scaleY = this.getAttributeLJ('scale-y');

      return scaleY ? this.eval(scaleY) : 1;
    },
    /*frame */
  fitTo: function() {
    return this.getAttributeLJ('fit-to') || 'width';
  },
  elasticLeft: function() {
    return this.getAttributeLJ('elastic-left');
  },
  elasticRight: function() {
    return this.getAttributeLJ('elastic-right');
  },
  elasticTop: function() {
    return this.getAttributeLJ('elastic-top');
  },
  elasticBottom: function() {
    return this.getAttributeLJ('elastic-bottom');
  },
  startPosition: function() {
    return this.getAttributeLJ('start-position') || 'top';
  },
  noScrolling: function() {
    var noScrolling = this.getAttributeLJ('no-scrolling');
    return noScrolling ? this.eval(noScrolling) : false;
  },
  rotation: function(){
    return this.getAttributeLJ('rotation');
  },
  /*layer*/
  layoutType: function(){
    return this.getAttributeLJ('layout-type') || 'slide';
  },
  defaultFrame: function(){
    return this.getAttributeLJ('default-frame');
  },
  nativeScroll: function() {
    var nativeScroll = this.getAttributeLJ('native-scroll');
    return nativeScroll ? this.eval(nativeScroll) : false;
  }
});

module.exports = baseView;
