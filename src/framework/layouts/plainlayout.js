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
