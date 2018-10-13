var layoutManager = require('../layoutmanager');
var CanvasLayout = require('./canvaslayout');
var EditorTransformer = require('./editortransformer');

var EditorLayout = CanvasLayout.extend({
  /**
  * initalize EditorLayout with a layer
  *
  * @param {Type} Name - Description
  * @returns {Type} Description
  **/
  constructor: function(layer) {
    CanvasLayout.call(this, layer);
    this.transformer = new EditorTransformer(layer);
  },
  getScrollTransformer: function() {
    return this.transformer;
  }
});
layoutManager.registerType('editor', EditorLayout);


