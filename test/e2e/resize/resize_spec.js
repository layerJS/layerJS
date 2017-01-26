describe('resize', function() {

  var utilities = require('../helpers/utilities.js');

  beforeEach(function() {
    utilities.resizeWindow(500, 500);
  });

  function frameHasSameWidth(stage_dimensions, layer_dimensions, frame_dimensions) {
    expect(frame_dimensions.width).toBe(stage_dimensions.width);
    expect(frame_dimensions.width).toBe(layer_dimensions.width);
  }

  function frameHasSameHeight(stage_dimensions, layer_dimensions, frame_dimensions) {
    expect(frame_dimensions.height).toBe(stage_dimensions.height);
    expect(frame_dimensions.height).toBe(layer_dimensions.height);
  }

  it('frame will adapt it\'s width on a resize', function() {
    browser.get('resize/resize.html').then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect('stage'),
        utilities.getBoundingClientRect('layer'),
        utilities.getBoundingClientRect('frame'),
      ]).then(function(data) {
        frameHasSameWidth(data[0], data[1], data[2]);
        utilities.resizeWindow(700, 700);
        protractor.promise.all([
          utilities.getBoundingClientRect('stage'),
          utilities.getBoundingClientRect('layer'),
          utilities.getBoundingClientRect('frame'),
        ]).then(function(data) {
          frameHasSameWidth(data[0], data[1], data[2]);
        });
      });
    });
  });

  it('frame will adapt it\'s height on a resize', function() {
    browser.get('resize/resize.html').then(function() {
      utilities.setAttribute('frame', 'data-lj-fit-to', 'height').then(function() {
        utilities.resizeWindow(700, 700);
        protractor.promise.all([
          utilities.getBoundingClientRect('stage'),
          utilities.getBoundingClientRect('layer'),
          utilities.getBoundingClientRect('frame'),
        ]).then(function(data) {
          frameHasSameHeight(data[0], data[1], data[2]);
          utilities.resizeWindow(500, 500);
          protractor.promise.all([
            utilities.getBoundingClientRect('stage'),
            utilities.getBoundingClientRect('layer'),
            utilities.getBoundingClientRect('frame'),
          ]).then(function(data) {
            frameHasSameHeight(data[0], data[1], data[2]);
          });
        });
      });
    });
  });

  it('frame will keeps its vertical scroll position on a resize', function() {
    browser.get('resize/resize.html').then(function() {
      utilities.resizeWindow(600, 400);
      utilities.scrollDown('layer', 10).then(function() {
        utilities.resizeWindow(500, 400);
        utilities.getScroll('layer').then(function(layer_scroll) {
          expect(layer_scroll.scrollTop).not.toBe(0);
        });
      });
    });
  });

  // refactoring: add test that will detect a change in the fit-to attribute.

  it('frame will keeps its horizontal scroll position on a resize', function() {
    browser.get('resize/resize.html').then(function() {
      utilities.setAttributes('frame', {
        'data-lj-fit-to': 'height',
        'data-lj-start-position': 'left'
      }).then(function() {
        utilities.resizeWindow(400, 600); // refactor: should be removed
        utilities.scrollRight('layer', 1).then(function() {
          utilities.resizeWindow(400, 500);
          utilities.getScroll('layer').then(function(layer_scroll) {
            expect(layer_scroll.scrollLeft).not.toBe(0);
          });
        });
      });
    });
  });

  it('frame will adapt it\'s width when a large element is added', function() {
    browser.get('resize/resize.html').then(function() {
      protractor.promise.all([
        utilities.getBoundingClientRect('stage'),
        utilities.getBoundingClientRect('layer'),
        utilities.getBoundingClientRect('frame'),
      ]).then(function(data) {
        frameHasSameWidth(data[0], data[1], data[2]);
        utilities.addElement('frame', '<div style="width:1000px;height:1px;"></div>').then(function() {
          utilities.wait(100);
          protractor.promise.all([
            utilities.getBoundingClientRect('stage'),
            utilities.getBoundingClientRect('layer'),
            utilities.getBoundingClientRect('frame'),
          ]).then(function(data) {
            frameHasSameWidth(data[0], data[1], data[2]);
          });
        });
      });
    });
  });

  it('frame will adapt it\'s height when a large element is added', function() {
    browser.get('resize/resize.html').then(function() {
      utilities.setAttributes('frame', {
        'data-lj-fit-to': 'height',
        'data-lj-start-position': 'left'
      }).then(function() {
        utilities.resizeWindow(400, 400); // temporary fix, when attributes change, frame should be redraw
        protractor.promise.all([
          utilities.getBoundingClientRect('stage'),
          utilities.getBoundingClientRect('layer'),
          utilities.getBoundingClientRect('frame'),
        ]).then(function(data) {
          frameHasSameHeight(data[0], data[1], data[2]);
          utilities.addElement('frame', '<div style="width:1px;height:1000px;"></div>').then(function() {
            utilities.wait(100);
            protractor.promise.all([
              utilities.getBoundingClientRect('stage'),
              utilities.getBoundingClientRect('layer'),
              utilities.getBoundingClientRect('frame'),
            ]).then(function(data) {
              frameHasSameHeight(data[0], data[1], data[2]);
            });
          });
        });
      });
    });
  });

});
