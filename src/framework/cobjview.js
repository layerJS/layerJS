'use strict';
var Kern = require('../kern/Kern.js');
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
    options = options ||  {};
    // dataobject must exist
    this.data = dataModel || new CobjData();
    // DOM element
    this.el = options.el || document.createElement(this.data.attributes.tag);
    // possible wrapper element
    this.elWrapper = options.elWrapper || this.el;
    this.renderLink();
    // backlink from DOM to object
    if (this.el._wlView) throw "trying to initialialize view on element that already has a view";
    this.el._wlView = this.elWrapper._wlView = this;

    var that = this;
    // The change event must change the properties of the HTMLElement el.
    this.data.on('change', function() {
      //that._renderPosition();
      that.render();
    });
    this.data.on('change:link_to', function() {
      that.renderLink();
    });
    this.data.on('change:link_target', function() {
      that.renderLink();
    });
    // render the element the first time. Don't render if HTML Element already existed.
    (options.forceRender || !options.el) && this.render();
  },
  /**
   * ##render
   * This method applies all the object attributes to its DOM element `this.$el`.
   * It only updates attributes that have changes (`this.data.changedAttributes`)
   * @return {void}
   */
  render: function(options) {
    options = options ||  {};
    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.el;

    if ('id' in diff) {
      el.setAttribute("data-wl-id", attr.id); //-> should be a class?
    }

    if ('elementId' in diff) {
      el.id = attr.elementId ||  attr.id; //-> shouldn't we always set an id? (priority of #id based css declarations)
    }

    // add classes to object
    if ('classes' in diff) {
      var classes = 'object-default object-' + this.data.get('type');
      // this.ui && (classes += ' object-ui');
      // this.ontop && (classes += ' object-ontop');
      attr.classes && (classes += ' ' + attr.classes);
      this.el.className = classes;
    }

    // create object css style
    // these styles are stored in the head of the page index.html
    // in a style tag with the id object_css
    // FIXME: we should use $('#object_css').sheet to acces the style sheet and then iterate through the cssrules. The view can keep a reference to its cssrule
    // FIXME: should we support media queries here. if so how does that work with versions? alternative?

    var selector = (attr.elementId && "#" + attr.elementId) ||  "#wl-obj-" + attr.id;
    var oldSelector = (diff.elementId && "#" + diff.elementId) ||  (diff.id && "#wl-obj-" + diff.id) || selector;

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
  },

  /**
   * Position the view's element using it's data's positional attributes.
   */
  renderPosition: function(options) {
    options = options || {};

    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.el;

    var css = {};
    'x' in diff && attr.x !== undefined && (css.left = attr.x);
    'y' in diff && attr.y !== undefined && (css.top = attr.y);
    ('x' in diff ||  'y' in diff) && (css.position = (attr.x !== undefined ||  attr.y !== undefined ? "absolute" : "static"));
    ('scaleX' in diff || 'scaleY' in  diff || 'rotation' in  diff) && (css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : ""));
    'zIndex' in diff && attr.zIndex !== undefined && (css.zIndex = attr.zIndex);
    'hidden' in diff && (css.display = attr.hidden ? 'none' : '');
    'width' in diff && attr.width !== undefined && (css.width = attr.width);
    'height' in diff && attr.height !== undefined && (css.height = attr.height);

    Kern._extend(el.style, css);
  },

  /**
   * ##_renderLink
   * Render hyperlinks seperate from the rest of the `_render` function.
   * Why? The `_render` function is triggered on the `change` event while
   * most `plugin` render function are triggered on `change:attr` which is
   * triggered before the `change` event, and on long computation time this
   * might cause a delay between rendering of the link and the object which
   * the link wraps, which causes confusion. Therefor this function is triggered
   * on `change:link_to`!
   */
  renderLink: function() {
    // Deal with hyperlinks.
    // there was a heisenbug in Safari that sometimes deleted the wraping link while being detached.
    // this might have been due to garbage collection as the wrapping link was not referenced anymore
    // we try to keep a reference to that element here (this.elWrapper)

    var attr = this.data.attributes;

    if (attr.link_to) {
      var anchor;

      if (this.elWrapper.tagName === 'A') {
        anchor = this.elWrapper;
      }
      // not yet wrapped ?
      else {
        var parentElement = this.el.parentNode;

        anchor = document.createElement('A');

        anchor.appendChild(this.elWrapper);
        this.elWrapper = anchor;

        if (parentElement) {
          parentElement.appendChild(anchor);
        }
      }

      anchor.href = attr.link_to;

      // set link target
      anchor.target = attr.link_target ? attr.link_target : '_self';
      // console.log("attaching link to object "+this.id);
    } else if (this.elWrapper.tagName === 'A') { // wrapped -> unwrap
      this.elWrapper.parentNode.appendChild(this.el);
      delete this.elWrapper;
      this.elWrapper = this.el;
      // console.log("unattaching link from object "+this.id);
    }
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
  }
});


module.exports = CobjView;
