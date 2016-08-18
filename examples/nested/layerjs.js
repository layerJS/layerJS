(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  version: 'default',
  transitionParameters: {
    duration: 't',
    type: 'p'
  }
};

},{}],2:[function(require,module,exports){
'use strict';
var DomHelpers = {
  /**
   * wrap all children of element into a wrapper element
   *
   * @param {HTMLElement} element - the element who's children should be wrapped
   * @param {object} options - options.tag - the HTML tag of the wrapper
   * @returns {HTMLElement} the wrapper
   */
  wrapChildren: function(element, options) {
    options = options || {};
    var wrapper = document.createElement(options.tag || "div");
    while (element.childNodes.length) {
      wrapper.appendChild(element.childNodes[0]);
    }
    element.appendChild(wrapper);
    return wrapper;
  },
  /**
   * unwrap the children of an element
   *
   * @param {HTMLElement} element - the element that contains a wrapper that should be removed. Copies all children of that wrapper into the element
   * @returns {void}
   */
  unwrapChildren: function(element) {
    var wrapper = element.removeChild(element.children[0]);
    while (wrapper.childNodes.length) {
      element.appendChild(wrapper.childNodes[0]);
    }
  },
  /**
   * browser detection
   * no mobile detection
   */
  detectBrowser: function() {
    var match;
    if (typeof navigator === 'undefined') {
      this.browser = 'node';
      return;
    }
    if ((match = navigator.userAgent.match(/Edge\/([0-9]*)/))) {
      this.vendorPrefix = '-ms-';
      this.browserVersion = match[1];
      this.browser = "edge";
    } else if ((match = navigator.userAgent.match(/MSIE ([0-9]*)/))) {
      this.vendorPrefix = '-ms-';
      this.browserVersion = match[1];
      this.browser = "ie";
    } else if ((match = navigator.userAgent.match(/Trident.*rv\:([0-9]*)/))) {
      this.vendorPrefix = '-ms-';
      this.browserVersion = match[1];
      this.browser = "ie";
    } else if ((match = navigator.userAgent.match(/Chrome\/([0-9]*)/))) {
      this.vendorPrefix = '-webkit-';
      this.browserVersion = match[1];
      this.browser = "chrome";
    } else if ((match = navigator.userAgent.match(/Firefox\/([0-9]*)/))) {
      this.vendorPrefix = '';
      this.browserVersion = match[1];
      this.browser = "firefox";
    } else if ((match = navigator.userAgent.match(/Safari\/([0-9]*)/))) {
      this.vendorPrefix = '-webkit-';
      this.browserVersion = match[1];
      this.browser = "safari";
    } else if ((match = navigator.userAgent.match(/AppleWebKit/))) {
      this.vendorPrefix = '-webkit-';
      this.browserVersion = 0;
      this.browser = "webkit";
    }
  },
  calculatePrefixes: function(prefixable) {
    this.cssPrefix = this.cssPrefix || {};
    for (var i = 0; i < prefixable.length; i++) {
      this.cssPrefix[prefixable[i]] = (this.vendorPrefix && (this.vendorPrefix + prefixable[i])) || prefixable[i];
    }
  },
  /**
   * execute after the next renderloop
   * needed to ensure a previous transform has been applied so we can now apply a new transform with a transition
   * NOTE: if this is too slow (at least 16ms), we may try to apply the first transform also with a transision (1ms)
   * and listen for transitionEnd event
   *
   * @param {Function} callback - the function to be executed
   * @returns {void}
   */
  postAnimationFrame: function(callback) {
    var rf = window.requestAnimationFrame || function(cb) {
      setTimeout(cb, 1000 / 60);
    };
    rf(function() {
      // make sure to get behind the current render thread
      setTimeout(callback, 0);
    });
  },
  /**
   * select a layerJS view object using a CSS selector
   * returns only the first view it finds.
   *
   * @param {string} selector - a CSS selector that identifies an element that is associated with a NodeView
   * @returns {NodeView} the selected view object
   */
  selectView: function(selector) {
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i]._wlView) return nodes[i]._wlView;
    }
  },
  /**
   * similar to jquery delegated bind. Will "bind" to all elements matching selector, even if those are added after the listener was added.
   *
   * @param {HTMLElement} element - the root element within which elements specified by selector exist or will exist
   * @param {string} eventName - which event type should be bound
   * @param {string} selector - the selector for elements that shoud be bound
   * @param {funcion} fn - the listener
   * @returns {Type} Description
   */
  addDelegtedListener: function(element, eventName, selector, fn) {
    // install Element.matches polyfill method
    if (!window.Element.prototype.matches) {
      window.Element.prototype.matches =
        window.Element.prototype.matchesSelector ||
        window.Element.prototype.mozMatchesSelector ||
        window.Element.prototype.msMatchesSelector ||
        window.Element.prototype.oMatchesSelector ||
        window.Element.prototype.webkitMatchesSelector ||
        function(s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {} // jshint ignore:line
          return i > -1;
        };
    }
    element.addEventListener(eventName, function(event) {
      var el = event.target;
      while (!el.matches(selector) && el !== element) {
        el = el.parent;
      }
      if (el !== element) {
        fn.call(el, event);
      }
    });
  }
};
DomHelpers.detectBrowser();
DomHelpers.calculatePrefixes(['transform', 'transform-origin']);

module.exports = DomHelpers;

},{}],3:[function(require,module,exports){
'use strict';
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');

var NodeView = require('./nodeview.js');
var defaults = require('./defaults.js');
var identifyPriority = require('./identifypriority.js');
var observerFactory = require('./observer/observerfactory.js');

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
      outerEl.setAttribute("data-lj-id", attr.id); //-> should be a class?
    }

    if ('type' in diff) {
      outerEl.setAttribute("data-lj-type", attr.type); //-> should be a class?
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
  _createObserver: function() {
    if (this.hasOwnProperty('_observer'))
      return;

    var that = this;
    this._observer = observerFactory.getObserver(this.outerEl, {
      attributes: true,
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
      this.parse(this.outerEl);
    }
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

      if (attributeName.indexOf('data-lj-') === 0) {
        // store directly in the data object
        dataSource = data;
        attributeName = attributeName.replace('data-lj-', '');
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

},{"../kern/Kern.js":29,"./defaults.js":1,"./domhelpers.js":2,"./identifypriority.js":8,"./nodeview.js":16,"./observer/observerfactory.js":19,"./pluginmanager.js":22}],4:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');
var identifyPriority = require('./identifypriority.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var FrameView = GroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    this.transformData = undefined;
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el))
      this.render();
  },
  /**
   * get the transformData of the frame that describes how to fit the frame into the stage
   *
   * @param {StageView} stage - the stage to be fit into
   * @param {String} transitionStartPosition -  [optional] the transition data for the current transition, only startPosition is considered
   * @param {Boolean} keepScroll - if true, scrollX and scrollY are not reset to their initial positions (unless transitionStartPosition requests a full recalculation)
   * @returns {TransformData} the transform data
   */
  getTransformData: function(stage, transitionStartPosition, keepScroll) {
    // check if we can return cached version of transfromData
    var d = this.transformData;
    if (!d || d.stage !== stage || (transitionStartPosition && transitionStartPosition !== d.startPosition)) {
      // calculate transformData
      return (this.transformData = this.calculateTransformData(stage, transitionStartPosition));
    }
    if (!keepScroll) {
      d.scrollX = d.initialScrollX;
      d.scrollY = d.initialScrollY;
    }
    return d;
  },
  /**
   * Returns the scroll data for this frame
   *
   * @returns {object} contains the the startPosition, scrollX and scrollY
   */
  getScrollData: function() {

    var scrollData = this.transformData ? {
      startPosition: this.transformData.startPosition,
      scrollX: this.transformData.scrollX,
      scrollY: this.transformData.scrollY
    } : {};
    return scrollData;
  },
  /**
   * calculate transform data (scale, scoll position and displacement) when fitting current frame into associated stage.
   * Note: this ignores the frame's scale and rotation property which have to be dealt with in the layer layout if necessary.
   *
   * @param {StageView} stage - the stage to be fit into
   * @param {string} [transitionStartPosition] - the scroll position at start
   * @returns {TransformData} the transform data
   */
  calculateTransformData: function(stage, transitionStartPosition) {
    var stageWidth = stage.width();
    var stageHeight = stage.height();
    // data record contianing transformation and scrolling information of frame within given stage
    var d = this.transformData = {};
    d.stage = stage;
    // scaling of frame needed to fit frame into stage
    d.scale = 1;
    d.frameWidth = this.width();
    d.frameHeight = this.height();
    // d.shiftX/Y indicate how much the top-left corner of the frame should be shifted from
    // the stage top-left corner (in stage space)
    d.shiftX = 0;
    d.shiftY = 0;
    // d.scrollX/Y give the initial scroll position in X and/or Y direction.
    d.scrollX = 0;
    d.scrollY = 0;
    // indicate whether scrolling in x or y directions is active
    d.isScrollX = false;
    d.isScrollY = false;
    switch (this.data.attributes.fitTo) {
      case 'width':
        d.scale = stageWidth / d.frameWidth;
        d.isScrollY = true;
        break;
      case 'height':
        d.scale = stageHeight / d.frameHeight;
        d.isScrollX = true;
        break;
      case 'fixed':
        d.scale = 1;
        d.isScrollX = true;
        d.isScrollY = true;
        break;
      case 'contain':
        d.scaleX = stageWidth / d.frameWidth;
        d.scaleY = stageHeight / d.frameHeight;
        if (d.scaleX < d.scaleY) {
          d.scale = d.scaleX;
          d.isScrollY = true;
        } else {
          d.scale = d.scaleY;
          d.isScrollX = true;
        }
        break;
      case 'cover':
        d.scaleX = stageWidth / d.frameWidth;
        d.scaleY = stageHeight / d.frameHeight;
        if (d.scaleX > d.scaleY) {
          d.scale = d.scaleX;
          d.isScrollY = true;
        } else {
          d.scale = d.scaleY;
          d.isScrollX = true;
        }
        break;
      case 'elastic-width':
        if (stageWidth < d.frameWidth && stageWidth > d.frameWidth - this.data.attributes.elasticLeft - this.data.attributes.elasticRight) {
          d.scale = 1;
          d.shiftX = this.data.attributes.elasticLeft * (d.frameWidth - stageWidth) / (this.data.attributes.elasticLeft + this.data.attributes.elasticRight);
        } else if (stageWidth > d.frameWidth) {
          d.scale = stageWidth / d.frameWidth;
        } else {
          d.scale = stageWidth / (d.frameWidth - this.data.attributes.elasticLeft - this.data.attributes.elasticRight);
          d.shiftX = this.data.attributes.elasticLeft;
        }
        d.isScrollY = true;
        break;
      case 'elastic-height':
        if (stageHeight < d.frameHeight && stageHeight > d.frameHeight - this.data.attributes.elasticTop - this.data.attributes.elasticBottom) {
          d.scale = 1;
          d.shiftY = this.data.attributes.elasticTop * (d.frameHeight - stageHeight) / (this.data.attributes.elasticTop + this.data.attributes.elasticBottom);
        } else if (stageHeight > d.frameHeight) {
          d.scale = stageHeight / d.frameHeight;
        } else {
          d.scale = stageHeight / (d.frameHeight - this.data.attributes.elasticTop - this.data.attributes.elasticBottom);
          d.shiftY = this.data.attributes.elasticTop;
        }
        d.isScrollY = true;
        break;
      case 'responsive':
        d.scale = 1;
        this.innerEl.style.width = d.frameWidth = stageWidth;
        this.innerEl.style.height = d.frameHeight = stageHeight;
        break;
      case 'responsive-width':
        d.scale = 1;
        d.isScrollY = true;
        this.innerEl.style.width = d.frameWidth = stageWidth;
        break;
      case 'responsive-height':
        d.scale = 1;
        d.isScrollX = true;
        this.innerEl.style.height = d.frameHeight = stageHeight;
        break;
      default:
        throw "unkown fitTo type '" + this.attributes.fitTo + "'";
    }
    // calculate maximum scroll positions (depend on frame and stage dimensions)
    // WARN: allow negative maxScroll for now
    if (d.isScrollY) d.maxScrollY = d.frameHeight - stageHeight / d.scale;
    if (d.isScrollX) d.maxScrollX = d.frameWidth - stageWidth / d.scale;
    // define initial positioning
    // take startPosition from transition or from frame
    d.startPosition = transitionStartPosition || this.data.attributes.startPosition;
    switch (d.startPosition) {
      case 'top':
        if (d.isScrollY) d.scrollY = 0;
        break;
      case 'bottom':
        if (d.isScrollY) {
          d.scrollY = d.maxScrollY;
          if (d.scrollY < 0) {
            d.shiftY = d.scrollY;
            d.scrollY = 0;
            // FIXME disable isScrollY????
          }
        }
        break;
      case 'left':
        if (d.isScrollX) d.scrollX = 0;
        break;
      case 'right':
        if (d.isScrollX) {
          d.scrollX = d.maxScrollX;
          if (d.scrollX < 0) {
            d.shiftX = d.scrollX;
            d.scrollX = 0;
          }
        }
        break;
      case 'middle': // middle and center act the same
      case 'center':
        if (d.isScrollX) {
          d.scrollX = (d.frameWidth - stageWidth / d.scale) / 2;
          if (d.scrollX < 0) {
            d.shiftX = d.scrollX;
            d.scrollX = 0;
          }
        }
        if (d.isScrollY) {
          d.scrollY = (d.frameHeight - stageHeight / d.scale) / 2;
          if (d.scrollY < 0) {
            d.shiftY = d.scrollY;
            d.scrollY = 0;
          }
        }
        break;
      default:
        if (d.isScrollX) d.scrollX = 0;
        if (d.isScrollY) d.scrollY = 0;
        break;
    }
    // calculate actual frame width height in stage space
    d.width = d.frameWidth * d.scale;
    d.height = d.frameHeight * d.scale;
    // disable scrolling if maxscroll < 0
    if (d.maxScrollX <= 0) {
      d.shiftX += d.scrollX;
      d.scrollX = 0;
      d.maxScrollX = 0;
      d.isScrollX = false;
    }
    if (d.maxScrollY <= 0) {
      d.shiftY += d.scrollY;
      d.scrollY = 0;
      d.maxScrollY = 0;
      d.isScrollY = false;
    }
    // disable scrolling if configured in frame
    if (this.data.attributes.noScrolling) {
      d.shiftX += d.scrollX;
      d.shiftY += d.scrollY;
      d.scrollX = 0;
      d.scrollY = 0;
      d.isScrollX = false;
      d.isScrollY = false;
      d.maxScrollX = 0;
      d.maxScrollY = 0;
      // } else if (transition) {
      //   // apply transition scroll information if available
      //   // support transition.scroll as direction ambivalent scroll position
      //   if (d.isScrollX) {
      //     if (transition.scroll !== undefined) d.scrollX = transition.scroll * d.scale;
      //     if (transition.scrollX !== undefined) d.scrollX = transition.scrollX * d.scale;
      //     if (d.scrollX > d.maxScrollX) d.scrollX = d.maxScrollX;
      //   }
      //   if (d.isScrollY) {
      //     if (transition.scroll !== undefined) d.scrollY = transition.scroll * d.scale;
      //     if (transition.scrollY !== undefined) d.scrollY = transition.scrollY * d.scale;
      //     if (d.scrollY > d.maxScrollY) d.scrollY = d.maxScrollY;
      //   }
    }

    d.shiftX *= d.scale;
    d.shiftY *= d.scale;

    // save inital scroll position to be able to reset this without recalculating the full transform data
    d.initialScrollX = d.scrollX;
    d.initialScrollY = d.scrollY;
    return (this.transformData = d);
  }
}, {
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'frame'
  }),
  identify: function(element) {
    var type = element.getAttribute('data-lj-type');
    return null !== type && type.toLowerCase() === FrameView.defaultProperties.type;
  }
});

