'use strict';
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var repository = require('./repository.js');
var ObjData = require('./objdata.js');

/**
 * Defines the view of a ObjData and provides all basic properties and
 * rendering fuctions that are needed for a visible element.
 *
 * @param {ObjData} dataModel the Tailbone Model of the View's data
 * @param {Object} options {data: json for creating a new data object; el: (optional) HTMLelement already exisitng; outerEl: (optional) link wrapper existing; root: true if that is the root object}
 */
var ObjView = Kern.EventManager.extend({
  constructor: function(dataModel, options) {
    Kern.EventManager.call(this);
    options = options || {};
    // dataobject must exist
    this.data = this.data || dataModel || (options.el && this.parse(options.el));
    if (!this.data) throw "data object must exist when creating a view";
    // parent if defined
    this.parent = options.parent;
    // DOM element, take either the one provide by a sub constructor, provided in options, or create new
    this.innerEl = this.innerEl || options.el || document.createElement(this.data.attributes.tag);
    // backlink from DOM to object
    if (this.innerEl._wlView) throw "trying to initialialize view on element that already has a view";
    this.innerEl._wlView = this;
    // possible wrapper element
    this.outerEl = this.outerEl || options.el || this.innerEl;
    this.outerEl._wlView = this;
    this.disableObserver();

    var that = this;
    // The change event must change the properties of the HTMLElement el.
    this.data.on('change', function(model) {
      if (model.changedAttributes.hasOwnProperty('width') || model.changedAttributes.hasOwnProperty('height')) that._fixedDimensions();
      that.render();

    });
    this._fixedDimensions();
    // Only render the element when it is passed in the options
    if (!options.noRender && (options.forceRender || !options.el))
      this.render();

    this._createObserver();
    this.enableObserver();
  },
  _fixedDimensions: function() {
    var match;
    if (this.data.width && (match = this.data.width.match(/(.*)px/))) {
      this.fixedWidth = parseInt(match[1]);
    } else {
      delete this.fixedWidth;
    }
    if (this.data.height && (match = this.data.height.match(/(.*)px/))) {
      this.fixedHeight = parseInt(match[1]);
    } else {
      delete this.fixedHeight;
    }
  },
  /**
   * add a new parent view
   *
   * @param {ObjView} parent - the parent of this view
   * @returns {Type} Description
   */
  setParent: function(parent) {
    this.parent = parent;
    // notify listeners.
    this.trigger('parent', parent);
  },
  /**
   * return the parent view of this view
   *
   * @returns {ObjView} parent
   */
  getParent: function() {
    return this.parent;
  },
  /**
   * This property keeps track if the view is already rendered.
   * If true, the render method will only update the changedAttributes of the data model   *
   */
  isRendered: false,
  /**
   * ##render
   * This method applies all the object attributes to its DOM element `this.$el`.
   * It only updates attributes that have changes (`this.data.changedAttributes`)
   * @return {void}
   */
  render: function(options) {
    options = options || {};
    this.disableObserver();

    var attr = this.data.attributes,
      diff = (this.isRendererd ? this.data.changedAttributes : this.data.attributes),
      outerEl = this.outerEl;
    if ('id' in diff) {
      outerEl.setAttribute("data-wl-id", attr.id); //-> should be a class?
    }

    if ('type' in diff) {
      outerEl.setAttribute("data-wl-type", attr.type); //-> should be a class?
    }

    if ('elementId' in diff || 'id' in diff) {
      outerEl.id = attr.elementId || "wl-obj-" + attr.id; //-> shouldn't we always set an id? (priority of #id based css declarations)
    }

    // add classes to object
    if ('classes' in diff) {
      var classes = 'object-default object-' + this.data.get('type');
      // this.ui && (classes += ' object-ui');
      // this.ontop && (classes += ' object-ontop');
      if (attr.classes) {
        classes += ' ' + attr.classes;
      }
      outerEl.className = classes;
    }

    // When the object is an anchor, set the necessary attributes
    if (this.data.attributes.tag.toUpperCase() === 'A') {
      if ('linkTo' in diff)
        outerEl.setAttribute('href', this.data.attributes.linkTo);

      if (!this.data.attributes.linkTarget)
        this.data.attributes.linkTarget = '_self';

      if ('linkTarget' in diff)
        outerEl.setAttribute('target', this.data.attributes.linkTarget);
    }

    // create object css style
    // these styles are stored in the head of the page index.html
    // in a style tag with the id object_css
    // FIXME: we should use $('#object_css').sheet to acces the style sheet and then iterate through the cssrules. The view can keep a reference to its cssrule
    // FIXME: should we support media queries here. if so how does that work with versions? alternative?

    var selector = (attr.elementId && "#" + attr.elementId) || "#wl-obj-" + attr.id;
    var oldSelector = (diff.elementId && "#" + diff.elementId) || (diff.id && "#wl-obj-" + diff.id) || selector;

    if (('style' in diff) || (selector !== oldSelector)) {
      var styleElement = document.getElementById('wl-obj-css');
      if (!styleElement) {
        styleElement = document.createElement('style');
        document.head.appendChild(styleElement);
      }
      var cssContent = styleElement.innerHTML;
      var re;

      if (attr.style) {
        if (cssContent.indexOf(oldSelector) === -1) {
          styleElement.innerHTML += selector + '{' + attr.style + '}\n';
        } else {
          re = new RegExp(oldSelector + '{[^}]*}', 'g');
          styleElement.innerHTML = cssContent.replace(re, selector + '{' + attr.style + '}');
        }
      } else { // no style provided, if it is is in object_css tag delete it from there
        if (cssContent.indexOf(oldSelector) !== -1) {
          re = new RegExp(oldSelector + '{[^}]*}', 'g');
          styleElement.innerHTML = cssContent.replace(re, '');
        }
      }
    }

    this.isRendered = true;

    this.enableObserver();
  },
  /**
   * apply CSS styles to this view
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  applyStyles: function(styles) {
    this.disableObserver();

    var props = Object.keys(styles);
    for (var i = 0; i < props.length; i++) {
      this.outerEl.style[$.cssPrefix[props[i]] || props[i]] = styles[props[i]];
    }

    this.enableObserver();
  },
  /**
   * returns the width of the object. Note, this is the actual width which may be different then in the data object
   * Use waitForDimensions() to ensure that this value is correct
   *
   * @returns {number} width
   */
  width: function() {
    return this.outerEl.offsetWidth || this.fixedWidth;
  },
  /**
   * returns the height of the object. Note, this is the actual height which may be different then in the data object.
   * Use waitForDimensions() to ensure that this value is correct
   *
   * @returns {number} height
   */
  height: function() {
    return this.outerEl.offsetHeight || this.fixedHeight;
  },
  /**
   * make sure element has reliable dimensions, either by being rendered or by having fixed dimensions
   *
   * @returns {Promise} the promise which becomes fulfilled if dimensions are availabe
   */
  waitForDimensions: function() {
    var p = new Kern.Promise();
    var w = this.outerEl.offsetWidth || this.fixedWidth;
    var h = this.outerEl.offsetHeight || this.fixedHeight;
    var that = this;
    if (w || h) {
      p.resolve({
        width: w || 0,
        height: h || 0
      });
    } else {
      setTimeout(function f() {
        var w = that.outerEl.offsetWidth || this.fixedWidth;
        var h = that.outerEl.offsetHeight || this.fixedHeight;
        if (w || h) {
          p.resolve({
            width: w || 0,
            height: h || 0
          });
        } else {
          setTimeout(f, 200);
        }
      }, 0);

    }
    return p;
  },
  /**
   * Will create a dataobject based on a DOM element
   *
   * @param {element} DOM element to needs to be parsed
   * @return  {data} a javascript data object
   */
  parse: function(element) {
    var index;
    var data = {
      tag: element.tagName
    };

    var attributes = element.attributes;
    var length = attributes.length;

    for (index = 0; index < length; index++) {
      var attribute = attributes[index];
      if (attribute.name.indexOf('data-wl-') === 0) {
        data[attribute.name.replace('data-wl-', '')] = attribute.value;
      }
    }

    data.classes = element.className.replace("object-default object-" + data.type + " ", ""); //FIXME: remove old webpgr classes

    if (data.tag.toUpperCase() === 'A') {
      data.linkTo = element.getAttribute('href');
      data.linkTarget = element.getAttribute('target');
    }

    var style = element.style;

    if (style.left) {
      data.x = style.left;
    }
    if (style.top) {
      data.y = style.top;
    }
    if (style.display === 'none') {
      data.hidden = true;
    }
    if (style.zIndex) {
      data.zIndex = style.zIndex;
    }

    data.width = style.width;
    if (!data.width && element.getAttribute('width')) { // only a limited set of elements support the width attribute
      data.width = element.getAttribute('width');
    }
    data.height = style.height;
    if (!data.height && element.getAttribute('height')) { // only a limited set of elements support the width attribute
      data.height = element.getAttribute('height');
    }

    if (data.id === undefined) {
      data.id = repository.getId(); // if we don't have an data object we must create an id.
    }

    // modify existing data object if present
    if (this.data) {
      this.data.silence();
      this.data.set(data);
      this.data.ignore();
    }

    var returnedDataObject = this.data ? this.data : new this.constructor.Model(data); // this will find the correct data object class which will also set the correct type

    if (!repository.hasVersion(returnedDataObject.attributes.version)) {
      repository.createVersion(returnedDataObject.attributes.version);
    }

    if (!repository.contains(returnedDataObject.attributes.id, returnedDataObject.attributes.version)) {
      repository.add(returnedDataObject, returnedDataObject.attributes.version);
    }

    return returnedDataObject;
  },
  /**
   * ##destroy
   * This element was requested to be deleted completly; before the delete happens
   * an event is triggerd on which this function id bound (in `initialialize`). It
   * will remove the DOM elements connected to this element.
   * @return {void}
   */
  destroy: function() {
    if (window.MutationObserver && this._observer) {
      this._observer.disconnect();
    }

    this.outerEl.parentNode.removeChild(this.outerEl);
  },
  enableDataObserver: function() {
    if (!this.hasOwnProperty('_dataObserverCounter')) {
      this._dataObserverCounter = 0;
    } else if (this._dataObserverCounter > 0) {
      this._dataObserverCounter--;
    }
  },
  disableDataObserver: function() {
    if (!this.hasOwnProperty('_dataObserverCounter')) {
      this._dataObserverCounter = 0;
    }

    this._dataObserverCounter++;
  },
  enableObserver: function() {
    if (!this.hasOwnProperty('_observerCounter')) {
      this._observerCounter = 0;
    } else if (this._observerCounter > 0) {
      this._observerCounter--;
    }
  },
  disableObserver: function() {
    if (!this.hasOwnProperty('_observerCounter')) {
      this._observerCounter = 0;
    }

    this._observerCounter++;
  },
  _createObserver: function() {

    if (this.hasOwnProperty('_observer'))
      return;

    var that = this;

    if (window.MutationObserver) {
      this._observer = new MutationObserver(function() {
        that._domElementChanged();
      });

      this._observer.observe(this.outerEl, {
        attributes: true,
        childList: false,
        characterData: true,
        subtree: false
      });
    } else {
      this._observer = {};

      this.outerEl.addEventListener("DOMAttrModified", function() {
        that._domElementChanged();
      }, false);

      this.outerEl.addEventListener("DOMAttributeNameChanged", function() {
        that._domElementChanged();
      }, false);

      this.outerEl.addEventListener("DOMCharacterDataModified", function() {
        that._domElementChanged();
      }, false);

      this.outerEl.addEventListener("DOMElementNameChanged", function() {
        that._domElementChanged();
      }, false);
    }
  },
  /**
   * This function will parse the DOM element and add it to the data of the view.
   * It will be use by the MutationObserver.
   * @return {void}
   */
  _domElementChanged: function() {
    if (this._observerCounter !== 0) return;

    var dataObject = this.parse(this.outerEl);

    this.data.silence();
    for (var data in dataObject) {
      if (dataObject.hasOwnProperty(data)) {
        this.data.set(data, dataObject[data]);
      }
    }
    this.data.ignore();
  }
}, {
  // save model class as static variable
  Model: ObjData
});


pluginManager.registerType('node', ObjView);

module.exports = ObjView;
