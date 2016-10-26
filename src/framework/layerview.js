'use strict';
var $ = require('./domhelpers.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');
var layoutManager = require('./layoutmanager.js');
var GroupView = require('./groupview.js');
var ScrollTransformer = require('./scrolltransformer.js');
var gestureManager = require('./gestures/gesturemanager.js');
var defaults = require('./defaults.js');
var state = require('./state.js');
var sizeObserver = require('./observer/sizeobserver.js');

var directions2neighbors = {
  up: 'b',
  down: 't',
  left: 'r',
  right: 'l'
};
/**
 * A View which can have child views
 * @param {LayerData} dataModel
 * @param {object}        options
 * @extends GroupView
 */

var LayerView = GroupView.extend({
  constructor: function(dataModel, options) {
    options = options || {};
    this._setDocument(options);
    var that = this;
    this.inTransform = false; // indicates that transition is still being animated
    this.transitionID = 1; // counts up every call of transitionTo();

    var tag = 'div';

    if (dataModel) {
      tag = dataModel.attributes.tag;
    }
    this.outerEl = options.el || this.document.createElement(tag);


    var hasScroller = this.outerEl.children.length === 1 && $.getAttributeLJ(this.outerEl.children[0], 'helper') === 'scroller';
    this.innerEl = hasScroller ? this.outerEl.children[0] : this.outerEl;

    // call super constructor
    GroupView.call(this, dataModel, Kern._extend({}, options, {
      noRender: true
    }));

    this.switchLayout(this.data.attributes.layoutType, false);
    this.switchScrolling(this.data.attributes.nativeScroll, false);

    // get upper layer where unuseable gestures should be sent to.
    this.parentLayer = this.getParentOfType('layer');
    // register for gestures
    gestureManager.register(this.outerEl, this.gestureListener.bind(this), {
      dragging: true
    });

    // this is my stage and add listener to keep it updated
    this.stage = this.parent;
    this.on('parent', function() {
      that.stage = that.parent;
      // FIXME trigger adaption to new stage
    });
    // set current frame from data object or take first child
    if (this.data.attributes.defaultFrame) {
      if (this.data.attributes.defaultFrame === 'none') {
        this.currentFrame = null;
      } else {
        this.currentFrame = this.getChildViewByName(this.data.attributes.defaultFrame);
      }
    } else {
      this.currentFrame = this.data.attributes.children[0] && this.getChildView(this.data.attributes.children[0]);
    }

    if (!options.noRender && (options.forceRender || !options.el)) {
      this.render();
    }
    // set the initial frame if possible
    if (this.currentFrame) {
      this.showFrame(this.currentFrame.data.attributes.name);
    }
    // listen to scroll events
    this.on('scroll', function() { // jshint ignore:line
      //that._layout.updateTransitions(); // FIXME: notify layout about scroll and that prepared transitions may be outdated
    });
    /*
    // register for gestures
    gestureManager.register(this.layer.outerEl,function(){
      that.gestureListener.apply(that,arguments);
    })
    */

    state.registerView(this);
  },
  /**
   * Will toggle native and non-native scrolling
   *
   * @param {boolean} nativeScrolling
   * @returns {void}
   */
  switchScrolling: function(nativeScrolling) {

    if (this.nativeScroll !== nativeScrolling) {
      this.nativeScroll = nativeScrolling;

      this.disableObserver();
      var hasScroller = this.outerEl.children.length === 1 && $.getAttributeLJ(this.outerEl.children[0], 'helper') === 'scroller';

      if (nativeScrolling) {
        this.innerEl = hasScroller ? this.outerEl.children[0] : $.wrapChildren(this.outerEl);
        $.setAttributeLJ(this.innerEl, 'helper', 'scroller');
        if (!this.innerEl._ljView) {
          this.innerEl._ljView = this.outerEl._ljView;
        }
        this.outerEl.className += ' nativescroll';
      } else {
        if (hasScroller) {
          $.unwrapChildren(this.outerEl);
        }
        this.innerEl = this.outerEl;
        this.outerEl.className = this.outerEl.className.replace(' nativescroll', '');
      }

      this._transformer = this._layout.getScrollTransformer() || new ScrollTransformer(this);

      if (this.currentFrame) {
        this.showFrame(this.currentFrame.data.attributes.name, this.currentFrame.getScrollData());
      }
      this._observer.element = this.innerEl;
      this.enableObserver();
    }
  },
  /**
   * Will change the current layout with an other layout
   *
   * @param {string} layoutType - the name of the layout type
   * @returns {void}
   */
  switchLayout: function(layoutType) {
    this._layout = new(layoutManager.get(layoutType))(this);
    this._transformer = this._layout.getScrollTransformer() || new ScrollTransformer(this);

    if (this.currentFrame) {
      this.showFrame(this.currentFrame.data.attributes.name);
    }
  },
  gestureListener: function(gesture) {
    var layerTransform = this._transformer.scrollGestureListener(gesture);

    if (gesture.first) {
      return;
    }
    if (layerTransform === true) {
      // native scrolling possible
      return;
    } else if (layerTransform) {
      this._layout.setLayerTransform(this.currentTransform = layerTransform);
      gesture.preventDefault = true;
    } else {
      if (this.inTransform) gesture.preventDefault = true; // we need to differentiate here later as we may have to check up stream handlers
      // gesture.cancelled = true;
      var cattr = this.currentFrame.data.attributes;
      if (gesture.direction) {
        if (cattr.neighbors && cattr.neighbors[directions2neighbors[gesture.direction]]) {
          gesture.preventDefault = true;
          if (!this.inTransform && (gesture.last || (gesture.wheel && gesture.enoughDistance()))) {
            this.transitionTo(cattr.neighbors[directions2neighbors[gesture.direction]], {
              type: gesture.direction
            });
          }
        } else { //jshint ignore:line
          // FIXME: escalate/gesture bubbling ; ignore for now
        }
      } else { //jshint ignore:line
        // this will prevent any bubbling for small movements
        gesture.preventDefault = true;
      }
    }
  },
  /**
   * show current frame immidiately without transition/animation
   *
   * @param {string} framename - the frame to be active
   * @param {Object} scrollData - information about the scroll position to be set. Note: this is a subset of a
   * transition object where only startPosition, scrollX and scrollY is considered
   * @returns {void}
   */
  showFrame: function(framename, scrollData) {
    if (!this.stage) {
      return;
    }
    scrollData = scrollData || {};
    var that = this;
    var frame = null;

    if (null !== framename) {
      frame = this.getChildViewByName(framename);
      if (!frame) throw "transformTo: " + framename + " does not exist in layer";
    }

    that.trigger('beforeTransition', framename);

    this.inTransform = true;

    this._layout.loadFrame(frame).then(function() {
      var tfd = that.currentFrameTransformData = null === frame ? that.noFrameTransformdata(scrollData.startPosition) : frame.getTransformData(that.stage, scrollData.startPosition);
      that.currentTransform = that._transformer.getScrollTransform(tfd, scrollData.scrollX || (tfd.isScrollX && tfd.scrollX) || 0, scrollData.scrollY || (tfd.isScrollY && tfd.scrollY) || 0);
      that.currentFrame = frame;
      that.trigger('transitionStarted', framename);
      that._layout.showFrame(frame, tfd, that.currentTransform);
      that.inTransform = false;
      that.currentFrame = frame;
      that.trigger('transitionFinished', framename);
    });
  },
  noFrameTransformdata: function(transitionStartPosition) {
    var d = {};
    d.stage = this.stage;
    d.scale = 1;
    d.width = d.frameWidth = this.stage.width();
    d.height = d.frameHeight = this.stage.height();
    d.shiftX = d.shiftY = d.scrollX = d.scrollY = 0;
    d.isScrollX = d.isScrollY = false;
    d.startPosition = transitionStartPosition || 'top';
    d.initialScrollX = d.scrollX;
    d.initialScrollY = d.scrollY;

    return d;
  },
  /**
   * transform to a given frame in this layer with given transition
   *
   * @param {string} [framename] - (optional) frame name to transition to
   * @param {Object} [transition] - (optional) transition object
   * @returns {Kern.Promise} a promise fullfilled after the transition finished. Note: if you start another transition before the first one finished, this promise will not be resolved.
   */
  transitionTo: function(framename, transition) {
    // is framename  omitted?
    if (typeof framename === 'object' && null !== framename) {
      transition = framename;
      framename = transition.framename;
    } else if (null !== framename) {
      framename = framename || (transition && transition.framename);
    }
    if (!framename && null !== framename) throw "transformTo: no frame given";
    // transition ommitted? create some default
    transition = Kern._extend({
      type: 'default',
      duration: '1s'
        // FIXME: add more default values like timing
    }, transition || {});
    // lookup frame by framename
    var frame = null === framename ? null : this.getChildViewByName(framename);
    if (!frame && null !== frame) throw "transformTo: " + framename + " does not exist in layer";
    var that = this;
    that.trigger('beforeTransition', framename);

    this.inTransform = true;
    transition.transitionID = ++this.transitionID; // inc transition ID and save new ID into transition record
    // make sure frame is there such that we can calculate dimensions and transform data
    return this._layout.loadFrame(frame).then(function() {
      // calculate the layer transform for the target frame. Note: this will automatically consider native scrolling
      // getScrollIntermediateTransform will not change the current native scroll position but will calculate
      // a compensatory transform for the target scroll position.
      var targetFrameTransformData = null === frame ? that.noFrameTransformdata(transition.startPosition) : frame.getTransformData(that.stage, transition.startPosition);
      var targetTransform = that._transformer.getScrollTransform(targetFrameTransformData, transition.scrollX || 0, transition.scrollY || 0, true);
      // check if transition goes to exactly the same position
      if (that.currentFrame === frame && that.currentTransform === targetTransform && that.currentFrameTransformData === targetFrameTransformData) {
        // don't do a transition, just execute Promise
        var p = new Kern.Promise();
        p.resolve();
        that.inTransform = false;
        that.trigger('transitionStarted', framename);
        that.trigger('transitionFinished', framename);
        return p;
      }
      var layoutPromise = that._layout.transitionTo(frame, transition, targetFrameTransformData, targetTransform).then(function() {
        // is this still the active transition?
        if (transition.transitionID === that.transitionID) {
          // this will now calculate the currect layer transform and set up scroll positions in native scroll
          that.currentTransform = that._transformer.getScrollTransform(targetFrameTransformData, transition.scrollX || 0, transition.scrollY || 0, false);
          // apply new transform (will be 0,0 in case of native scrolling)
          that._layout.setLayerTransform(that.currentTransform);
          that.inTransform = false;
          $.postAnimationFrame(function() {
            that.trigger('transitionFinished', framename);
          });
        }
      });

      that.updateClasses(frame);
      that.currentFrameTransformData = targetFrameTransformData;
      that.currentFrame = frame;
      that.currentTransform = targetTransform;
      that.trigger('transitionStarted', framename);

      return layoutPromise;
    });
  },
  getCurrentTransform: function() {
    return this.currentTransform;
  },
  /**
   * updates HTML classes for frames during transition or showFrame
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  updateClasses: function(newFrame) {
    if (this.currentFrame) {
      this._saveLastFrame = this.currentFrame;
      this.currentFrame.outerEl.className = this.currentFrame.outerEl.className.replace(/\s*wl\-active\s*/g, '');
    }
    if (null !== newFrame) {
      newFrame.outerEl.className += " wl-active";
    }
  },
  /**
   * render child positions. overriden default behavior of groupview
   *
   * @param {ElementView} childView - the child view that has changed
   * @returns {Type} Description
   */
  _renderChildPosition: function(childView) {
    childView.disableObserver();
    this._layout.renderFramePosition(childView, this._currentTransform);
    childView.enableObserver();
  },
  /**
   * Method will be invoked when a resize event is detected.
   */
  onResize: function() {
    var childViews = this.getChildViews();
    var length = childViews.length;
    var scrollData = this.currentFrame !== null ? this.currentFrame.getScrollData() : undefined;

    for (var i = 0; i < length; i++) {
      var childView = childViews[i];
      if (childView.hasOwnProperty('transformData')) {
        childView.transformData = null;
      }
    }
    var frameName = this.currentFrame === null ? null : this.currentFrame.data.attributes.name;
    this.showFrame(frameName, scrollData);
  },
  /**
   * analyse list of childNodes (HTMLElements) in this group and create view- (and possibly data-) objects for them.
   *
   * @returns {void}
   */
  _parseChildren: function(options) {
    var that = this;
    // unregister childviews
    sizeObserver.unregister(this.getChildViews());

    GroupView.prototype._parseChildren.call(this, options);

    var callBack = function() {
      // when doing a transform, the callback should not be called
      if (!that.inTransform) {
        that.onResize();
      }
    };
    sizeObserver.register(this.getChildViews(), callBack);
  }
}, {
  /*
  Model: LayerData*/
  defaultProperties: Kern._extend({}, GroupView.defaultProperties, {
    type: 'layer',
    layoutType: 'slide',
    defaultFrame: undefined,
    nativeScroll: true
  }),
  identify: function(element) {
    var type = $.getAttributeLJ(element, 'type');
    return null !== type && type.toLowerCase() === LayerView.defaultProperties.type;
  }
});

pluginManager.registerType('layer', LayerView, defaults.identifyPriority.normal);

module.exports = LayerView;
