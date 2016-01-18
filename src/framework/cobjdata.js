'use strict';
var Kern = require('../kern/Kern.js');
var defaults = require('./defaults.js');
/**
 * #CobjData
 * This is the base data Model for all Webpgr objects.
 * @type {Model}
 */
var CobjData = Kern.Model.extend({
  // these are the default attributes, these attributes will be synced with the server
  // plugins should extend these attributes when they need to store values on the server
  // all attributes that are not in here linke `this.ontop` are internal attributes that
  // will not be stored on the server
  defaults: {
    // subclasses must overwrite this or FAIL
    type: undefined,
    tag: defaults.tag,
    elementId: undefined,

    // CSS string for styling this object
    style: '',
    // CSS classes of this object
    classes: '',

    // this stores a string for a hyperlink realized by an <a> tag that
    // wraps the element
    linkTo: undefined,
    // defaults to _self, but should not be set because if set a link is
    // created, this could be fixed
    linkTarget: undefined,

    //locked elements can not be edited
    locked: undefined,
    // a list of properties that are not allowed to be edited
    disallow: {},

    // set to undefined so we can find out if a newly created element
    // provided positional information
    x: undefined,
    y: undefined,


    width: undefined,
    height: undefined,

    // rendering scale
    scaleX: 1,
    scaleY: 1,

    // z-index
    zIndex: undefined,
    // this is set in init$el to the current rotation if it was not set
    // before
    rotation: undefined,
    //is the element hidden in presentation mode
    hidden: undefined,
    // bins are important for the compositor, they tell in which area the
    // object is located, this is used for faster lookups of elements
    version: defaults.version
  },
  //---
  // the tag should be overwritten by plugins if neccessary, eg. image plugin will set img here
  // nogesture: false,
  // selectable: true,
  // allowClick: true,
  // ui: false,
  // ontop: false,
  // choose a layer that is below all other objects
  // onbottom: false,
  // dontSetSize: false,
});

module.exports = CobjData;
