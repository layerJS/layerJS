/*
  Load the main.js. Will be closer to the production environment.
*/

require("../../../src/layerjs.js")

beforeEach(function() {
  delete global.document;
  delete global.window;
});
