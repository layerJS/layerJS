'use strict';

var Kern = require('../kern/Kern.js');

/**
 *  class that will contain the state off all the stages, layers, frames
 *
 * @extends Kern.Model
 */
var State = Kern.Model.extend({
  constructor: function() {
    this.stages = {};
  },
  getStates: function() {
    var stages = document.querySelectorAll("[data-lj-type='stage']");

    for (var i = 0; i < stages.length; i++) {
      var stageView = stages[i]._ljView;
      var stageState = {
        view: stageView,
        layers: {}
      };
      this.stages[stageView.data.attributes.id] = stageState;

      var layers = stageView.innerEl.querySelectorAll("[data-lj-type='layer']");

      for (var x = 0; x < layers.length; x++) {
        var layerView = layers[x]._ljView;
        var activeFrame = layerView.currentFrame;
        var layerState = {
          view: layerView,
          activeFrame: activeFrame ? activeFrame.data.attributes.name : null
        };
        stageState.layers[layerView.data.attributes.id] = layerState;
        layerState.view.on('transitionFinished', this._transitionFinishedEvent(layerState));
      }
    }
  },
  /**
   * Will return the handler for a transitionFinished event
   *
   * @param {object} representation of the state of a layer
   * @returns {function} function that will be called when transitionFinished event is invoked
   */
  _transitionFinishedEvent: function(layerState) {
    return function(frameName) {
      console.log('ttt');
      layerState.activeFrame = frameName;
    };
  }
});

module.exports = State;
