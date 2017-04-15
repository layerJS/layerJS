var utilities = require('../helpers/utilities.js');

describe('stage', function() {

  beforeEach(function() {
    utilities.resizeWindow(800, 600);
  });

  describe('auto-height', function() {

    it('will set the height of the stage equal to the height of the current frame', function() {
      browser.get('stage_autolength/autoheight.html').then(function() {
        utilities.transitionTo('layer', 'frame2', {
          duration: '1s'
        }).then(function() {
          utilities.wait(1000);
          protractor.promise.all([utilities.getBoundingClientRect('stage'),
          utilities.getBoundingClientRect('frame2')]).then(function(result) {
            expect(result[0].height).toBe(result[1].height);
          });
        });
      });
    });

    it('will set the height of the stage to 0 if the current frame is a !none frame', function() {
      browser.get('stage_autolength/autoheight.html').then(function() {
        utilities.transitionTo('layer', '!none', {
          duration: '1s'
        }).then(function() {
          utilities.wait(1000);
          utilities.getBoundingClientRect('stage').then(function(result) {
            expect(result.height).toBe(0);
          });
        });
      });
    });
  });


  describe('autoWidth', function() {

    beforeEach(function() {
      utilities.resizeWindow(800, 500);
    });

    it('will set the width of the stage equal to the height of the current frame', function() {
      browser.get('stage_autolength/autoheight.html').then(function() {
        utilities.transitionTo('layer', 'frame2', {
          duration: '1s'
        }).then(function() {
          utilities.wait(1000);
          protractor.promise.all([utilities.getBoundingClientRect('stage'),
          utilities.getBoundingClientRect('frame2')]).then(function(result) {
            expect(result[0].width).toBe(result[1].width);
          });
        });
      });
    });

    it('will set the width of the stage to 0 if the current frame is a !none frame', function() {
      browser.get('stage_autolength/autoheight.html').then(function() {
        utilities.transitionTo('layer', '!none', {
          duration: '1s'
        }).then(function() {
          utilities.wait(1000);
          utilities.getBoundingClientRect('stage').then(function(result) {
            console.log(result);
            expect(result.width).toBe(0);
          });
        });
      });
    });
  });
});
