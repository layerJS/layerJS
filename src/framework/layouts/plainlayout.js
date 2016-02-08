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
    this.prepareTransition(frame,transition.type, currentTransformData, targetTransformData).then(function(){
      
    })
  },
  /**
   * calculate pre and post transforms for current and target frame
   * needed for swipes
   * make sure targetFrame is at pre position
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - the transition object
   * @returns {Promise} will fire when pre  transform to target frame is applied
   */
  prepareTransition: function(frame, type, currentTransformData, targetTransformData) {
    // call the transition type function
    // var t = this.txransitions[type](type, currentTransformData, targetTransformData);
    // var currentFrameCenterX = stageWidth / 2 + currentTransformData.shiftX + currentTransformData.scrollX;
    // var currentFrameCenterY = stageHeight / 2 + currentTransformData.shiftY + currentTransformData.scrollY;
    // var currentFrameCenterX = stageWidth / 2 + currentTransformData.shiftX + currentTransformData.scrollX;
    // var currentFrameCenterY = stageHeight / 2 + currentTransformData.shiftY + currentTransformData.scrollY;
    // target frame transform time 0
    var x = currentTransformData.width - currentTransformData.shiftX - currentTransformData.scrollX;
    var y = -targetTransformData.shiftY - targetTransformData.scrollY;
    var tt0 = {
      transform: "translate3d(" + x + "," + y + ") scale(" + targetTransformData.scale + ")"
    };
    // current frame transform time 1
    var x = -targetTransformData.width + currentTransformData.shiftX + currentTransformData.scrollX;
    var y = -currentTransformData.shiftY - currentTransformData.scrollY;
    var ct1 = {
      transform: "translate3d(" + x + "," + y + ") scale(" + currentTransformData.scale + ")"
    };
    // create a promise that will wait for the transform being applied
    var finished = new Kern.Promise();
    // apply pre position to target frame
    Kern._extend(frame.elWrapper.style, tt0);
    setTimeout(function() {
      finished.resolve();
    }, 1);
    return finished;
  },
  applyTransformData(transform, rasterX, rasterY) {
    this.layer.getCurrentCenter()
  },
  swipeTransition: function(type) {

    var t = [{}, {}];
    switch (type) {
      case 'left':
        t = [{
          current: {
            left: 0,
            right: 0
          },
          target: {
            left: 1,
            right: 0
          }
        }, {
          current: {
            left: -1,
            right: 0
          },
          target: {
            left: 0,
            right: 0
          }
        }];
        break;
    }
    return t;
  }
});

layoutManager.registerType('plain', PlainLayout);

module.exports = PlainLayout;
