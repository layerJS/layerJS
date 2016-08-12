describe("NodeData", function() {

  var NodeData, ElementView;

  beforeEach(function() {
    NodeData = require('../../src/framework/nodedata.js');
    ElementView = require('../../src/framework/elementview.js');
  });

  it('can be created', function() {
    var nodeData = new NodeData();
    expect(nodeData).not.toBeUndefined();
  });

  it('has default values', function() {
    var nodeData = new NodeData(ElementView);
    expect(nodeData.attributes.scaleX).toBe(1);
    expect(nodeData.attributes.width).toBeUndefined;
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
    var nodeData = new NodeData(data);

    for (var property in data) {
      expect(nodeData.attributes.hasOwnProperty(property)).toBeTruthy();
      expect(nodeData.attributes[property]).toEqual(data[property]);
    }
  });

  describe("can have children", function() {

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
      var nodeData = new NodeData(data);
      expect(nodeData.attributes.children).toEqual(data.children);
    });

    it("can add a single child", function() {
      var nodeData = new NodeData({
        children: []
      });
      nodeData.on("change:children", eventHandler);
      nodeData.addChild(1);
      expect(nodeData.attributes.children).toEqual([1])
      expect(eventIsRaised).toBe(true);
    });

    it("can remove a single child", function() {
      var nodeData = new NodeData({
        children: [1]
      });
      nodeData.on("change:children", eventHandler);
      nodeData.removeChild(1);
      expect(nodeData.attributes.children).toEqual([])
      expect(eventIsRaised).toBe(true);
    });

    it("can add multiple children", function() {
      var childrenToAdd = [1, 2, 3];
      var nodeData = new NodeData({
        children: []
      });
      nodeData.on("change:children", eventHandler);
      nodeData.addChildren(childrenToAdd);
      expect(nodeData.attributes.children).toEqual(childrenToAdd);
      expect(eventIsRaised).toBe(true);
    });

    it("can remove multiple children", function() {
      var nodeData = new NodeData({
        children: [1, 2, 3]
      });
      nodeData.on("change:children", eventHandler);
      nodeData.removeChildren([2, 3]);
      expect(nodeData.attributes.children).toEqual([1]);
      expect(eventIsRaised).toBe(true);
    });
  });

});