pluginManager.registerType('frame', FrameView, identifyPriority.normal);
module.exports = FrameView;

},{"../kern/Kern.js":29,"./groupview.js":7,"./identifypriority.js":8,"./pluginmanager.js":22}],5:[function(require,module,exports){
'use strict';
var Kern = require('../../kern/kern.js');

var Gesture = Kern.Base.extend({
  constructor: function() {
    //this.altKey = false;
    this.buttons = [false, false, false];
    this.cancel = false; //
    this.click = false;
    //this.ctrlKey = false;
    //this.dbl = false;
    this.doubleClick = false;
    //this.event = null; // real event
    this.first = false;
    this.id = 0;
    this.last = false;
    //this.lng = false;
    //this.longClick = false;
    this.move = false;
    //this.multi = false;
    //this.rotation = 0;
    //this.scale = 1;

    this.shift = {
      x: 0,
      y: 0
    };
    this.shiftKey = false;
    this.start = {
      x: 0,
      y: 0
    };
    this.startTime = new Date().getTime();
    this.touch = false; // from finger not from mouse
    //this.transform = false;
    this.wheel = false;
    this.wheelDelta = 0; // orginal value from the event
    this.position = {
      x: 0,
      y: 0
    };
  },
  /**
   * Returns how long a go the event got fired
   */
  lifeTime: function() {
    return new Date().getTime() - this.startTime;

  },
  /**
   * Returns if the gesture has made enough distance to lock a direction
   */
  enoughDistance: function() {
    return Math.abs(this.shift.x) + Math.abs(this.shift.y) > 10;
  }
}, {});

module.exports = Gesture;

},{"../../kern/kern.js":30}],6:[function(require,module,exports){
'use strict';
var Kern = require('../../kern/kern.js');
var Gesture = require('./gesture.js');
var layerJS = require('../layerjs.js');

var GestureManager = Kern.EventManager.extend({
  constructor: function() {
    this.gesture = null;
    this.element = null;
    this.gesturecc = 0;
    this.timeoutWheel = null;

  },
  /**
   * Will register a layerView for events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  register: function(element, callback, options) {
    options = options || {};
    this._registerTouchEvents(element, callback, options);
    this._registerWheelEvents(element, callback, options);
  },
  /**
   * Will register a layerView for mouse/touche events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _registerWheelEvents: function(element, callback, options) {
    var that = this;
    var wheel = function(e) {
      return that._wheel(e, element, callback, options);
    };

    element.addEventListener('wheel', wheel);
  },
  /**
   * Will register a layerView for mouse/touche events
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _registerTouchEvents: function(element, callback, options) {
    var that = this;
    var tap = function(e) {
      return that._tap(e, element, callback, options);
    };
    var drag = function(e) {
      return that._drag(e, element, callback, options);
    };
    var release = function(e) {
      return that._release(e, element, callback, options);
    };

    if (typeof window.ontouchstart !== 'undefined') {
      element.addEventListener('touchstart', tap);
      element.addEventListener('touchend', release);
      if (options.dragging) {
        element.addEventListener('touchmove', drag);
      }
    }

    element.addEventListener('mousedown', tap);
    element.addEventListener('mouseup', release);
    if (options.dragging) {
      element.addEventListener('mousemove', drag);
    }
  },
  /**
   * Users starts a wheel event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _wheel: function(event, element, callback, options) { //jshint unused:false
    var that = this;

    if (this.timeoutWheel) {
      clearTimeout(this.timeoutWheel);
    }
    // WARN: temporarily always create a new gesture on every wheel event. The gesture continuation leads
    // to hanging if gesture canceling is implemented
    if (true || !this.gesture || !this.gesture.wheel || this.element !== element) {
      this.gesture = new Gesture();
      this.gesture.wheel = true;
      this.gesture.first = true;
      this.gesture.start.x = this.gesture.position.x = this._xPosition(event);
      this.gesture.start.y = this.gesture.position.y = this._yPosition(event);
      this.element = element;
      this._raiseGesture(callback); // first
    } else {
      this.gesture.startTime = new Date().getTime();
    }
    this.gesture.first = false;
    this.gesture.wheelDelta = this._wheelDelta(event);

    this.gesture.position = {
      x: this.gesture.position.x + this.gesture.wheelDelta.x * 6,
      y: this.gesture.position.y + this.gesture.wheelDelta.y * 6
    };
    this.gesture.shift = {
      x: this.gesture.position.x - this.gesture.start.x,
      y: this.gesture.position.y - this.gesture.start.y
    };
    // temporary set gesture.last here as gesture continuation has been disabled
    this.gesture.last = true;
    this._raiseGesture(callback);
    // var thisgesture = this.gesturecc;
    // this.gesturecc++;
    // this.timeoutWheel = setTimeout(function() {
    //   if (that.gesture && that.gesture.wheel && that.gesture.gesturecc === thisgesture) {
    //     that.gesture = that.element = null; // FIXME we need to notify the listener that this gesture ended (either by sending another gesture with .last set or .cancel )
    //   }
    //   that.timeoutWheel = null;
    // }, 300);

    return false;
  },
  /**
   * return the wheel delta for the x- and y-axis
   * @param {event} Actual dom event
   */
  _wheelDelta: function(event) {
    var wheelDelta = {
      x: 0,
      y: 0
    };

    if (event.deltaY !== undefined && event.deltaX !== undefined) {
      wheelDelta.y = -event.deltaY / 3;
      wheelDelta.x = -event.deltaX / 3;
    } else if (event.wheelDeltaY !== undefined && event.wheelDeltaX !== undefined) {
      wheelDelta.y = -event.wheelDeltaY / 120;
      wheelDelta.x = -event.wheelDeltaX / 120;
    } else if (event.detail !== undefined) {
      // doesn't have an x and y variant, so by default we use it for the y axis
      wheelDelta.Y = -event.detail / 3;
    }
    return wheelDelta;
  },
  /**
   * Users starts a touch event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _tap: function(event, element, callback, options) { //jshint unused:false
    this.element = element;
    this.gesture = new Gesture();
    this.gesture.first = true;
    this.gesture.start.x = this._xPosition(event);
    this.gesture.start.y = this._yPosition(event);
    this.gesture.touch = event.type !== "mousedown";
    this.gesture.click = event.type === "mousedown";
    this._raiseGesture(callback);

    return false;
  },
  /**
   * Users stops a touch event
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _release: function(event, element, callback, options) { //jshint unused:false
    this.gesture.move = false;
    this.gesture.last = true;
    this.gesture.position.x = this._xPosition(event);
    this.gesture.position.y = this._yPosition(event);
    this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
    this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;

    this._raiseGesture(callback);

    this.gesture = this.element = null;
    return false;
  },
  /**
   * Users is dragging
   * @param {event} Actual dom event
   * @param {element} The actual dom element that needs to be listened to
   * @param {callback} The callback method
   * @param {options} additiional options
   */
  _drag: function(event, element, callback, options) { //jshint unused:false
    if (this.gesture !== null && (this.gesture.click || this.gesture.touch)) {
      this.gesture.first = false;
      this.gesture.move = true;
      this.gesture.position.x = this._xPosition(event);
      this.gesture.position.y = this._yPosition(event);
      this.gesture.shift.x = this.gesture.position.x - this.gesture.start.x;
      this.gesture.shift.y = this.gesture.position.y - this.gesture.start.y;
      this._raiseGesture(callback);
    }
    return false;
  },

  /**
   * Will get the Y postion (horizontal) of an avent
   * @param {event} Actual dom event
   */
  _yPosition: function(event) {
    // touch event
    if (event.targetTouches && (event.targetTouches.length >= 1)) {
      return event.targetTouches[0].clientY;
    } else if (event.changedTouches && (event.changedTouches.length >= 1)) {
      return event.changedTouches[0].clientY;
    }

    // mouse event
    return event.clientY;
  },
  /**
   * Will get the X postion (vertical) of an avent
   * @param {event} Actual dom event
   */
  _xPosition: function(event) {
    // touch event
    if (event.targetTouches && (event.targetTouches.length >= 1)) {
      return event.targetTouches[0].clientX;
    } else if (event.changedTouches && (event.changedTouches.length >= 1)) {
      return event.changedTouches[0].clientX;
    }

    // mouse event
    return event.clientX;
  },
  /**
   * Passes the gesture to the callback method
   * @param {callback} The callback method
   */
  _raiseGesture: function(callback) {
    if (callback && this.gesture) {
      if (!this.gesture.direction) { // is direction locked?
        var x = this.gesture.shift.x;
        var y = this.gesture.shift.y;
        if (this.gesture.enoughDistance()) { // has it moved considerably to lock direction?
          if (Math.abs(x) > Math.abs(y)) {
            this.gesture.direction = (x < 0 ? 'left' : 'right');
            this.gesture.axis = 'x';
          } else {
            this.gesture.direction = (y < 0 ? 'up' : 'down');
            this.gesture.axis = 'y';
          }
        }
      }
      callback(this.gesture);
      if (this.gesture.preventDefault) { // should we stop propagation and prevent default?
        event.preventDefault();
        event.stopPropagation();
      }
      if (this.gesture.cancelled) {
        this.gesture = this.element = null;
      }
    }
  }
});

layerJS.gestureManager2 = new GestureManager();

module.exports = layerJS.gestureManager2;

},{"../../kern/kern.js":30,"../layerjs.js":9,"./gesture.js":5}],7:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var repository = require('./repository.js'); // jshint ignore:line
var ElementView = require('./elementview.js');
var identifyPriority = require('./identifypriority.js');
var observerFactory = require('./observer/observerfactory.js');
/**
 * A View which can have child views
 * @param {GroupData} dataModel
 * @param {object}        options
 * @extends ElementView
 */
