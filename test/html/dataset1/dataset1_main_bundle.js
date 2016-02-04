(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');
/**
 * An extension of CobjData that adds the children property which is an
 * array of CobjData IDs
 *
 * @extends CobjData
 */
var CgroupData = CobjData.extend({
  defaults: Kern._extend({}, CobjData.prototype.defaults, {
    type: 'group',
    children: [],
    tag: 'div'
  }),
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

module.exports = CgroupData;
},{"../kern/Kern.js":22,"./cobjdata.js":5}],2:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var WL = require('./wl.js');
var pluginManager = require('./pluginmanager.js');
var repository = require('./repository.js');
var CobjView = require('./cobjview.js');
var CGroupData = require('./cgroupdata.js');
/**
 * A View which can have child views
 * @param {CobjGroupData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CGroupView = CobjView.extend({
  /**
   * construct a new view of a CobjGroupData
   *
   * @param {CobjData} dataModel - the data model to be used for the view
   * @param {object} options - passed to the Super constructor
   * @returns {this}
   */
  constructor: function(dataModel, options) {
    var that = this;
    this.childInfo = {};
    // create listener to child changes. need different callbacks for each instance in order to remove listeners separately from child data objects
    this.myChildListenerCallback = function(model) {
      that._renderChildPosition(that.childInfo[model.attributes.id].view);
    }



    CobjView.call(this, dataModel, options);
    this.data.on('change:children', (function() {
      that._buildChildren(); // update DOM when data.children changes
    }).bind(this));
    this._buildChildren(); // build (or fix) DOM
  },
  /**
   * Syncronise the DOM child nodes with the data IDs in the data's
   * children array.
   *
   * - Create Views for the data models if they haven't been created yet.
   * - Rearrange the child views to match the order of the child IDs
   * - be respectful with any HTML childnodes which are not connected to a data
   * object (i.e. no data-wl-id property); leaves them where they are.
   */
  _buildChildren: function() {
    var that = this;
    var empty;
    var childIds = this.data.attributes.children;
    var k = -1; // index in childNodes;
    var nodeId;
    var _k_nextChild = function() { // find next DOM child node that is a wl-element
      k++;
      while (!(empty = !(k < that.el.childNodes.length)) && !(nodeId = that.el.childNodes[k].getAttribute('data-wl-id'))) {
        k++;
      }
    }
    var _k_reset = function(k_orig) { // set k to k_orig and fix "empty" and "nodeId"
      k = k_orig - 1;
      _k_nextChild();
    }
    _bc_outer: for (var i = 0; i < childIds.length; i++) {
        var childId = childIds[i];
        _k_nextChild();
        if (!empty) {
          // check if we already have the corresponding view object of the child;
          // check if we can find it at the current position in DOM or in the remaining DOM children
          var k_saved = k; // save current position in DOM children list
          while (!empty) {
            if (nodeId === childId) { // found a matching DOM element; put it at the right position
              if (k !== k_saved) this.el.insertBefore(this.el.childNodes[k], this.el.childNodes[k_saved]);
              // create view object if it does not exist yet (even if the HTML element exist)
              var vo;
              if (!this.el.childNodes[k_saved]._wlView) {
                vo = pluginManager.createView(repository.get(childId, this.data.attributes.version), {
                  el: this.el.childNodes[k_saved],
                  parent: this
                });
              } else { // or get existing view
                vo = this.el.childNodes[k_saved]._wlView;
              }
              // check if we have registered another view under the same id
              if (this.childInfo[childId] && this.childInfo[childId].view && this.childInfo[childId].view != vo) {
                throw "duplicate child id " + childId + " in group " + this.data.attributes.id + ".";
              }
              // create childinfo which indicates which view we have for each id. This is also used for checking whether we registered a change callback already.
              this.childInfo[childId] = this.childInfo[childId] || {};
              this.childInfo[childId].view = vo;
              vo.data.on('change', this._myChildListenerCallback); // attach child change listener
              // Note: if the HTML was present, we don't render positions
              _k_reset(k_saved);
              continue _bc_outer;
            }
            _k_nextChild();
          }
          _k_reset(k_saved);
        }
        // check if we have already a new view object in childinfo that has to be added, OR create a new View object for the data object child that was not yet existing in the view's children list
        // Note: putting existing view objects into the childinfo before updateing data.children is the way to add new children that already have a view. This is done in this.attachChild()

        var newView = (this.childInfo[childId] && this.childInfo[childId].view) || pluginManager.createView(repository.get(childId, this.data.attributes.version), {
          parent: this
        });
        if (empty) {
          this.el.appendChild(newView.el);
        } else {
          this.el.insertBefore(newView.el, this.el.childNodes[k]);
        }
        //if (this.childInfo[childId]) console.warn("Apparently DOM element for child id " + childId + " of parent " + this.data.attributes.id + " got deleted. ");
        // create childinfo for new view (may already exist with same info)
        this.childInfo[childId] = {
          view: newView
        };
        newView.data.on('change', this._myChildListenerCallback); // attach child change listener
        this._renderChildPosition(newView);
      }
      // we checked/added all object in data.children. Are there more children in DOM left?
      !empty && _k_nextChild();
    while (!empty) { // some objects need to be deleted (only removes dom elements of wl objects)
      var vo = this.el.childNodes[k]._wlView;
      vo.data.off('change', this._myChildListenerCallback); // remove child change listener
      this.el.childNodes[k].remove(); // remove child from dom
      _k_nextChild(); // next wl object
    }
  },
  /**
   * Attach a new view object as a child. This updates the this.data.children property, so don't do that manually.
   * This method is the only way to attach an existing view to the parent. If a child is added solely in the dataobject,
   * a new view object is generated via the plugin manager.
   *
   * @param {CobjView} newView - the view object to be attached as child
   * @returns {Type} Description
   */
  attachView: function(newView) {
    this.childinfo[newView.data.attributes.id] = newView; // prepare info about new view
    newView.setParent(this);
    this.data.children.addChild(newView.data.attributes.id); // this will eventually trigger _buildChildren which sets up everything for this group
  },
  /**
   * remove a view from this group. updates dataobject of this group which will trigger change event which
   * will call _buildChildren
   *
   * @param {CobjView} view - the view object to be removed
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
   * cobjview's render method. It's important to do this here so that derived classes can overwrite it
   * and position objects differently
   * Note: this currently implements setting the positional style information directly on the object.
   * This is most likely the best for speed. For rendering on the server, this infor has to go into a
   * separate css style
   *
   * @param {Cobjview} childView - the view to be positioned.
   * @returns {Type} Description
   */
  _renderChildPosition: function(childView) {
    var attr = childView.data.attributes,
      diff = childView.data.changedAttributes || childView.data.attributes,
      el = childView.el;

    var css = {};
    'x' in diff && attr.x !== undefined && (css.left = attr.x);
    'y' in diff && attr.y !== undefined && (css.top = attr.y);
    ('x' in diff || 'y' in diff) && (css.position = (attr.x !== undefined || attr.y !== undefined ? "absolute" : "static"));
    ('scaleX' in diff || 'scaleY' in diff || 'rotation' in diff) && (css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : ""));
    'zIndex' in diff && attr.zIndex !== undefined && (css.zIndex = attr.zIndex);
    'hidden' in diff && (css.display = attr.hidden ? 'none' : '');
    'width' in diff && attr.width !== undefined && (css.width = attr.width);
    'height' in diff && attr.height !== undefined && (css.height = attr.height);

    Kern._extend(el.style, css);
  },
  /**
   * render the group. Uses cobjview.render to display changes to the object.
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  render: function(options) {
    CobjView.prototype.render.call(this, options);
    this._buildChildren();
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

}, {
  Model: CGroupData
});
pluginManager.registerType("group", CGroupView);
module.exports = CGroupView;

},{"../kern/Kern.js":22,"./cgroupdata.js":1,"./cobjview.js":6,"./pluginmanager.js":17,"./repository.js":18,"./wl.js":21}],3:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');
/**
 * #CimageData
 * This data type will contain all the information to render a image
 * @type {Model}
 */
