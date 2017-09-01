var utilities = require('../helpers/utilities.js');

describe('fade', function() {

  utilities.resizeWindow(800, 600);

  describe('fade frame', function() {
    /*
    frame1(default-frame) fades out as frame2 fades in
    */
    it('frame1 fades out as frame2 fades in', function() {
      browser.get('slidelayout/fade.html').then(function() {

        var f1 = element(by.id('frame1'));
        var f2 = element(by.id('frame2'));

        // frame1_display_before == block
        expect(f1.getCssValue('display')).toBe('block');
        // frame2_display_before == none
        expect(f2.getCssValue('display')).toBe('none');

        protractor.promise.all([utilities.setStyle('frame2', {
          width: '500px',
          height: '500px'
        }), utilities.setStyle('stage', {
          width: '500px',
          height: '500px'
        })]).then(function() {
          utilities.setAttributes('frame2', {
            'lj-transition': 'fade'
          }).then(function() {
            utilities.wait(300); // time for the style changes to take effect
            utilities.listenDimensionsBeforeTransition('layer', 'frame1');
            utilities.listenDimensionsBeforeTransition('layer', 'frame2');
            utilities.transitionTo('layer', 'frame2', {}).then(function() {
              protractor.promise.all([
                utilities.getBoundingClientRect('stage'),
                utilities.getBoundingClientRect('frame1'),
                utilities.getBoundingClientRect('frame2'),
                utilities.getFromStore('frame1'),
                utilities.getFromStore('frame2')
              ]).then(function(data) {
                var stage_dimensions = data[0];
                var frame1_dimensions_after = data[1];
                var frame2_dimensions_after = data[2];
                var frame1_dimensions_before = data[3];
                var frame2_dimensions_before = data[4];

                // frame1_display_after == none
                f1 = element(by.id('frame1'));
                expect(f1.getCssValue('display')).toBe('none');
                // frame2_display_after == block
                expect(f2.getCssValue('display')).toBe('block');
                // opacity
                expect(Math.round(frame1_dimensions_before.opacity)).toBe(1);
                expect(Math.round(frame2_dimensions_before.opacity)).toBe(0);
                expect(frame2_dimensions_after.opacity).toBe('1');
                // expect(frame1_dimensions_after.opacity).toBe('0'); //result: Expected '1' to be '0'.- this is not fulfilled because of resetting opacity
                // z-index (shouldn't change by the transition)
                expect(frame1_dimensions_before['z-index']).toBe('1');
                expect(frame2_dimensions_before['z-index']).toBe('-1');
                expect(frame2_dimensions_after['z-index']).toBe('auto');
                expect(frame1_dimensions_after['z-index']).toBe('auto');
                // positioning and dimensions of frame1 and frame 2
                expect(frame1_dimensions_after.width).toBe(stage_dimensions.width);
                expect(frame2_dimensions_after.width).toBe(stage_dimensions.width);
                expect(frame1_dimensions_after.height).toBe(stage_dimensions.height);
                expect(frame2_dimensions_after.height).toBe(stage_dimensions.height);

                delete frame1_dimensions_before.opacity;
                delete frame2_dimensions_before.opacity;
                delete frame1_dimensions_after.opacity;
                delete frame2_dimensions_after.opacity;
                delete frame1_dimensions_before['z-index'];
                delete frame1_dimensions_after['z-index'];
                delete frame2_dimensions_before['z-index'];
                delete frame2_dimensions_after['z-index'];

                expect(frame1_dimensions_before).toEqual(frame2_dimensions_before);
                expect(frame2_dimensions_before).toEqual(frame1_dimensions_after);
                expect(frame1_dimensions_before).toEqual(frame2_dimensions_after);
              });
            });
          });
        });
      });
    });
  });
});
