'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');
var SlideLayout = require('./slidelayout.js');

var GridLayout = SlideLayout.extend({
  /**
   * initalize GridLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    SildeLayout.call(this, layer);
  },
  _recordPositions(key) {
    // record pre positions of all frames
    var container_bb = this.layer.outerEl.getBoundingClientRect();
    var frames = this.layer.getChildViews();
    for (var f = 0; f < frames.length; f++) {
      var frame = frames[f];
      var bb = frame.outerEl.getBoundingClientRect();
      var cs = window.getComputedStyle(frame.outerEl);
      frame[key] = {
        width: cs.width,
        height: cs.height,
        x: bb.left - container_bb.left,
        y: bb.top - container_bb.top,
      }
    }
  },
  preLoad: function(frame) {
    _recordPositions('prePosition');
  },
  postLoad: function(frame) {
    if (frame) frame.outerEl.style.position='initial'; // this should make position absolute frames static if they come from an position absolute layout layer.
    _recordPositions('postPosition');
    // removed transform
    // record post positions of all frames, 
    // reset pre positons of all frames, as animation will only start later after sync
    // for new interstage frames restore transforms
  },
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    var frames = this.layer.getChildViews();
    frames.forEach(function(frame){
      frame.applyStyles({
        position: 'relative',
        transition: 'none',
        left: frame.prePosition.x-frame.postPosition.x,
        top: frame.prePosition.y-frame.postPosition.y,
        width: frame.prePosition.width,
        height: frame.prePosition.height
      });
    })
    // wait for semaphore as there may be more transitions that need to be setup
    transition.semaphore.sync().then(function() {
      
    });

    return;
  }
});

layoutManager.registerType('grid', GridLayout);

module.exports = GridLayout;
