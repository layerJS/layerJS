var GroupData = require('../../src/framework/groupdata.js');

describe("GroupData", function() {
  it('can be created', function() {
    var c = new GroupData();
    expect(c).not.toBeUndefined();
  });
  it('has default values', function() {
    var c = new GroupData();
    expect(c.attributes.type).toBe("group");
    expect(c.attributes.width).toBeUndefined;
  });
  it('can be initialized with data', function() {
    var data = {
      "type": "group",
      "id": 110528,
      "children": [110530, 110534, 110537, 110533, 110532, 110531]
    };
    var c = new GroupData(data);
    expect(c.attributes.children.length).toBe(6);
  });

  describe("has children", function() {

    var eventIsRaised;
    beforeEach(function() {
      eventIsRaised = false;
    });

    var eventHandler = function(model, value) {
      eventIsRaised = true;
    };

    it("children are initialized", function() {
      var data = {
        children: [110530]
      };
      var c = new GroupData(data);
      expect(c.attributes.children).toBe(data.children);
    });

    it("can add a single child", function() {
      var c = new GroupData();
      c.on("change:children", eventHandler);
      c.addChild(1);
      expect(c.attributes.children).toEqual([1])
      expect(eventIsRaised).toBe(true);
    });

    it("can remove a single child", function() {
      var c = new GroupData({
        children: [1]
      });
      c.on("change:children", eventHandler);
      c.removeChild(1);
      expect(c.attributes.children).toEqual([])
      expect(eventIsRaised).toBe(true);
    });

    it("can add multiple children", function() {
      var childrenToAdd = [1, 2, 3];
      var c = new GroupData();
      c.on("change:children", eventHandler);
      c.addChildren(childrenToAdd);
      expect(c.attributes.children).toEqual(childrenToAdd);
      expect(eventIsRaised).toBe(true);
    });

    it("can remove multiple children", function() {
      var c = new GroupData({
        children: [1, 2, 3]
      });
      c.on("change:children", eventHandler);
      c.removeChildren([2, 3]);
      expect(c.attributes.children).toEqual([1]);
      expect(eventIsRaised).toBe(true);
    });
  });
});
