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
