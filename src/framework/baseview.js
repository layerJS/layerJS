'use strict';
var Kern = require('../kern/Kern.js');
var defaults = require('./defaults.js');
var state = require('./state.js');
var $ = require('./domhelpers.js');
var pluginManager = require('./pluginmanager.js');
var observerFactory = require('./observer/observerfactory.js');

var baseView = Kern.EventManager.extend({

  constructor: function(options) {
    options = options || {};
    this.childType = options.childType;
    Kern.EventManager.call(this);
    this._setDocument(options);

    //this.outerEl = this.innerEl = undefined;
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
    this._createObserver();
    this.enableObserver();

    // copy version from parent
    // FIXME: how can we get a different version in a child? Needed maybe for editor.
    // FIXME(cont): can't test for this.data.attributes.version as this will be 'default'
    /*if (options.parent && options.parent.version()) {
      this.setVersion(options.parent.version());
    }*/
  },
  eval: function(arg) {
    var evalFn = eval;

    return evalFn(arg);
  },
  enableObserver: function() {
    if (this._observer) {
      this._observer.observe();
    }
  },
  disableObserver: function() {
    if (this._observer) {
      this._observer.stop();
    }
  },
  _createObserver: function() {
    if (this.hasOwnProperty('_observer'))
      return;

    var that = this;
    this._observer = observerFactory.getObserver(this.innerEl, {
      attributes: true,
      attributeFilter: ['id', 'name', 'data-lj-*','lj-*'],
      childList: true,
      callback: function(result) {
        that._domElementChanged(result);
      }
    });
  },
  /**
   * This function will parse the DOM element and add it to the data of the view.
   * It will be use by the MutationObserver.
   * @param {result} an object that contains what has been changed on the DOM element
   * @return {void}
   */
  _domElementChanged: function(result) {
    if (result.attributes.length > 0) {
      //this.parse(this.outerEl);
    }

    if (result.removedNodes.length > 0 || result.addedNodes.length > 0) {
      if (result.addedNodes.length > 0) {
        this._parseChildren();
      }
      state.updateChildren(this, result.addedNodes, result.removedNodes);
    }
  },
  _parseChildren: function() {
    if (this.childType) {
      for (var i = 0; i < this.innerEl.children.length; i++) {
        var child = this.innerEl.children[i];
        if (!child._ljView && $.getAttributeLJ(child, 'type') === this.childType) {
          pluginManager.createView(this.childType, {
            el: child,
            parent: this,
            document: this.document
          });

          this.renderChildPosition(child._ljView);
        }
      }
    }
  },
  _parseDimension: function(value) {
    var match;
    if (value && typeof value === 'string' && (match = value.match(/(.*)(?:px)?$/))) return parseInt(match[1]);
    if (value && typeof value === 'number') return value;
    return undefined;
  },
  _getChildViewsByChildName: function() {
    let result = {};
    let state = this.outerEl._state;

    if (state && this.childType) {
      for (var childName in state.children) {
        if (state.children.hasOwnProperty(childName) && state.children[childName].view.type() === this.childType) {
          result[childName] = state.children[childName].view;
        }
      }
    }

    return result;
  },
  getChildViewByName: function(name) {
    var children = this._getChildViewsByChildName();

    return children.hasOwnProperty(name) ? children[name] : undefined;
  },
  getChildViews: function() {
    var children = this._getChildViewsByChildName();
    var result = [];

    for (var childName in children) {
      if (children.hasOwnProperty(childName)) {
        result.push(children[childName]);
      }
    }

    return result;

  },
  getParentOfType: function(type) {
    let parentView;
    let state = this.outerEl._state;

    if (state) {
      let parent = state.parent;
      while (parent && parent.view.type() !== type) {
        parent = parent.parent.view ? parent.parent : undefined;
      }

      parentView = parent ? parent.view : undefined;
    }
    return parentView;
  },
  /**
   * Will determin which docment object should be associated with this view
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
  renderChildPosition: function(childView) {},
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
      this._id = this.getAttributeLJ('id');

      if (!this._id) {
        if (!this.outerEl._state) {
          throw 'element should be associated with an lj-id or a state in order to use id()';
        }
        var parentChildren = this.outerEl._state.parent.children;

        for (var childName in parentChildren) {
          if (parentChildren.hasOwnProperty(childName) && parentChildren[childName].view === this) {
            this._id = childName;
            break;
          }
        }
      }
    }

    return this._id;
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
  setVersion: function(version) {
    this.setAttributeLJ('version', version);
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
  zIndex: function() {
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
    return nativeScroll ? this.eval(nativeScroll) : false;
  },
  setNativeScroll: function(nativeScroll) {
    this.setAttributeLJ('native-scroll', nativeScroll);
  },
});

module.exports = baseView;
