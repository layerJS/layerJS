var utilities = require('../helpers/utilities.js');

describe("CanvasLayout", function () {

  describe("Fit to", function () {

    beforeEach(function () {
      // window size can be set
      browser.driver.manage().window().setSize(800, 600);
    });


    function check(sizeType, originalFitTo, reponsiveFitTo) {
      browser.get('canvaslayout/canvaslayoutfitto' + sizeType + '.html').then(function () {
        utilities.setAttributes('main', {
          "data-lj-fit-to": originalFitTo
        }).then(function () {
          // time for the style changes to take effect
          utilities.wait(300).then(function () {
            var frame1 = element(by.id('main'));
            var size = frame1.getCssValue(sizeType);
            utilities.setAttributes('main', {
              "data-lj-fit-to": reponsiveFitTo
            }).then(function () {
              // time for the style changes to take effect
              utilities.wait(300).then(function () {
                expect(frame1.getCssValue(sizeType)).not.toBe(size);

                utilities.setAttributes('main', {
                  "data-lj-fit-to": originalFitTo
                }).then(function () {
                  // time for the style changes to take effect
                  utilities.wait(300).then(function () {
                    expect(frame1.getCssValue(sizeType)).toBe(size);
                  });
                });
              });
            });
          });
        });
      });
    }

    it('will set the orginal width when going from responsive to a non-reponsive fitting', function () {
      check('width', 'width', 'responsive');
      check('width', 'width', 'responsive-width');
    });

    it('will set the orginal height when going from responsive to a non-reponsive fitting', function () {
      check('height', 'width', 'responsive');
      check('height', 'width', 'responsive-height');
    });
  });
});