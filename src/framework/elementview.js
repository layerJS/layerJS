'use strict';
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');

var NodeView = require('./nodeview.js');
var defaults = require('./defaults.js');
var identifyPriority = require('./identifypriority.js');

/**
 * Defines the view of a ObjData and provides all basic properties and
 * rendering fuctions that are needed for a visible element.
 *
 * @param {ObjData} dataModel the Tailbone Model of the View's data
 * @param {Object} options {data: json for creating a new data object; el: (optional) HTMLelement already exisitng; outerEl: (optional) link wrapper existing; root: true if that is the root object}
 */
var ElementView = NodeView.extend({
  constructor: function(dataModel, options) {

    NodeView.call(this, dataModel, options);

    this.disableObserver();

    var that = this;
    // The change event must change the properties of the HTMLElement el.
    this.data.on('change', function(model) {
      if (!that._dataObserverCounter) {
        if (model.changedAttributes.hasOwnProperty('width') || model.changedAttributes.hasOwnProperty('height')) {
          that._fixedDimensions();
        }
      }
    }, {
      ignoreSender: that
    });

    this._fixedDimensions();
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
    var getDimension = function(value) {
      var match;
      if (value && typeof value === 'string' && (match = value.match(/(.*)(?:px)?$/))) return parseInt(match[1]);
      if (value && typeof value === 'number') return value;
      return undefined;
    };
    if (!(this.fixedWidth = getDimension(this.data.attributes.width))) delete this.fixedWidth;
    if (!(this.fixedWHeight = getDimension(this.data.attributes.height))) delete this.fixedHeight;
    if (!(this.fixedX = getDimension(this.data.attributes.x))) delete this.fixedX;
    if (!(this.fixedY = getDimension(this.data.attributes.y))) delete this.fixedY;
  },

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

    // Add htmlAttributes to the DOM element
    if ('htmlAttributes' in diff) {
      for (var htmlAttribute in diff.htmlAttributes) {
        if ('style' !== htmlAttribute && diff.htmlAttributes.hasOwnProperty(htmlAttribute)) {
          outerEl.setAttribute(htmlAttribute.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), diff.htmlAttributes[htmlAttribute]);
        }
      }
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
   * returns the x position of the element
   *
   * @returns {number} x
   */
  x: function() {
    return this.outerEl.offsetLeft || this.fixedX;
  },
  /**
   * returns the x position of the element
   *
   * @returns {number} x
   */
  y: function() {
    return this.outerEl.offsetTop || this.fixedY;
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
      tag: element.tagName,
      htmlAttributes: {}
    };

    var elementAttributes = element.attributes;
    var length = elementAttributes.length;

    for (index = 0; index < length; index++) {
      var attribute = elementAttributes[index];
      var attributeName = attribute.name;
      var attributeValue = attribute.value;
      var dataSource = undefined;

      if (attributeName.indexOf('data-wl-') === 0) {
        // store directly in the data object
        dataSource = data;
        attributeName = attributeName.replace('data-wl-', '');
      } else {
        // store in data.htmlAttributes
        dataSource = data.htmlAttributes;
      }

      if (attributeValue === 'true' || attributeValue === 'false') {
        attributeValue = eval(attributeValue); // jshint ignore:line
      }

      attributeName = attributeName.replace(/(\-[a-z])/g, function($1) {
        return $1.toUpperCase().replace('-', '');
      });

      var attributeNames = attributeName.split('.');
      var attributesNamesLength = attributeNames.length;
      var attributeObj = dataSource;
      for (var i = 0; i < attributesNamesLength; i++) {
        if (!attributeObj.hasOwnProperty(attributeNames[i])) {
          attributeObj[attributeNames[i]] = (i === attributesNamesLength - 1) ? attributeValue : {};
        }
        attributeObj = attributeObj[attributeNames[i]];
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
}, {
  defaultProperties: Kern._extend({}, NodeView.defaultProperties, defaults, {
    type: 'element',
    nodeType: 1,
    tag: 'br',
    elementId: undefined,
    // CSS string for styling this object
    style: '',
    // CSS classes of this object
    classes: '',
    // this stores a string for a hyperlink realized by an <a> tag that
    // wraps the element
    linkTo: undefined,
    // defaults to _self, but should not be set because if set a link is
    // created, this could be fixed
    linkTarget: undefined,
    //locked elements can not be edited
    locked: undefined,
    // a list of properties that are not allowed to be edited
    disallow: {},
    // set to undefined so we can find out if a newly created element
    // provided positional information
    x: undefined,
    y: undefined,
    width: undefined,
    height: undefined,
    // rendering scale
    scaleX: 1,
    scaleY: 1,
    // z-index
    zIndex: undefined,
    // this is set in init$el to the current rotation if it was not set
    // before
    rotation: undefined,
    //is the element hidden in presentation mode
    hidden: undefined
  }),
  identify: function(element) {
    var result = false;

    if (element.nodeType === 1) {
      var tags = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
      for (var i = 0; i < tags.length; i++) {
        if (tags[i] === element.tagName.toLowerCase()) {
          result = true;
          break;
        }
      }
    }
    return result;
  }
});


pluginManager.registerType('element', ElementView, identifyPriority.normal);

module.exports = ElementView;
