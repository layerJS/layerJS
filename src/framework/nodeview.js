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