var GroupView = ElementView.extend({
  /**
   * construct a new view of a GroupData
   *
   * @param {GroupData} dataModel - the data model to be used for the view
   * @param {object} options - passed to the Super constructor
   * @returns {this}
   */
  constructor: function(dataModel, options) {
    options = options || {};
    var that = this;
    this._childViews = {};
    this._childNames = {};

    ElementView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));
    // create listener to child changes. need different callbacks for each instance in order to remove listeners separately from child data objects
    this._myChildListenerCallback = function(model) {
      var view = that._childViews[model.attributes.id];
      if (!view) throw "listing to datamodel changes that does not have a childview " + model.attributes.id + " in this group " + this.data.attributes.id;
      that._renderChildPosition(view);
      if (model.changedAttributes.hasOwnProperty('name')) { // did name change?
        var names = Object.keys(that._childNames);
        for (var i = 0; i < names.length; i++) { // delete old reference
          if (that._childViews[names[i]] === view) {
            delete that._childViews[names[i]];
          }
        }
        if (model.attributes.name) {
          that._childNames[model.attributes.name] = view;
        }
      }
    };

    this.data.on('change:children', (function() {
      if (!this._dataObserverCounter) {
        that._buildChildren(); // update DOM when data.children changes
        that.render();
      }
    }).bind(this));

    if (this.data.attributes.children && this.data.attributes.children.length > 0) {
      this._buildChildren();
    }

    if (this.innerEl.childNodes.length > 0) {
      this._parseChildren(options);
    }

    if (!options.noRender && (options.forceRender || !options.el))
      this.render(options);
  },
  /**
   * Syncronise the DOM child nodes with the data IDs in the data's
   * children array.
   *
   * - Create Views for the data models if they haven't been created yet.
   * - Rearrange the child views to match the order of the child IDs
   * - be respectful with any HTML childnodes which are not connected to a data
   * object (i.e. no data-lj-id property); leaves them where they are.
   */
  _buildChildren: function() {

    this.disableObserver(); // dont react to DOM changes on this element
    var that = this; // jshint ignore:line
    var empty;
    var childIds = this.data.attributes.children;
    var k = -1; // index in childNodes;
    var nodeId; // layerjs id of current HMTL element
    var vo; // view object created for current element

    var _k_nextChild = function() { // find next DOM child node that is a wl-element
      // jshint ignore:start
      k++;
      var elem;
      while (!(empty = !(k < that.innerEl.childNodes.length)) && (elem = that.innerEl.childNodes[k]) && (elem.nodeType != 1 || !(nodeId = (elem._wlView && elem._wlView.data.attributes.id) || elem.getAttribute('data-lj-id')))) {
        k++;
      }
      // jshint ignore:end
    };
    var _k_reset = function(k_orig) { // set k to k_orig and fix "empty" and "nodeId"
      k = k_orig - 1;
      _k_nextChild();
    };
    _bc_outer:
      for (var i = 0; i < childIds.length; i++) {
        var childId = childIds[i];
        _k_nextChild();

        if (!empty) {
          // check if we already have the corresponding view object of the child;
          // check if we can find it at the current position in DOM or in the remaining DOM children
          var k_saved = k; // save current position in DOM children list
          while (!empty) {
            if (nodeId === childId) { // found a matching DOM element; put it at the right position
              if (k !== k_saved) {
                this.innerEl.insertBefore(this.innerEl.childNodes[k], this.innerEl.childNodes[k_saved]);
              }
              // create view object if it does not exist yet (even if the HTML element exist)
              if (!this.innerEl.childNodes[k_saved]._wlView) {
                vo = pluginManager.createView(repository.get(childId, this.data.attributes.version), {
                  el: this.innerEl.childNodes[k_saved],
                  parent: this
                });
              } else { // or get existing view
                vo = this.innerEl.childNodes[k_saved]._wlView;
              }

              // check if we have registered another view under the same id
              if (this._childViews[childId]) {
                if (this._childViews[childId] !== vo) throw "duplicate child id " + childId + " in group " + this.data.attributes.id + ".";
              } else {
                // create _childViews which indicates which view we have for each id. This is also used for checking whether we registered a change callback already.
                this._childViews[childId] = vo;
                vo.data.on('change', this._myChildListenerCallback); // attach child change listener
                if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
              }
              // Note: if the HTML was present, we don't render positions
              _k_reset(k_saved);
              continue _bc_outer; // continue with next id from data.children
            }
            _k_nextChild();
          }
          _k_reset(k_saved);
        }
        // no fitting element found -> create new view and element
        // we may already have a view supplied in _childViews if it was moved here via attachView()
        var newView = this._childViews[childId] || pluginManager.createView(repository.get(childId, this.data.attributes.version), {
          parent: this
        });
        // new HMTL element: append or place at current position
        if (empty) {
          this.innerEl.appendChild(newView.outerEl);
        } else {
          this.innerEl.insertBefore(newView.outerEl, this.innerEl.childNodes[k]);
        }
        // create _childViews for new view (may already exist with same info)
        this._childViews[childId] = newView;
        // set name
        if (newView.data.attributes.name) this._childNames[newView.data.attributes.name] = newView;
        newView.data.on('change', this._myChildListenerCallback); // attach child change listener
        //this._renderChildPosition(newView);
      }

    // we checked/added all object in data.children. Are there more childNodes in DOM left?
    if (!empty) {
      _k_nextChild();

      while (!empty) { // some objects need to be deleted (only removes dom elements of wl objects)
        vo = this.innerEl.childNodes[k]._wlView;
        if (!vo) { // this object has not been parsed yet, leave it there
          _k_nextChild();
          continue;
        }
        vo.data.off('change', this._myChildListenerCallback); // remove child change listener
        delete this._childNames[vo.data.attributes.name];
        delete this._childViews[vo.data.attributes.id];
        this.innerEl.removeChild(this.innerEl.childNodes[k]); // remove child from dom
        _k_nextChild(); // next wl object
      }
    }
    this.enableObserver();
  },
  /**
   * analyse list of childNodes (HTMLElements) in this group and create view- (and possibly data-) objects for them.
   *
   * @returns {void}
   */
  _parseChildren: function(options) {
    options = options || {};
    this.disableDataObserver();
    var cn = this.innerEl.childNodes;
    var childIds = this.data.attributes.children;
    var inChildren = {};
    var i;
    var vo;
    // hash denoting which ids are in data.attributes.children
    for (i = 0; i < childIds.length; i++) {
      inChildren[childIds[i]] = true;
    }
    var k = 0;
    var nodeId;
    var nodeType;
    var data;
    for (i = 0; i < cn.length; i++) {
      var elem = cn[i];

      nodeId = (elem._wlView && elem._wlView.data.attributes.id) || elem.getAttribute && elem.getAttribute('data-lj-id');
      try {
        data = nodeId && repository.get(nodeId, this.data.attributes.version);
      } catch (e) {
        data = undefined;
      }
      nodeType = (elem._wlView && elem._wlView.data.attributes.type) || elem.getAttribute && elem.getAttribute('data-lj-type');
      if (nodeId && (data || nodeType)) {
        // search for nodeId in data.chi ldren
        var k_saved = k;

        while (k < childIds.length && nodeId !== childIds[k]) {
          k++;
        }
        // put at right position in data.children if not already there
        if (k !== k_saved || k >= childIds.length) {
          if (k < childIds.length) {
            childIds.splice(k, 1);
          }
          childIds.splice(k_saved, 0, nodeId);
        }
        k = k_saved; // put k back to current position
        if (data) { // do we have a data object for this nodeid?
          vo = pluginManager.createView(data, {
            el: elem,
            parent: this
          });
        } else if (nodeType) { // or  a nodeType?
          // create new view without data object, just by type. creates data object implicitly with cElementView._parse
          vo = pluginManager.createView(nodeType, {
            el: elem,
            parent: this,
            parseFull: options.parseFull
          });
          vo.data.attributes.id = nodeId; // overwrite new id generated by above call with nodeid given in HMTL
          vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
          if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
            repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
          }
        }
        this._childViews[nodeId] = vo; // update _childViews
        if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
        vo.data.on('change', this._myChildListenerCallback); // attach child change listener
        k++; // next in data.children

      } else if (nodeType) {
        // create new view without data object, just by type. creates data object implicitly with cElementView._parse
        vo = pluginManager.createView(nodeType, {
          el: elem,
          parent: this,
          parseFull: options.parseFull
        });
        nodeId = vo.data.attributes.id; // id has been generated automatically
        vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
        childIds.splice(k, 0, nodeId); // insert new nodeid in data.children
        if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
          repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
        }
        this._childViews[nodeId] = vo; // update _childViews
        if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
        vo.data.on('change', this._myChildListenerCallback); // attach child change listener
        k++; // next in data.children
      } else if (options.parseFull) {
        nodeType = pluginManager.identify(elem);
        // create new view without data object, just by type. creates data object implicitly with cElementView._parse
        vo = pluginManager.createView(nodeType, {
          el: elem,
          parent: this,
          parseFull: options.parseFull
        });
        nodeId = vo.data.attributes.id; // id has been generated automatically
        vo.data.attributes.version = this.data.attributes.version; // take version from parent (this)
        childIds.splice(k, 0, nodeId); // insert new nodeid in data.children
        if (!repository.contains(vo.data.attributes.id, vo.data.attributes.version)) {
          repository.add(vo.data, this.data.attributes.version); // add new (implicitly created) data object to repository
        }
        this._childViews[nodeId] = vo; // update _childViews
        if (vo.data.attributes.name) this._childNames[vo.data.attributes.name] = vo;
        vo.data.on('change', this._myChildListenerCallback); // attach child change listener
        k++; // next in data.children
      }
    }
    // delete further ids in data.children
    if (k < childIds.length) {
      childIds.splice(k);
    }
    this.enableDataObserver();
  },
  /**
   * return child ElementView for a given child id
   *
   * @param {string} childId - the id of the requested object
   * @returns {ElementView} the view object
   */
  getChildView: function(childId) {
    if (!this._childViews.hasOwnProperty(childId)) throw "unknown child " + childId + " in group " + this.data.attributes.id;
    return this._childViews[childId];
  },
  /**
   * return view by name property
   *
   * @param {string} name - the name of the searched child
   * @returns {ElementView} the view object
   */
  getChildViewByName: function(name) {
    if (!this._childNames.hasOwnProperty(name)) throw "unknown child with name " + name + " in group " + this.data.attributes.id;
    return this._childNames[name];
  },
  /**
   * return all the child views
   *
   * @returns {array} the view object
   */
  getChildViews: function() {

    var childViews = [];

    for (var child in this._childViews) {
      if (this._childViews.hasOwnProperty(child)) {
        childViews.push(this._childViews[child]);
      }
    }

    return childViews;
  },

  /**
   * Attach a new view object as a child. This updates the this.data.children property, so don't do that manually.
   * This method is the only way to attach an existing view to the parent. If a child is added solely in the dataobject,
   * a new view object is generated via the plugin manager.
   *
   * @param {ElementView} newView - the view object to be attached as child
   * @returns {Type} Description
   */
  attachView: function(newView) {
    var childId = newView.data.attributes.id;

    if (!this._childViews[childId]) {
      this._childViews[childId] = newView;
      newView.setParent(this);
      this.data.addChild(childId); // this will eventually trigger _buildChildren which sets up everything for this group
    }
  },
  /**
   * remove a view from this group. updates dataobject of this group which will trigger change event which
   * will call _buildChildren
   *
   * @param {ElementView} view - the view object to be removed
   * @returns {Type} Description
   */
  detachView: function(view) {
    this.data.silence();
    var idx = this.data.update('children').indexOf(view.data.attributes.id);
    this.data.update('children').splice(idx, 1);
    this.data.fire();
    view.setParent(undefined);
  },
  /**
   * render the position of the child. This is done similar as setting other style (CSS) properties in
   * ElementView's render method. It's important to do this here so that derived classes can overwrite it
   * and position objects differently
   * Note: this currently implements setting the positional style information directly on the object.
   * This is most likely the best for speed. For rendering on the server, this infor has to go into a
   * separate css style
   *
   * @param {ElementView} childView - the view to be positioned.
   * @returns {Type} Description
   */
  _renderChildPosition: function(childView) {

    var attr = childView.data.attributes,
      diff = childView.data.changedAttributes || childView.data.attributes;

    var css = {};
    if ('x' in diff && attr.x !== undefined) {
      css.left = attr.x + 'px';
    }

    if ('y' in diff && attr.y !== undefined) {
      css.top = attr.y + 'px';
    }

    if ('x' in diff || 'y' in diff) {
      css.position = (attr.x !== undefined || attr.y !== undefined ? "absolute" : "static");
    }

    if ('scaleX' in diff || 'scaleY' in diff || 'rotation' in diff) {
      css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : "");
    }

    if ('zIndex' in diff && attr.zIndex !== undefined) {
      css.zIndex = attr.zIndex;
    }

    if ('hidden' in diff) {
      css.display = attr.hidden ? 'none' : '';
    }

    if ('width' in diff && attr.width !== undefined) {
      css.width = attr.width;
    }

    if ('height' in diff && attr.height !== undefined) {
      css.height = attr.height;
    }

    if (childView.applyStyles) {
      childView.applyStyles(css);
    }
  },
  /**
   * render the group. Uses ElementView.render to display changes to the object.
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  render: function(options) {
    var i;
    options = options || {};
    this.disableObserver();

    ElementView.prototype.render.call(this, options);

    if (!this.data.changedAttributes || this.data.changedAttributes.children) {
      var views = Object.keys(this._childViews);
      var length = views.length;
      for (i = 0; i < length; i++) {
        var childView = this._childViews[views[i]];
        if (options.forceRender) {
          childView.render(options);
        }
        this._renderChildPosition(childView);
      }
    }
    this.enableObserver();
  },
  /**
   * Return decendent Views which give a true value when passed to a given
   * testFunction
   *
   * @param {function} testFunction A function that takes a view and returns true/false
   * @param {bool}     single       Should only one matching view be returned or an array of all matches
   * @param {array}    [results]    An array in which to store multiple results
   */
  filter: function(testFunction, single, results) {
    if (!single && !results) {
      results = [];
    }

    for (var i = 0; i < this.children.length; i++) {
      var currentObject = this.children[i];

      if (testFunction(currentObject)) {
        if (single) {
          return currentObject;
        }

        results.push(currentObject);
      }

      if (currentObject.children) {
        var result = currentObject.filter(testFunction, single, results);

        if (result && single) {
          return result;
        }
      }
    }

    return results;
  },

  /**
   * @param {array} [results] array to store the children
   * @returns {array} array of all decendents of the GroupView
   */
  getAllChildren: function() {
    return this.filter(function() {
      return true;
    });
  },
  _createObserver: function() {
    if (this.hasOwnProperty('_observer'))
      return;

    var that = this;
    this._observer = observerFactory.getObserver(this.outerEl, {
      attributes: true,
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
      this.parse(this.outerEl);
    }

    if (result.removedNodes.length > 0 || result.addedNodes.length > 0) {
      this._parseChildren();
    }
  }

}, {
  defaultProperties: Kern._extend({}, ElementView.defaultProperties, {
    type: 'group',
    tag: 'div',
    children: []
  }),
  getNodeType: undefined,
  identify: function(element) {
    var type = element.getAttribute('data-lj-type');

    return element.nodeType === 1 && ((null !== type && type.toLowerCase() === 'group') || !type);
  }
});


pluginManager.registerType("group", GroupView, identifyPriority.low);
module.exports = GroupView;

},{"../kern/Kern.js":29,"./elementview.js":3,"./identifypriority.js":8,"./observer/observerfactory.js":19,"./pluginmanager.js":22,"./repository.js":23}],8:[function(require,module,exports){
module.exports = {
  low: 1,
  normal: 2,
  high: 3
};

},{}],9:[function(require,module,exports){
var $ = require('./domhelpers.js');
// this module defines a global namespace for all weblayer objects.
layerJS = {
  select: $.selectView,
  imagePath: "/",
  executeScriptCode : true
};

module.exports = layerJS;

},{"./domhelpers.js":2}],10:[function(require,module,exports){
'use strict';
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var layoutManager = require('./layoutmanager.js');
var GroupView = require('./groupview.js');
var ScrollTransformer = require('./scrolltransformer.js');
var gestureManager = require('./gestures/gesturemanager.js');
var identifyPriority = require('./identifypriority.js');

var directions2neighbors = {
  up: 'b',
  down: 't',
  left: 'r',
  right: 'l'
};
/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends GroupView
 */

var LayerView = GroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    var that = this;
    this.inTransform = false; // indicates that transition is still being animated
    this.transitionID = 1; // counts up every call of transitionTo();

    var tag = 'div';

    if (dataModel) {
      tag = dataModel.attributes.tag;
    }
    this.outerEl = options.el || document.createElement(tag);


    var hasScroller = this.outerEl.children.length === 1 && this.outerEl.children[0].getAttribute('data-lj-helper') === 'scroller';
    this.innerEl = hasScroller ? this.outerEl.children[0] : this.outerEl;

    // call super constructor
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    this.switchLayout(this.data.attributes.layoutType, false);
    this.switchScrolling(this.data.attributes.nativeScroll, false);

    // get upper layer where unuseable gestures should be sent to.
    this.parentLayer = this.getParentOfType('layer');
    // register for gestures
    gestureManager.register(this.outerEl, this.gestureListener.bind(this), {
      dragging: true
    });

    // this is my stage and add listener to keep it updated
    this.stage = this.parent;
    this.on('parent', function() {
      that.stage = that.parent;
      // FIXME trigger adaption to new stage
    });
    // set current frame from data object or take first child
    this.currentFrame = (this.data.attributes.defaultFrame && this.getChildViewByName(this.data.attributes.defaultFrame)) || (this.data.attributes.children[0] && this.getChildView(this.data.attributes.children[0]));
    if (!options.noRender && (options.forceRender || !options.el)) {
      this.render();
    }
    // set the initial frame if possible
    if (this.currentFrame) {
      this.showFrame(this.currentFrame.data.attributes.name);
    }
    // listen to scroll events
    this.on('scroll', function() { // jshint ignore:line
      //that._layout.updateTransitions(); // FIXME: notify layout about scroll and that prepared transitions may be outdated
    });
    /*
    // register for gestures
    gestureManager.register(this.layer.outerEl,function(){
      that.gestureListener.apply(that,arguments);
    })
    */
  },
  /**
   * Will toggle native and non-native scrolling
   *
   * @param {boolean} nativeScrolling
   * @returns {void}
   */
  switchScrolling: function(nativeScrolling) {

    if (this.nativeScroll !== nativeScrolling) {
      this.nativeScroll = nativeScrolling;

      this.disableObserver();
      var hasScroller = this.outerEl.children.length === 1 && this.outerEl.children[0].getAttribute('data-lj-helper') === 'scroller';

      if (nativeScrolling) {
        this.innerEl = hasScroller ? this.outerEl.children[0] : $.wrapChildren(this.outerEl);
        this.innerEl.setAttribute('data-lj-helper', 'scroller');
        if (!this.innerEl._wlView) {
          this.innerEl._wlView = this.outerEl._wlView;
        }
        this.outerEl.className += ' nativescroll';
      } else {
        if (hasScroller) {
          $.unwrapChildren(this.outerEl);
        }
        this.innerEl = this.outerEl;
        this.outerEl.className = this.outerEl.className.replace(' nativescroll', '');
      }

      this._transformer = this._layout.getScrollTransformer() || new ScrollTransformer(this);

      if (this.currentFrame) {
        this.showFrame(this.currentFrame.data.attributes.name, this.currentFrame.getScrollData());
      }

      this.enableObserver();
    }
  },
  /**
   * Will change the current layout with an other layout
   *
   * @param {string} layoutType - the name of the layout type
   * @returns {void}
   */
  switchLayout: function(layoutType) {
    this._layout = new(layoutManager.get(layoutType))(this);
    this._transformer = this._layout.getScrollTransformer() || new ScrollTransformer(this);

    if (this.currentFrame) {
      this.showFrame(this.currentFrame.data.attributes.name);
    }
  },
  gestureListener: function(gesture) {
    var layerTransform = this._transformer.scrollGestureListener(gesture);

    if (gesture.first) {
      return;
    }
    if (layerTransform === true) {
      // native scrolling possible
      return;
    } else if (layerTransform) {
      this._layout.setLayerTransform(this.currentTransform = layerTransform);
      gesture.preventDefault = true;
    } else {
      if (this.inTransform) gesture.preventDefault = true; // we need to differentiate here later as we may have to check up stream handlers
      // gesture.cancelled = true;
      var cattr = this.currentFrame.data.attributes;
      if (gesture.direction) {
        if (cattr.neighbors && cattr.neighbors[directions2neighbors[gesture.direction]]) {
          gesture.preventDefault = true;
          if (!this.inTransform && (gesture.last || (gesture.wheel && gesture.enoughDistance()))) {
            this.transitionTo(cattr.neighbors[directions2neighbors[gesture.direction]], {
              type: gesture.direction
            });
          }
        } else { //jshint ignore:line
          // FIXME: escalate/gesture bubbling ; ignore for now
        }
      } else { //jshint ignore:line
        // this will prevent any bubbling for small movements
        gesture.preventDefault = true;
      }
    }
  },
  /**
   * show current frame immidiately without transition/animation
   *
   * @param {string} framename - the frame to be active
   * @param {Object} scrollData - information about the scroll position to be set. Note: this is a subset of a
   * transition object where only startPosition, scrollX and scrollY is considered
   * @returns {void}
   */
  showFrame: function(framename, scrollData) {
    if (!this.stage) {
      return;
    }
    scrollData = scrollData || {};
    var that = this;
    var frame = this.getChildViewByName(framename);
    if (!frame) throw "transformTo: " + framename + " does not exist in layer";
    this.inTransform = true;
    this._layout.loadFrame(frame).then(function() {
      var tfd = that.currentFrameTransformData = frame.getTransformData(that.stage, scrollData.startPosition);
      that.currentTransform = that._transformer.getScrollTransform(tfd, scrollData.scrollX || (tfd.isScrollX && tfd.scrollX) || 0, scrollData.scrollY || (tfd.isScrollY && tfd.scrollY) || 0);
      that._layout.showFrame(frame, tfd, that.currentTransform);
      that.inTransform = false;
    });
  },
  noFrameTransformdata: function(transitionStartPosition) {
    var d = {};
    d.stage = this.stage;
    d.scale = 1;
    d.width = d.frameWidth = this.stage.width();
    d.height = d.frameHeight = this.stage.height();
    d.shiftX = d.shiftY = d.scrollX = d.scrollY = 0;
    d.isScrollX = d.isScrollY = false;
    d.startPosition = transitionStartPosition || 'top';
    d.initialScrollX = d.scrollX;
    d.initialScrollY = d.scrollY;

    return d;
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {string} [framename] - (optional) frame name to transition to
   * @param {Object} [transition] - (optional) transition object
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transition before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(framename, transition) {
    // is framename  omitted?
    if (typeof framename === 'object' && null !== framename) {
      transition = framename;
      framename = transition.framename;
    } else if (null !== framename) {
      framename = framename || (transition && transition.framename);
    }
    if (!framename && null !== framename) throw "transformTo: no frame given";
    // transition ommitted? create some default
    transition = Kern._extend({
      type: 'default',
      duration: '1s'
        // FIXME: add more default values like timing
    }, transition || {});
    // lookup frame by framename
    var frame = null === framename ? null : this.getChildViewByName(framename);
    if (!frame && null !== frame) throw "transformTo: " + framename + " does not exist in layer";
    var that = this;
    this.inTransform = true;
    transition.transitionID = ++this.transitionID; // inc transition ID and save new ID into transition record
    // make sure frame is there such that we can calculate dimensions and transform data
    return this._layout.loadFrame(frame).then(function() {
      // calculate the layer transform for the target frame. Note: this will automatically consider native scrolling
      // getScrollIntermediateTransform will not change the current native scroll position but will calculate
      // a compensatory transform for the target scroll position.
      var targetFrameTransformData = null === frame ? that.noFrameTransformdata(transition.startPosition) : frame.getTransformData(that.stage, transition.startPosition);
      var targetTransform = that._transformer.getScrollTransform(targetFrameTransformData, transition.scrollX || 0, transition.scrollY || 0, true);
      // check if transition goes to exactly the same position
      if (that.currentFrame === frame && that.currentTransform === targetTransform && that.currentFrameTransformData === targetFrameTransformData) {
        // don't do a transition, just execute Promise
        var p = new Kern.Promise();
        p.resolve();
        that.inTransform = false;
        that.trigger('transitionTo', framename);
        that.trigger('transitionFinished', framename);
        return p;
      }
      var layoutPromise = that._layout.transitionTo(frame, transition, targetFrameTransformData, targetTransform).then(function() {
        // is this still the active transition?
        if (transition.transitionID === that.transitionID) {
          // this will now calculate the currect layer transform and set up scroll positions in native scroll
          that.currentTransform = that._transformer.getScrollTransform(targetFrameTransformData, transition.scrollX || 0, transition.scrollY || 0, false);
          // apply new transform (will be 0,0 in case of native scrolling)
          that._layout.setLayerTransform(that.currentTransform);
          that.inTransform = false;
          $.postAnimationFrame(function() {
            that.trigger('transitionFinished', framename);
          });
        }
      });
      that.trigger('transitionTo', framename);
      that.updateClasses(frame);
      that.currentFrameTransformData = targetFrameTransformData;
      that.currentFrame = frame;
      that.currentTransform = targetTransform;
      return layoutPromise;
    });
  },
  getCurrentTransform: function() {
    return this.currentTransform;
  },
  /**
   * updates HTML classes for frames during transition or showFrame
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  updateClasses: function(newFrame) {
    if (this.currentFrame) {
      this._saveLastFrame = this.currentFrame;
      this.currentFrame.outerEl.className = this.currentFrame.outerEl.className.replace(/\s*wl\-active\s*/g, '');
    }
    if (null !== newFrame) {
      newFrame.outerEl.className += " wl-active";
    }
  },
  /**
   * render child positions. overriden default behavior of groupview
   *
   * @param {ElementView} childView - the child view that has changed
   * @returns {Type} Description
   */
  _renderChildPosition: function(childView) {
    childView.disableObserver();
    this._layout.renderFramePosition(childView, this._currentTransform);
    childView.enableObserver();
  },
  /**
   * Method will be invoked when a resize event is detected.
   */
  onResize: function() {
    var childViews = this.getChildViews();
    var length = childViews.length;
    var scrollData = this.currentFrame.getScrollData();

    for (var i = 0; i < length; i++) {
      var childView = childViews[i];
      if (childView.hasOwnProperty('transformData')) {
        childView.transformData = null;
      }
    }
    this.showFrame(this.currentFrame.data.attributes.name, scrollData);
  }
}, {
  /*
  Model: LayerData*/
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    type: 'layer',
    layoutType: 'slide',
    defaultFrame: undefined,
    nativeScroll: true
  }),
  identify: function(element) {
    var type = element.getAttribute('data-lj-type');
    return null !== type && type.toLowerCase() === LayerView.defaultProperties.type;
  }
});

