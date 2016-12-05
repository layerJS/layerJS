var pluginmanager = require('../../src/framework/pluginmanager.js');
var BaseView = require('../../src/framework/baseview.js');
var defaults = require('../../src/framework/defaults.js');
var utilities = require("./helpers/utilities.js");

describe('PluginManager', function() {

  var pluginmanagerMap;

  it('can be initialized', function() {
    expect(pluginmanager).toBeDefined();
  });

  it('can create view objects', function() {
    var v = pluginmanager.createView('stage', {
      el: utilities.appendChildHTML(require('./htmlelements/simple_stage_1.js'))
    });
    expect(v).toBeDefined();
  });

  it('can register and create new types of View objects', function() {
    var NV = BaseView.extend({}, {
      identify: function(element) {
        return false;
      }
    }); // Note this is the wrong model data type but that shouldn't be a problem


    pluginmanager.registerType('heinz', NV, defaults.identifyPriority.low);
    var v = pluginmanager.createView('heinz', {
      el: utilities.appendChildHTML('<div lj-type="heinz" data-lj-name="name"></div>')
    });

    expect(v instanceof NV).toBe(true);
    expect(v.innerEl._ljView).toBe(v);

    delete pluginmanager.map.heinz;
  });

  it('can identify an element\'s viewtype', function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'stage');
    expect(pluginmanager.identify(element)).toBe('stage');
  });

  it('can accept a priority for viewtype', function() {
    var Low = BaseView.extend({}, {
      identify: function(element) {
        return element.id === 'priority';
      },
      defaultProperties: {
        type: 'low'
      }
    });

    pluginmanager.registerType('low', Low, defaults.identifyPriority.low);
    var Normal = BaseView.extend({}, {
      identify: function(element) {
        return element.id === 'priority';
      },
      defaultProperties: {
        type: 'normal'
      }
    });

    pluginmanager.registerType('normal', Normal, defaults.identifyPriority.normal);

    var el = document.createElement('div');
    el.id = 'priority';

    expect(pluginmanager.identify(el)).toBe('normal');
  });
});
