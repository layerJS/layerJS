'use strict';
var layerJS = require('./layerjs.js');
var pluginManager = require('./pluginmanager.js');
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');

var ParseManager = function() {
  /**
   * Parses a document for layerJs object
   * @param {HTMLDocument} doc - an optional root document
   *
   * @returns {void}
   */
  this.parseDocument = function(doc) {
    doc = doc || document;
    this._parse(doc, doc);
  };

  /**
   * Parses an existing node for LayerJS objects
   * @param {HTMLElement} Element
   * @param {object} Optional options
   * @returns {void}
   */
  this.parseElement = function(element, options) {
    if (element.nodeType === 1) {
      this._parse(element, element.ownerDocument, options);
    }
  };

  /**
   * Parses an Node for layerJs object
   * @param {HTMLNode} root - Nodes who's children needs to be parsed
   * @param {HTMLDocument} doc - an optional root document
   * @param {oobject} options - optional options
   *
   * @returns {void}
   */
  this._parse = function(root, doc, options) {
    var stageElements = root.querySelectorAll("[data-lj-type='stage'],[lj-type='stage']");
    var length = stageElements.length;
    options = options || {};

    for (var index = 0; index < length; index++) {
      pluginManager.createView($.getAttributeLJ(stageElements[index], 'type'), Kern._extend(options, {
        el: stageElements[index],
        document: doc
      }));
    }
  };
};


layerJS.parseManager = new ParseManager();
module.exports = layerJS.parseManager;
