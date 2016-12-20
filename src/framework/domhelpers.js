'use strict';
var uniqueHash = {};
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
    var wrapper = element.ownerDocument.createElement(options.tag || "div");
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
      if (nodes[i]._ljView) return nodes[i]._ljView;
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
      while (el !== element && !el.matches(selector)) {
        el = el.parentNode;
      }
      if (el !== element) {
        fn.call(el, event);
      }
    });
  },
  /**
   * Will get the value for a data-lj-* or lj-* attribute
   *
   * @param {HTMLElement} element
   * @param {string} name - the attribute name
   * @returns {string}
   */
  getAttributeLJ: function(element, name) {
    return element.getAttribute('data-lj-' + name) || element.getAttribute('lj-' + name);
  },
  /**
   * Check if the element has a data-lj-* or lj-* attribute defined
   *
   * @param {HTMLElement} element
   * @param {string} name - the attribute name
   * @returns {boolean}
   */
  hasAttributeLJ: function(element, name) {
    return element.hasAttribute('data-lj-' + name) || element.hasAttribute('lj-' + name);
  },
  /**
   * Set the data-lj-* or lj-* attribute
   *
   * @param {HTMLElement} element
   * @param {string} name - the attribute name
   * @param {string} value - the attribute value
   */
  setAttributeLJ: function(element, name, value) {
    name = 'lj-' + name;
    if (element.getAttribute('data-' + name)) {
      element.setAttribute('data-' + name, value);
    } else {
      element.setAttribute(name, value);
    }
  },
  /**
   * Will try to find a parent view of a specific type
   *
   * @param {HTMLElement} element
   * @param {string} type - the view type to look
   * @returns {Object} a view
   */
  findParentViewOfType: function(element, type) {
    var parent = element.parentElement;
    var found = false;

    while (parent && !found) {
      if (parent._ljView && parent._ljView.type() === type) {
        found = true;
      } else {
        parent = parent.parentElement;
      }
    }

    return found ? parent._ljView : undefined;
  },
  timeToMS: function(time) {
    var match = time.match(/^([\d\.]*)(s|ms|min|h)$/);
    if (!match) return 0;
    switch (match[2]) {
      case 'ms':
        return match[1];
      case 's':
        return match[1] * 1000;
      case 'min':
        return match[1] * 60 * 1000;
      case 'h':
        return match[1] * 60 * 60 * 1000;
    }
    return 0;
  },
  parseDimension: function(value) {
    var match;
    if (value && typeof value === 'string' && (match = value.match(/(.*)(?:px)?$/))) return parseInt(match[1]);
    if (value && typeof value === 'number') return value;
    return undefined;
  },
  uniqueID: function(prefix) {
    prefix = prefix || -1;
    if (uniqueHash[prefix] === undefined) {
      uniqueHash[prefix] = -1;
    }
    if (prefix !== -1) {
      return prefix + "[" + (++uniqueHash[prefix]) + "]";
    } else {
      return ++uniqueHash[prefix];
    }
  }
};
DomHelpers.detectBrowser();
DomHelpers.calculatePrefixes(['transform', 'transform-origin']);

// enable this function to get timing information into the console logs
// var oldlog = console.log;
// var log0 = Date.now();
// console.log = function() {
//   oldlog.apply(this, [((Date.now() - log0) / 1000).toFixed(2) + "s"].concat(Array.prototype.slice.call(arguments)));
// };
module.exports = DomHelpers;
