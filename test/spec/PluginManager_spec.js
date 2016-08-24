var pluginmanager = require('../../src/framework/pluginmanager.js');
var ElementView = require('../../src/framework/elementview.js');
var NodeData = ElementView.Model;
var identifyPriority = require('../../src/framework/identifypriority.js');

describe('PluginManager', function() {

  var pluginmanagerMap;

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
    "version": ElementView.defaultProperties.version,
    "tag": ElementView.defaultProperties.tag
  };
  var c = new NodeData(data);
  it('can be initialized', function() {
    expect(pluginmanager).toBeDefined();
  });
  it('can create view objects', function() {
    var v = pluginmanager.createView(c);
    expect(v).toBeDefined();
    expect(v.data.attributes.x).toBe('789px');
    expect(v.innerEl._ljView).toBe(v);
  });
  it('can register and create new types of View objects', function() {
    var NV = ElementView.extend({}, {
      Model: NodeData,
      identify: function(element) {
        return false;
      }
    }); // Note this is the wrong model data type but that shouldn't be a problem
    var ndata = {
      "type": "heinz",
      "version": ElementView.defaultProperties.version,
      "tag": ElementView.defaultProperties.tag
    }
    pluginmanager.registerType('heinz', NV, identifyPriority.low);
    var nc = pluginmanager.createModel(ndata);
    var v = pluginmanager.createView(nc);
    expect(v instanceof NV).toBe(true);
    expect(v.innerEl._ljView).toBe(v);

    delete pluginmanager.map.heinz;
  });

  it('can identify an element\'s viewtype', function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'stage');
    expect(pluginmanager.identify(element)).toBe('stage');

    element.setAttribute('data-lj-type', '');
    expect(pluginmanager.identify(element)).toBe('group');

    var element = document.createTextNode('');
    expect(pluginmanager.identify(element)).toBe('node');
  });

  it('can accept a priority for viewtype', function() {
    var Low = ElementView.extend({}, {
      Model: NodeData,
      identify: function(element) {
        return element.id === 'priority';
      },
      defaultProperties: {
        type: 'low'
      }
    });

    pluginmanager.registerType('low', Low, identifyPriority.low);
    var Normal = ElementView.extend({}, {
      Model: NodeData,
      identify: function(element) {
        return element.id === 'priority';
      },
      defaultProperties: {
        type: 'normal'
      }
    });

    pluginmanager.registerType('normal', Normal, identifyPriority.normal);

    var el = document.createElement('div');
    el.id = 'priority';

    expect(pluginmanager.identify(el)).toBe('normal');
  });
});