var CimageData = CobjData.extend({
  defaults: Kern._extend({}, CobjData.prototype.defaults, {
    type: 'image',
    tag: 'img'
  })
});

module.exports = CimageData;

},{"../kern/Kern.js":22,"./cobjdata.js":5}],4:[function(require,module,exports){
'use strict';
var CobjView = require('./cobjview.js');
var CimageData = require('./cimagedata.js');
var pluginManager = require('./pluginmanager.js');
var WL = require('./wl.js');

/**
 * A View which can render images
 * @param {CimageData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CimageView = CobjView.extend({
  render : function(options){
      var attr = this.data.attributes,
          diff = this.data.changedAttributes || this.data.attributes,
          el = this.el;

     CobjView.prototype.render.call(this,options);

     if ('src' in diff) {
       el.setAttribute("src", WL.imagePath + attr.src);
     }

     if ('alt' in diff) {
       el.setAttribute("alt", attr.alt);
     }
  }

},{
  Model: CimageData
});

pluginManager.registerType('image', CimageView);
module.exports = CimageView;

},{"./cimagedata.js":3,"./cobjview.js":6,"./pluginmanager.js":17,"./wl.js":21}],5:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var defaults = require('./defaults.js');
/**
 * #CobjData
 * This is the base data Model for all Webpgr objects.
 * @type {Model}
 */
var CobjData = Kern.Model.extend({
  // these are the default attributes, these attributes will be synced with the server
  // plugins should extend these attributes when they need to store values on the server
  // all attributes that are not in here linke `this.ontop` are internal attributes that
  // will not be stored on the server
  defaults: {
    // subclasses must overwrite this or FAIL
    type: 'node',
    tag: defaults.tag,
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
    hidden: undefined,
    // bins are important for the compositor, they tell in which area the
    // object is located, this is used for faster lookups of elements
    version: defaults.version
  },
  //---
  // the tag should be overwritten by plugins if neccessary, eg. image plugin will set img here
  // nogesture: false,
  // selectable: true,
  // allowClick: true,
  // ui: false,
  // ontop: false,
  // choose a layer that is below all other objects
  // onbottom: false,
  // dontSetSize: false,
});

module.exports = CobjData;

},{"../kern/Kern.js":22,"./defaults.js":9}],6:[function(require,module,exports){
'use strict';
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
    options = options || {};
    // dataobject must exist
    if (!dataModel) throw "data object mus exist when creating a view";
    this.data = dataModel;
    // parent if defined
    this.parent = options.parent;
    // DOM element
    this.el = options.el || document.createElement(this.data.attributes.tag);
    // backlink from DOM to object
    if (this.el._wlView) throw "trying to initialialize view on element that already has a view";
    this.el._wlView = this;
    // possible wrapper element
    this.elWrapper = options.elWrapper || this.el;
    this.elWrapper._wlView = this;
    this.renderLink();

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
    (options.forceRender || !options.el) && this.render();
  },
  /**
   * add a new parent view
   *
   * @param {CobjView} parent - the parent of this view
   * @returns {Type} Description
   */
  setParent: function(parent) {
    this.parent = parent;
  },
  /**
   * return the parent view of this view
   *
   * @returns {CobjView} parent
   */
  getParent: function(){
    return this.parent;
  },
  /**
   * ##render
   * This method applies all the object attributes to its DOM element `this.$el`.
   * It only updates attributes that have changes (`this.data.changedAttributes`)
   * @return {void}
   */
  render: function(options) {
    options = options || {};
    var attr = this.data.attributes,
      diff = this.data.changedAttributes || this.data.attributes,
      el = this.el;

    if ('id' in diff) {
      el.setAttribute("data-wl-id", attr.id); //-> should be a class?
    }

    if ('elementId' in diff) {
      el.id = attr.elementId || attr.id; //-> shouldn't we always set an id? (priority of #id based css declarations)
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
    'x' in diff && attr.x !== undefined && (css.left = attr.x + 'px');
    'y' in diff && attr.y !== undefined && (css.top = attr.y + 'px');
    ('x' in diff || 'y' in diff) && (css.position = (attr.x !== undefined || attr.y !== undefined ? "absolute" : "static"));
    ('scaleX' in diff || 'scaleY' in diff || 'rotation' in diff) && (css.transform = "scale(" + attr.scaleX + "," + attr.scaleY + ")" + (attr.rotation ? " rotate(" + Math.round(attr.rotation) + "deg)" : ""));
    'zIndex' in diff && attr.zIndex !== undefined && (css.zIndex = attr.zIndex);
    'hidden' in diff && (css.display = attr.hidden ? 'none' : '');
    'width' in diff && attr.width !== undefined && (css.width = attr.width + 'px');
    'height' in diff && attr.height !== undefined && (css.height = attr.height + 'px');

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
   * returns the width of the object. Note, this is the actual width which may be different then in the data object
   *
   * @returns {number} width
   */
  width: function() {
    return this.elWrapper.style.width; // WARN: Refactor: what to do if element is not yet rendered?
  },
  /**
   * returns the height of the object. Note, this is the actual height which may be different then in the data object
   *
   * @returns {number} height
   */
  height: function() {
    return this.elWrapper.style.height; // WARN: Refactor: what to do if element is not yet rendered?
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
}, {
  // save model class as static variable
  Model: CobjData
});
pluginManager.registerType('node', CobjView);

module.exports = CobjView;

},{"../kern/Kern.js":22,"./cobjdata.js":5,"./pluginmanager.js":17}],7:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');
/**
 * #CtextData
 * This data type will contain all the information to render some text
 * @type {Model}
 */
