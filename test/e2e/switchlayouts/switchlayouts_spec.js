var utilities = require('../helpers/utilities.js');

describe("Switch layout", function() {

  beforeEach(function() {
    // window size can be set
    utilities.resizeWindow(800, 600);
  });

  it('can switch from canvaslayout to slidelayout', function() {
    browser.get('switchlayouts/canvaslayout.html').then(function() {
      utilities.wait(1000).then(function() {
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth'));

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('block');
        expect(f3.getCssValue('display')).toBe('block');

        utilities.setLayout('layer1', 'slide').then(function(result) {
          protractor.promise.all([
            f1.getCssValue('display'),
            f2.getCssValue('display'),
            f3.getCssValue('display'),
          ]).then(function(data) {
            var f1_display = data[0];
            var f2_display = data[1];
            var f3_display = data[2];

            expect(f1_display).toBe('block');
            expect(f2_display).toBe('none');
            expect(f3_display).toBe('none');
          });
        });
      });
    });
  });

  it('can switch from slidelayout to canvaslayout', function() {
    browser.get('switchlayouts/slidelayout.html').then(function() {
      utilities.wait(1000).then(function() {
        var f1 = element(by.id('main'));
        var f2 = element(by.id('second'));
        var f3 = element(by.id('thirth'));

        expect(f1.getCssValue('display')).toBe('block');
        expect(f2.getCssValue('display')).toBe('none');
        expect(f3.getCssValue('display')).toBe('none');

        utilities.setLayout('layer1', 'canvas').then(function(result) {
          protractor.promise.all([
            f1.getCssValue('display'),
            f2.getCssValue('display'),
            f3.getCssValue('display'),
          ]).then(function(data) {
            var f1_display = data[0];
            var f2_display = data[1];
            var f3_display = data[2];

            expect(f1_display).toBe('block');
            expect(f2_display).toBe('block');
            expect(f3_display).toBe('block');
          });
        });
      });
    });
  });

});
