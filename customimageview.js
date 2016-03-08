var ImageView = require('./src/framework/imageview.js');
var pluginManager = require('./src/framework/pluginmanager.js');
//var WL = require('./src/framework/wl.js');

var CustomImageView = ImageView.extend({
  constructor: function(dataModel, options) {
    dataModel.attributes.alt = "default alt message";
    dataModel.attributes.src = "http://layerjs.com/production/static/dump/1202/logo1.png";

    ImageView.call(this, dataModel, options);
  }
});
// use WL
pluginManager.registerType('customImage', CustomImageView);
module.exports = CustomImageView;
