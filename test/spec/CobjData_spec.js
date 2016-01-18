var CobjData = require('../../src/framework/cobjdata.js');
var CgroupData = require('../../src/framework/cgroupdata.js');
var FrameData = require('../../src/framework/framedata.js');
var LayerData = require('../../src/framework/layerdata.js');
var StageData = require('../../src/framework/stagedata.js');

describe("CobjData", function() {
  it('can be created', function() {
    var c = new CobjData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new CobjData();
    expect(c.attributes.scaleX).toBe(1);
    expect(c.attributes.width).toBeUndefined;
  });
  it('can be initialized with data', function() {
    var data = {
      "type": "text",
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
      "id": 110534
    };
    var c = new CobjData(data);
    expect(c.attributes.scaleX).toBe(1);
    expect(c.attributes.width).toBe('64px');
  });
});

describe("CgroupData", function() {
  it('can be created', function() {
    var c = new CgroupData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new CgroupData();
    expect(c.attributes.type).toBe("group");
    expect(c.attributes.width).toBeUndefined;
  });
  it('can be initialized with data', function() {
    var data = {
      "type": "group",
      "id": 110528,
      "children": [110530, 110534, 110537, 110533, 110532, 110531]
    };
    var c = new CgroupData(data);
    expect(c.attributes.children.length).toBe(6);
  });
  it('can listen to changes of the children list', function() {
    var data = {
      "type": "group",
      "id": 110528,
      "children": [110530, 110534, 110537, 110533, 110532, 110531]
    };
    var length;
    var changed;
    var cnt = 0;
    var c = new CgroupData(data);
    c.on('change:children', function(model, value) {
      debugger;
      length = value.length;
      var parts=[];
      model.addedChildren && parts.push(model.addedChildren.sort().join(','));
      model.removedChildren && parts.push(model.removedChildren.sort().join(','));
      changed = parts.join(',');
      cnt++;
    })
    c.removeChild(110534);
    expect(c.attributes.children.length).toBe(5);
    expect(length).toBe(5);
    expect(changed).toBe('110534');
    c.addChildren([1, 2, 3])
    expect(c.attributes.children.length).toBe(8);
    expect(length).toBe(8);
    expect(cnt).toBe(2);
    expect(changed).toBe('1,2,3');
  })
});

describe("FrameData", function() {
  it('can be created', function() {
    var c = new FrameData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new FrameData();
    expect(c.attributes.scaleX).toBe(1);
    expect(c.attributes.width).toBeUndefined;
  });
  it('can be initialized with data', function() {
    var data = {
      "type": "frame",
      "children": [110530, 110534, 110537, 110533, 110532, 110531]
    };
    var c = new CobjData(data);
    expect(c.attributes.type).toBe('frame');
    expect(c.attributes.children.length).toBe(6);
  });
});

describe("LayerData", function() {
  it('can be created', function() {
    var c = new LayerData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new LayerData();
    expect(c.attributes.scaleX).toBe(1);
    expect(c.attributes.width).toBeUndefined;
  });
  it('can be initialized with data', function() {
    var data = {
      "type": "layer",
      "children": [110530, 110534, 110537, 110533, 110532, 110531]
    };
    var c = new CobjData(data);
    expect(c.attributes.type).toBe('layer');
    expect(c.attributes.children.length).toBe(6);
  });
});

describe("StageData", function() {
  it('can be created', function() {
    var c = new StageData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new StageData();
    expect(c.attributes.scaleX).toBe(1);
    expect(c.attributes.width).toBeUndefined;
  });
  it('can be initialized with data', function() {
    var data = {
      "type": "stage",
      "children": [110530, 110534, 110537, 110533, 110532, 110531]
    };
    var c = new CobjData(data);
    expect(c.attributes.type).toBe('stage');
    expect(c.attributes.children.length).toBe(6);
  });
});
