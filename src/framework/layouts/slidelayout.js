'use strict';
var $ = require('../domhelpers.js');
var Kern = require('../../kern/Kern.js');
var layoutManager = require('../layoutmanager.js');
var LayerLayout = require('./layerlayout.js');


// partials
// define define data for pre position / css of new frame (for in transition ) or post position / css of old frame
// ['adjacent',x,y,scale,rotation,z,css,org_css]
// x,y: position relative to stage (x=-1 left, x=+1 right, y=-1 top, y=+1 bottom), can be scaled (values <>1) and combined
// scale, rotation: only for the pre target frame or post current frame
// z: z component of translate3d for pre / post position
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
   * transforms immidiately to the specified frame. hides all other frames
   *
   * @param {FrameView} frame - the frame to activate
   * @param {Object} transfromData - transform data of current frame
   * @param {string} transform - a string represenptg the scroll transform of the current frame
   * @returns {void}
   */
  showFrame: function(frame, frameTransformData, transform) {
    for (var i = 0; i < this.layer.innerEl.children.length; i++) {
      this.layer.innerEl.children[i].style.display = 'none';
    }
    this._applyTransform(frame, this._currentFrameTransform = this._calcFrameTransform(frameTransformData), transform, {
      display: 'block',
      opacity: 1,
      visibility: 'initial',
      top: "0px",
      left: "0px"
    });
    this._preparedTransitions = {};
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {FrameView} frame - frame to transition to
   * @param {Object} transition - transition object
   * @param {Object} targetFrameTransformData - the transformData object of the target frame
   * @param {string} targetTransform - transform represenptg the scrolling after transition
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transition before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(frame, transition, targetFrameTransformData, targetTransform) {
    var that = this;
    var currentFrame = that.layer.currentFrame;
    return this.prepareTransition(frame, transition, targetFrameTransformData, targetTransform).then(function(t) {
      var finished = new Kern.Promise();
      var frameToTransition = frame || currentFrame;

      if (frameToTransition) {
        frameToTransition.outerEl.addEventListener("transitionend", function f(e) { // FIXME needs webkitTransitionEnd etc
          e.target.removeEventListener(e.type, f); // remove event listener for transitionEnd.
          if (transition.transitionID === that.layer.transitionID) {
            if (currentFrame) {
              currentFrame.applyStyles(t.fix_css, {
                transition: 'none',
                display: 'none'
              });
            }
            if (frame) {
              frame.applyStyles(t.fix_css, {
                transition: 'none'
              });
            }
          }
          // wait until above styles are applied;
          $.postAnimationFrame(function() {
            finished.resolve();
          });
        });
      } else {
        finished.resolve();
      }

      that._applyTransform(frame, that._currentFrameTransform = t.t1, targetTransform, {
        transition: transition.duration,
        top: "0px",
        left: "0px",
        opacity: "1"
      });

      that._applyTransform(currentFrame, t.c1, targetTransform, {
        transition: transition.duration,
        top: "0px",
        left: "0px"
      });
      that._preparedTransitions = {};
      // wait until post transforms are applied an signal that animation is now running.
      /*  $.postAnimationFrame(function() {
          that.layer.trigger('transitionStarted', frame === null ? null : frame.data.attributes.name);
        });*/
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
        if (transition.reverse) {
          prep = this.genericTransition(transitionfn[1], transitionfn[0], this.layer.currentFrameTransformData, targetFrameTransformData, (transitionfn[2] && -transitionfn[2]) || 0);
        } else {
          prep = this.genericTransition(transitionfn[0], transitionfn[1], this.layer.currentFrameTransformData, targetFrameTransformData, transitionfn[2]);
          // WARNING: this.layer.currentFrameTransformData should still be the old one here. careful: this.layer.currentFrameTransformData will be set by LayerView before transition ends!
        }
      } else {
        finished.reject();
      }
      prep.transform = targetTransform; // FIXME: targetTransform is not enough, need to check current transform as well
      if (frame === null && !prep.current_css) { // nothing to do as new frame is "none"
        prep.applied = true;
        finished.resolve(prep);
      }
      // apply pre position to target frame
      this._applyTransform(frame, prep.t0, this.layer.currentTransform, {
        transition: 'none',
        visibility: 'inital'
      });
      // apply pre position to current frame
      if (prep.current_css) {
        this._applyTransform(currentFrame, prep.c0, this.layer.currentTransform, {
          transition: 'none',
        });
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
      frame.applyStyles(styles || {}, css);
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
            opacity: 1
          }, pt_css);
      }
    };
    var tin_css_after = tin[6] || {};
    var tout_css_before = tout[6] || {};
    if (Object.keys(tout_css_before).length) t.current_css = true; // notify that we need to apply something to currentframe before transition.
    var t = { // record taking pre and post positions
      t1: Kern._extend(this._calcFrameTransform(ttfd), tin_css_after),
      c0: Kern._extend(this._calcFrameTransform(ctfd), tout_css_before)
    };
    t.t0 = getPartialTransition(tin, ctfd, ttfd, z || 0);
    t.c1 = getPartialTransition(tout, ttfd, ctfd, (z && -z) || 0); // WARNING: ctfd & ttfd are swapped here!
    t.fix_css = [tin[5], tout[5], tin[6], tout[6]].map(function(e) {
      return Object.keys(e || {});
    }).reduce(function(css, property) {
      if (property !== 'transform') css[property] = 'initial';
      return css;
    }, {}); // create a css record that sets all extra css properties back to inital
    return t;
  },
  /**
   * calculates pre and post positions for simple swipe transitions.
   *
   * @param {string} type - the transition type (e.g. "left")
   * @param {Integer} which - Boolean mask describing which positions need to be calculated
   * @param {Object} ctfd - currentFrameTransformData - transform data of current frame
   * @param {Object} ttfd - targetFrameTransformData - transform data of target frame
   * @returns {Object} the "t" record containing pre and post transforms
   */
  swipeTransition: function(type, ctfd, ttfd) {
    var t = {
      t0: {
        transform: "",
        opacity: 1
      },
      c1: {
        transform: "",
        opacity: 1
      }
    }; // record taking pre and post positions
    var x, y;
    switch (type) {
      case 'default':
      case 'left':
        // target frame transform time 0
        x = Math.max(this.getStageWidth(), ctfd.width) - ctfd.shiftX;
        y = -ttfd.shiftY + ctfd.scrollY * ctfd.scale - ttfd.scrollY * ttfd.scale;
        // FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        x = -Math.max(this.getStageWidth(), ctfd.width) - ttfd.shiftX;
        y = -ctfd.shiftY - ctfd.scrollY * ctfd.scale + ttfd.scrollY * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'right':
        // target frame transform time 0
        x = -Math.max(this.getStageWidth(), ttfd.width) - ctfd.shiftX;
        y = -ttfd.shiftY + ctfd.scrollY * ctfd.scale - ttfd.scrollY * ttfd.scale;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        x = Math.max(this.getStageWidth(), ttfd.width) - ttfd.shiftX;
        y = -ctfd.shiftY - ctfd.scrollY * ctfd.scale + ttfd.scrollY * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'up':
        // target frame transform time 0
        y = Math.max(this.getStageHeight(), ctfd.height) - ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        // FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        y = -Math.max(this.getStageHeight(), ctfd.height) - ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'down':
        // target frame transform time 0
        y = -Math.max(this.getStageHeight(), ttfd.height) - ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        y = Math.max(this.getStageHeight(), ttfd.height) - ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'fade':
        y = -ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        t.t0.opacity = '0';
        y = -ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        t.c1.opacity = '0';
        break;
        // target frame transform time 0
    }

    return t;
  },
  slideOverTransition: function(type, ctfd, ttfd) {
    var t = {
      t0: {
        transform: "",
        opacity: 1
      },
      c1: {
        transform: "",
        opacity: 1
      }
    }; // record taking pre and post positions
    var x, y;
    switch (type) {

      case 'slideOverLeft':
      case 'slideOverLeftFade':
        // target frame transform time 0
        x = Math.max(this.getStageWidth(), ctfd.width) - ctfd.shiftX;
        y = -ttfd.shiftY + ctfd.scrollY * ctfd.scale - ttfd.scrollY * ttfd.scale;
        // original comment from case 'left': FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
        t.t0["z-index"] = 2;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        t.c1 = this._currentFrameTransform;
        t.c1["z-index"] = 1;
        if (type.match(/Fade/)) {
          t.c1.opacity = 0;
        }
        break;

      case 'slideOverRight':
      case 'slideOverRightFade':
        // target frame transform time 0
        x = -Math.max(this.getStageWidth(), ttfd.width) - ctfd.shiftX;
        y = -ttfd.shiftY + ctfd.scrollY * ctfd.scale - ttfd.scrollY * ttfd.scale;
        t.t0["z-index"] = 2;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        t.c1 = this._currentFrameTransform;
        t.c1["z-index"] = 1;
        if (type.match(/Fade/)) {
          t.c1.opacity = 0;
        }
        break;

      case 'slideOverUp':
      case 'slideOverUpFade':
        // target frame transform time 0
        y = Math.max(this.getStageHeight(), ctfd.height) - ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        // original comment from case 'up': FIXME: translate and scale may actually be swapped here, not tested yet as shift was always zero so far!!!
        t.t0["z-index"] = 2;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        t.c1 = this._currentFrameTransform;
        t.c1["z-index"] = 1;
        if (type.match(/Fade/)) {
          t.c1.opacity = 0;
        }
        break;

      case 'slideOverDown':
      case 'slideOverDownFade':
        // target frame transform time 0
        y = -Math.max(this.getStageHeight(), ttfd.height) - ctfd.shiftY;
        x = -ttfd.shiftX + ctfd.scrollX * ctfd.scale - ttfd.scrollX * ttfd.scale;
        t.t0["z-index"] = 2;
        t.t0.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ttfd.scale + ")";
        // current frame transform time 1
        t.c1 = this._currentFrameTransform;
        t.c1["z-index"] = 1;
        if (type.match(/Fade/)) {
          t.c1.opacity = 0;
        }
        break;

      case 'slideAwayLeft':
      case 'slideAwayLeftFade':
        // target frame transform time 0
        t.t0 = this._calcFrameTransform(ttfd);
        t.t0.opacity = (type.match(/Fade/) ? 0 : 1);
        // current frame transform time 1
        x = -Math.max(this.getStageWidth(), ctfd.width) - ttfd.shiftX;
        y = -ctfd.shiftY - ctfd.scrollY * ctfd.scale + ttfd.scrollY * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'slideAwayRight':
      case 'slideAwayRightFade':
        // target frame transform time 0
        t.t0 = this._calcFrameTransform(ttfd);
        t.t0.opacity = (type.match(/Fade/) ? 0 : 1);
        // current frame transform time 1
        x = Math.max(this.getStageWidth(), ttfd.width) - ttfd.shiftX;
        y = -ctfd.shiftY - ctfd.scrollY * ctfd.scale + ttfd.scrollY * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'slideAwayUp':
      case 'slideAwayUpFade':
        // target frame transform time 0
        t.t0 = this._calcFrameTransform(ttfd);
        t.t0.opacity = (type.match(/Fade/) ? 0 : 1);
        // current frame transform time 1
        y = -Math.max(this.getStageHeight(), ctfd.height) - ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;

      case 'slideAwayDown':
      case 'slideAwayDownFade':
        // target frame transform time 0
        t.t0 = this._calcFrameTransform(ttfd);
        t.t0.opacity = (type.match(/Fade/) ? 0 : 1);
        // current frame transform time 1
        y = Math.max(this.getStageHeight(), ttfd.height) - ttfd.shiftY;
        x = -ctfd.shiftX - ctfd.scrollX * ctfd.scale + ttfd.scrollX * ttfd.scale;
        t.c1.transform = "translate3d(" + x + "px," + y + "px,0px) scale(" + ctfd.scale + ")";
        break;
    }

    return t;
  }
});

layoutManager.registerType('slide', SlideLayout);

module.exports = SlideLayout;
