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

  it('will transition to a frame and will apply a transform on all frames within the layer', function() {
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

        utilities.transitionTo('layer1', 'second', {}).then(function() {

          protractor.promise.all([
            utilities.getBoundingClientRect('root'),
            f1.getCssValue('display'),
            utilities.getBoundingClientRect('main'),
            utilities.getScale('main'),
            f2.getCssValue('display'),
            utilities.getBoundingClientRect('second'),
            utilities.getScale('second'),
            f3.getCssValue('display'),
            utilities.getBoundingClientRect('thirth'),
            utilities.getScale('thirth')
          ]).then(function(data) {

            var stage_dimensions = data[0];
            var f1_display = data[1];
            var f1_dimensions = data[2];
            var f1_scale = data[3];
            var f2_display = data[4];
            var f2_dimensions = data[5];
            var f2_scale = data[6];
            var f3_display = data[7];
            var f3_dimensions = data[8];
            var f3_scale = data[9];

            expect(f1_display).toBe('block');
            expect(f2_display).toBe('block');
            expect(f3_display).toBe('block');
            expect(stage_dimensions.width).toBe(f2_dimensions.width);
            expect(f1_dimensions.left.toFixed(0)).toBe('-272');
            expect(f1_dimensions.top.toFixed(0)).toBe('-54');
            expect(f1_scale.toFixed(4)).toBe('0.5444');
            expect(f2_dimensions.left.toFixed(0)).toBe('0');
            expect(f2_dimensions.top.toFixed(0)).toBe('0');
            expect(f2_scale.toFixed(4)).toBe('0.5444');
            expect(f3_dimensions.left.toFixed(0)).toBe('-94');
            expect(f3_dimensions.top.toFixed(0)).toBe('-49');
            expect(f3_scale.toFixed(4)).toBe('0.2722');
          });
        });
      });
    });
  });

  it('will transition to a frame and will apply a transform on all frames within the layer', function() {
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
            f2.getCssValue('display'),
            utilities.getBoundingClientRect('second'),
            utilities.getScale('second'),
            f3.getCssValue('display'),
            utilities.getBoundingClientRect('thirth'),
            utilities.getScale('thirth')
          ]).then(function(data) {

            var stage_dimensions = data[0];
            var f1_display = data[1];
            var f1_dimensions = data[2];
            var f1_scale = data[3];
            var f2_display = data[4];
            var f2_dimensions = data[5];
            var f2_scale = data[6];
            var f3_display = data[7];
            var f3_dimensions = data[8];
            var f3_scale = data[9];


            expect(f1_display).toBe('block');
            expect(f2_display).toBe('block');
            expect(f3_display).toBe('block');
            //expect(stage_dimensions.width).toBe(f2_dimensions.width);
            expect(f1_dimensions.left.toFixed(0)).toBe('-168');
            expect(f1_dimensions.top.toFixed(0)).toBe('-32');
            expect(f1_scale.toFixed(4)).toBe('0.5444');
            expect(f2_dimensions.left.toFixed(0)).toBe('95');
            expect(f2_dimensions.top.toFixed(0)).toBe( '-390');
            expect(f2_scale.toFixed(4)).toBe('0.5444');
            expect(f3_dimensions.left.toFixed(0)).toBe('-0');
            expect(f3_dimensions.top.toFixed(0)).toBe('0');
            expect(f3_scale.toFixed(4)).toBe('0.2722');
          });
        });
      });
    });
  });
});
