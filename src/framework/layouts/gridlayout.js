'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');
var SlideLayout = require('./slidelayout.js');

var GridLayout = SlideLayout.extend({
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    return;
  }
});

layoutManager.registerType('grid', GridLayout);

module.exports = GridLayout;
