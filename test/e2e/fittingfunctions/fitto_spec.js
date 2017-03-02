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
        expect(frame_dimensions.width).toBe(550);
        expect(frame_scale).toBe(1);
        expect(frame_dimensions.left).toBe(-25);
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
        expect(stage_dimensions.width).toBe(frame_dimensions.width);
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.left).toBe(0);
      });
    });
  });

  it("elastic-width with scale and shiftX - stage larger than the frame", function() {
    browser.get(baseFolder + "fitto_elastic-width-scale_and_shiftX_bigger_stage.html").then(function() {
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
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.left).toBe(0);
      });
    });
  });

  it("elastic-width with scale and shiftX - stage smaller than inner frame", function() {
    browser.get(baseFolder + "fitto_elastic-width-scale_and_shiftX_smaller_stage.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame"),
        utilities.getAttribute("frame", "data-lj-elastic-left"),
        utilities.getAttribute("frame", "data-lj-elastic-right"),
        utilities.getStyle("frame", "width")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];
        var frame_elastic_left = parseFloat(data[4]);
        var frame_elastic_right = parseFloat(data[5]);
        var frame_width_before_change = parseFloat(data[6]);
        var calculated_frame_width = frame_width_before_change / ((frame_width_before_change - (frame_elastic_left + frame_elastic_right))/(stage_dimensions.width)); // (550/((550-(50+50))/350))
     
        expect(frame_dimensions.width).toBeWithinRange((calculated_frame_width - 1), (calculated_frame_width + 1)); 
        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(frame_scale).toBeLessThan(1);
      });
    });
  });

  it("elastic-height with scale and shiftY - stage larger than the frame", function() {
    browser.get(baseFolder + "fitto_elastic-width-scale_and_shiftY_bigger_stage.html").then(function() {
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
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.top).toBe(0);
      });
    });
  });

  it("elastic-height with scale and shiftY - stage smaller than inner frame", function() {
    browser.get(baseFolder + "fitto_elastic-width-scale_and_shiftY_smaller_stage.html").then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect("stage"),
        utilities.getBoundingClientRect("layer"),
        utilities.getBoundingClientRect("frame"),
        utilities.getScale("frame"),
        utilities.getAttribute("frame", "data-lj-elastic-top"),
        utilities.getAttribute("frame", "data-lj-elastic-bottom"),
        utilities.getStyle("frame", "height")
      ]).then(function(data) {
        var stage_dimensions = data[0];
        var layer_dimensions = data[1];
        var frame_dimensions = data[2];
        var frame_scale = data[3];
        var frame_elastic_top = parseFloat(data[4]);
        var frame_elastic_bottom = parseFloat(data[5]);
        var frame_height_before_change = parseFloat(data[6]);
        var calculated_frame_height = frame_height_before_change / ((frame_height_before_change - (frame_elastic_top + frame_elastic_bottom))/(stage_dimensions.height)); // (500/((500-(25+25))/350))

        expect(frame_dimensions.height).toBeWithinRange((calculated_frame_height - 1), (calculated_frame_height + 1)); 
        expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
        expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
        expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
        expect(frame_scale).toBeLessThan(1);
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
        expect(frame_dimensions.height).toBe(550);
        expect(frame_scale).toBe(1);
        expect(frame_dimensions.top).toBe(-25);
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
        expect(stage_dimensions.height).toBe(frame_dimensions.height);
        expect(frame_scale > 1).toBeTruthy();
        expect(frame_dimensions.top).toBe(0);
      });
    });
  });
});
