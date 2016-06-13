var jsdom = require("jsdom").jsdom;
var pluginmanager = require('../../src/framework/pluginmanager.js');
var ElementView = require('../../src/framework/elementview.js');
var NodeData = ElementView.Model;

describe('PluginManager', function() {
  var document, window, $;


  var data = {
    "type": "element",
    "text": "Cart",
    "width": '64px',
    "height": '35px',
    "x": '789px',
    "y": '27px',
    "scaleX": 1,
    "scaleY": 1,
    "style": "",
    "classes": " wp-menu",
    "zIndex": 26,
    "rotation": 360,
    "link_to": "http://spiegel.de",
    "link_target": "_self",
    "disallow": {},
    "id": 110534,
    "version" : ElementView.defaultProperties.version,
    "tag" : ElementView.defaultProperties.tag
  };
  var c = new NodeData(data);
  it('can be initialized', function() {
    expect(pluginmanager).toBeDefined();
  });
  it('can create view objects', function() {
    var v = pluginmanager.createView(c);
    expect(v).toBeDefined();
    expect(v.data.attributes.x).toBe('789px');
    expect(v.innerEl._wlView).toBe(v);
  });
  it('can register and create new types of View objects', function() {
    var NV = ElementView.extend({}, {
      Model: NodeData
    }); // Note this is the wrong model data type but that shouldn't be a problem
    var ndata = {
      "type": "heinz",
      "version" : ElementView.defaultProperties.version,
      "tag" : ElementView.defaultProperties.tag
    }
    pluginmanager.registerType('heinz', NV);
    var nc = pluginmanager.createModel(ndata);
    var v = pluginmanager.createView(nc);
    expect(v instanceof NV).toBe(true);
    expect(v.innerEl._wlView).toBe(v);
  })
});
