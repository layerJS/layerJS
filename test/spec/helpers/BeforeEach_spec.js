/*
  Load the layerjs.js. Will be closer to the production environment.
*/

require("../../../src/layerjs.js")
var WL = require("../../../src/framework/wl.js")
var jsdom = require('jsdom').jsdom;

var document, window, $;

beforeEach(function() {
  delete global.document;
  delete global.window;

  document = global.document = jsdom("<html><head><style id='wl-obj-css'></style></head><body></body></html>");
  window = global.window = document.defaultView;
  $ = document.querySelector;

  WL.repository.clear();
});
