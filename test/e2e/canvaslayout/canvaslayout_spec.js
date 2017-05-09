var utilities = require('../helpers/utilities.js');

describe("CanvasLayout", function() {

  beforeEach(function() {
    // window size can be set
    browser.driver.manage().window().setSize(800, 600);
  });

  /*
    function sin(x) {
      return Math.sin(x / 180 * Math.PI);
    }

    function cos(x) {
      return Math.cos(x / 180 * Math.PI);
    }

    function rotate(x, y, a) {
      var x2 = cos(a) * x - sin(a) * y;
      var y2 = sin(a) * x + cos(a) * y;
      return [x2, y2];
    }*/

  it('will transition to a frame and will apply a transform on all frames within the layer (1)', function() {
    browser.get('canvasLayout/canvaslayout.html').then(function() {
      browser.sleep(3000).then(function() {
        var stage = element(by.id('root'));
        var layer1 = element(by.id('layer1'));
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth')); //should be "third"

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('block');
        expect(f3.getCssValue('display')).toBe('block');

        utilities.transitionTo('layer1', 'second', {}).then(function() {

          protractor.promise.all([
            utilities.getBoundingClientRect('root'),
            f1.getCssValue('display'),
            utilities.getBoundingClientRect('main'),
            utilities.getScale('main'),
            utilities.getRotation('main'),
            f2.getCssValue('display'),
            utilities.getBoundingClientRect('second'),
            utilities.getScale('second'),
            utilities.getRotation('second'),
            f3.getCssValue('display'),
            utilities.getBoundingClientRect('thirth'),
            utilities.getScale('thirth'),
            utilities.getRotation('thirth')
          ]).then(function(data) {

            var stage_dimensions = data[0];
            var f1_display = data[1];
            var f1_dimensions = data[2];
            var f1_scale = data[3];
            var f1_rotation = data[4];
            var f2_display = data[5];
            var f2_dimensions = data[6];
            var f2_scale = data[7];
            var f2_rotation = data[8];
            var f3_display = data[9];
            var f3_dimensions = data[10];
            var f3_scale = data[11];
            var f3_rotation = data[12];

            expect(f1_display).toBe('block');
            expect(f2_display).toBe('block');
            expect(f3_display).toBe('block');
            expect(stage_dimensions.width).toBe(f2_dimensions.width);
            expect(f1_dimensions.left).toBeWithinRange(-278, -272);
            expect(f1_dimensions.top).toBeWithinRange(-56, -54);
            expect(f1_scale).toBeWithinRange(0.544, 0.556);
            expect(f1_rotation).toBe(0);
            expect(f2_dimensions.left).toBeWithinRange(0, 0.5);
            expect(f2_dimensions.top).toBeWithinRange(0, 0.5);
            expect(f2_scale).toBeWithinRange(0.544, 0.556);
            expect(f2_rotation).toBe(0);
            expect(f3_dimensions.left).toBeWithinRange(-97, -93);
            expect(f3_dimensions.top).toBeWithinRange(-50, -49);
            expect(f3_scale).toBeWithinRange(0.272, 0.278);
            expect(f3_rotation).toBe(30);
          });
        });
      });
    });
  });

  it('will transition to a frame and will apply a transform on all frames within the layer (2)', function() {
    browser.get('canvasLayout/canvaslayout.html').then(function() {
      browser.sleep(3000).then(function() {
        var stage = element(by.id('root'));
        var layer1 = element(by.id('layer1'));
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth'));

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('block');
        expect(f3.getCssValue('display')).toBe('block');

        utilities.transitionTo('layer1', 'thirth', {}).then(function() {

          protractor.promise.all([
            utilities.getBoundingClientRect('root'),
            f1.getCssValue('display'),
            utilities.getBoundingClientRect('main'),
            utilities.getScale('main'),
            utilities.getRotation('main'),
            f2.getCssValue('display'),
            utilities.getBoundingClientRect('second'),
            utilities.getScale('second'),
            utilities.getRotation('second'),
            f3.getCssValue('display'),
            utilities.getBoundingClientRect('thirth'),
            utilities.getScale('thirth'),
            utilities.getRotation('thirth')
          ]).then(function(data) {

            var stage_dimensions = data[0];
            var f1_display = data[1];
            var f1_dimensions = data[2];
            var f1_scale = data[3];
            var f1_rotation = data[4];
            var f2_display = data[5];
            var f2_dimensions = data[6];
            var f2_scale = data[7];
            var f2_rotation = data[8];
            var f3_display = data[9];
            var f3_dimensions = data[10];
            var f3_scale = data[11];
            var f3_rotation = data[12];

            expect(f1_display).toBe('block');
            expect(f2_display).toBe('block');
            expect(f3_display).toBe('block');
            expect(stage_dimensions.width).toBe(f3_dimensions.width);
            expect(f1_dimensions.left).toBeWithinRange(-344, -334);
            expect(f1_dimensions.top).toBeWithinRange(-66, -62);
            expect(f1_scale).toBeWithinRange(1.088, 1.112);
            expect(f1_rotation).toBe(-30);
            expect(f2_dimensions.left).toBeWithinRange(186, 196);
            expect(f2_dimensions.top).toBeWithinRange(-798, -780);
            expect(f2_scale).toBeWithinRange(1.088, 1.112);
            expect(f2_rotation).toBe(-30);
            expect(f3_dimensions.left).toBeWithinRange(-0.5, 0);
            expect(f3_dimensions.top).toBeWithinRange(0, 0.5);
            expect(f3_scale).toBeWithinRange(0.544, 0.556);
            expect(f3_rotation).toBe(0);
          });
        });
      });
    });
  });

  it('a transition to a null frame will fade out all frames within the layer', function() {
    browser.get('canvasLayout/canvaslayout.html').then(function() {
      browser.sleep(3000).then(function() {
        var stage = element(by.id('root'));
        var layer1 = element(by.id('layer1'));
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth'));

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('block');
        expect(f3.getCssValue('display')).toBe('block');

        utilities.transitionTo('layer1', null, {}).then(function() {
          protractor.promise.all([
            f1.getCssValue('opacity'),
            f2.getCssValue('opacity'),
            f3.getCssValue('opacity'),
          ]).then(function(data) {
            var f1_opacity = data[0];
            var f2_opacity = data[1];
            var f3_opacity = data[2];

            expect(f1_opacity).toBe('0');
            expect(f2_opacity).toBe('0');
            expect(f3_opacity).toBe('0');
          });
        });
      });
    });
  });

  it('can load a null frame directly', function() {
    browser.get('canvasLayout/canvaslayout.html').then(function() {
      browser.sleep(3000).then(function() {
        var stage = element(by.id('root'));
        var layer1 = element(by.id('layer1'));
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth'));

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('block');
        expect(f3.getCssValue('display')).toBe('block');

        utilities.showFrame('layer1', null, {}).then(function() {
          protractor.promise.all([
            f1.getCssValue('opacity'),
            f2.getCssValue('opacity'),
            f3.getCssValue('opacity'),
          ]).then(function(data) {
            var f1_opacity = data[0];
            var f2_opacity = data[1];
            var f3_opacity = data[2];

            expect(f1_opacity).toBe('0');
            expect(f2_opacity).toBe('0');
            expect(f3_opacity).toBe('0');
          });
        });
      });
    });
  });

  it('will transition from a null frame will fade in all frames within the layer', function() {
    browser.get('canvasLayout/canvaslayout.html').then(function() {
      browser.sleep(3000).then(function() {
        var stage = element(by.id('root'));
        var layer1 = element(by.id('layer1'));
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth'));

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('block');
        expect(f3.getCssValue('display')).toBe('block');

        utilities.transitionTo('layer1', null, {}).then(function() {
          utilities.transitionTo('layer1', 'thirth', {}).then(function() {
            protractor.promise.all([
              utilities.getBoundingClientRect('root'),
              f1.getCssValue('display'),
              utilities.getBoundingClientRect('main'),
              utilities.getScale('main'),
              utilities.getRotation('main'),
              f2.getCssValue('display'),
              utilities.getBoundingClientRect('second'),
              utilities.getScale('second'),
              utilities.getRotation('second'),
              f3.getCssValue('display'),
              utilities.getBoundingClientRect('thirth'),
              utilities.getScale('thirth'),
              utilities.getRotation('thirth'),
              f1.getCssValue('opacity'),
              f2.getCssValue('opacity'),
              f3.getCssValue('opacity')
            ]).then(function(data) {

              var stage_dimensions = data[0];
              var f1_display = data[1];
              var f1_dimensions = data[2];
              var f1_scale = data[3];
              var f1_rotation = data[4];
              var f2_display = data[5];
              var f2_dimensions = data[6];
              var f2_scale = data[7];
              var f2_rotation = data[8];
              var f3_display = data[9];
              var f3_dimensions = data[10];
              var f3_scale = data[11];
              var f3_rotation = data[12];
              var f1_opacity = data[13];
              var f2_opacity = data[14];
              var f3_opacity = data[15];

              expect(f1_display).toBe('block');
              expect(f2_display).toBe('block');
              expect(f3_display).toBe('block');
              expect(stage_dimensions.width).toBe(f3_dimensions.width);
              expect(f1_dimensions.left).toBeWithinRange(-344, -334);
              expect(f1_dimensions.top).toBeWithinRange(-66, -62);
              expect(f1_scale).toBeWithinRange(1.088, 1.112);
              expect(f1_rotation).toBe(-30);
              expect(f1_opacity).toBe('1');
              expect(f2_dimensions.left).toBeWithinRange(186, 196);
              expect(f2_dimensions.top).toBeWithinRange(-798, -780);
              expect(f2_scale).toBeWithinRange(1.088, 1.112);
              expect(f2_rotation).toBe(-30);
              expect(f2_opacity).toBe('1');
              expect(f3_dimensions.left).toBeWithinRange(-0.5, 0);
              expect(f3_dimensions.top).toBeWithinRange(0, 0.5);
              expect(f3_scale).toBeWithinRange(0.544, 0.556);
              expect(f3_rotation).toBe(0);
              expect(f3_opacity).toBe('1');
            });
          });
        });
      });
    });
  });

});