pluginManager.registerType('layer', LayerView, identifyPriority.normal);

module.exports = LayerView;

},{"../kern/Kern.js":29,"./domhelpers.js":2,"./gestures/gesturemanager.js":6,"./groupview.js":7,"./identifypriority.js":8,"./layoutmanager.js":11,"./pluginmanager.js":22,"./scrolltransformer.js":27}],11:[function(require,module,exports){
'use strict';
var layerJS = require('./layerjs.js');
var Kern = require('../kern/Kern.js');

var LayoutManager = Kern.EventManager.extend({
  /**
   * create a LayoutManager
   * the LayoutManager is used to provide Layer layout function for specified layout types.
   * It can be dynamically extended by further layout types.
   *
   * @param {Object} map - a mapping from type to Function
   * @returns {This}
   */
  constructor: function(map) {
    Kern.EventManager.call(this);
    this.map = map || {}; // maps ObjData types to View constructors
  },
  /**
   * register a new layout function
   *
   * @param {string} type - the layout type as given in the layer data model
   * @param {LayerLayout} fn - the layout engine
   * @returns {Type} Description
   */
  registerType: function(type, layouter) {
    this.map[type] = layouter;
  },
  /**
   * return the layout function for a given layout type
   *
   * @param {string} type - the layout type
   * @returns {LayerLayout} the layout engine
   */
  get: function(type){
    return this.map[type];
  }
});
// initialialize layoutManager with default plugins
layerJS.layoutManager = new LayoutManager();
// this module does not return the class but a singleton instance, the layoutManager for the project.
module.exports = layerJS.layoutManager;

},{"../kern/Kern.js":29,"./layerjs.js":9}],12:[function(require,module,exports){
'use strict';
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var CanvasLayout = LayerLayout.extend({
  /**
   * initalize CanvasLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    this._frameTransforms = {};
  },
  /**
   * transforms immidiately to the specified frame.
   *
   * @param {FrameView} frame - the frame to activate
   * @param {Object} transfromData - transform data of current frame
   * @param {string} transform - a string representing the scroll transform of the current frame
   * @returns {void}
   */
  /*jshint unused: true*/
  showFrame: function(frame, targetFrameTransformData, transform) {
    /*jshint unused: false*/
    transform = transform || "";
    this._reverseTransform = this._calculateReverseTransform(frame, targetFrameTransformData);
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;
    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, transform, {
        transition: '',
        display: 'block'
      });
    }
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {FrameView} frame - frame to transition to
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform representing the scrolling after transition
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transtion before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    var finished = new Kern.Promise();

    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;

    // we only listen to the transitionend of the target frame and hope that's fine
    // NOTE: other frame transitions may end closely afterwards and setting transition time to 0 will let
    // them jump to the final positions (hopefully jump will not be visible)

    // NOTE: Maybe this is a solution for not stopping the transitions
    var lastFrameToTransition = frames[framesLength-1];

    lastFrameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
      e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
      /*for (var i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        childFrame.applyStyles({
          transition: '' // deactivate transitions for all frames
        });
      }*/
      finished.resolve();
    });

    if (null !== frame) {
      this._reverseTransform = this._calculateReverseTransform(frame, targetFrameTransformData);
      // now apply all transforms to all frames
      for (var i = 0; i < framesLength; i++) {
        childFrame = frames[i];
        this._applyTransform(childFrame, this._reverseTransform, targetTransform, {
          transition: transition.duration,
          opacity: 1
        });
      }
    } else {
      for (var x = 0; x < framesLength; x++) {
        childFrame = frames[x];
        childFrame.applyStyles({
          opacity: 0,
          transition: transition.duration
        });
      }
    }


    return finished;
  },
  /**
   * calculate the transform that transforms a frame into the stage (almost the inverse transform to the actual frame transform)
   *
   * @returns {string} the calculated transform
   */
  _calculateReverseTransform: function(frame, targetFrameTransformData) {
    var targetFrameX = (parseInt(frame.x(), 10) || 0);
    var targetFrameY = (parseInt(frame.y(), 10) || 0);

    var transform = "translate3d(" + parseInt(-targetFrameTransformData.shiftX, 10) + "px," + parseInt(-targetFrameTransformData.shiftY, 10) + "px,0px) scale(" + targetFrameTransformData.scale / (frame.data.attributes.scaleX || 1) + "," + targetFrameTransformData.scale / (frame.data.attributes.scaleY || 1) + ") rotate(" + (-frame.data.attributes.rotation || 0) + "deg) translate3d(" + (-targetFrameX) + "px," + (-targetFrameY) + "px,0px)";
    return transform;
  },
  /**
   * apply new scrolling transform to layer
   *
   * @param {string} transform - the scrolling transform
   */
  setLayerTransform: function(transform) {
    var frames = this.layer.getChildViews();
    var framesLength = frames.length;
    var childFrame;
    // now apply all transforms to all frames
    for (var i = 0; i < framesLength; i++) {
      childFrame = frames[i];
      this._applyTransform(childFrame, this._reverseTransform, transform, {
        transition: ''
      });
    }
  },
  /**
   * this functions puts a frame at its default position. It's called by layer's render() renderChildPosition()
   * and and will also react to changes in the child frames
   *
   * @param {FrameView} frame - the frame to be positioned
   * @returns {void}
   */
  renderFramePosition: function(frame, transform) {
    var attr = frame.data.attributes,
      diff = frame.data.changedAttributes || frame.data.attributes,
      el = frame.outerEl;
    var css = {};
    // just do width & height for now; FIXME
    if ('width' in diff && attr.width !== undefined) {
      css.width = attr.width;
    }
    if ('height' in diff && attr.height !== undefined) {
      css.height = attr.height;
    }
    if ('x' in diff || 'y' in diff || 'rotation' in diff) {
      // calculate frameTransform of frame and store it in this._frameTransforms
      delete this._frameTransforms[attr.id]; // this will be recalculated in _applyTransform
      if (this._reverseTransform && transform) {
        // currentFrame is initialized -> we need to render the frame at new position
        this._applyTransform(frame, this._currentReverseTransform, this.layer.currentTransform, css);
      } {
        // just apply width and height, everything else the first showFrame() should do
        Kern._extend(el.style, css);
      }
    }
  },
  /**
   * apply transform by combining the frame transform with the reverse transform and the added scroll transform
   *
   * @param {FrameView} frame - the frame that should be transformed
   * @param {Object} baseTransform - a plain object containing the styles for the frame transform
   * @param {String} addedTransform - a string to be added to the "transform" style which represents the scroll transform
   * @param {Object} styles - additional styles for example for transition timing.
   * @returns {void}
   */
  _applyTransform: function(frame, reverseTransform, addedTransform, styles) {
    var attr = frame.data.attributes;
    // we need to add the frame transform (x,y,rot,scale) the reverse transform (that moves the current frame into the stage) and the transform representing the current scroll/displacement
    frame.applyStyles(styles || {}, {
      transform: addedTransform + " " + reverseTransform + " " + (this._frameTransforms[attr.id] || (this._frameTransforms[attr.id] = "translate3d(" + (attr.x || 0) + "px," + (attr.y || 0) + "px,0px) rotate(" + (attr.rotation || 0) + "deg) scale(" + attr.scaleX + "," + attr.scaleY + ")"))
    });
  },
});

layoutManager.registerType('canvas', CanvasLayout);

module.exports = CanvasLayout;

},{"../../kern/Kern.js":29,"../layoutmanager.js":11,"./layerlayout.js":13}],13:[function(require,module,exports){
'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');

/**
 * this is the base class for all LayerLayouts
 *
 */
var LayerLayout = Kern.EventManager.extend({
  /**
   * initalize LayerLayout with a layer
   *
   * @param {LayerView} layer - the layer to which this layout belongs
   * @returns {Type} Description
   */
  constructor: function(layer) {
    Kern.EventManager.call(this);
    if (!layer) throw "provide a layer";
    this.layer = layer;
  },
  /**
   * this functions puts a frame at its default position
   * Note: by default this only renders width and height, but no position or transforms.
   * Width and height are needed for getting the frame transform data
   *
   * @param {FrameView} frame - the frame to be positioned
   * @returns {void}
   */
  renderFramePosition: function(frame) {
    var attr = frame.data.attributes,
      diff = frame.data.changedAttributes || frame.data.attributes,
      el = frame.outerEl;
    var css = {};
    // just do width & height for now; FIXME
    if ('width' in diff && attr.width !== undefined) {
      css.width = attr.width;
    }
    if ('height' in diff && attr.height !== undefined) {
      css.height = attr.height;
    }
    Kern._extend(el.style, css);
  },
  /**
   * make sure frame is rendered (i.e. has display: block)
   * Later: make sure frame is loaded and added to document
   * FIXME: should that go into layout?
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  loadFrame: function(frame) {
    var finished = new Kern.Promise();

    if (frame === null || (document.body.contains(frame.outerEl) && window.getComputedStyle(frame.outerEl).display !== 'none')) {
      finished.resolve();
    } else {
      // FIXME: add to dom if not in dom
      // set display block
      frame.outerEl.style.display = 'block';
      // frame should not be visible; opacity is the best as "visibility" can be reverted by nested elements
      frame.outerEl.style.opacity = '0';
      // wait until rendered;
      $.postAnimationFrame(function() {
        finished.resolve();
      });
    }
    return finished;
  },
  /**
   * get the width of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the width
   */
  getStageWidth: function() {
    return this.layer.stage.width();
  },
  /**
   * get the height of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the height
   */
  getStageHeight: function() {
    return this.layer.stage.height();
  },
  showFrame: function() {
    throw "showFrame() not implemented";
  },
  transitionTo: function() {
    throw "transitionTo() not implemented";
  },
  // jshint ignore:start
  prepareTransition: function() {
  },
  // jshint ignore:end
  parametricTransition: function() {
    throw "parametricTransition() not implemented";
  },
  getScrollTransformer: function(){
    return undefined;
  }
});

module.exports = LayerLayout;

},{"../../kern/Kern.js":29,"../domhelpers.js":2}],14:[function(require,module,exports){
'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var SlideLayout = LayerLayout.extend({
  /**
   * initalize SlideLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    var that = this;
    this._preparedTransitions = {};
    // create a bound version of swipeTransition() that will be stored to the transitions hash
    var swipeTransition = function(type, currentFrameTransformData, targetFrameTransformData) {
      return that.swipeTransition(type, currentFrameTransformData, targetFrameTransformData);
    };

    this.transitions = {
      default: swipeTransition,
      left: swipeTransition,
      right: swipeTransition,
      up: swipeTransition,
      down: swipeTransition
    };
  },
  /**
   * transforms immidiately to the specified frame. hides all other frames
   *
   * @param {FrameView} frame - the frame to activate
   * @param {Object} transfromData - transform data of current frame
   * @param {string} transform - a string representing the scroll transform of the current frame
   * @returns {void}
   */
  showFrame: function(frame, frameTransformData, transform) {
    for (var i = 0; i < this.layer.innerEl.children.length; i++) {
      this.layer.innerEl.children[i].style.display = 'none';
    }
    this._applyTransform(frame, this._currentFrameTransform = this._calcFrameTransform(frameTransformData), transform, {
      display: '',
      opacity: 1,
      visibility: '',
      top: "0px",
      left: "0px"
    });
    this._preparedTransitions = {};
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {FrameView} frame - frame to transition to
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform representing the scrolling after transition
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transition before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    var that = this;
    var currentFrame = that.layer.currentFrame;
    return this.prepareTransition(frame, transition, targetFrameTransformData, targetTransform).then(function(t) {
      var finished = new Kern.Promise();
      console.log('now for real');
      var frameToTransition = frame || currentFrame;

      if (null !== frameToTransition) {
        frameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
          e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
          if (transition.transitionID === that.layer.transitionID) {
            if (currentFrame) {
              currentFrame.applyStyles({
                transition: '',
                display: 'none'
              });
            }
            if (frame) {
              frame.applyStyles({
                transition: ''
              });
            }
          }
          // wait until above styles are applied;
          $.postAnimationFrame(function() {
            finished.resolve();
          });
        });
      } else {
        finished.resolve();
      }

      that._applyTransform(frame, that._currentFrameTransform = that._calcFrameTransform(targetFrameTransformData), targetTransform, {
        transition: transition.duration,
        top: "0px",
        left: "0px"
      });

      that._applyTransform(currentFrame, t.c1, targetTransform, {
        transition: transition.duration,
        top: "0px",
        left: "0px"
      });
      that._preparedTransitions = {};
      // wait until post transforms are applied an signal that animation is now running.
      $.postAnimationFrame(function() {
        that.layer.trigger('transitionStarted');
      });
      return finished;
    });
  },
  /**
   * calculate pre and post transforms for current and target frame
   * needed for swipes
   * make sure targetFrame is at pre position
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform representing the scrolling after transition
   * @returns {Promise} will fire when pre transform to target frame is applied
   */
  prepareTransition: function(frame, transition, targetFrameTransformData, targetTransform) {
    // create a promise that will wait for the transform being applied
    var finished = new Kern.Promise();
    var prep;

    if (frame === null) {
      prep = this.transitions[transition.type](transition.type, this.layer.currentFrameTransformData, targetFrameTransformData);
      finished.resolve(prep);
    } else if ((prep = this._preparedTransitions[frame.data.attributes.id])) {
      if (prep.transform === targetTransform && prep.applied) { // if also the targetTransform is already applied we can just continue
        finished.resolve(prep);
      } else {
        prep = undefined;
      }
    }

    if (undefined === prep) {
      // call the transition type function to calculate all frame positions/transforms
      prep = this._preparedTransitions[frame.data.attributes.id] = this.transitions[transition.type](transition.type, this.layer.currentFrameTransformData, targetFrameTransformData); // WARNING: this.layer.currentFrameTransformData should still be the old one here. carefull: this.layer.currentFrameTransformData will be set by LayerView before transition ends!
      // apply pre position to target frame
      this._applyTransform(frame, prep.t0, this.layer.currentTransform, {
        transition: '',
        opacity: '1',
        visibility: ''
      });
      prep.transform = targetTransform;
      console.log(prep.t0);
      // wait until new postions are rendered then resolve promise
      $.postAnimationFrame(function() {
        prep.applied = true;
        console.log('resolve');
        finished.resolve(prep);
      });
    }

    return finished;
  },
  /**
   * apply new scrolling transform to layer
   *
   * @param {string} transform - the scrolling transform
   */
  setLayerTransform: function(transform) {
    this._applyTransform(this.layer.currentFrame, this._currentFrameTransform, transform);
  },
  /**
   * apply transform by combining the frames base transform with the added scroll transform
   *
   * @param {FrameView} frame - the frame that should be transformed
   * @param {Object} baseTransform - a plain object containing the styles for the frame transform
   * @param {String} addedTransform - a string to be added to the "transform" style which represents the scroll transform
   * @param {Object} styles - additional styles for example for transition timing.
   * @returns {void}
   */
  _applyTransform: function(frame, frameTransform, addedTransform, styles) {
    if (frame) {
      frame.applyStyles(styles || {}, {
        transform: addedTransform + " " + frameTransform
      });
    }
  },
  /**
   * calculate the transform for a give frame using its transformData record
   *
   * @param {Object} frameTransformData - the transform data of the frame
   * @returns {string} the calculated transform
   */
  _calcFrameTransform: function(frameTransformData) {
    var x = -frameTransformData.shiftX;
    var y = -frameTransformData.shiftY;
    return "translate3d(" + x + "px," + y + "px,0px) scale(" + frameTransformData.scale + ")";
  },
  /**
   * calculates pre and post positions for simple swipe transitions.
   *
   * @param {string} type - the transition type (e.g. "left")
   * @param {Integer} which - Boolean mask describing which positions need to be calculated
   * @param {Object} ctfd - currentFrameTransformData - transform data of current frame
   * @param {Object} ttfd - targetFrameTransformData - transform data of target frame
   * @returns {Object} the "t" record containing pre and post transforms
   */
  swipeTransition: function(type, ctfd, ttfd) {
    var t = {}; // record taking pre and post positions
    var x, y;
    switch (type) {
      case 'default':
      case 'left':
        // target frame transform time 0
        x = Math.max(this.getStageWidth(), ctfd.width) - ctfd.shiftX;
        y = -ttfd.shiftY + ctfd.scrollY * ctfd.scale - ttfd.scrollY * ttfd.scale;
        // FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
        t.t0 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        x = -Math.max(this.getStageWidth(), ctfd.width) - ttfd.shiftX;
        y = -ctfd.shiftY - ctfd.scrollY * ctfd.scale + ttfd.scrollY * ttfd.scale;
        t.c1 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'right':
        // target frame transform time 0
        x = -Math.max(this.getStageWidth(), ttfd.width) - ctfd.shiftX;
        y = -ttfd.shiftY + ctfd.scrollY * ctfd.scale - ttfd.scrollY * ttfd.scale;
        t.t0 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        x = Math.max(this.getStageWidth(), ttfd.width) - ttfd.shiftX;
        y = -ctfd.shiftY - ctfd.scrollY * ctfd.scale + ttfd.scrollY * ttfd.scale;
        t.c1 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'up':
        // target frame transform time 0
        y = Math.max(this.getStageHeight(), ctfd.height) - ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        // FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
        t.t0 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        y = -Math.max(this.getStageHeight(), ctfd.height) - ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'down':
        // target frame transform time 0
        y = -Math.max(this.getStageHeight(), ttfd.height) - ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        t.t0 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        y = Math.max(this.getStageHeight(), ttfd.height) - ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1 = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;
        // target frame transform time 0
    }

    return t;
  }
});