var CtextData = CobjData.extend({
  defaults: Kern._extend({}, CobjData.prototype.defaults, {
    type: 'text',
    tag: 'div'
  })
});

module.exports = CtextData;

},{"../kern/Kern.js":22,"./cobjdata.js":5}],8:[function(require,module,exports){
'use strict';
var CobjView = require('./cobjview.js');
var CtextData = require('./ctextdata.js');
var pluginManager = require('./pluginmanager.js');

/**
 * A View which can render images
 * @param {CtextData} dataModel
 * @param {object}        options
 * @extends CobjView
 */
var CtextView = CobjView.extend({
  render : function(options){
      var attr = this.data.attributes,
          diff = this.data.changedAttributes || this.data.attributes,
          el = this.el;

     CobjView.prototype.render.call(this,options);

     if ('content' in diff) {
       el.innerHTML = attr.content;
     }
  }

},{
  Model: CtextData
});

pluginManager.registerType('text', CtextView);
module.exports = CtextView;

},{"./cobjview.js":6,"./ctextdata.js":7,"./pluginmanager.js":17}],9:[function(require,module,exports){
module.exports = {
  version: 'default',
  tag: 'div'
}

},{}],10:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var CgroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var FrameData = CgroupData.extend({
  defaults: Kern._extend({}, CgroupData.prototype.defaults, {
    nativeScroll: true,
    fitTo: 'width',
    startPosition: 'top',
    type: 'frame'
  })
});

module.exports = FrameData;
},{"../kern/Kern.js":22,"./cgroupdata.js":1}],11:[function(require,module,exports){
'use strict';
var pluginManager = require('./pluginmanager.js')
var FrameData = require('./framedata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {FrameData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var FrameView = CGroupView.extend({
}, {
  Model: FrameData
});

pluginManager.registerType('frame', FrameView);
module.exports = FrameView;

},{"./cgroupview.js":2,"./framedata.js":10,"./pluginmanager.js":17}],12:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var CGroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var LayerData = CGroupData.extend({
  defaults: Kern._extend({}, CGroupData.prototype.defaults, {
    type: 'layer',
    layoutType: 'plain'
  })
});

