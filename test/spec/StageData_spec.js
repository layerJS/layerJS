var StageData = require('../../src/framework/stagedata.js');

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
    var c = new StageData(data);
    expect(c.attributes.type).toBe('stage');
    expect(c.attributes.children).toEqual(data.children);
  });
});
