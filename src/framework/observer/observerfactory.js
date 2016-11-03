'use strict';
var Kern = require('../../kern/kern.js');
var MutationsObserver = require('./mutationsobserver.js');
var TimeoutObserver = require('./timeoutobserver.js');

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
  }
});

module.exports = new ObserverFactory();
