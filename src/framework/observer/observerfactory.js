'use strict';
var Kern = require('../../kern/Kern.js');
var MutationsObserver = require('./mutationsobserver.js');
var TimeoutObserver = require('./timeoutobserver.js');
var SizeObserver = require('./sizeobserver.js');

/**
 * A factory class to get an observer
 */
var ObserverFactory = Kern.Base.extend({
  constructor: function() {},
  /**
   * Creates an observer
   *
   * @param {object} element - a dom element
   * @returns {object} options
   */
  getObserver: function(element, options) {
    var elementWindow = element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
    return (elementWindow && elementWindow.MutationObserver) ? new MutationsObserver(element, options) : new TimeoutObserver(element, options);
  },
  /**
   * Creates a  size observer
   *
   * @param {object} element - a dom element
   * @returns {object} options
   */
  getSizeObserver: function(element, options) {
    return new SizeObserver(element, options);
  }
});

module.exports = new ObserverFactory();
