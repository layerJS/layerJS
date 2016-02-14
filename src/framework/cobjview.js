'use strict';
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js')
var CobjData = require('./cobjdata.js');

/**
 * Defines the view of a cobj and provides all basic properties and
 * rendering fuctions that are needed for a visible element.
 *
 * @param {CobjData} dataModel the Tailbone Model of the View's data
 * @param {Object} options {data: json for creating a new data object; el: (optional) HTMLelement already exisitng; elWrapper: (optional) link wrapper existing; root: true if that is the root object}
 */
var CobjView = Kern.EventManager.extend({
  constructor: function(dataModel, options) {
    Kern.EventManager.call(this);
    options = options || {};
    // dataobject must exist
    if (!dataModel) throw "data object mus exist when creating a view";
    this.data = dataModel;
    // parent if defined
    this.parent = options.parent;
    // DOM element, take either the one provide by a sub constructor, provided in options, or create new
    this.el = this.el || options.el || document.createElement(this.data.attributes.tag);
    // backlink from DOM to object
    if (this.el._wlView) throw "trying to initialialize view on element that already has a view";
    this.el._wlView = this;
    // possible wrapper element
    this.elWrapper = this.elWrapper || options.elWrapper || this.el;
    this.elWrapper._wlView = this;
    this.observeElement = (!options.noObserveElement);

    var that = this;
    // The change event must change the properties of the HTMLElement el.
    this.data.on('change', function(model) {
      //that._renderPosition();
      if (model.changedAttributes.hasOwnProperty('width') || model.changedAttributes.hasOwnProperty('height')) that._fixedDimensions();
      that.render();
    });
    this._fixedDimensions();
    // Only render the element when it is passed in the options
    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
    this._observeElement();
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
   * @param {CobjView} parent - the parent of this view
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
   * @returns {CobjView} parent
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
    this.observeElement = false;

    var attr = this.data.attributes,
      diff = (this.isRendererd ? this.data.changedAttributes : this.data.attributes),
      elWrapper = this.elWrapper;
    if ('id' in diff) {
      elWrapper.setAttribute("data-wl-id", attr.id); //-> should be a class?
    }

    if ('type' in diff) {
      elWrapper.setAttribute("data-wl-type", attr.type); //-> should be a class?
    }

    if ('elementId' in diff || 'id' in diff) {
      elWrapper.id = attr.elementId || "wl-obj-" + attr.id; //-> shouldn't we always set an id? (priority of #id based css declarations)
    }

    // add classes to object
    if ('classes' in diff) {
      var classes = 'object-default object-' + this.data.get('type');
      // this.ui && (classes += ' object-ui');
      // this.ontop && (classes += ' object-ontop');
      attr.classes && (classes += ' ' + attr.classes);
      elWrapper.className = classes;
    }

    // When the object is an anchor, set the necessary attributes
    if (this.data.attributes.tag.toUpperCase() == 'A') {
      if ('linkTo' in diff)
        elWrapper.setAttribute('href', this.data.attributes.linkTo);

      if (!this.data.attributes.linkTarget)
        this.data.attributes.linkTarget = '_self';

      if ('linkTarget' in diff)
        elWrapper.setAttribute('target', this.data.attributes.linkTarget);
    }

    // create object css style
    // these styles are stored in the head of the page index.html
    // in a style tag with the id object_css
    // FIXME: we should use $('#object_css').sheet to acces the style sheet and then iterate through the cssrules. The view can keep a reference to its cssrule
    // FIXME: should we support media queries here. if so how does that work with versions? alternative?

    var selector = (attr.elementId && "#" + attr.elementId) || "#wl-obj-" + attr.id;
    var oldSelector = (diff.elementId && "#" + diff.elementId) || (diff.id && "#wl-obj-" + diff.id) || selector;

    if (('style' in diff) || (selector != oldSelector)) {
      var styleElement = document.getElementById('wl-obj-css');
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

    this.observeElement = (!options.noObserveElement);
  },

  /**
   * Position the view's element using it's data's positional attributes.
   */
  renderPosition: function(options) {
    options = options || {};
    this.observeElement = false;
    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.el;

    var css = {};
    'x' in diff && attr.x !== undefined && (css.left = attr.x + 'px');
    'y' in diff && attr.y !== undefined && (css.top = attr.y + 'px');
    ('x' in diff || 'y' in diff) && (css.position = (attr.x !== undefined || attr.y !== undefined ? "absolute" : "static"));
    ('scaleX' in diff || 'scaleY' in diff || 'rotation' in diff) && (css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : ""));
    'zIndex' in diff && attr.zIndex !== undefined && (css.zIndex = attr.zIndex);
    'hidden' in diff && (css.display = attr.hidden ? 'none' : '');
    'width' in diff && attr.width !== undefined && (css.width = attr.width + 'px');
    'height' in diff && attr.height !== undefined && (css.height = attr.height + 'px');

    Kern._extend(el.style, css);

    this.observeElement = (!options.noObserveElement);
  },
  /**
   * apply CSS styles to this view
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  applyStyles: function(styles) {
    var observeElementSve = this.observeElement;
    this.observeElement = false;

    var props = Object.keys(styles);
    for (var i = 0; i < props.length; i++) {
      this.elWrapper.style[$.cssPrefix[props[i]] || props[i]] = styles[props[i]];
    }

    this.observeElement = observeElementSve;
  },
  /**
   * returns the width of the object. Note, this is the actual width which may be different then in the data object
   * Use waitForDimensions() to ensure that this value is correct
   *
   * @returns {number} width
   */
  width: function() {
    return this.elWrapper.offsetWidth || this.fixedWidth;
  },
  /**
   * returns the height of the object. Note, this is the actual height which may be different then in the data object.
   * Use waitForDimensions() to ensure that this value is correct
   *
   * @returns {number} height
   */
  height: function() {
    return this.elWrapper.offsetHeight || this.fixedHeight;
  },
  /**
   * make sure element has reliable dimensions, either by being rendered or by having fixed dimensions
   *
   * @returns {Promise} the promise which becomes fulfilled if dimensions are availabe
   */
  waitForDimensions: function() {
    var p = new Kern.Promise();
    var w = this.elWrapper.offsetWidth || this.fixedWidth;
    var h = this.elWrapper.offsetHeight || this.fixedHeight;
    var that = this;
    if (w || h) {
      p.resolve({
        width: w || 0,
        height: h || 0
      });
    } else {
      setTimeout(function f() {
        var w = that.elWrapper.offsetWidth || this.fixedWidth;
        var h = that.elWrapper.offsetHeight || this.fixedHeight;
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
   * ##destroy
   * This element was requested to be deleted completly; before the delete happens
   * an event is triggerd on which this function id bound (in `initialialize`). It
   * will remove the DOM elements connected to this element.
   * @return {void}
   */
  destroy: function() {
    this.elWrapper.parentNode.removeChild(this.elWrapper);
  },
  _observeElement: function() {

    if (this.observer)
      return;

    var that = this;

    if (false && window.MutationObserver) {
      this.observer = new MutationObserver(function(mutation) {
        that._domElementChanged();
      });

      this.observer.observe(this.el, new {
        attributes: true,
        childList: false,
        characterData: true,
        subtree: false
      });
    } else {
      this.observer = {};

      this.el.addEventListener("DOMAttrModified", function(ev) {
        that._domElementChanged();
      }, false);

      this.el.addEventListener("DOMAttributeNameChanged", function(ev) {
        that._domElementChanged();
      }, false);

      this.el.addEventListener("DOMCharacterDataModified", function(ev) {
        that._domElementChanged();
      }, false);

      this.el.addEventListener("DOMElementNameChanged", function(ev) {
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
    if (!this.observeElement) return;
    var dataObject = CobjView.parse(this.el);

    this.data.silence();
    for (var data in dataObject) {
      this.data.set(data, dataObject[data]);
    }
    this.data.ignore();
  }
}, {
  // save model class as static variable
  Model: CobjData,
  /**
   * Will create a dataobject based on a DOM element
   *
   * @param {element} DOM element to needs to be parsed
   * @return  {data} a javascript data object
   */
  parse: function(element) {
    var data = {
      tag: element.tagName
    };

    var attributes = element.attributes;
    var length = attributes.length;

    for (var index = 0; index < length; index++) {
      var attribute = attributes[index];
      if (attribute.name.indexOf('data-wl-') != -1) {
        data[attribute.name.replace('data-wl-', '')] = attribute.value;
      }
    }

    if (data.id)
      data.id = parseInt(data.id);

    data.classes = element.className.replace("object-default object-" + data.type, "");

    if (data.tag.toUpperCase() == 'A') {
      data.linkTo = element.getAttribute('href');
      data.linkTarget = element.getAttribute('target');
    }

    var style = element.style;

    if (style.left)
      data.x = style.left.replace('px', '');
    if (style.top)
      data.y = style.top.replace('px', '');
    if (style.display == 'none')
      data.hidden = style.display == 'none';
    if (style.zIndex)
      data.zIndex = style.zIndex;

    data.width = style.width != '' ? style.width.replace('px', '') : ''
    data.height = style.height != '' ? style.height.replace('px', '') : '';

    return data;
  }
});


pluginManager.registerType('node', CobjView);

module.exports = CobjView;
