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
    this.data = this.data || dataModel || options.el && new this.constructor.Model();
    if (!this.data) throw "data object must exist when creating a view";
    this.disableDataObserver();
    // if element is given, parse the element to fill data object
    this.data.silence();
    if (options.el) {
      this.parse(options.el);
    }
    // copy version from parent
    // FIXME: how can we get a different version in a child? Needed maybe for editor.
    // FIXME(cont): can't test for this.data.attributes.version as this will be 'default'
    if (options.parent && options.parent.data.attributes.version) {
      this.data.set("version", options.parent.data.attributes.version);
    }
    if (this.data.attributes.id === undefined) {
      this.data.set("id", repository.getId()); // if we don't have an data object we must create an id.
    }
    this.data.fire();
    // register data object with repository
    if (this.data.attributes.version && !repository.hasVersion(this.data.attributes.version)) {
      repository.createVersion(this.data.attributes.version);
    }
    if (!repository.contains(this.data.attributes.id, this.data.attributes.version)) {
      repository.add(this.data, this.data.attributes.version);
    }
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
      if (!that._dataObserverCounter) {
        if (model.changedAttributes.hasOwnProperty('width') || model.changedAttributes.hasOwnProperty('height')) {
          that._fixedDimensions();
        }
        that.render();
      }
    }, {
      ignoreSender: that
    });
    this._fixedDimensions();
    // Only render the element when it is passed in the options
    if (!options.noRender && (options.forceRender || !options.el))
      this.render();

    this._createObserver();
    this.enableObserver();
    this.enableDataObserver();

  },
  /**
   * checks if the data object contains fixed width and height and provides those in the properties
   * fixedWidth and fixedHeight. This allows certain functions (like getTransformData) to calculate
   * geometries before this element is rendered. Those properties should be accessed via the .width()
   * and height() methods which also consider the rendered dimensions.
   *
   * @returns {void}
   */
  _fixedDimensions: function() {
    var match;
    if (this.data.attributes.width && (match = this.data.attributes.width.match(/(.*)px/))) {
      this.fixedWidth = parseInt(match[1]);
    } else {
      delete this.fixedWidth;
    }
    if (this.data.attributes.height && (match = this.data.attributes.height.match(/(.*)px/))) {
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
   * get Parent View of specific type recursively
   *
   * @param {string} type - the type the parent should have
   * @returns {ObjView} the View requested
   */
  getParentOfType(type) {
    if (this.parent && this.parent.data) {
      if (this.parent.data.attributes.type && this.parent.data.attributes.type === type) return this.parent;
      return this.parent.getParentOfType(type); // search recursively
    } else {
      // we need to to this dom based as there may be non-layerjs elements in the hierarchy
      var el = this.outerEl.parentNode;
      if (!el) return undefined; // no parent element return undefined
      while (!el._wlView) { // search for layerjs element in parent hierarchy
        if (!el.parentNode) return undefined; // no parent element return undefined
        el = el.parentNode;
      }
      if (el._wlView.data.attributes.type === type) return el._wlView; // found one; is it the right type?
      return el._wlView.getParentOfType(type); // search recursively
    }
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
   * @param {Object} arguments - List of styles that should be applied
   * @returns {Type} Description
   */
  applyStyles: function() {
    this.disableObserver();
    var len = arguments.length;
    for (var j = 0; j < len; j++) {
      var props = Object.keys(arguments[j]); // this does not run through the prototype chain; also does not return special
      for (var i = 0; i < props.length; i++) {
        if ($.cssPrefix[props[i]]) this.outerEl.style[$.cssPrefix[props[i]]] = arguments[j][props[i]];
        // do standard property as well as newer browsers may not accept their own prefixes  (e.g. IE & edge)
        this.outerEl.style[props[i]] = arguments[j][props[i]];
      }
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
        var attributeName = attribute.name.replace('data-wl-', '');
        var attributeValue = attribute.value;

        if (attributeValue === 'true' || attributeValue === 'false') {
          attributeValue = eval(attributeValue); // jshint ignore:line
        }

        attributeName = attributeName.replace(/(\-[a-z])/g, function($1) {
          return $1.toUpperCase().replace('-', '');
        });

        var attributeNames = attributeName.split('.');
        var attributesNamesLength = attributeNames.length;
        var attributeObj = data;
        for (var i = 0; i < attributesNamesLength; i++) {
          if (!attributeObj.hasOwnProperty(attributeNames[i])) {
            attributeObj[attributeNames[i]] = (i === attributesNamesLength - 1) ? attributeValue : {};
          }
          attributeObj = attributeObj[attributeNames[i]];
        }
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

    if (style.width !== undefined) {
      data.width = style.width; //FIXME: how to deal with this?
    }
    if (!data.width && element.getAttribute('width')) { // only a limited set of elements support the width attribute
      data.width = element.getAttribute('width');
    }
    if (style.height !== undefined) {
      data.height = style.height;
    }
    if (!data.height && element.getAttribute('height')) { // only a limited set of elements support the width attribute
      data.height = element.getAttribute('height');
    }
    this.disableDataObserver();
    // modify existing data object, don't trigger any change events to ourselves
    this.data.setBy(this, data);
    this.enableDataObserver();

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
    if (window.MutationObserver && this._observerCounter === 0) {
      this._observer.observe(this.outerEl, {
        attributes: true,
        childList: false,
        characterData: true,
        subtree: false
      });
    }
  },
  disableObserver: function() {
    if (!this.hasOwnProperty('_observerCounter')) {
      this._observerCounter = 0;
    }

    this._observerCounter++;
    if (window.MutationObserver && this._observer && this._observer.disconnect) {
      this._observer.disconnect();
    }
  },
  _createObserver: function() {

    if (this.hasOwnProperty('_observer'))
      return;

    var that = this;

    if (window.MutationObserver) {
      this._observer = new MutationObserver(function(mutations) {
        var i;
        var trigger = false;
        for (i = 0; i < mutations.length; i++) {
          // FIXME: do a similar thing for DOMChangeListeners below
          if (!(mutations[i].type === "attributes" && mutations[i].attributeName === 'styles')) {
            trigger = true;
          }
        }
        if (trigger) {
          that._domElementChanged();
        }
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

    this.parse(this.outerEl);
  }
}, {
  // save model class as static variable
  Model: ObjData
});


pluginManager.registerType('node', ObjView);

module.exports = ObjView;
