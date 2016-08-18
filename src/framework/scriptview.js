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
