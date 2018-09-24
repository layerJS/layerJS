'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');
var SlideLayout = require('./slidelayout.js');

var GridLayout = SlideLayout.extend({
  preLoad: function(frame){
    // record pre positions of all frames
  },
  postLoad: function(frame){
    // removed transform
    // record post positions of all frames, 
    // reset pre positons of all frames, as animation will only start later after sync
    // for new interstage frames restore transforms
  },
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    return;
  }
});

layoutManager.registerType('grid', GridLayout);

module.exports = GridLayout;
