'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');

// partials
// define data for pre position / css of new frame (for in transition ) or post position / css of old frame
// ['adjacent',x,y,scale,rotation,css,org_css]
// x,y: position relative to stage (x=-1 left, x=+1 right, y=-1 top, y=+1 bottom), can be scaled (values <>1) and combined
// scale, rotation: only for the pre target frame or post current frame
// css: additional css parameters (e.g. opacity, clip) for the pre target frame or post current frame
// org_css: additional css parameters (e.g. opacity, clip) for the post target frame or pre current frame
var partials = {
  none: ["adjacent", 0, 0, 1, 0],
  left: ["adjacent", -1, 0, 1, 0],
  right: ["adjacent", 1, 0, 1, 0],
  bottom: ["adjacent", 0, 1, 1, 0],
  top: ["adjacent", 0, -1, 1, 0],
  fade: ["adjacent", 0, 0, 1, 0, {
    opacity: 0
  }],
  blur: ["adjacent", 0, 0, 1, 0, {
    filter: 'blur(5px)',
    opacity: 0
  }, {
    filter: 'blur(0px)'
  }],
  zoomout: ["adjacent", 0, 0, 0.666, 0, {
    opacity: 0
  }],
  zoomin: ["adjacent", 0, 0, 1.5, 0, {
    opacity: 0
  }],

};
// transitions
// the first element is the partial for the targetframe (tin) and the second is the partial for the current frame (tout)
// the third element defines the z direction: 1 - target frame is above current frame, -1 targetframe is below
var transitions = {
  default: [partials.right, partials.left, 1],
  none: [partials.none, partials.none, 1],
  left: [partials.right, partials.left, 1],
  right: [partials.left, partials.right, 1],
  up: [partials.bottom, partials.top, 1],
  down: [partials.top, partials.bottom, 1],
  fade: [partials.fade, partials.fade, -1],
  blur: [partials.blur, partials.blur, -1],
  slideOverLeft: [partials.right, partials.none, 1],
  slideOverRight: [partials.left, partials.none, 1],
  slideOverUp: [partials.bottom, partials.none, 1],
  slideOverDown: [partials.top, partials.none, 1],
  slideOverLeftFade: [partials.right, partials.fade, 1],
  slideOverRightFade: [partials.left, partials.fade, 1],
  slideOverUpFade: [partials.bottom, partials.fade, 1],
  slideOverDownFade: [partials.top, partials.fade, 1],
  zoomout: [partials.zoomin, partials.zoomout, 1],
  zoomin: [partials.zoomout, partials.zoomin, -1]
};

