var utilities = require('../helpers/utilities.js');

describe('timer', function() {

  utilities.resizeWindow(800, 600);

  it('timer will automatically advance', function() {
    browser.get('delay/timer.html').then(function() {
      utilities.wait(300); // time for loading everything
      expect(utilities.getCurrentFrame('layer')).toBe('frame1');
      utilities.wait(1500); // time for loading everything NOTE: these timings are just guesswork and might fail on different computers
      expect(utilities.getCurrentFrame('layer')).toBe('frame2');
      utilities.wait(1000); // time for loading everything
      expect(utilities.getCurrentFrame('layer')).toBe('frame3');
    });
  });
  it('timer will automatically advance', function() {
    browser.get('delay/timer.html').then(function() {
      expect(utilities.getCurrentFrame('layer')).toBe('frame1');
      utilities.setAttribute('layer','lj-timer','#!prev&d=1s');
      utilities.wait(1500); // time for loading everything NOTE: these timings are just guesswork and might fail on different computers
      expect(utilities.getCurrentFrame('layer')).toBe('frame3');
      utilities.wait(1000); // time for loading everything
      expect(utilities.getCurrentFrame('layer')).toBe('frame2');
    });
  });
});
