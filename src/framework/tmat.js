'use strict';
// class holding a 2D affine transform matrix
//     | a b tx |
// A = | c d ty |
//     | 0 0 1  |

var TMat = function(init) {
  if (init instanceof Array) {
    this.a = init[0];
    this.b = init[1];
    this.c = init[2];
    this.d = init[3];
    this.tx = init[4];
    this.ty = init[5];
  } else { // unit matrix
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
  }
};
TMat.prototype = {
  prod: function(o) {
    //matrix multiplication for our special matrix
    // A = this * o
    var a = this.a * o.a + this.b * o.c;
    var b = this.a * o.b + this.b * o.d;
    var tx = this.a * o.tx + this.b * o.ty + this.tx;
    var c = this.c * o.a + this.d * o.c;
    var d = this.c * o.b + this.d * o.d;
    var ty = this.c * o.tx + this.d * o.ty + this.ty;
    return new TMat([a, b, c, d, tx, ty]);
  },
  transform: function() {
    // create css transform string
    return "matrix(" + this.a.toFixed(4) + "," + this.c.toFixed(4) + "," + this.b.toFixed(4) + "," + this.d.toFixed(4) + "," + this.tx.toFixed(4) + "," + this.ty.toFixed(4) + ")";
  },
  /**
   * ##transform_nomatrix
   * create CSS transform string w/o matrix, here translation is last
   * @param {number?} addrot rotation to be added? as rotation is not unique add addrot to the rotate() part if supplied by caller
   * @return {string} css string
   */
  transform_nomatrix: function(addrot) {
    var transl = this.get_translation_equal();
    var scale = this.get_scale_equal();
    var rot = this.get_rotation_equal();
    transl = TMat.Tscale(1 / scale).prod(TMat.Trot(-rot)).transform_vec(transl);
    // avoid 1.xe-xxx numbers
    if (Math.abs(transl.x) < 0.000001) transl.x = 0;
    // avoid 1.xe-xxx numbers
    if (Math.abs(transl.y) < 0.000001) transl.y = 0;
    var cssstring = "scale(" + this.get_scale_equal() + ") " + "rotate(" + (this.get_rotation_equal() + (addrot ? addrot : 0)) + "deg) " + TMat.getTranslateString(transl.x, transl.y);
    return cssstring;
  },
  transform_vec: function(v) {
    // transform a vector
    return {
      x: this.a * v.x + this.b * v.y + this.tx,
      y: this.c * v.x + this.d * v.y + this.ty
    };
  },
  invert: function() {
    // inverse matrix of an affine transform matrix
    var D = 1 / (this.a * this.d - this.b * this.c);
    var a = D * this.d;
    var b = -D * this.b;
    var c = -D * this.c;
    var d = D * this.a;
    var tx = -a * this.tx - b * this.ty;
    var ty = -c * this.tx - d * this.ty;
    return new TMat([a, b, c, d, tx, ty]);
  },
  get_scale_equal: function() { // WARNING only works for equal x and y scale
    // return current scale of transform
    var x = this.a;
    var y = this.c;
    return Math.sqrt(x * x + y * y);
  },
  get_rotation_equal: function() { // WARNING only works for equal x and y scale
    var s = this.get_scale_equal();
    var phi = 180 * Math.acos(this.a / s) / Math.PI;
    if (this.c < 0) phi = 360 - phi;
    return phi;
  },
  get_translation_equal: function() { // WARNING only works for equal x and y scale and translation applied last
    return {
      x: this.tx,
      y: this.ty
    };
  },
  set_scale_equal: function(scale) { // WARNING only works for equal x and y scale and translation applied last
    var cs = this.get_scale_equal();
    this.a *= scale / cs;
    this.b *= scale / cs;
    this.c *= scale / cs;
    this.d *= scale / cs;
  },
  copy: function() {
    return new TMat([this.a, this.b, this.c, this.d, this.tx, this.ty]);
  },
  clearShift: function() {
    this.tx = 0;
    this.ty = 0;
    return this;
  }
};
TMat.Trot = function(r) {
  var t = r * Math.PI / 180;
  return new TMat([Math.cos(t), -Math.sin(t), Math.sin(t), Math.cos(t), 0, 0]);
};
TMat.Tscale = function(s) {
  return new TMat([s, 0, 0, s, 0, 0]);
};
TMat.Tscalexy = function(x, y) {
  return new TMat([x, 0, 0, y, 0, 0]);
};
TMat.Ttrans = function(x, y) {
  return new TMat([1, 0, 0, 1, x, y]);
};
TMat.Tall = function(x, y, s, r) {
  var t = r * Math.PI / 180;
  return new TMat([s * Math.cos(t), -s * Math.sin(t), s * Math.sin(t), s * Math.cos(t), x, y]);
};
/**
 * ##getTranslateString
 * Since Mac browsers have a problem with `translate3d` we will not use this
 * on any of their devices. This function is the switch.
 * @param {float} x
 * @param {float} y
 * @return {string} translate string for CSS transform
 */
TMat.getTranslateString = function(x, y) {
  return "translate3d(" + x + "px," + y + "px,0)";
};
// Return the model for the module
module.exports = TMat;