module.exports = LayerData;

},{"../kern/Kern.js":22,"./cgroupdata.js":1}],13:[function(require,module,exports){
'use strict';
var pluginManager = require('./pluginmanager.js');
var layoutManager = require('./layoutmanager.js');
var LayerData = require('./layerdata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */

var LayerView = CGroupView.extend({
  constructor: function(dataModel, options) {
    this.frames = {};
    debugger;
    this.layout = new (layoutManager.get(dataModel.attributes.layoutType))(this);
    CGroupView.call(this, dataModel, options);
    this.stage = this.parent;
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {string} framename - (optional) frame name to transition to
   * @param {Object} transition - (optional) transition object
   * @returns {Type} Description
   */
  transformTo: function(framename, transition) {
    // is framename is omitted?
    if (typeof framename === 'object') {
      transition = framename;
      framename = transition.frame;
    };
    transition = transition || {};
    framename = framename || transition.framename;
    if (!framename) throw "transformTo: no frame given";
    var frame = this.frames[framename];
    if (!frame) throw "transformTo: " + framename + " does not exist in layer";

  }
}, {
  Model: LayerData
});

pluginManager.registerType('layer', LayerView);

module.exports = LayerView;

},{"./cgroupview.js":2,"./layerdata.js":12,"./layoutmanager.js":14,"./pluginmanager.js":17}],14:[function(require,module,exports){
var WL = require('./wl.js');
var Kern = require('../kern/Kern.js');
//var CobjView = require('./CobjView.js');

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
    this.map = map || {}; // maps cobjdata types to View constructors
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
WL.layoutManager = new LayoutManager();
// this module does not return the class but a singleton instance, the layoutManager for the project.
module.exports = WL.layoutManager;

},{"../kern/Kern.js":22,"./wl.js":21}],15:[function(require,module,exports){
var WL = require('../wl.js');
var Kern = require('../../kern/Kern.js');

/**
 * this is the base class for all LayerLayouts
 *
 * @param {LayerView} layer - the layer which is layed out by the layouter
 * @returns {Type} Description
 */
var LayerLayout = Kern.EventManager.extend({
  /**
   * initalize LayerLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    if (!layer) throw "provide a layer";
    this.layer = layer;
  },
  /**
   * get the width of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the width
   */
  getStageWidth: function() {
    return this.layer.stage.getWidth();
  },
  /**
   * get the height of associated stage. Use this method in sub classes to be compatible with changing interfaces in layer/stage
   *
   * @returns {number} the height
   */
  getStageHeight: function() {
    return this.layer.stage.getHeight();
  },
  /**
   * return current frame of associated layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  getCurrentFrame: function() {
    return this.layer.currentFrame;
  },
  /**
   * return staget associated with associated layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  getStage: function(){
    return this.layer.stage;
  }
});

module.exports = LayerLayout;

},{"../../kern/Kern.js":22,"../wl.js":21}],16:[function(require,module,exports){
var WL = require('../wl.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var PlainLayout = LayerLayout.extend({
  /**
   * initial layout of all visible frames when this layout engine becomes active
   *
   * @returns {Type} Description
   */
  init: function() {

  },
  /**
   * transition to a specified frame with given transition
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - the transition object
   * @returns {Type} Description
   */
  transitionTo: function(frame, transition) {
    var cframe = this.getCurrentFrame();
  },
  /**
   * calculate pre and post transforms for current and target frame
   * needed for swipes
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - the transition object
   * @returns {Type} Description
   */
  prepareTransition: function(frame, transition) {

  }
});

layoutManager.registerType('plain', PlainLayout);

module.exports = PlainLayout;

},{"../layoutmanager.js":14,"../wl.js":21,"./layerlayout.js":15}],17:[function(require,module,exports){
var WL = require('./wl.js');
var Kern = require('../kern/Kern.js');
//var CobjView = require('./CobjView.js');

var PluginManager = Kern.EventManager.extend({
  /**
   * create a PluginManager
   * the PluginManager is used to create View objects from cobjdata objects.
   * It contains a list of constructors for the corresponding data types.
   * It can be dynamically extended by further data types.
   *
   * @param {Object} map - an object mapping cobj types to {view:constructor, model: contructor} data sets
   * @returns {This}
   */
  constructor: function(map) {
    this.map = map || {}; // maps cobjdata types to View constructors
  },
  /**
   * create a view based on the type in the cobj's model
   *
   * @param {cobjdata} model - the model from which the view should be created
   * @param {Object} [options] - create options
   * @param {HTMLElement} options.el - the element of the view
   * @returns {CobjView} the view object of type CobjView or a sub class
   */
  createView: function(model, options) {
    // return existing view if the provided element already has one
    if (options && options.el && options.el._wlView && options.el._wlView instanceof CobjView) {
      return options.el._wlView;
    }
    if (model.attributes.type && this.map.hasOwnProperty(model.attributes.type)) {
      return new(this.map[model.attributes.type].view)(model, options);
    }
    throw "no constructor found for cobjects of type '" + model.attributes.type + "'";
  },
  /**
   * create a data model based on a json object (and it's type property)
   *
   * @param {Object} data - JSON data of data model
   * @param {Object} options - options passed to the model constructor
   * @returns {CobjData} the new data model
   */
  createModel: function(data, options) {
    if (data.type && this.map.hasOwnProperty(data.type)) {
      return new(this.map[data.type].model)(data, options);
    }
    throw "no constructor found for cobjects of type '" + data.type + "'";
  },
  /**
   * register a view class for a cobject type
   *
   * @param {string} type - the name of the type
   * @param {function} constructor - the constructor of the view class of this type
   * @returns {This}
   */
  registerType: function(type, constructor) {
    this.map[type] = {
      view: constructor,
      model: constructor.Model
    };
  },
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
WL.pluginManager = new PluginManager({});
// this module does not return the class but a singleton instance, the pluginmanager for the project.
module.exports = WL.pluginManager;

},{"../kern/Kern.js":22,"./wl.js":21}],18:[function(require,module,exports){
var WL = require('./wl.js');
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
    if (data) this.importJSON(data, version);
  },
  /**
   * import model repository from JSON Array (or map with {id: model} entries)
   *
   * @param {object} data - JSON data
   * @param {string} version - version to be used
   * @returns {Type} Description
   */
  importJSON(data, version) {
    if (!data) throw "no ModelRepository or data given";
    if (!version) throw "no version to create given";
    if (this.versions.hasOwnProperty(version)) throw "version already present in repository"
    var models = [];
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        models.push(pluginManager.createModel(data[i]));
      }
    } else if (typeof data == 'string') {
      for (var k in Object.keys(data)) {
        var obj = data[k];
        if (obj.attributes.id && obj.attributes.id != k) throw "id mismatch in JSON data"
        obj.attributes.id = k;
        models.push(pluginManager.createModel(data[i]));

      }
    }
    this.versions[version] = new Kern.ModelRepository(data);
  },
  /**
   * clear the repository either for a specified version or for all versions
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  clear: function(version) {
    if (version !== undefined) {
      this.versions[version] = new Kern.ModelRepository(data);
    } else {
      this.versions = {};
    }
  },
  /**
   * return a model of a give id from a specified version
   *
   * @param {string} id - the id of the model
   * @param {string} version - the version of the requested model
   * @returns {CobjData} the model
   */
  get: function(id, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    return this.versions[version].get(id);
  },

});
// initialialize repository
WL.repository = new Repository();
module.exports = WL.repository;

},{"../kern/Kern.js":22,"./defaults.js":9,"./pluginmanager.js":17,"./wl.js":21}],19:[function(require,module,exports){
'use strict';
var Kern = require('../kern/Kern.js');
var CgroupData = require('./cgroupdata.js');

/**
 * @extends CobjGroupData
 */
var StageData = CgroupData.extend({
  defaults: Kern._extend({}, CgroupData.prototype.defaults, {
    type: 'stage'
  })
});

module.exports = StageData;
},{"../kern/Kern.js":22,"./cgroupdata.js":1}],20:[function(require,module,exports){
'use strict';
var pluginManager = require('./pluginmanager.js');
var StageData = require('./stagedata.js');
var CGroupView = require('./cgroupview.js');

/**
 * A View which can have child views
 * @param {StageData} dataModel
 * @param {object}        options
 * @extends CGroupView
 */
var StageView = CGroupView.extend({

}, {
  Model: StageData
});
pluginManager.registerType('stage', StageView);
module.exports = StageView;

},{"./cgroupview.js":2,"./pluginmanager.js":17,"./stagedata.js":19}],21:[function(require,module,exports){
// this module defines a global namespace for all weblayer objects.
module.exports = WL = {
    imagePath: "/"
};

},{}],22:[function(require,module,exports){
'use strict';

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
      if (obj == null) throw ("no object provided in _extend");
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
      if (obj == null) throw ("no object provided in _extend");
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
      if (typeof obj == 'object') {
        if (Array.isArray(obj)) {
          var temp = [];
          for (var i = obj.length - 1; i >= 0; i--) {
            temp[i] = _deepCopy(obj[i]);
          }
          return temp;
        }
        if (obj === null) {
          return null;
        }
        var temp = {};
        for (var k in Object.keys(obj)) {
          temp[k] = _deepCopy(obj[k]);
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
      if (obj == null) throw ("no object provided in _extend");
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
        delete prototypeProperties.constructor; // this should not be set again.
        // create an instance of parent and assign it to childs prototype
        child.prototype = Object.create(parent.prototype); // NOTE: this does not call the parent's constructor (instead of "new parent()")
        child.prototype.constructor = child; //NOTE: this seems to be an oldish artefact; we do it anyways to be sure (http://stackoverflow.com/questions/9343193/why-set-prototypes-constructor-to-its-constructor-function)
        // extend the prototype by further (provided) prototyp properties of the new class
        _extend(child.prototype, prototypeProperties);
        // extend static properties (e.g. the extend static method itself)
        _extend(child, this, staticProperties);
        return child;
      }
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
       * @return {Object} this object
       */
      on: function(event, callback) {
        this.__listeners__[event] = this.__listeners__[event] || [];
        this.__listeners__[event].push({
          callback: callback
        });
        return this;
      },
      /**
       * register event listerner. will be called only once, then unregistered.
       * @param {string} event event name
       * @param {Function} callback the callback function
       * @return {Object} this object
       */
      once: function(event, callback) {
        var that = this;
        var helper = function() {
          callback.apply(this, arguments);
          that.off(event, helper);
        }
        this.on(event, helper);
        return this;
      },
      /**
       * unregister event handler.
       * @param {string} event the event name
       * @param {Function} callback the callback
       * @return {Object} this object
       */
      off: function(event, callback) {
        if (event) {
          if (callback) {
            // remove specific call back for given event
            for (var i = 0; i < this.__listeners__[event].length; i++) {
              if (this.__listeners__[event][i].callback == callback) {
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
              for (var i = 0; i < this.__listeners__[ev].length; i++) {
                if (this.__listeners__[ev][i].callback == callback) {
                  this.__listeners__[ev].splice(i, 1);
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
          for (var j = 0; j < length; j++) {
            args2[j] = args[j];
          }
          for (var j = 0; j < length2; j++) {
            args2[j + length] = arguments[j];
          }
          callback.apply(context, args2)
        }
      }
    });
    /**
     * Kern.Model is a basic model class supporting getters and setters and change events
     */
    var Model = Kern.Model = EventManager.extend({
      /**
       * constructor of the Model
       * @param {Object} attributes prefills attributes (not copied)
       * @return {Object} this object
       */
      constructor: function(attributes) {
        // call super constructor
        EventManager.call(this);
        this.silent = false; // fire events on every "set"
        this.history = false; // don't track changes
        this.attributes = _extendKeepDeepCopy(attributes || {}, this.defaults || {}); // initialize attributes if given (don't fire change events); Note: this keeps the original attributes object.
        return this;
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
       * internal fire function (also used by set)
       * @return {[type]} [description]
       */
      _fire: function() {
        if (this.silent) {
          return;
        }
        // trigger change event if something has changed
        var that = this;
        if (this.changedAttributes) {
          Object.keys(this.changedAttributes).forEach(function(attr) {
            that.trigger("change:" + attr, that, that.attributes[attr]);
          });
        }
        this.trigger("change", this);
        delete this.changedAttributes;
        delete this.newAttributes;
        delete this.deletedAttributes;
      },
      /**
       * set a property or several properties and fires change events
       * set(attributes) and set(attribute, value) syntax supported
       * @param {Object} attributes {attribute: value}
       */
      set: function(attributes) {
        if (attributes == null) {
          return this;
        }
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
        return this;
      },
      /**
       * internal function setting a single attribute
       * @param {string} attribute attribute name
       * @param {Object} value the value
       */
      _set: function(attribute, value) {
        var str;
        // check whether this is a new attribute
        if (!this.attributes.hasOwnProperty(attribute)) {
          if (!this.changedAttributes) this.changedAttributes = {};
          this.changedAttributes[attribute] = undefined;
          if (!this.newAttributes) this.newAttributes = {};
          this.newAttributes[attribute] = true;
          // set the value
          this.attributes[attribute] = value;
          return;
        }
        if (this.checkdiff) {
          str = JSON.stringify(this.attributes[attribute]);
          if (str == JSON.stringify(value)) {
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
          throw ('You cannot use update method without manually firing change events.')
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
       * @return {Object} this object
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
        return this;
      },
      /**
       * get the value of an attrbute
       * you can use .attributes.'attribute' instead
       * @param {string} attribute attribute name
       * @return {Object} returns the value
       */
      get: function(attribute) {
        return this.attributes[attribute]
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
        }
        if (Array.isArray(data)) {
          this.add(data, {
            noEvents: true
          });
        } else if (typeof data == "object") {
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
        var model;
        options = options || {};
        if (options.isHash) { // interpret as {id1: {}, id2: {}}
          for (var i in data) {
            this.add(data[i], {
              id: i
            });
          }
        } else if (Array.isArray(data)) { // if array loop over array
          for (var i = 0; i < data.length; i++) {
            this.add(data[i]);
          };
        } else {
          if (data instanceof this.model) { // model given
            model = data;
            var nid = (options && options.id) || model.attributes[this.idattr]; // id given as param or in model?
            if (!nid) throw ('model with no id "' + this.idattr + '"');
            this._add(model, nid, options.noEvents);
          } else if (typeof data == 'object') { // interpret as (single) json data
            var nid = (options && options.id) || data[this.idattr]; // id given as param or in json?
            if (!nid) throw ('model with no id "' + this.idattr + '"');
            var model = new this.model(data);
            this._add(model, nid, options.noEvents);
          } else { // interpret as id

          }
        }
        return this;
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
        if (model.attributes[this.idattr] && (model.attributes[this.idattr] != id)) {
          throw ('adding model with wrong id');
        }
        // do not use bindContext, too slow!!!
        // model.on('change', this.callbacks[id] = this.bindContext(this._modelChangeHandler, this));
        model.on('change', this.modelChangeHandler);
        this.models[id] = model;
        noEvents || this.trigger('add', model, this);
        return this;
      },
      /**
       * removes a model(s) from this Repository
       * @param {String|Model|Array} model in id (string) or Model or an Array of those to be removed
       * @return {Object} this object
       */
      remove: function(model) {
        if (Array.isArray(model)) { // if array loop over array
          for (var i = 0; i < model.length; i++) {
            this.remove(model[i]);
          };
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
        return this;
      },
      /**
       * handler listening to changes of the models in the repository
       * @param {Object} model the model being changed
       */
      _modelChangeHandler: function(model) {
        this.trigger("change", model) //FIXME make backbone compatible
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
          throw "model not in repository";
        }
        return this.models[id];
      }
    });
    return Kern;
  }

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

},{}],23:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"dup":22}],24:[function(require,module,exports){
var dataset =[{"id":1,"type":"stage","tag":"div","children":[3,5]},{"type":"frame","name":"home","mediatype":"landscape","x":0,"y":0,"width":1280,"height":768,"style":"","classes":"viewframe view_landscape","layer":15,"rotation":0,"disallow":{},"id":110523,"children":[],"scaleX":1,"scaleY":1},{"type":"image","src":"negativespace-151-690x460.2x.jpg","alt":"","crop":false,"clip":"","x":-2.9999999999995453,"y":-620.1576416528359,"width":1297,"height":865,"style":"","classes":"","layer":24,"rotation":0,"disallow":{},"id":110527,"scaleX":1,"scaleY":1},{"type":"frame","name":"menuclosed","mediatype":"landscape","x":-1857,"y":64,"width":1280,"height":500,"style":"","classes":" view_landscape viewframe","layer":34,"rotation":0,"disallow":{},"id":110528,"children":[110530,110534,110537,110533,110532,110531],"scaleX":1,"scaleY":1},{"type":"frame","name":"menuopen","mediatype":"landscape","x":-1857,"y":-242.00000000000034,"width":1280,"height":500,"style":"","classes":" view_landscape viewframe","layer":34,"rotation":0,"disallow":{},"id":110529,"children":[],"scaleX":1,"scaleY":1},{"type":"text","width":1280,"height":396,"x":0,"y":-306,"style":"background-color: rgba(240,240,240,0.8);","classes":"","layer":25,"rotation":360,"disallow":{},"id":110530,"scaleX":1,"scaleY":1,"content":""},{"type":"text","width":93,"height":35,"x":314,"y":27.837404871295576,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110531,"content":"Gallery","scaleX":1,"scaleY":1},{"type":"text","width":66,"height":35,"x":565,"y":27.837404871295576,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110532,"content":"Blog","scaleX":1,"scaleY":1},{"type":"text","width":85,"height":35,"x":71,"y":27.837404871295576,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110533,"content":"Home","scaleX":1,"scaleY":1},{"type":"text","width":64,"height":35,"x":789,"y":27.837404871295462,"style":"","classes":" wp-menu","layer":26,"rotation":360,"link_to":"http://spiegel.de","link_target":"_self","disallow":{},"id":110534,"content":"Cart","scaleX":1,"scaleY":1},{"type":"text","width":41,"height":35,"x":1190,"y":26.837404871295462,"style":"","classes":" wp-menu","layer":26,"rotation":360,"link_to":"?f=menuopen","link_target":"_self","disallow":{},"id":110537,"content":"☰","scaleX":1,"scaleY":1},{"type":"frame","name":"blog","mediatype":"landscape","x":0,"y":1164.0249501120225,"width":1280,"height":768,"style":"","classes":" view_landscape viewframe viewframe","layer":37,"rotation":0,"disallow":{},"id":110538,"children":[110559,110558],"scaleX":1,"scaleY":1},{"type":"frame","name":"gallery","mediatype":"landscape","x":-4.547473508864641e-13,"y":619.1576416528359,"width":1280,"height":768,"style":"","classes":" view_landscape viewframe","layer":37,"rotation":0,"disallow":{},"id":110539,"children":[110540,110527],"scaleX":1,"scaleY":1},{"type":"stage","width":640,"height":300,"x":320.0000000000009,"y":244.84235834716412,"style":"border: 1px solid gray;","classes":"","layer":28,"rotation":360,"disallow":{},"id":110540,"children":[4],"scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-5.jpeg","alt":"","crop":false,"clip":"","x":640,"y":0,"width":640,"height":480,"style":"","classes":"","layer":29,"rotation":0,"disallow":{},"id":110541,"scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-4.jpeg","alt":"","crop":false,"clip":"","x":0,"y":0,"width":640,"height":386,"style":"","classes":"","layer":30,"rotation":0,"disallow":{},"id":110542,"scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-3.jpeg","alt":"","crop":false,"clip":"","x":640,"y":0,"width":640,"height":513,"style":"","classes":"","layer":31,"rotation":0,"disallow":{},"id":110543,"scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-2.jpeg","alt":"","crop":false,"clip":"","x":640,"y":0,"width":640,"height":427,"style":"","classes":"","layer":32,"rotation":0,"disallow":{},"id":110544,"scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-1.jpeg","alt":"","crop":false,"clip":"","x":640,"y":0,"width":640,"height":323,"style":"","classes":"","layer":34,"rotation":0,"disallow":{},"id":110546,"scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-0.jpeg","alt":"","crop":false,"clip":"","x":-640,"y":0,"width":640,"height":427,"style":"","classes":"","layer":35,"rotation":0,"disallow":{},"id":110547,"scaleX":1,"scaleY":1},{"type":"frame","name":"image1","mediatype":"landscape","x":2878,"y":172,"width":640,"height":300,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110548,"children":[110547,110556,110542,110541],"scaleX":1,"scaleY":1},{"type":"frame","name":"image2","mediatype":"landscape","x":3518,"y":172,"width":640,"height":300,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110549,"children":[110557,110543],"scaleX":1,"scaleY":1},{"type":"frame","name":"image3","mediatype":"landscape","x":4158,"y":172,"width":640,"height":300,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110550,"children":[110544],"scaleX":1,"scaleY":1},{"type":"frame","name":"image4","mediatype":"landscape","x":4798,"y":172,"width":640,"height":300,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110551,"children":[110546],"scaleX":1,"scaleY":1},{"type":"text","width":41,"height":35,"x":-516.5562219786023,"y":101.76681042981738,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110552,"content":"⇦","scaleX":1,"scaleY":1},{"type":"text","width":41,"height":35,"x":-431.89929567652985,"y":128.50057663047187,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110553,"content":"⇧","scaleX":1,"scaleY":1},{"type":"text","width":43,"height":36,"x":-352,"y":143,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110554,"content":"⇨","scaleX":1,"scaleY":1},{"type":"text","width":41,"height":35,"x":-330.5337654990483,"y":226.52438603287146,"style":"","classes":" wp-menu","layer":26,"rotation":360,"disallow":{},"id":110555,"content":"⇩","scaleX":1,"scaleY":1},{"type":"text","width":51,"height":47,"x":589,"y":253,"style":"","classes":" wp-arrow","layer":31,"rotation":360,"link_to":"?f=image2","link_target":"_self","disallow":{},"id":110556,"content":"⇨","scaleX":1,"scaleY":1},{"type":"text","width":51,"height":47,"x":589,"y":253,"style":"","classes":" wp-arrow","layer":31,"rotation":360,"link_to":"?f=image3","link_target":"_self","disallow":{},"id":110557,"content":"⇨","scaleX":1,"scaleY":1},{"type":"text","text":"","width":1280,"height":797,"x":0,"y":-0.02495011202245223,"style":"background-color: rgba(240,240,240,0.8);","classes":"","layer":25,"rotation":360,"disallow":{},"id":110558,"scaleX":1,"scaleY":1},{"type":"stage","width":1280,"height":768,"x":-1.1368683772161603e-13,"y":0,"style":"border: 1px solid gray;","classes":"","layer":28,"rotation":360,"disallow":{},"id":110559,"children":[6],"scaleX":1,"scaleY":1},{"type":"frame","name":"post1","mediatype":"landscape","x":2000,"y":1164,"width":1280,"height":768,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110560,"children":[110566,110563,110568,110567],"scaleX":1,"scaleY":1},{"type":"frame","name":"post2","mediatype":"landscape","x":3280,"y":1164.0249501120227,"width":1280,"height":768,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110561,"children":[110574,110573,110572,110571,110569],"scaleX":1,"scaleY":1},{"type":"frame","name":"post3","mediatype":"landscape","x":4560,"y":1164.0249501120227,"width":1280,"height":768,"style":"","classes":" view_landscape viewframe viewframe","layer":45,"rotation":0,"disallow":{},"id":110562,"children":[],"scaleX":1,"scaleY":1},{"type":"text","width":400,"height":555,"x":162,"y":333.5723680579704,"style":"","classes":" wp-paragraph","layer":36,"rotation":360,"disallow":{},"id":110563,"content":"<div>Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. &nbsp;&nbsp;</div>","scaleX":1,"scaleY":1},{"type":"text","text":"","width":1,"height":504,"x":641,"y":215,"style":"","classes":" wp-leftcolumn","layer":37,"rotation":360,"disallow":{},"id":110566,"scaleX":1,"scaleY":1},{"type":"text","width":400,"height":555,"x":755,"y":215,"style":"","classes":" wp-paragraph","layer":36,"rotation":360,"disallow":{},"id":110567,"content":"<div>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. &nbsp;&nbsp;</div>","scaleX":1,"scaleY":1},{"type":"text","width":270,"height":58,"x":162,"y":213,"style":"","classes":" wp-blogtitle","layer":36,"rotation":360,"disallow":{},"id":110568,"content":"Blog lorem","scaleX":1,"scaleY":1},{"type":"text","width":270,"height":58,"x":143,"y":214.97504988797732,"style":"","classes":" wp-blogtitle","layer":36,"rotation":360,"disallow":{},"id":110569,"content":"Blog ipsum","scaleX":1,"scaleY":1},{"type":"text","width":400,"height":555,"x":735.8884813164859,"y":214.97504988797732,"style":"","classes":" wp-paragraph","layer":36,"rotation":360,"disallow":{},"id":110571,"content":"<div>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. &nbsp;&nbsp;</div>","scaleX":1,"scaleY":1},{"type":"image","src":"photo-1441716844725-09cedc13a4e7-0.jpeg","alt":"","crop":false,"clip":"","x":143,"y":300.9750498879773,"width":400,"height":267,"style":"","classes":"","layer":35,"rotation":0,"disallow":{},"id":110572,"scaleX":1,"scaleY":1},{"type":"text","width":400,"height":101,"x":143,"y":602.9750498879773,"style":"","classes":" wp-paragraph","layer":36,"rotation":360,"disallow":{},"id":110573,"content":"<div>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.&nbsp;</div>","scaleX":1,"scaleY":1},{"type":"text","text":"","width":3,"height":504,"x":638.5,"y":214.97504988797732,"style":"","classes":" wp-leftcolumn","layer":37,"rotation":360,"disallow":{},"id":110574,"scaleX":1,"scaleY":1},{"id":3,"name":"layer3","children":[110538,110539,110523],"type":"layer","tag":"div"},{"id":4,"name":"layer31","children":[110548,110549,110550,110551],"type":"layer","tag":"div"},{"id":5,"name":"layer1","children":[110529,110528],"type":"layer","tag":"div"},{"id":6,"name":"layer32","children":[110560,110561,110562],"type":"layer","tag":"div"}];module.exports = dataset;
},{}],25:[function(require,module,exports){

require("../../../src/kern/kern.js");
var WL = require("../../../src/framework/wl.js");
var defaults = require("../../../src/framework/defaults.js");

/* others*/
var pluginmanager = require("../../../src/framework/pluginmanager.js");
require("../../../src/framework/layoutmanager.js");
require("../../../src/framework/repository.js");
require("../../../src/framework/layouts/layerlayout.js");
require("../../../src/framework/layouts/plainlayout.js");

/* data objects*/
require("../../../src/framework/defaults.js");
require("../../../src/framework/cobjdata.js");
require("../../../src/framework/cimagedata.js");
require("../../../src/framework/cgroupdata.js");
require("../../../src/framework/framedata.js");
require("../../../src/framework/layerdata.js");
require("../../../src/framework/stagedata.js");

/* view objects*/
require("../../../src/framework/cobjview.js");
require("../../../src/framework/cimageview.js");
require("../../../src/framework/ctextview.js");
require("../../../src/framework/cgroupview.js");
require("../../../src/framework/layerview.js");
require("../../../src/framework/frameview.js");
require("../../../src/framework/stageview.js");

var dataset = require('../../datasets/dataset1.js'); 
WL.imagePath = "../../img/img_dataset1/";
WL.repository.importJSON(dataset, defaults.version);

var stageData = WL.repository.get("1", defaults.version);
var stageView = pluginmanager.createView(stageData);

document.body.appendChild(stageView.el);
},{"../../../src/framework/cgroupdata.js":1,"../../../src/framework/cgroupview.js":2,"../../../src/framework/cimagedata.js":3,"../../../src/framework/cimageview.js":4,"../../../src/framework/cobjdata.js":5,"../../../src/framework/cobjview.js":6,"../../../src/framework/ctextview.js":8,"../../../src/framework/defaults.js":9,"../../../src/framework/framedata.js":10,"../../../src/framework/frameview.js":11,"../../../src/framework/layerdata.js":12,"../../../src/framework/layerview.js":13,"../../../src/framework/layoutmanager.js":14,"../../../src/framework/layouts/layerlayout.js":15,"../../../src/framework/layouts/plainlayout.js":16,"../../../src/framework/pluginmanager.js":17,"../../../src/framework/repository.js":18,"../../../src/framework/stagedata.js":19,"../../../src/framework/stageview.js":20,"../../../src/framework/wl.js":21,"../../../src/kern/kern.js":23,"../../datasets/dataset1.js":24}]},{},[25]);