layoutManager.registerType('slide', SlideLayout);

module.exports = SlideLayout;

},{"../../kern/Kern.js":29,"../domhelpers.js":2,"../layoutmanager.js":11,"./layerlayout.js":13}],15:[function(require,module,exports){
'use strict';

var Kern = require('../kern/Kern.js');

/**
 * Base data class of all view classes
 *
 * @extends Kern.Model
 */
var NodeData = Kern.Model.extend({
  constructor: function(param) {
    var data = param || {};

    if (data.defaultProperties) {
      data = Kern._extendKeepDeepCopy({}, param.defaultProperties);
    }

    Kern.Model.call(this, data);
  },

  addChildren: function(ids) {
    this.silence();
    if (Array.isArray(ids)) {
      for (var i = 0; i < ids.length; i++) {
        this.addChild(ids[i]);
      }
    }
    this.fire();
  },

  addChild: function(id) {
    this.silence();
    this.update('children').push(id);
    this.fire();
  },

  removeChildren: function(ids) {
    this.silence();
    if (Array.isArray(ids)) {
      for (var i = 0; i < ids.length; i++) {
        this.removeChild(ids[i]);
      }
    }
    this.fire();
  },

  removeChild: function(id) {
    var idx = this.attributes.children.indexOf(id);
    if (idx >= 0) {
      this.silence();
      this.update('children').splice(idx, 1);
      this.fire();
    }
  }
});

module.exports = NodeData;

},{"../kern/Kern.js":29}],16:[function(require,module,exports){
'use strict';

var Kern = require('../kern/Kern.js');
var NodeData = require('./nodedata.js');
var defaults = require('./defaults.js');
var repository = require('./repository.js');
var pluginManager = require('./pluginmanager.js');
var identifyPriority = require('./identifypriority.js');
var observerFactory = require('./observer/observerfactory.js');
/**
 * Defines the view of a node and provides all basic properties and
 * rendering fuctions that are needed for a visible element.
 *
 * @param {NodeData} dataModel the Tailbone Model of the View's data
 * @param {Object} options {data: json for creating a new data object; el: (optional) HTMLelement already exisitng; outerEl: (optional) link wrapper existing; root: true if that is the root object}
 */
var NodeView = Kern.EventManager.extend({
  constructor: function(dataModel, options) {
    Kern.EventManager.call(this);
    options = options || {};

    // dataobject must exist
    this.data = this.data || dataModel || options.el && new NodeData(this.constructor);

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
    this.innerEl = this.innerEl || options.el;
    if (undefined === this.innerEl) {
      if (this.data.attributes.nodeType === 1 || this.data.attributes.tag) {
        this.innerEl = document.createElement(this.data.attributes.tag);
      } else if (this.data.attributes.nodeType === 3) {
        // text node
        this.innerEl = document.createTextNode('');
      } else if (this.data.attributes.nodeType === 8) {
        // comment node
        this.innerEl = document.createComment('');
      }
    }
    // backlink from DOM to object
    if (this.innerEl._wlView) throw "trying to initialialize view on element that already has a view";
    this.innerEl._wlView = this;
    // possible wrapper element
    this.outerEl = this.outerEl || options.el || this.innerEl;
    this.outerEl._wlView = this;
    this.disableObserver();

    var that = this;
    // The change event must change the properties of the HTMLElement el.
    this.data.on('change', function() {
      if (!that._dataObserverCounter) {
        that.render();
      }
    }, {
      ignoreSender: that
    });

    // Only render the element when it is passed in the options
    if (!options.noRender && (options.forceRender || !options.el))
      this.render();

    this._createObserver();
    this.enableObserver();
    this.enableDataObserver();
  },
  /**
   * add a new parent view
   *
   * @param {NodeView} parent - the parent of this view
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
   * @returns {NodeView} parent
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

    var diff = this.isRendered ? this.data.changedAttributes || {} : this.data.attributes;

    if ('id' in diff) {
      this.outerEl.id = 'wl-obj-' + this.data.attributes.id;
    }

    if ('content' in diff && this.data.attributes.nodeType !== 1) {
      this.outerEl.data = this.data.attributes.content || '';
    }

    this.isRendered = true;

    this.enableObserver();
  },
  /**
   * get Parent View of specific type recursively
   *
   * @param {string} type - the type the parent should have
   * @returns {ObjView} the View requested
   */
  getParentOfType: function(type) {
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
   * Will create a NodeData object based on a DOM element
   *
   * @param {element} DOM element to needs to be parsed
   * @return  {data} a javascript data object
   */
  parse: function(element) {
    var data = {
      content: element.data,
      nodeType: element.nodeType
    };

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
    if (this._observer) {
      this._observer.stop();
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

    this._observer = observerFactory.getObserver(this.outerEl, {
      characterData: true,
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
    if (result.characterData) {
      this.parse(this.outerEl);
    }
  }
}, {
  // save model class as static variable
  Model: NodeData,
  identify: function(element) {
    return element.nodeType !== 1;
  },
  defaultProperties: {
    id: undefined,
    type: 'node',
    content: '',
    nodeType: 3,
    version: defaults.version
  }
});


pluginManager.registerType('node', NodeView, identifyPriority.normal);

module.exports = NodeView;

},{"../kern/Kern.js":29,"./defaults.js":1,"./identifypriority.js":8,"./nodedata.js":15,"./observer/observerfactory.js":19,"./pluginmanager.js":22,"./repository.js":23}],17:[function(require,module,exports){
'use strict';
var Observer = require('./observer.js');

var something = Observer.extend({
      constructor: function(element, options) {
        Observer.call(this, element, options);

        var that = this;
        this.mutationObserver = new MutationObserver(function(mutations) {
          that.mutationCallback(mutations);
        });
      },
      /**
       * Will analyse if the element has changed. Will call the callback method that
       * is provided in the options.
       */
      mutationCallback: function(mutations) {
        var result = {
          attributes: [],
          addedNodes: [],
          removedNodes: []
        };
        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];
          if (this.options.attributes && mutation.type === 'attributes') {
            result.attributes.push(mutation.attributeName);
          }
          if (this.options.childList && mutation.type === 'childList') {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              result.addedNodes = result.addedNodes.concat(mutation.addedNodes);
            }
            if (mutation.removeNodes && mutation.removeNodes.length > 0) {
              result.removedNodes = result.newNodes.concat(mutation.removeNodes);
            }
          }
        }

        if (this.options.callback && (result.attributes.length > 0 || result.addedNodes.length > 0 || result.removedNodes.length > 0)) {
            this.options.callback(result);
          }
        },
        /**
         * Starts the observer
         */
        observe: function() {
            this.mutationObserver.observe(this.element, {
              attributes: this.options.attributes || false,
              childList: this.options.childList || false,
              characterData: this.options.characterData || false
            });
          },
          /**
           * Stops the observer
           */
          stop: function() {
            this.mutationObserver.disconnect();
          }
      });

  module.exports = something;

},{"./observer.js":18}],18:[function(require,module,exports){
'use strict';
var Kern = require('../../kern/kern.js');

var Observer = Kern.Base.extend({
  constructor: function(element, options) {
    options = options || {};
    this.element = element;
    this.options = options;
    this.counter = 0;
  },
  /**
   * Starts the observer   
   */
  observe: function() {
    throw 'not implemented';
  },
  /**
   * Stops the observer
   */
  stop: function() {
    throw 'not implemented';
  },
  /**
   * Checks if the observer is observing
   *
   * @returns {bool} returns true if observer is observing
   */
  isObserving: function(){
    return this.counter === 0;
  }
});

module.exports = Observer;

},{"../../kern/kern.js":30}],19:[function(require,module,exports){
'use strict';
var Kern = require('../../kern/kern.js');
var MutationsObserver = require('./mutationsobserver.js');
var TimeoutObserver = require('./timeoutobserver.js');

var ObserverFactory = Kern.Base.extend({
  constructor: function() {
  },
  /**
 * Creates an observer
 *
 * @param {object} element - a dom element
 * @returns {object} options
 */
  getObserver: function(element, options) {
    return (window.MutationObserver) ? new MutationsObserver(element, options) : new TimeoutObserver(element, options);
  }
});

module.exports = new ObserverFactory();

},{"../../kern/kern.js":30,"./mutationsobserver.js":17,"./timeoutobserver.js":20}],20:[function(require,module,exports){
'use strict';
var Observer = require('./observer.js');

var TimeoutObserver = Observer.extend({
  constructor: function(element, options) {
    Observer.call(this, element, options);

    this.attributes = {};
    this.childNodes = [];
    this.characterData = undefined;
    this.myTimeout = undefined;
  },
  /**
 * Checks if the elements has changed. Will call the callback method
 * that is provided in the options
 */
  elementModified: function() {
    var result = {
      attributes: [],
      addedNodes: [],
      removedNodes: [],
      characterData: false
    };

    if (this.options.attributes && this.element.nodeType === 1) {
      var attributeName;
      var found = {};
      for (attributeName in this.attributes) {
        if (this.attributes.hasOwnProperty(attributeName)) {
          found[attributeName] = false;
        }
      }
      for (var index = 0; index < this.element.attributes.length; index++) {
        var attribute = this.element.attributes[index];
        // attribute isn't mapped
        if (!this.attributes.hasOwnProperty(attribute.name)) {
          this.attributes[attribute.name] = attribute.value;
          result.attributes.push(attribute.name);
        } else if (this.attributes[attribute.name] !== attribute.value) {
          // attribute is mapped but value has changed
          result.attributes.push(attribute.name);
        }
        found[attribute.name] = true;
      }

      // detect deleted attributes
      for (attributeName in found) {
        if (found.hasOwnProperty(attributeName) && !found[attributeName]) {
          delete this.attributes[attributeName];
          result.attributes.push(attributeName);
        }
      }
    }

    if (this.options.childList && this.element.nodeType === 1) {
      var i, child;
      //detect delete children
      for (i = 0; i < this.childNodes.length; i++) {
        child = this.childNodes[i];
        if (!this.element.contains(child)) {
          this.childNodes.splice(i, 1);
          result.removedNodes.push(child);
        }
      }
      //detect new children
      for (i = 0; i < this.element.childNodes.length; i++) {
        child = this.element.childNodes[i];
        if (-1 === this.childNodes.indexOf(child)) {
          result.addedNodes.push(child);
          this.childNodes.push(child);
        }
      }
    }

    // detect changes in characterData
    if (this.options.characterData && this.element.nodeType === 3) {
      if (this.characterData !== this.element.data) {
        result.characterData = true;
        this.characterData = this.element.data;
      }
    }

    if (this.options.callback && (result.attributes.length > 0 || result.addedNodes.length > 0 || result.removedNodes.length > 0 || result.characterData)) {
      this.options.callback(result);
    }

    this.observe();
  },
  /**
   * Starts the observer
   */
  observe: function() {
    if (this.counter !== 0) {
      this.counter--;
    }

    if (this.counter === 0) {
      this.attributes = {};
      this.childNodes = [];
      this.myTimeout = undefined;

      if (this.element.nodeType === 1) {
        var length = this.element.attributes.length;
        for (var index = 0; index < length; index++) {
          var attribute = this.element.attributes[index];
          this.attributes[attribute.name] = attribute.value;
        }

        length = this.element.childNodes.length;
        for (var i = 0; i < length; i++) {
          this.childNodes.push(this.element.childNodes[i]);
        }
      } else if (this.element.nodeType === 3) {
        this.characterData = this.element.data;
      }

      var that = this;
      this.myTimeout = setTimeout(function() {
        that.elementModified();
      }, this.options.timeout || 1000);
    }
  },
  /**
   * Stops the observer
   */
  stop: function() {
    this.counter++;
    if (this.myTimeout !== undefined) {
      clearTimeout(this.myTimeout);
      this.myTimeout = undefined;
    }
  }
});

module.exports = TimeoutObserver;

},{"./observer.js":18}],21:[function(require,module,exports){
'use strict';
var layerJS = require('./layerjs.js');
var pluginManager = require('./pluginmanager.js');

var ParseManager = function() {
  /**
   * Parses a document for layerJs object
   * @param {HTMLDocument} doc - an optional root document
   *
   * @returns {void}
   */
  this.parseDocument = function(doc) {

    var stageElements = (doc || document).querySelectorAll("[data-lj-type='stage']");

    var length = stageElements.length;

    for (var index = 0; index < length; index++) {
      pluginManager.createView('stage', {
        el: stageElements[index]
      });
    }
  };
};


layerJS.parseManager = new ParseManager();
module.exports = layerJS.parseManager;

},{"./layerjs.js":9,"./pluginmanager.js":22}],22:[function(require,module,exports){
'use strict';
var layerJS = require('./layerjs.js');
var Kern = require('../kern/Kern.js');

var PluginManager = Kern.EventManager.extend({
  /**
   * create a PluginManager
   * the PluginManager is used to create View objects from ObjData objects.
   * It contains a list of constructors for the corresponding data types.
   * It can be dynamically extended by further data types.
   *
   * @param {Object} map - an object mapping Obj types to {view:constructor, model: contructor} data sets
   * @returns {This}
   */
  constructor: function(map, identifyPriorities) {
    Kern.EventManager.call(this);
    this.map = map || {}; // maps ObjData types to View constructors
    this.identifyPriorities = identifyPriorities || {};
  },
  /**
   * create a view based on the type in the Obj's model
   *
   * @param {NodeData} model - the model from which the view should be created
   * @param {Object} [options] - create options
   * @param {HTMLElement} options.el - the element of the view
   * @returns {NodeView} the view object of type NodeView or a sub class
   */
  createView: function(model, options) {
    // return existing view if the provided element already has one
    if (options && options.el && options.el._wlView) {
      return options.el._wlView;
    }
    if (typeof model === 'string') {
      var type = model;
      if (this.map.hasOwnProperty(type)) {
        return new(this.map[type].view)(null, options);
      }
      throw "no constructor found for objects of type '" + type + "'";
    } else if (model.attributes.type && this.map.hasOwnProperty(model.attributes.type)) {
      return new(this.map[model.attributes.type].view)(model, options);
    }
    throw "no constructor found for objects of type '" + model.attributes.type + "'";
  },
  /**
   * create a data model based on a json object (and it's type property)
   *
   * @param {Object} data - JSON data of data model
   * @param {Object} options - options passed to the model constructor
   * @returns {ObjData} the new data model
   */
  createModel: function(data, options) {
    if (data.type && this.map.hasOwnProperty(data.type)) {
      return new(this.map[data.type].model)(data, options);
    }
    throw "no constructor found for ObjData of type '" + data.type + "'";
  },
  /**
   * register a view class for a ObjData type
   *
   * @param {string} type - the name of the type
   * @param {function} constructor - the constructor of the view class of this type
   * @returns {This}
   */
  registerType: function(type, constructor, identifyPriority) {
    this.map[type] = {
      view: constructor,
      model: constructor.Model,
      identify: constructor.identify
    };

    if (undefined === this.identifyPriorities[identifyPriority])
      this.identifyPriorities[identifyPriority] = [];

    this.identifyPriorities[identifyPriority].push(constructor);
  },
  /**
   * Will iterate over the registered ViewTypes and call it's identify
   * method to find the ViewType of a DOM element
   *
   * @param {object} element - A DOM element
   * @returns {string} the found ViewType
   */
  identify: function(element) {
      var type;

      var sortedKeys = Object.keys(this.identifyPriorities).sort(function(a, b) {
        return (a - b) * (-1);
      });

      for (var x = 0; x < sortedKeys.length; x++) {
        var key = sortedKeys[x];
        for (var i = 0; i < this.identifyPriorities[key].length; i++) {
          if (this.identifyPriorities[key][i].identify(element)) {
            type = this.identifyPriorities[key][i].defaultProperties.type;
            break;
          }
        }
        if (undefined !== type) {
          break;
        }
      }

      if (undefined === type) {
        throw "no ViewType found for element '" + element + "'";
      }

      return type;
    }
    /**
     * make sure a certain plugin is available, continue with callback
     *
     * @param {string} type - the type that shoud be present
     * @param {Function} callback - call when plugins is there
     * @returns {Type} Description
     */
    // requireType: function(type, callback) {
    //   if (!this.map[type]) throw "type " + type + " unkonw in pluginmanager. Have no means to load it"; //FIXME at some point this should dynamically load plugins
    //   return callback(); // FIXME should be refactored with promises or ES 6 yield
    // }
});
// initialialize pluginManager with default plugins
layerJS.pluginManager = new PluginManager({});
// this module does not return the class but a singleton instance, the pluginmanager for the project.
module.exports = layerJS.pluginManager;

},{"../kern/Kern.js":29,"./layerjs.js":9}],23:[function(require,module,exports){
'use strict';
var layerJS = require('./layerjs.js');
var defaults = require('./defaults.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');

var Repository = Kern.EventManager.extend({
  /**
   * create a Repository
   *
   * @param {Object} data - key value store of all objects in the prepository
   * @param {string} [version] - the version of the data objects
   * @returns {This}
   */
  constructor: function(data, version) {
    this.versions = {};
    if (data) {
      this.importJSON(data, version);
    }
  },
  /**
   * import model repository from JSON Array (or map with {id: model} entries)
   *
   * @param {object} data - JSON data
   * @param {string} version - version to be used
   * @returns {Type} Description
   */
  importJSON: function(data, version) {
    if (!data) throw "no ModelRepository or data given";
    if (!version) throw "no version to create given";
    if (this.versions.hasOwnProperty(version)) throw "version already present in repository";
    var models = [];
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        models.push(pluginManager.createModel(data[i]));
      }
    } else if (typeof data === 'string') { //<-- FIXME this seems wrong
      for (var k in Object.keys(data)) {
        if (data.hasOwnProperty(k)) {
          var obj = data[k];
          if (obj.attributes.id && obj.attributes.id !== k) throw "id mismatch in JSON data";
          obj.attributes.id = k;
          models.push(pluginManager.createModel(data[k]));
        }
      }
    }
    this.versions[version] = new Kern.ModelRepository(models);
  },
  /**
   * clear the repository either for a specified version or for all versions
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  clear: function(version) {
    if (version !== undefined) {
      this.versions[version] = new Kern.ModelRepository();
    } else {
      this.versions = {};
    }
  },
  /**
   * return a model of a give id from a specified version
   *
   * @param {string} id - the id of the model
   * @param {string} version - the version of the requested model
   * @returns {ObjData} the model
   */
  get: function(id, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    return this.versions[version].get(id);
  },
  /**
   * add a data model to the repository of the specified version
   *
   * @param {ObjData} model - the model to be added
   * @param {string} version - the version of the repository/model
   * @returns {void}
   */
  add: function(model, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    this.versions[version].add(model);
  },
  /**
   * Check if a specific model is already added to a certain version
   *
   * @param {string} id
   * @param {string} version - the version of the repository/model
   * @returns {bool}
   */
  contains: function(id, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point

    return this.versions[version].models[id] !==undefined;
  },
  /**
   * Generates an id for a data object. This id should be unique
   * This method should be looked at in the future.
   *
   * @returns {string} the id
   */
  getId: function() {
    if (this.previous === undefined)
      this.previous = 0;

    var next = (new Date()).getTime();

    if (next <= this.previous) {
      next = this.previous + 1;
    }

    this.previous = next;
    return next.toString();
  },
  /**
   * Will check if a specific version is added to the repository
   *
   * @param {string} version - the version of the repository
   * @returns {bool} the id
   */
  hasVersion: function(version) {
    return this.versions[version] !== undefined;
  },
  /**
   * Will create a new version in the repository
   *
   * @param {string} version - the version of the repository
   */
  createVersion: function(version) {
    if (this.versions[version]) throw "version already exists";
    this.versions[version] = new Kern.ModelRepository();
  }
});
// initialialize repository
layerJS.repository = new Repository();
module.exports = layerJS.repository;

},{"../kern/Kern.js":29,"./defaults.js":1,"./layerjs.js":9,"./pluginmanager.js":22}],24:[function(require,module,exports){
'use strict';
var Kern = require('../../kern/Kern.js');
//var ParseManager = require("./parsemanager.js");

/**
 * load an HTML document by AJAX and return it through a promise
 *
 * @param {string} URL - the url of the HMTL document
 * @returns {Promise} a promise that will return the HTML document
 */
var loadHTML = function(URL) {
  var xhr = new XMLHttpRequest();
  var p = new Kern.Promise();
  xhr.onload = function() {
    var doc = document.implementation.createHTMLDocument("framedoc");
    doc.documentElement.innerHTML = xhr.responseText;
    p.resolve(doc);
  };
  xhr.open("GET", URL);
  xhr.responseType = "text";
  xhr.send();
  return p;
};
var getChildIndex = function(type, node) {
  var children = node.parent.children;
  var i;
  var cc = 0;
  for (i = 0; i < children.length; i++) {
    if (node === children[i]) return cc;
    if (children[i].getAttribute('data-lj-type') !== type) continue;
    cc++;
  }
  throw "node not found in parent";
};
var getLayerJSParents = function(path, node) {
  var type = node.nodeType === 1 && node.getAttribute('data-lj-type');
  if (type === 'stage' || type === 'layer' || type === 'frame') {
    path = (node.getAttribute('data-lj-name') || node.id || type + "[" + getChildIndex(type, node) + "]") + (path ? "." + path : "");
  }
  if (!node.parentNode) return path;
  return getLayerJSParents(path, node.parentNode);
};
var getFramePaths = function(doc) {
  var frames = doc.querySelectorAll('[data-lj-type="frame"]');
  var paths = [];
  var f;
  for (f = 0; f < frames.length; f++) {
    paths.push({
      frame: frames[f],
      path: getLayerJSParents("", frames[f])
    });
  }
  paths = paths.sort(function(a, b) {
    return a.path.length - b.path.length;
  });
  return paths;
};

var FileRouter = Kern.EventManager.extend({
  /**
 * Will check if the router can handle the passed in url
 * @param {string} An url
 * @return {boolean} True if the router can handle the url
 */
  canHandle: function(href) {
    var result = true;
    if (href.match(/^\w+:/)) { // absolute URL
      if (!href.match(new RegExp('^' + window.location.origin))) {
        result = false;
      }
    }
    return result;
  },
  /**
 * Will do the actual navigation to the url
 * @param {string} an url
 * @return {void}
 */
  handle: function(href, transition) {
    loadHTML(href).then(function(doc) {
      var paths = getFramePaths(doc);
      var currentPaths = getFramePaths(document);
      var i, j;
      var replacedPaths = [];
      for (i = 0; i < paths.length; i++) {
        var found = false;
        for (j = 0; j < replacedPaths.length; j++) {
          if (paths[i].path.indexOf(replacedPaths[j]) === 0) {
            found = true;
            break;
          }
        }
        if (found) continue;
        found = false;
        for (j = 0; j < currentPaths.length; j++) {
          if (paths[i].path === currentPaths[j].path) {
            found = true;
            break;
          }
        }
        if (found) continue;
        found = false;
        var layerPath = paths[i].path.replace(/^(.*\.)[^\.]*$/, "$1");
        for (j = 0; j < currentPaths.length; j++) {
          if (currentPaths[j].path.indexOf(layerPath) === 0 && currentPaths[j].path.slice(layerPath.length).match(/^[^\.]*$/)) {
            found = true;
            replacedPaths.push(paths[i].path);
            var parent = currentPaths[j].frame.parentNode;
            parent.appendChild(paths[i].frame);

            // FIXME: Refactor to use new children changed paradigm of layerJS
            // calling internal function _parseChildren is not recommended
            parent._wlView._parseChildren();
            parent._wlView.transitionTo(paths[i].frame._wlView.data.attributes.name, transition);
            parent._wlView._parseChildren();
            parent.removeChild(currentPaths[j].frame);

            break;
          }
        }
        if (found) continue;
        window.location.href = href;

      }
      console.log(paths);
    });
  }
});

module.exports = FileRouter;

},{"../../kern/Kern.js":29}],25:[function(require,module,exports){
'use strict';
var layerJS = require('../layerjs.js');
var $ = require('../domhelpers.js');
var Kern = require('../../kern/kern.js');
var defaults = require('../defaults.js');

var Router = Kern.EventManager.extend({
  constructor: function(rootEl) {
    this.rootElement = rootEl || document;
    this.currentRouter = undefined;
    this._registerLinkClickedListener();
  },
  /**
   * Will set the current router that will be used to navigate
   * @param {object} A new router
   */
  setCurrentRouter: function(router) {
    this.currentRouter = router;
  },
  _registerLinkClickedListener: function() {
    var that = this;

    window.onpopstate = function() {
      that._navigate(document.location.href, false);
    };

    $.addDelegtedListener(this.rootElement, 'click', 'a', function(event) {
      var href = this.href;

      if (that._navigate(href, true)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  },
  /**
   * Will parse the url for transition parameters and will return a cleaned up url and parameters
   * @param {string} Url where to navigate
   * @return {Object} An object containing a cleaned up url and transitionOptions
   */
  _parseUrl: function(href) {
    var result = {
      url: href,
      transitionOptions: {}
    };

    for (var parameter in defaults.transitionParameters) {
      if (defaults.transitionParameters.hasOwnProperty(parameter)) {
        var parameterName = defaults.transitionParameters[parameter];
        var regEx = new RegExp("[?&]" + parameterName + "=([^&]+)");
        var match = result.url.match(regEx);
        if (match) {
          result.transitionOptions[parameter] = match[1];
          result.url = result.url.replace(regEx, '');
        }
      }
    }


    return result;
  },
  /**
   * When the router can navigate to the url, it will do this.
   * @param {string} Url where to navigate
   * @param {boolean} Indicate if the url needs to be added to the history
   * @return {boolean} Indicates if the router could do the navigation to the url
   */
  _navigate: function(href, addToHistory) {
    var navigate = false;
    if (this.currentRouter && this.currentRouter.canHandle(href)) {

      var options = this._parseUrl(href);
      this.currentRouter.handle(href, options.transitionOptions);

      // add to history using push state
      if (window.history && addToHistory) {
        window.history.pushState({}, "", options.url);
      }


      navigate = true;
    }

    return navigate;
  }
});

module.exports = layerJS.router = new Router();

},{"../../kern/kern.js":30,"../defaults.js":1,"../domhelpers.js":2,"../layerjs.js":9}],26:[function(require,module,exports){
'use strict';
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');
var identifyPriority = require('./identifypriority.js');
var layerJS = require('./layerjs.js');

/**
 * A View that represents a script DOM element
 * @param {nodeData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var ScriptView = GroupView.extend({
  constructor: function(dataModel, options) {
    GroupView.call(this, dataModel, options);
  },
  /**
   * Will render the scriptView. When layerJS.executeScriptCode == false
   * the src attribute will not be added
   * @param {object} options
   */
  render: function(options) {
    options = options || {};
    this.disableObserver();

    var attr = this.data.attributes,
      diff = (this.isRendererd ? this.data.changedAttributes : this.data.attributes),
      outerEl = this.outerEl;
    if ('id' in diff) {
      outerEl.setAttribute("data-lj-id", attr.id); //-> should be a class?
    }

    if ('type' in diff) {
      outerEl.setAttribute("data-lj-type", attr.type); //-> should be a class?
    }

    if ('elementId' in diff || 'id' in diff) {
      outerEl.id = attr.elementId || "wl-obj-" + attr.id; //-> shouldn't we always set an id? (priority of #id based css declarations)
    }

    // Add htmlAttributes to the DOM element
    if ('htmlAttributes' in diff) {
      for (var htmlAttribute in diff.htmlAttributes) {
        if ((layerJS.executeScriptCode || 'src' !== htmlAttribute) && diff.htmlAttributes.hasOwnProperty(htmlAttribute)) {
          outerEl.setAttribute(htmlAttribute.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), diff.htmlAttributes[htmlAttribute]);
        }
      }
    }

    this.enableObserver();
  },
  /**
   * Syncronise the DOM child nodes with the data IDs in the data's
   * children array. When layerJS.executeScriptCode == false, nothing is done.
   *
   * - Create Views for the data models if they haven't been created yet.
   * - Rearrange the child views to match the order of the child IDs
   * - be respectful with any HTML childnodes which are not connected to a data
   * object (i.e. no data-lj-id property); leaves them where they are.
   */
  _buildChildren: function() {
    if (layerJS.executeScriptCode) {
      GroupView.prototype._buildChildren.call(this);
    }
  }
}, {
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    type: 'script',
    tag: 'script'
  }),
  identify: function(element) {
    return element.nodeType === 1 && element.tagName.toLowerCase() === 'script';
  }
});

