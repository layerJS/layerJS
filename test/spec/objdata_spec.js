var ObjData = require('../../src/framework/objdata.js');
describe("ObjData", function() {
  it('can be created', function() {
    var c = new ObjData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new ObjData();
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
    var c = new ObjData(data);
    expect(c.attributes.scaleX).toBe(1);
    expect(c.attributes.width).toBe('64px');
  });
});
