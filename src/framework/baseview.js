'use strict';
var state = require('./state.js');
var $ = require('./domhelpers.js');
var pluginManager = require('./pluginmanager.js');
var parseManager = require('./parsemanager.js');
var DOMObserver = require('./observer/domobserver.js');

var BaseView = DOMObserver.extend({

  constructor: function(options) {
    options = options || {};
    DOMObserver.call(this);

    this._cache = {}; // this will cache some properties. The cache can be deleted an the method will need to rebuild the data. Therefore don't query the _cache directly, but use the accessor functions.
    this.childType = options.childType;
    this._setDocument(options);

    // parent if defined
    this.parent = options.parent;
    this.innerEl = this.innerEl || options.el;
    // backlink from DOM to object
    if (this.innerEl._ljView) throw "trying to initialialize view on element that already has a view";
    this.innerEl._ljView = this;
    // possible wrapper element
    this.outerEl = this.outerEl || options.el || this.innerEl;
    this.outerEl._ljView = this;

    state.registerView(this);

    if (!this.parent && this.outerEl._state && this.outerEl._state.view) {
      this.parent = this.outerEl._state.parent.view;
    }

    this._parseChildren();
    this.registerEventHandlers();
    this.startObserving();
  },
  /* jshint ignore:start */
  startObserving: function(){

  },
  /* jshint ignore:end */
  registerEventHandlers: function() {
    this.on('childrenChanged', function(result) {
      if ((result.addedNodes && result.addedNodes.length > 0) || ( result.removedNodes && result.removedNodes.length > 0)) {
        this._parseChildren({
          addedNodes: result.addedNodes,
          removedNodes : result.removedNodes
        });
      }
    });
  },
  _parseChildren: function(options) {
    options = options || {};

    this._cache.children = [];
    this._cache.childNames = {};
    this._cache.childIDs = {};
    if (this.childType) {
      for (var i = 0; i < this.innerEl.children.length; i++) {
        var child = this.innerEl.children[i];
        if (!child._ljView && $.getAttributeLJ(child, 'type') === this.childType) {
          pluginManager.createView(this.childType, {
            el: child,
            parent: this,
            document: this.document
          });
          this._renderChildPosition(child._ljView);
        }
        if (child._ljView && child._ljView.type() === this.childType) {
          var cv = child._ljView;
          this._cache.children.push(cv);
          this._cache.childNames[cv.name()] = cv;
          this._cache.childIDs[cv.id()] = cv;
        }
      }
    }
    if (options.addedNodes && options.addedNodes.length > 0) {
      var length = options.addedNodes.length;
      for (var x = 0; x < length; x++) {
        // check if added nodes don't already have a view defined.
        if (!options.addedNodes[x]._ljView) {
          parseManager.parseElement(options.addedNodes[x].parentNode);
        }
      }
    }

  },
  getChildViewByName: function(name) {
    if (!this._cache.childNames) this._parseChildren();
    return this._cache.childNames[name];
  },
  getChildViews: function() {
    if (!this._cache.children) this._parseChildren();
    return this._cache.children;
  },
  /**
   * Will determin which document object should be associated with this view
   * @param {result} an object that contains what has been changed on the DOM element
   * @return {void}
   */
  _setDocument: function(options) {
    this.document = document;

    if (options) {
      if (options.document) {
        this.document = options.document;
      } else if (options.el) {
        this.document = options.el.ownerDocument;
      }
    }
  },
  /* jshint ignore:start */
  _renderChildPosition: function(childView) {

  },
  /* jshint ignore:end */
  /**
   * apply CSS styles to this view
   *
   * @param {Object} arguments - List of styles that should be applied
   * @returns {Type} Description
   */
  applyStyles: function() {
    var len = arguments.length;
    for (var j = 0; j < len; j++) {
      var props = Object.keys(arguments[j]); // this does not run through the prototype chain; also does not return special
      for (var i = 0; i < props.length; i++) {
        if ($.cssPrefix[props[i]]) this.outerEl.style[$.cssPrefix[props[i]]] = arguments[j][props[i]];
        // do standard property as well as newer browsers may not accept their own prefixes  (e.g. IE & edge)
        this.outerEl.style[props[i]] = arguments[j][props[i]];
      }
    }
  },
  setAttributeLJ: function(name, data) {
    $.setAttributeLJ(this.outerEl, name, data);
  },
  getAttributeLJ: function(name) {
    return $.getAttributeLJ(this.outerEl, name);
  },
  getAttribute: function(name) {
    return this.outerEl.getAttribute(name);
  },
  id: function() {
    if (!this._id) {
      this._id = this.getAttributeLJ('id') || this.outerEl.id || $.uniqueID(this.type());
    }
    return this._id;
  },
  name: function() {
    return this.getAttributeLJ('name') || this.outerEl.id || this.id();
  },
  type: function() {
    return this.getAttributeLJ('type');
  },
  nodeType: function() {
    return this.outerEl && this.outerEl.nodeType;
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

    return $.parseDimension(width);
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

    return $.parseDimension(height);
  },
  x: function() {
    var x = this.getAttributeLJ('x');

    if (this.outerEl.style.left) {
      x = this.outerEl.style.left;
    }

    return this.outerEl.offsetLeft || $.parseDimension(x);
  },
  y: function() {
    var y = this.getAttributeLJ('y');

    if (this.outerEl.style.top) {
      y = this.outerEl.style.top;
    }

    return this.outerEl.offsetTop || $.parseDimension(y);
  },
  hidden: function() {
    return this.outerEl.style.display === 'none';
  },
  zIndex: function() {
    return this.outerEl.style.zIndex;
  },
  tag: function() {
    return this.nodeType() === 1 ? this.outerEl.tagName : '';
  },
  classes: function() {
    return this.getAttributeLJ('classes') || '';
  },
  scaleX: function() {
    var scaleX = this.getAttributeLJ('scale-x');

    return scaleX ? parseFloat(scaleX) : 1;
  },
  scaleY: function() {
    var scaleY = this.getAttributeLJ('scale-y');

    return scaleY ? parseFloat(scaleY) : 1;
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
    return noScrolling ? noScrolling === 'true'  : false;
  },
  rotation: function() {
    return this.getAttributeLJ('rotation');
  },
  neighbors: function() {
    var neighbors = {
      l: this.getAttributeLJ('neighbors.l'),
      r: this.getAttributeLJ('neighbors.r'),
      t: this.getAttributeLJ('neighbors.t'),
      b: this.getAttributeLJ('neighbors.b')
    };

    return neighbors;
  },
  /*layer*/
  layoutType: function() {
    return this.getAttributeLJ('layout-type') || 'slide';
  },
  defaultFrame: function() {
    return this.getAttributeLJ('default-frame');
  },
  nativeScroll: function() {
    var nativeScroll = this.getAttributeLJ('native-scroll');
    return nativeScroll ? nativeScroll === 'true' : true;
  },
  setNativeScroll: function(nativeScroll) {
    this.setAttributeLJ('native-scroll', nativeScroll);
  },
  /**
   * ##destroy
   * This element was requested to be deleted completly; before the delete happens
   * an event is triggerd on which this function id bound (in `initialialize`). It
   * will remove the DOM elements connected to this element.
   * @return {void}
   */
  destroy: function() {
    this.unobserve();
    this.outerEl.parentNode.removeChild(this.outerEl);
  }
});

module.exports = BaseView;
