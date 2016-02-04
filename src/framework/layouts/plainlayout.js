var WL = require('../wl.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

var PlainLayout = LayerLayout.extend({
  /**
   * initalize PlainLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    this.transitions = {
      left: this.swipeTransition,
      right: this.swipeTransition,
      top: this.swipeTransition,
      bottom: this.swipeTransition
    }
  },
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

  },
  swipeTransition: function(type, currentTransformData, targetTransformData) {
    var t = [{
      currentFrame: {},
      targetFrame: {}
    }, {
      currentFrame: {},
      targetFrame: {}
    }];
    switch (type) {
      case 'left':
        t[0].currentFrame = {};
        t[1].currentFrame = {};
        t[0].targetFrame = {};
        t[1].targetFrame = {};
        break;
    }
    return t;
  }
});

layoutManager.registerType('plain', PlainLayout);

module.exports = PlainLayout;
