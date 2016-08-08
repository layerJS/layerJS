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