var SlideLayout = LayerLayout.extend({
  /**
   * initalize SlideLayout with a layer
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  constructor: function(layer) {
    LayerLayout.call(this, layer);
    this._preparedTransitions = {};
  },
  /**
   * Hides all other frames
   *
   * @param {FrameView} currentFrame - the current active frame
   * @param {FrameView} frame - the frame to activate
   * @returns {void}
   */
  hideOtherFrames: function(currentFrame, frame) {
    var frames = this.layer.getChildViews();

    for (var i = 0; i < frames.length; i++) {

      if (frames[i] !== frame && frames[i] !== currentFrame) {
        frames[i].applyStyles({
          display: 'none'
        });
      }
    }
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {FrameView} frame - frame to transition to
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform representing the scrolling after transition
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transition before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    var that = this;
    var currentFrame = that.layer.currentFrame;
    return this.prepareTransition(frame, transition, targetFrameTransformData, targetTransform).then(function(t) {
      var finished = new Kern.Promise();

      var transitionEnd = function() {

        if (currentFrame && transition.applyCurrentPostPosition !== false  ) {
          currentFrame.applyStyles(t.fix_css, {
            transition: 'none',
            display: 'none',
            'z-index': 'initial'
          });
          $.debug('slidelayout: fix c');
        }

        if (frame ) {
          frame.applyStyles(t.fix_css, {
            transition: 'none',
            'z-index': 'initial'
          });
          $.debug('slidelayout: fix t');
        }


        finished.resolve(); // do we need to wait here until it is rendered?
        // wait until above styles are applied;
        // $.postAnimationFrame(function() {
        //   finished.resolve();
        // });
      };

      var frameToTransition = frame || currentFrame; // is there at least on frame to transition?
      if (frameToTransition && transition.duration !== '') {
        frameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
          e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
          transitionEnd();
        });
      }
      // wait for semaphore as there may be more transitions that need to be setup
      transition.semaphore.sync().then(function() {
        var otherCss = {
          transition: transition.duration,
          top: "0px",
          left: "0px",
          opacity: "1"
        };

        otherCss.width = targetFrameTransformData.applyWidth ? targetFrameTransformData.frameWidth + "px" : '';
        otherCss.height = targetFrameTransformData.applyHeight ? targetFrameTransformData.frameHeight + "px" : '';

        if (!transition.noActivation) {
          that._applyTransform(frame, that._currentFrameTransform = t.t1, targetTransform, otherCss);
          $.debug('slidelayout: apply t1');
        } else {
          that._applyTransform(frame, {
            opacity: 0,
            transition: transition.duration,
          }, {}, {});
        }
        if (transition.applyCurrentPostPosition !== false) {
          that._applyTransform(currentFrame, t.c1, targetTransform, {
            transition: transition.duration,
            top: "0px",
            left: "0px"
          });
          $.debug('slidelayout: apply c1');
        }

        if (transition.duration === '' || !frameToTransition ) { // execute transitionend immediately if not transition is going on
          transitionEnd();
        }

        that._preparedTransitions = {};
      });
      return finished;
    });
  },
  /**
   * calculate pre and post transforms for current and target frame
   * needed for swipes
   * make sure targetFrame is at pre position
   *
   * @param {ViewFrame} frame - the target frame
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform represenptg the scrolling after transition
   * @returns {Promise} will fire when pre transform to target frame is applied
   */
  prepareTransition: function(frame, transition, targetFrameTransformData, targetTransform) {
    // create a promise that will wait for the transform being applied
    var finished = new Kern.Promise();
    var prep;
    var currentFrame = this.layer.currentFrame;
    if (!transition.wasInTransition) this.hideOtherFrames(frame, currentFrame);
    if (frame && (prep = this._preparedTransitions[frame.id()])) {
      if (prep.transform === targetTransform && prep.applied) { // if also the targetTransform is already applied we can just conptue
        finished.resolve(prep);
      } else {
        prep = undefined;
      }
    }
    if (!prep) {
      var transitionfn = transitions[transition.type]; // transition function or record
      if (!transitionfn && transition.type && transition.type.match(/\:/)) {
        transitionfn = transition.type.split(':');
      } else if (!transitionfn) {
        transitionfn = [partials.none, partials.none, 1];
      }
      // call the transition type function to calculate all frame positions/transforms
      if (typeof transitionfn === 'function') { // custom transition function
        prep = transitionfn(transition.type, this.layer.currentFrameTransformData, targetFrameTransformData); // WARNING: this.layer.currentFrameTransformData should still be the old one here. careful: this.layer.currentFrameTransformData will be set by LayerView before transition ends!
      } else if (Array.isArray(transitionfn)) { // array of in and out partials
        var shuffled;
        // bringing in and out transitions into right order
        if (transition.reverse) {
          shuffled = [transitionfn[1], transitionfn[0], this.layer.currentFrameTransformData, targetFrameTransformData, (transitionfn[2] && -transitionfn[2]) || 0];
        } else {
          shuffled = [transitionfn[0], transitionfn[1], this.layer.currentFrameTransformData, targetFrameTransformData, transitionfn[2]];
          // WARNING: this.layer.currentFrameTransformData should still be the old one here. careful: this.layer.currentFrameTransformData will be set by LayerView before transition ends!
        }
        // when using default transitions, it may be different for the currentFrame and the targetFrame. So add here the transition for the currentFrame as out transition
        if (transition.previousType) {
          var ptransitionfn = transitions[transition.previousType]; // transition function or record for default transition of currentFrameTransformData
          if (Array.isArray(ptransitionfn)) { // only works if that is an array as well
            shuffled[1] = transition.previousReverse ? ptransitionfn[1] : ptransitionfn[0];
          }
        }
        prep = this.genericTransition.apply(this, shuffled);
      } else {
        throw "slidelayout: error in registered transition type.";
      }
      prep.transform = targetTransform; // FIXME: targetTransform is not enough, need to check current transform as well
      if (transition.applyTargetPrePosition === false && transition.applyCurrentPrePosition === false) { // shortcut if we don't hve to apply pre positions
        finished.resolve(prep);
        return finished;
      }
      if (frame === null && !prep.current_css) { // nothing to do as new frame is "none"
        prep.applied = true;
        finished.resolve(prep);
        return finished;
      }
      var otherCss = {
        transition: 'none',
        visibility: 'inital'
      };
      // apply frame dimensions. this should be the dimensions of the pre position, but in slide layout the pre position should have same frame dimensions as post position. (in all cases where this is not true [sizechanged, interstage, ?] applyTargetPrePosition would be false)
      if (targetFrameTransformData.applyWidth) otherCss.width = targetFrameTransformData.frameWidth + "px";
      if (targetFrameTransformData.applyHeight) otherCss.height = targetFrameTransformData.frameHeight + "px";
      if (transition.applyTargetPrePosition !== false) {
        // apply pre position to target frame
        this._applyTransform(frame, prep.t0, this.layer.currentTransform, otherCss);
        $.debug('slidelayout: apply t0');
      }
      // apply pre position to current frame
      if (currentFrame && prep.current_css && transition.applyCurrentPrePosition !== false) {
        this._applyTransform(currentFrame, prep.c0, this.layer.currentTransform, {
          transition: 'none',
          'z-index': 'initial'
        });
        $.debug('slidelayout: apply c0');
      }
      // wait until new positions are rendered then resolve promise
      $.postAnimationFrame(function() {
        prep.applied = true;
        finished.resolve(prep);
      });
    }

    return finished;
  },
  /**
   * apply new scrolling transform to layer
   *
   * @param {string} transform - the scrolling transform
   * @param {Object} cssTransiton - css object containing the transition info (currently only single time -> transition: 2s)
   */
  setLayerTransform: function(transform, cssTransition) {
    cssTransition = cssTransition || {};
    var p = new Kern.Promise();
    if (cssTransition.transition) { // FIXME is this sufficient? should we rather pipe duration here, but what about other transtion properties like easing
      this.layer.currentFrame.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
        e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
        p.resolve();
      });
    } else {
      p.resolve();
    }
    this._applyTransform(this.layer.currentFrame, this._currentFrameTransform, transform, cssTransition);
    return p;
  },
  /**
   * apply transform by combining the frames base transform with the added scroll transform
   *
   * @param {FrameView} frame - the frame that should be transformed
   * @param {Object} baseTransform - a plain object containing the styles for the frame transform
   * @param {String} addedTransform - a string to be added to the "transform" style which represents the scroll transform
   * @param {Object} styles - additional styles for example for transition timing.
   * @returns {void}
   */
  _applyTransform: function(frame, frameTransform, addedTransform, styles) {
    if (frame) {
      var css = Kern._extend({}, frameTransform);
      css.transform = addedTransform + " " + (css.transform || "");
      frame.applyStyles({
        left: '0px', // force top, left to be 0 in slide layout
        top: '0px'
      }, styles || {}, css);
    }
  },
  /**
   * calculate the transform for a give frame using its transformData record
   *
   * @param {Object} frameTransformData - the transform data of the frame
   * @returns {object} the calculated transform
   */
  _calcFrameTransform: function(frameTransformData) {
    var x = -frameTransformData.shiftX;
    var y = -frameTransformData.shiftY;
    return {
      transform: "translate3d(" + x + "px," + y + "px,0px) scale(" + frameTransformData.scale + ")",
      opacity: 1
    };
  },
  /**
   * calculates pre and post position record based on data for the "in" partial transition (how target
   * frame comes in) and data for the "out" partial transition (how current frame goes out)
   *
   * @param {Array} tin - transition data for the "in" transition
   * @param {Array} tout - transition data for the "out" transition
   * @param {Object} ctfd - currentFrameTransformData - transform data of current frame
   * @param {Object} ttfd - targetFrameTransformData - transform data of target frame
   * @returns {Object} the "t" record containing pre and post transforms
   */
  genericTransition: function(tin, tout, ctfd, ttfd, z) {
    var that = this;
    // calculates the transform for the in or the out part of the transition
    var getPartialTransition = function(pt, ctfd, ttfd, z) {
      var scale = function(org, dis, scale) {
        return org + (dis - org) * Math.abs(scale);
      };
      var sw = that.getStageWidth(),
        sh = that.getStageHeight(),
        cx = -ctfd.shiftX,
        cy = -ctfd.shiftY,
        tx = -ttfd.shiftX,
        ty = -ttfd.shiftY,
        pt_x = pt[1],
        pt_y = pt[2],
        pt_scale = pt[3],
        pt_rot = pt[4],
        pt_css = pt[5] || {};
      switch (pt[0]) {
        case "adjacent":
          tx = (pt_x < 0) ? scale(tx, Math.min(cx, 0) - ttfd.width, pt_x) : scale(tx, Math.max(cx + ctfd.width, sw), pt_x);
          ty = (pt_y < 0) ? scale(ty, Math.min(cy, 0) - ttfd.height, pt_y) : scale(ty, Math.max(cy + ctfd.height, sh), pt_y);
          // adjust scroll difference, but only perpendicular to transition direction (the other direction is taken care of by applying currentTransform and targetTransform later on)
          if (pt_x === 0) tx += -ttfd.scrollX * ttfd.scale + ctfd.scrollX * ctfd.scale;
          if (pt_y === 0) ty += -ttfd.scrollY * ttfd.scale + ctfd.scrollY * ctfd.scale;
          return Kern._extend({
            transform: "translate3d(" + tx + "px," + ty + "px," + z + "px) scale(" + ttfd.scale * pt_scale + ") rotate(" + pt_rot + "deg)",
            opacity: 1,
            'z-index': z
          }, pt_css);
      }
    };
    var tin_css_after = tin[6] || {};
    var tout_css_before = tout[6] || {};
    var t = { // record taking pre and post positions
      t1: Kern._extend(this._calcFrameTransform(ttfd), tin_css_after),
      c0: Kern._extend(this._calcFrameTransform(ctfd), tout_css_before)
    };
    if (Object.keys(tout_css_before).length) t.current_css = true; // notify that we need to apply something to currentframe before transition.
    t.t0 = getPartialTransition(tin, ctfd, ttfd, z || 0);
    t.c1 = getPartialTransition(tout, ttfd, ctfd, (z && -z) || 0); // WARNING: ctfd & ttfd are swapped here!
    t.fix_css = [tin[5], tout[5], tin[6], tout[6]].map(function(e) {
      return Object.keys(e || {});
    }).reduce(function(css, property) {
      if (property !== 'transform') css[property] = 'initial';
      return css;
    }, {}); // create a css record that sets all extra css properties back to inital
    return t;
  }
});

layoutManager.registerType('slide', SlideLayout);

module.exports = SlideLayout;
