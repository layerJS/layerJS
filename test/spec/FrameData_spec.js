var FrameData = require('../../src/framework/framedata.js');

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
    var c = new FrameData(data);
    expect(c.attributes.type).toBe('frame');
    expect(c.attributes.children).toEqual(data.children);
  });
});