pluginManager.registerType('script', ScriptView, identifyPriority.normal);
module.exports = ScriptView;

},{"../kern/Kern.js":29,"./groupview.js":7,"./identifypriority.js":8,"./layerjs.js":9,"./pluginmanager.js":22}],27:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');

/**
 * this is the ScrollTransformer which handles native and transform scrolling for Layers.
 *
 */
var ScrollTransformer = Kern.EventManager.extend({
  /**
   * create a ScrollTransformer which handles native and transform scrolling for Layers.
   *
   * @param {LayerView} layer - the layer this ScrollTransformer belongs to
   * @returns {Type} Description
   */
  constructor: function(layer) {
    Kern.EventManager.call(this);
    var that = this;
    if (!layer) throw "provide a layer";
    this.layer = layer;

    // listen to scroll events
    this.layer.outerEl.addEventListener('scroll', function() {
      if (that.layer.nativeScroll) {
        var tfd = that.layer.currentFrameTransformData;
        tfd.scrollX = that.layer.outerEl.scrollLeft / tfd.scale;
        tfd.scrollY = that.layer.outerEl.scrollTop / tfd.scale;
        that.layer.trigger("scroll");
      }
    });
  },

  /**
   * returns a transform for a specified scroll position
   *
   * @param {Number} scrollX - the scroll in x direction
   * @param {Number} scrollY - the scroll in y direction
   * @returns {string} the transform
   */
  scrollTransform: function(scrollX, scrollY) {
    return "translate3d(" + scrollX + "px," + scrollY + "px,0px)";
  },
  /**
   * calculate current transform based on gesture
   *
   * @param {Gesture} gesture - the input gesture to be interpreted as scroll transform
   * @returns {string} the transform or false to indicate no scrolling
   */
  scrollGestureListener: function(gesture) {
    var tfd = this.layer.currentFrameTransformData;
    if (gesture.first) {
      this.scrollStartX = tfd.scrollX;
      this.scrollStartY = tfd.scrollY;
      return true;
    }
    // primary direction
    var axis = (Math.abs(gesture.shiftX) > Math.abs(gesture.shiftY) ? "x" : "y");
    // check if can't scroll in primary direction
    if (axis === "x" && !tfd.isScrollX) return false;
    if (axis === "y" && !tfd.isScrollY) return false;
    if (this.layer.nativeScroll) {
      if (axis === 'y') {
        if (gesture.shift.y > 0) { // Note: gesture.shift is negative
          return tfd.scrollY > 0; // return true if can scroll; false otherwise
        } else {
          return (this.layer.outerEl.scrollHeight - this.layer.outerEl.clientHeight - 1 > this.layer.outerEl.scrollTop);
        }
      } else if (axis === 'x') {
        if (gesture.shift.x > 0) {
          return tfd.scrollX > 0;
        } else {
          return (this.layer.outerEl.scrollWidth - this.layer.outerEl.clientWidth - 1 > this.layer.outerEl.scrollLeft);
        }
      }
    } else {
      if (axis === 'y') {
        if (gesture.shift.y > 0) { // Note: gesture.shift is negative
          if (tfd.scrollY === 0) return false; // return false if cannot scroll
        } else {
          if (tfd.maxScrollY - tfd.scrollY < 1) return false;
        }
      } else if (axis === 'x') {
        if (gesture.shift.x > 0) {
          if (tfd.scrollX === 0) return false;
        } else {
          if (tfd.maxScrollX - tfd.scrollX < 1) return false;
        }
      }
      tfd.scrollX = this.scrollStartX - gesture.shift.x / tfd.scale;
      tfd.scrollY = this.scrollStartY - gesture.shift.y / tfd.scale;
      if (!tfd.isScrollX) tfd.scrollX = this.scrollStartX;
      if (!tfd.isScrollY) tfd.scrollY = this.scrollStartY;
      if (tfd.scrollX < 0) tfd.scrollX = 0;
      if (tfd.scrollX > tfd.maxScrollX) tfd.scrollX = tfd.maxScrollX;
      if (tfd.scrollY < 0) tfd.scrollY = 0;
      if (tfd.scrollY > tfd.maxScrollY) tfd.scrollY = tfd.maxScrollY;
      return this.scrollTransform(-tfd.scrollX * tfd.scale, -tfd.scrollY * tfd.scale);
    }
  },
  switchNativeScroll: function(nativeScroll) { //jshint ignore:line

  },
  /**
   * Calculate the scroll transform and, in case of native scrolling, set the inner dimensions and scroll position.
   *
   * @param {Object} tfd - the transformdata of the frame for which the scrolling should be calculated / set
   * @param {Number} scrollX - the scroll x position in the frame
   * @param {Number} scrollY - the scroll y position in the frame
   * @param {Boolean} intermediate - true if the scroll transform should be calculated before the transition ends.
                                     here, the (possibly wrong/old native scroll position is taken into account)
   * @returns {Type} Description
   */
  getScrollTransform: function(tfd, scrollX, scrollY, intermediate) {
    // update frameTransformData
    tfd.scrollX = scrollX || tfd.scrollX;
    tfd.scrollY = scrollY || tfd.scrollY;
    // limit scrolling to [0,maxScroll]
    if (tfd.scrollX > tfd.maxScrollX) {
      tfd.scrollX = tfd.maxScrollX;
    }
    if (tfd.scrollY > tfd.maxScrollY) {
      tfd.scrollY = tfd.maxScrollY;
    }
    if (tfd.scrollX < 0) {
      tfd.scrollX = 0;
    }
    if (tfd.scrollY < 0) {
      tfd.scrollY = 0;
    }
    if (this.layer.nativeScroll) {
      if (intermediate) {
        // in nativescroll, the scroll position is not applied via transform, but we need to compensate for a displacement due to the different scrollTop/Left values in the current frame and the target frame. This displacement is set to 0 after correcting the scrollTop/Left in the transitionEnd listener in transitionTo()
        var shiftX = this.layer.outerEl.scrollLeft - (tfd.scrollX * tfd.scale || 0);
        var shiftY = this.layer.outerEl.scrollTop - (tfd.scrollY * tfd.scale || 0);
        return this.scrollTransform(shiftX, shiftY);
      } else {
        // set inner size to set up native scrolling
        // FIXME: we shouldn't set the dimension in that we don't scroll
        if (tfd.isScrollY) {
          this.layer.innerEl.style.height = tfd.height + "px";
        } else {
          this.layer.innerEl.style.height = "100%";
        }
        if (tfd.isScrollX) {
          this.layer.innerEl.style.width = tfd.width + "px";
        } else {
          this.layer.innerEl.style.width = "100%";
        }
        // apply inital scroll position
        this.layer.outerEl.scrollLeft = tfd.scrollX * tfd.scale;
        this.layer.outerEl.scrollTop = tfd.scrollY * tfd.scale;

        return this.scrollTransform(0, 0); // no transforms as scrolling is achieved by native scrolling
      }
    } else {
      // in transformscroll we add a transform representing the scroll position.
      return this.scrollTransform(-tfd.scrollX * tfd.scale, -tfd.scrollY * tfd.scale);
    }
  }
});

