'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');
var SlideLayout = require('./slidelayout.js');

var GridLayout = SlideLayout.extend({
  /**
   * GridLayouts lets the browser define the layout of the frames. The frames should be position static in a layer 
   * (or helper) which has a dimension greater than 0x0. The layout will use the FLIP technique, i.e it will record 
   * frame positions before any transitions and and after dom modification (showing / hiding elements, moving to layer 
   * in an interstage). Then it will render a transition between the two states for all frames using position relative.
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function (layer) {
    SlideLayout.call(this, layer);
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
      };
    }
  },
  /**
   * called before any frames are added to dom (either by display:block or interstage transiton)
   * @param {*} frame 
   */
  preLoad: function (frame) { /* jshint unused:vars */
    this._recordPositions('prePosition');
  },
  /**
   * called after new frames are loaded into the layer or old frames are removed (or diplay:none). It will automatically trigger 
   * animation for all frames except the frame that is currently transtioned (this will be dealt with by the main transitonTo functions)
   * @param {Frame} frame the frame that will be affected by current transition
   * @param {object} transition the transition object of the current transition
   */
  postLoad: function (frame, transition) { // FIXME, transition is not provided by loadframe on interstage transitions
    // record post positions of all frames, 
    this._recordPositions('postPosition');
    var frames = this.layer.getChildViews();
    // reset pre positons of all frames, as animation will only start later after sync
    frames.forEach(function (f) {
      if (frame === f) return;
      f.applyStyles({
        position: 'relative',
        transition: 'none',
        transform: 'translateX('+(f.prePosition.x - f.postPosition.x)+'px) translateY('+(f.prePosition.y - f.postPosition.y)+'px)',
        width: f.prePosition.width,
        height: f.prePosition.height
      });
    });
    // wait for sync
    transition.semaphore.listen().then(function() { // FIXME, get transition object
      // transition to final positions
      frames.forEach(function (f) {
        if (frame === f) return;
        f.applyStyles({
          transition: transition.duration, 
          transform: 'translateX(0px) translateY(0px)',
          width: f.postPosition.width,
          height: f.postPosition.height
        });
      });  
    });
  },
  /**
 * make sure frame is rendered (i.e. has display: block)
 * Later: make sure frame is loaded and added to document
 *
 * @param {Type} Name - Description
 * @returns {Type} Description
 */
  loadFrame: function (frame) {
    this.preLoad(frame);
    return SlideLayout.prototype.loadFrame.call(this, frame);
  },
  transitionTo: function (frame, transition, targetFrameTransformData, targetTransform) {
    if (frame === null) {
      // take frame that will be hidden out of the layout (via position:absolute);
      this.layer.currentFrame.outerEl.style.position = 'absolute';
    } else if (frame && transition.hide) {
      frame.outerEl.style.position = 'absolute';
    } else {
      // this should make position absolute frames static if they come from an position absolute layout layer.
      if (frame) frame.outerEl.style.position = 'initial'; 
    }
    this.postLoad(frame || this.layer.currentFrame, transition); // this will record the post positions and recreate initial layout using position relative and the prepositions 
    return SlideLayout.prototype.transitionTo.call(this, frame, transition, targetFrameTransformData, targetTransform); // go ahead with the actual transition
  }
});

layoutManager.registerType('grid', GridLayout);

module.exports = GridLayout;
