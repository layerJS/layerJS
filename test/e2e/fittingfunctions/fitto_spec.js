var utilities = require('../helpers/utilities.js');

describe("Fit to", function() {

  var baseFolder = "fittingfunctions/";

  beforeEach(function() {
    // window size can be set
    browser.driver.manage().window().setSize(800, 600);
  });


  it("width", function() {
    browser.get(baseFolder + "fitto_width.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.width).toBe(frame_dimensions.width);
        expect(layer_dimensions.width).toBe(frame_dimensions.width);

        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);

        expect(frame_scale).not.toBe(1);
      });
    });
  });

  it("height", function() {
    browser.get(baseFolder + "fitto_height.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).toBe(frame_dimensions.height);
        expect(layer_dimensions.height).toBe(frame_dimensions.height);

        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);

        expect(frame_scale).not.toBe(1);
      });
    });
  });

  it("fixed", function() {
    browser.get(baseFolder + "fitto_fixed.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(frame_dimensions.width).toBe(1000);
        expect(frame_dimensions.height).toBe(1000);
        expect(frame_scale).toBe(1);

        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);

        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
      });
    });
  });

  it("contain", function() {
    browser.get(baseFolder + "fitto_contain.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(frame_dimensions.height <= stage_dimensions.height).toBeTruthy();
        expect(frame_dimensions.width <= layer_dimensions.width).toBeTruthy();

        expect(frame_scale).not.toBe(1);
      });
    });
  });

  it("cover with X scroller", function() {
    browser.get(baseFolder + "fitto_cover_scrollX.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).toBe(frame_dimensions.height);
        expect(stage_dimensions.height < frame_dimensions.width).toBeTruthy();
        expect(frame_dimensions.width < 1500).toBeTruthy();
        expect(frame_scale).not.toBe(1);
      });
    });
  });

  it("cover with Y scroller", function() {
    browser.get(baseFolder + "fitto_cover_scrollY.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.width).toBe(frame_dimensions.width);
        expect(stage_dimensions.height < frame_dimensions.height).toBeTruthy();
        expect(frame_dimensions.height < 1500).toBeTruthy();
        expect(frame_scale).not.toBe(1);
      });
    });
  });

  it("responsive", function() {
    browser.get(baseFolder + "fitto_responsive.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).toBe(frame_dimensions.height);
        expect(layer_dimensions.height).toBe(frame_dimensions.height);
        expect(stage_dimensions.width).toBe(frame_dimensions.width);
        expect(layer_dimensions.width).toBe(frame_dimensions.width);
        expect(frame_scale).toBe(1);
      });
    });
  });

  it("responsive-width", function() {
    browser.get(baseFolder + "fitto_responsive-width.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
        expect(stage_dimensions.width).toBe(frame_dimensions.width);
        expect(layer_dimensions.width).toBe(frame_dimensions.width);
        expect(frame_dimensions.height).toBe(1000);
        expect(frame_scale).toBe(1);
      });
    });
  });

  it("responsive-height", function() {
    browser.get(baseFolder + "fitto_responsive-height.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).toBe(frame_dimensions.height);
        expect(layer_dimensions.height).toBe(frame_dimensions.height);
        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
        expect(frame_dimensions.width).toBe(1500);
        expect(frame_scale).toBe(1);
      });
    });
  });

  it("elastic-width with shiftX", function() {
    browser.get(baseFolder + "fitto_elastic-width-shiftX.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
        expect(frame_scale).toBe(1);
        expect(frame_dimensions.left).toBeWithinRange(-1, 0);
      });
    });
  });

  it("elastic-width with scale", function() {
    browser.get(baseFolder + "fitto_elastic-width-scale.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
        expect(stage_dimensions.width).toBe(frame_dimensions.width);
        expect(layer_dimensions.width).toBe(frame_dimensions.width);
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.left).toBe(0);
      });
    });
  });

  it("elastic-width with scale and shiftX", function() {
    browser.get(baseFolder + "fitto_elastic-width-scale_and_shiftX.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(frame_dimensions.width).toBe(625);
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.left).toBe(-62.5);
      });
    });
  });

  it("elastic-height with shiftY", function() {
    browser.get(baseFolder + "fitto_elastic-height-shiftY.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
        expect(frame_scale).toBe(1);
        expect(frame_dimensions.top).toBeWithinRange(-1, 0);
      });
    });
  });

  it("elastic-height with scale", function() {
    browser.get(baseFolder + "fitto_elastic-height-scale.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
        expect(stage_dimensions.height).toBe(frame_dimensions.height);
        expect(layer_dimensions.height).toBe(frame_dimensions.height);
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.top).toBe(0);
      });
    });
  });

  it("elastic-height with scale and shiftY", function() {
    browser.get(baseFolder + "fitto_elastic-height-scale_and_shiftY.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];

        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(frame_dimensions.height).toBe(625);
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.top).toBe(-62.5);
      });
    });
  });
});