module.exports = ScrollTransformer;

},{"../kern/Kern.js":29}],28:[function(require,module,exports){
'use strict';
var pluginManager = require('./pluginmanager.js');
var GroupView = require('./groupview.js');
var Kern = require('../kern/Kern.js');
var identifyPriority = require('./identifypriority.js');

/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends GroupView
 */
var StageView = GroupView.extend({
  constructor: function(dataModel, options) {
    var that = this;
    options = options || {};
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    if (!options.noRender && (options.forceRender || !options.el)) {
      this.render();
    }

    window.addEventListener('resize', function() {
      that.onResize();
    }, false);
  },
  _renderChildPosition: function(childView) {
    if (childView.data.attributes.nodeType === 1) {
      childView.disableObserver();
      childView.outerEl.style.left = "0px";
      childView.outerEl.style.top = "0px";
      childView.enableObserver();
    }
  },
  /**
   * Method will be invoked when a resize event is detected.
   */
  onResize: function() {
    var childViews = this.getChildViews();
    var length = childViews.length;
    for (var i = 0; i < length; i++) {
      var childView = childViews[i];
      childView.onResize();
    }
  }
}, {
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    noScrolling: false,
    type: 'stage'
  }),
  identify: function(element) {
    var type = element.getAttribute('data-lj-type');
    return null !== type && type.toLowerCase() === StageView.defaultProperties.type;
  }
});
pluginManager.registerType('stage', StageView, identifyPriority.normal);
module.exports = StageView;

},{"../kern/Kern.js":29,"./groupview.js":7,"./identifypriority.js":8,"./pluginmanager.js":22}],29:[function(require,module,exports){
'use strict';
//jshint unused:false

// Copyright (c) 2015, Thomas Handorf, ThomasHandorf@gmail.com, all rights reserverd.

(function() { // private scope

  var scope = function() { // a scope which could be given a dependency as parameter (e.g. AMD or node require)
    /**
     * extend an object with properties from one or multiple objects
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var _extend = function(obj) {
      var len = arguments.length;
      if (len < 2) throw ("too few arguments in _extend");
      if (obj === null) throw ("no object provided in _extend");
      // run through extending objects
      for (var i = 1; i < len; i++) {
        var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
        // run through properties of extending object
        for (var j = 0; j < props.length; j++) {
          obj[props[j]] = arguments[i][props[j]];
        }
      }
      return obj;
    };
    /**
     * extend an object with properties from one or multiple object. Keep properties of earlier objects if present.
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var _extendKeep = function(obj) {
      var len = arguments.length;
      if (len < 2) throw ("too few arguments in _extend");
      if (obj === null) throw ("no object provided in _extend");
      // run through extending objects
      for (var i = 1; i < len; i++) {
        var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
        // run through properties of extending object
        for (var j = 0; j < props.length; j++) {
          if (!obj.hasOwnProperty(props[j])) obj[props[j]] = arguments[i][props[j]];
        }
      }
      return obj;
    };
    /**
     * returns a simple deep copy of an object. Only considers plain object and arrays (and of course scalar values)
     *
     * @param {object} obj - The object to be deep cloned
     * @returns {obj} a fresh copy of the object
     */
    var _deepCopy = function(obj) {
      if (typeof obj === 'object') {
        var temp;
        if (Array.isArray(obj)) {
          temp = [];
          for (var i = obj.length - 1; i >= 0; i--) {
            temp[i] = _deepCopy(obj[i]);
          }
          return temp;
        }
        if (obj === null) {
          return null;
        }
        temp = {};
        for (var k in Object.keys(obj)) {
          if (obj.hasOwnProperty(k)) {
            temp[k] = _deepCopy(obj[k]);
          }
        }
        return temp;
      }
      return obj;
    };
    /**
     * extend an object with properties from one or multiple object. Keep properties of earlier objects if present.
     * Will deep copy object and arrays from the exteding objects (needed for copying default values in Model)
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var _extendKeepDeepCopy = function(obj) {
      var len = arguments.length;
      if (len < 2) throw ("too few arguments in _extend");
      if (obj === null) throw ("no object provided in _extend");
      // run through extending objects
      for (var i = 1; i < len; i++) {
        var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
        // run through properties of extending object
        for (var j = 0; j < props.length; j++) {
          if (!obj.hasOwnProperty(props[j])) {
            obj[props[j]] = _deepCopy(arguments[i][props[j]]);
          }
        }
      }
      return obj;
    };
    // the module
    var Kern = {
      _extend: _extend,
      _extendKeep: _extendKeep,
      _extendKeepDeepCopy: _extendKeepDeepCopy
    };
    /**
     * Kern.Base is the Base class providing extend capability
     */
    var Base = Kern.Base = function() {

    };
    // create a contructor with a (function) name
    function createNamedConstructor(name, constructor) {
      // wrapper function created dynamically constructor to allow instances to be identified in the debugger
      var fn = new Function('c', 'return function ' + name + '(){c.apply(this, arguments)}'); //jshint ignore:line
      return fn(constructor);
    }
    // this function can extend classes; it's a class function, not a object method
    Base.extend = function(prototypeProperties, staticProperties) {
      // create child as a constructor function which is
      // either supplied in prototypeProperties.constructor or set up
      // as a generic constructor function calling the parents contructor
      prototypeProperties = prototypeProperties || {};
      staticProperties = staticProperties || {};
      var parent = this; // Note: here "this" is the class (which is the constructor function in JS)
      var child = (prototypeProperties.hasOwnProperty('constructor') ? prototypeProperties.constructor : function() {
        return parent.apply(this, arguments); // Note: here "this" is actually the object (instance)
      });
      // name constructor (for beautiful stacktraces) if name is given
      if (staticProperties && staticProperties.className) {
        child = createNamedConstructor(staticProperties.className, child);
      }
      delete prototypeProperties.constructor; // this should not be set again.
      // create an instance of parent and assign it to childs prototype
      child.prototype = Object.create(parent.prototype); // NOTE: this does not call the parent's constructor (instead of "new parent()")
      child.prototype.constructor = child; //NOTE: this seems to be an oldish artefact; we do it anyways to be sure (http://stackoverflow.com/questions/9343193/why-set-prototypes-constructor-to-its-constructor-function)
      // extend the prototype by further (provided) prototyp properties of the new class
      _extend(child.prototype, prototypeProperties);
      // extend static properties (e.g. the extend static method itself)
      _extend(child, this, staticProperties);
      return child;
    };
    /**
     * a class that can handle events
     */
    var EventManager = Kern.EventManager = Base.extend({
      constructor: function() {
        this.__listeners__ = {};
      },
      /**
       * register event listerner
       * @param {string} event event name
       * @param {Function} callback the callback function
       * @param {Object} options { ignoreSender: this }
       * @return {Object} this object
       */
      on: function(event, callback, options) {
        this.__listeners__[event] = this.__listeners__[event] || [];
        this.__listeners__[event].push({
          callback: callback,
          options: options || {}
        });
        return this;
      },
      /**
       * register event listerner. will be called only once, then unregistered.
       * @param {string} event event name
       * @param {Function} callback the callback function
       * @param {Object} options { ignoreSender: this }
       * @return {Object} this object
       */
      once: function(event, callback, options) {
        var that = this;
        var helper = function() {
          callback.apply(this, arguments);
          that.off(event, helper);
        };
        this.on(event, helper, options);
        return this;
      },
      /**
       * unregister event handler.
       * @param {string} event the event name
       * @param {Function} callback the callback
       * @return {Object} this object
       */
      off: function(event, callback) {
        var i;
        if (event) {
          if (callback) {
            // remove specific call back for given event
            for (i = 0; i < this.__listeners__[event].length; i++) {
              if (this.__listeners__[event][i].callback === callback) {
                this.__listeners__[event].splice(i, 1);
              }
            }
          } else {
            // remove all callbacks for event
            delete this.__listeners__[event];
          }
        } else {
          if (callback) {
            // remove specific callback in all event
            for (var ev in this.__listeners__) {
              if (this.__listeners__.hasOwnProperty(ev)) {
                for (i = 0; i < this.__listeners__[ev].length; i++) {
                  if (this.__listeners__[ev][i].callback === callback) {
                    this.__listeners__[ev].splice(i, 1);
                  }
                }
              }
            }
          } else {
            // remove all callbacks from all events
            this.__listeners__ = {};
          }
        }
        return this;
      },
      /**
       * trigger an event
       * @param {string} event event name
       * @param {...} arguments further arguments
       * @return {object} this object
       */
      trigger: function(event) {
        if (this.__listeners__[event]) {
          for (var i = 0; i < this.__listeners__[event].length; i++) {

            // copy arguments as we need to remove the first argument (event)
            // and arguments is read only
            var length = arguments.length;
            var args = new Array(length - 1);
            for (var j = 0; j < length - 1; j++) {
              args[j] = arguments[j + 1];
            }
            // call the callback
            this.__listeners__[event][i].callback.apply(this, args);
          }
        }
        return this;
      },
      /**
       * trigger an event. This also notes the object or channel that sends the event. This is compared to the ignoreSender option provided during the .on() registration.
       * @param {object} object/channel that fired the event. You can use the object (e.g. this) or just a string that identifies a channel as long as it is consitien with what you have specified as ignoreSender option when registering the listener.
       * @param {string} event event name
       * @param {...} arguments further arguments
       * @return {object} this object
       */
      triggerBy: function(sender, event) {
        if (this.__listeners__[event]) {
          for (var i = 0; i < this.__listeners__[event].length; i++) {

            // check if the sender equals the ignoreSender from the options
            if (this.__listeners__[event][i].options.ignoreSender && this.__listeners__[event][i].options.ignoreSender === sender) {
              continue;
            }

            // copy arguments as we need to remove the first argument (event)
            // and arguments is read only
            var length = arguments.length;
            var args = new Array(length - 2);
            for (var j = 0; j < length - 2; j++) {
              args[j] = arguments[j + 2];
            }
            // call the callback
            this.__listeners__[event][i].callback.apply(this, args);
          }
        }
        return this;
      },
      /**
       * return a functions that calls callback function with "this" set to context and
       * further argements supplied in bind and supplied to the returned function
       *
       * @param {function} callback the function to be called
       * @param {Object} context this context of the function to be called
       * @param {arguments} arguments further arguments supplied to the callback on each call
       * @return {Function} a function that can be called anywhere (eg as an event handler)
       */
      bindContext: function(callback, context) { // WARN: this method seems to introduce an extreme performance hit!
        var length = arguments.length;
        var args = new Array(length - 2);
        for (var j = 0; j < length - 2; j++) {
          args[j] = arguments[j + 2];
        }
        return function() {
          var length = args.length;
          var length2 = arguments.length;
          var args2 = new Array(length + length2);
          var j;
          for (j = 0; j < length; j++) {
            args2[j] = args[j];
          }
          for (j = 0; j < length2; j++) {
            args2[j + length] = arguments[j];
          }
          callback.apply(context, args2);
        };
      }
    });
    /**
     * Kern.Model is a basic model class supporting getters and setters and change events
     */
    var Model = Kern.Model = EventManager.extend({
      /**
       * constructor of the Model
       * @param {Object} attributes prefills attributes (not copied)
       */
      constructor: function(attributes) {
        // call super constructor
        EventManager.call(this);
        this.silent = false; // fire events on every "set"
        this.history = false; // don't track changes
        this.attributes = _extendKeepDeepCopy(attributes || {}, this.defaults || {}); // initialize attributes if given (don't fire change events); Note: this keeps the original attributes object.
      },
      /**
       * changedAttributes will have original values of attributes in event handlers if called
       * @return {Object} this object
       */
      trackChanges: function() {
        this.history = true;
        return this;
      },
      /**
       * stop tracking changes
       * @return {Object} this object
       */
      dontTrackChanges: function() {
        this.history = false;
        return this;
      },
      /**
       * don't send change events until manually triggering with fire()
       * Note: if silence is called nestedly, the same number of "fire"
       * calls have to be made in order to trigger the change events!
       */
      silence: function() {
        this.silent++;
        return this;
      },
      /**
       * When called after a silence(), it makes sure that the changed events
       * are ignored.
       */
      ignore: function() {
        this.silent = 0;
        delete this.changedAttributes;
        delete this.newAttributes;
        delete this.deletedAttributes;
      },
      /**
       * fire change events manually after setting attributes
       * @return {Boolean} true if event was fired (not silenced)
       */
      fire: function() {
        if (this.silent > 0) {
          this.silent--;
        }
        this._fire();
        return !this.silent;
      },
      /**
       * fire change events manually after setting attributes
       * @param {Object} object the fired the event
       * @return {Boolean} true if event was fired (not silenced)
       */
      fireBy: function(sender) {
        if (this.silent > 0) {
          this.silent--;
        }
        this._fire(sender);
        return !this.silent;
      },
      /**
       * internal fire function (also used by set)
       * @param {Object} object the fired the event
       * @return {[type]} [description]
       */
      _fire: function(sender) {
        if (this.silent) {
          return;
        }
        // trigger change event if something has changed
        if (this.firing) {
          throw "Eventmanager: already firing.";
        }
        this.firing = true;
        var that = this;
        if (this.changedAttributes) {
          Object.keys(this.changedAttributes).forEach(function(attr) {
            that.trigger("change:" + attr, that, that.attributes[attr]);
          });
        }

        if (sender) {
          this.triggerBy(sender, "change", this);
        } else {
          this.trigger("change", this);
        }
        delete this.firing;
        delete this.changedAttributes;
        delete this.newAttributes;
        delete this.deletedAttributes;
      },
      /**
       * set a property or several properties and fires change events
       * set(attributes) and set(attribute, value) syntax supported
       * @param {Object} sender
       * @param {Object} attributes {attribute: value}
       */
      setBy: function(sender, attributes) {
        if (attributes !== null) {
          if (typeof attributes !== 'object') { // support set(attribute, value) syntax
            this._set.call(this, arguments[1], arguments[2]);
          } else { // support set({attribute: value}) syntax
            for (var prop in attributes) {
              if (attributes.hasOwnProperty(prop)) {
                this._set(prop, attributes[prop]);
              }
            }
          }

          this._fire(sender);
        }
      },
      /**
       * set a property or several properties and fires change events
       * set(attributes) and set(attribute, value) syntax supported
       * @param {Object} attributes {attribute: value}
       */
      set: function(attributes) {
        if (attributes !== null) {
          if (typeof attributes !== 'object') { // support set(attribute, value) syntax
            this._set.apply(this, arguments);
          } else { // support set({attribute: value}) syntax
            for (var prop in attributes) {
              if (attributes.hasOwnProperty(prop)) {
                this._set(prop, attributes[prop]);
              }
            }
          }

          this._fire();
        }
      },
      /**
       * internal function setting a single attribute; this does not fire events
       * @param {string} attribute attribute name
       * @param {Object} value the value
       */
      _set: function(attribute, value) {
        var str;
        // check whether this is a new attribute
        if (!this.attributes.hasOwnProperty(attribute)) {
          if (!this.changedAttributes) this.changedAttributes = {};
          this.changedAttributes[attribute] = !this.history || undefined;
          if (!this.newAttributes) this.newAttributes = {};
          this.newAttributes[attribute] = true;
          // set the value
          this.attributes[attribute] = value;
          return;
        }
        if (this.checkdiff) {
          str = JSON.stringify(this.attributes[attribute]);
          if (str === JSON.stringify(value)) {
            return;
          }
        }
        if (!this.changedAttributes) this.changedAttributes = {};
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            str = str || JSON.stringify(this.attributes[attribute]);
            this.changedAttributes[attribute] = JSON.parse(str); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        // set the value
        this.attributes[attribute] = value;
      },
      /**
       * modify an attribute without changing the reference. Only makes sense for deep models
       * only works if change event firing is silent (as it cannot fire automatically after
       * you made the change to the object)
       * @param {string} attribute attribute name
       * @return {Object} returns the value that can be modifed if it's an array or object
       */
      update: function(attribute) {
        if (!this.silent) {
          throw ('You cannot use update method without manually firing change events.');
        }
        if (!this.changedAttributes) this.changedAttributes = {};
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            this.changedAttributes[attribute] = JSON.parse(JSON.stringify(this.attributes[attribute])); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        return this.attributes[attribute];
      },
      /**
       * delete the specified attribute
       * @param {string} attribute the attribute to be removed
       */
      unset: function(attribute) {
        if (!this.changedAttributes) this.changedAttributes = {};
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            this.changedAttributes[attribute] = JSON.parse(JSON.stringify(this.attributes[attribute])); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        if (!this.deletedAttributes) this.deletedAttributes = {};
        this.deletedAttributes[attribute] = true;
        delete this.attributes[attribute];
        this._fire();
      },
      /**
       * get the value of an attrbute
       * you can use .attributes.'attribute' instead
       * @param {string} attribute attribute name
       * @return {Object} returns the value
       */
      get: function(attribute) {
        return this.attributes[attribute];
      }
    });
    /**
     * Class for a Repository (hash) of Models
     * not a sorted list, its a key-value store
     * assumes model id's to be the keys
     */
    var ModelRepository = Kern.ModelRepository = EventManager.extend({
      /**
       * create a Model Repository. Models are safed by id that not necessarily needs to be stored
       * in the model, although it maybe difficult to identify the models in event callback later on.
       * @param {Object/Array} data and array of json objects which should be used to create models. Submit undefined if you don't want data initialized but want to set options
       * @param {Object} options {idattr: string determining id property, model: The model class (default=Kern.Model)}
       */
      constructor: function(data, options) {
        EventManager.call(this); // call SUPER constructor
        this.models = {};
        options = options || {};
        this.idattr = options.idattr || this.idattr || 'id';
        this.model = options.model || this.model || Model;
        var that = this;
        this.modelChangeHandler = function() {
          that._modelChangeHandler.apply(that, arguments);
        };
        if (Array.isArray(data)) {
          this.add(data, {
            noEvents: true
          });
        } else if (typeof data === "object") {
          this.add(data, {
            isHash: true,
            noEvents: true
          });
        }
      },
      /**
       * add model(s) to the repository (or add models by json data)
       * @param {Object|Model|Array} data Model or json data or an Array of those describing the model(s)
       * @param {object} options options.id allows to specify the id; options.isHash allows adding object of objects {id1: {}, id2: {}}
       */
      add: function(data, options) {
        var model, i;
        options = options || {};
        if (options.isHash) { // interpret as {id1: {}, id2: {}}
          for (i in data) {
            if (data.hasOwnProperty(i)) {
              this.add(data[i], {
                id: i
              });
            }
          }
        } else if (Array.isArray(data)) { // if array loop over array
          for (i = 0; i < data.length; i++) {
            this.add(data[i]);
          }
        } else {
          var nid;
          if (data instanceof this.model) { // model given
            model = data;
            nid = (options && options.id) || model.attributes[this.idattr]; // id given as param or in model?
            if (!nid) throw ('model with no id "' + this.idattr + '"');
            this._add(model, nid, options.noEvents);
          } else if (typeof data === 'object') { // interpret as (single) json data
            nid = (options && options.id) || data[this.idattr]; // id given as param or in json?
            if (!nid) throw ('model with no id "' + this.idattr + '"');
            model = new this.model(data);
            this._add(model, nid, options.noEvents);
          }
        }
      },
      /**
       * internal function to add model. sets event listeners and triggers events
       * @param {string} id the id of the model
       * @param {Model} model the model
       */
      _add: function(model, id, noEvents) {
        if (this.models.hasOwnProperty(id)) {
          throw ('cannot add model with same id');
        }
        if (model.attributes[this.idattr] && (model.attributes[this.idattr] !== id)) {
          throw ('adding model with wrong id');
        }
        // do not use bindContext, too slow!!!
        // model.on('change', this.callbacks[id] = this.bindContext(this._modelChangeHandler, this));
        model.on('change', this.modelChangeHandler);
        this.models[id] = model;
        if (!noEvents) {
          this.trigger('add', model, this);
        }
      },
      /**
       * removes a model(s) from this Repository
       * @param {String|Model|Array} model in id (string) or Model or an Array of those to be removed
       */
      remove: function(model) {
        if (Array.isArray(model)) { // if array loop over array
          for (var i = 0; i < model.length; i++) {
            this.remove(model[i]);
          }
        } else {
          var oldmodel;
          if (model instanceof this.model) { // model given?
            // remove change handler from model
            oldmodel = this.models[model.attributes[this.idattr]].off("change", this.modelChangeHandler);
            // delete reference to model
            delete this.models[model.attributes[this.idattr]];
          } else { // interpret as id
            // remove change handler from model
            oldmodel = this.models[model].off("change", this.modelChangeHandler);
            // delete reference to model
            delete this.models[model];
          }
          this.trigger("remove", oldmodel, this);
        }
      },
      /**
       * handler listening to changes of the models in the repository
       * @param {Object} model the model being changed
       */
      _modelChangeHandler: function(model) {
        this.trigger("change", model); //FIXME make backbone compatible
      },
      /**
       * return number of objects in repository
       * @return {number} the number of objects
       */
      length: function() {
        return Object.keys(this.models).length;
      },
      /**
       * return the model with the corresponding id
       * @return {Model} the requested model
       */
      get: function(id) {
        if (!this.models[id]) {
          throw "model " + id + " not in repository";
        }
        return this.models[id];
      }
    });
    /**
     * A simple Promise implementation
     *
     */
    var Promise = Kern.Promise = Base.extend({
      constructor: function() {
        this.state = undefined;
        this.value = undefined;
        this.reason = undefined;
      },
      /**
       * register resolve and reject handlers
       *
       * @param {Function} fn - function to be called if Promise is resolved.
       * first parameter is the value of the Promise
       * can return a further promise whice is passes to the returned promise
       * @param {Function} errFn - function called if promise is rejected
       * first parameter is a reason1
       * @returns {Promise} return a further promise which allows chaining of then().then().then() calls
       */
      then: function(fn, errFn) {
        this.nextPromise = new Promise();
        this.fn = fn;
        this.errFn = errFn;
        if (this.state !== undefined) this.execute();
        return this.nextPromise;
      },
      /**
       * resolve the promise
       *
       * @param {Anything} value - value of the promise
       * @returns {void}
       */
      resolve: function(value) {
        this.state = true;
        this.value = value;
        this.execute();
      },
      /**
       * reject the promise
       *
       * @param {Anything} reason - specify the reason of rejection
       * @returns {void}
       */
      reject: function(reason) {
        this.state = false;
        this.reason = reason;
        this.execute();
      },
      /**
       * internal fulfilemnt function. Will pass the promise behaviour of the resolve function to the Promise returned in then()
       *
       * @returns {void}
       */
      execute: function() {
        if (!this.nextPromise) return;
        var that = this;
        if (this.state === true) {
          if (!this.fn) return;
          try {
            var result = this.fn(this.value);
            if (result instanceof Promise) {
              result.then(function(value) {
                that.nextPromise.resolve(value);
              }, function(reason) {
                that.nextPromise.reject(reason);
              });
            } else {
              that.nextPromise.resolve(result);
            }
          } catch (e) {
            this.nextPromise.reject(e);
          }
        } else if (this.state === false) {
          if (this.errFn) this.errFn(this.reason);
          this.nextPromise.reject(this.reason);
        }
      }
    });

    return Kern;
  };

  // export to the outside
  //
  // test whether this is in a requirejs environment
  if (typeof define === "function" && define.amd) {
    define("Kern", [], scope);
  } else if (typeof module !== 'undefined' && module.exports) { // node js environment
    var Kern = scope();
    module.exports = Kern;
    // this.Kern = Kern; export to the global object in nodejs
  } else { // standard browser environment
    window.Kern = scope(); // else just export 'Kern' globally using globally defined underscore (_)
  }
})();

},{}],30:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"dup":29}],31:[function(require,module,exports){
'use strict';
require("./kern/kern.js");
require("./framework/layerjs.js");

/* others*/
require("./framework/pluginmanager.js");
require("./framework/layoutmanager.js");
require("./framework/repository.js");
require("./framework/parsemanager.js");
require("./framework/layouts/layerlayout.js");
require("./framework/layouts/slidelayout.js");
require("./framework/layouts/canvaslayout.js");
require("./framework/gestures/gesturemanager.js");
require("./framework/router/router.js");

/* data objects*/
require("./framework/defaults.js");
require("./framework/identifypriority.js");
require("./framework/nodedata.js");

/* view objects*/
/* The order in which the views are required is imported for the pluginmanager.identify */
require("./framework/nodeview.js");
require("./framework/elementview.js");
require("./framework/scriptview.js");
require("./framework/layerview.js");
require("./framework/frameview.js");
require("./framework/stageview.js");
require("./framework/groupview.js");

var FileRouter = require("./framework/router/filerouter.js");

layerJS.init = function() {
  layerJS.parseManager.parseDocument();
  layerJS.router.setCurrentRouter(new FileRouter());
};

},{"./framework/defaults.js":1,"./framework/elementview.js":3,"./framework/frameview.js":4,"./framework/gestures/gesturemanager.js":6,"./framework/groupview.js":7,"./framework/identifypriority.js":8,"./framework/layerjs.js":9,"./framework/layerview.js":10,"./framework/layoutmanager.js":11,"./framework/layouts/canvaslayout.js":12,"./framework/layouts/layerlayout.js":13,"./framework/layouts/slidelayout.js":14,"./framework/nodedata.js":15,"./framework/nodeview.js":16,"./framework/parsemanager.js":21,"./framework/pluginmanager.js":22,"./framework/repository.js":23,"./framework/router/filerouter.js":24,"./framework/router/router.js":25,"./framework/scriptview.js":26,"./framework/stageview.js":28,"./kern/kern.js":30}]},{},[31]);
