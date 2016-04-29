describe('scrolling', function() {
  var utilities = require('../helpers/utilities.js');

  beforeEach(function() {
    utilities.resizeWindow(800, 600);
  });

  describe('native-scrolling=true', function() {

    it('mouse wheel can reach bottom of frame', function() {
      browser.get('scrolling/native_scrolling.html').then(function() {
        utilities.setStyle('stage', {
          width: '650px',
          height: '650px'
        }).then(function() {
          utilities.resizeWindow(800, 599);
          utilities.scrollDown('layer', 3).then(function() {
            protractor.promise.all([utilities.getBoundingClientRect('layer'),
              utilities.getBoundingClientRect('frame1'),
              utilities.getScroll('layer')
            ]).then(function(data) {
              var layer_dimensions = data[0];
              var frame_dimensions = data[1];
              var layer_scroll = data[2];

              expect(layer_scroll.scrollTop).toBe(frame_dimensions.height - layer_dimensions.height);
            })
          });
        });
      });
    });

    it('mouse wheel can reach right of frame', function() {
      browser.get('scrolling/native_scrolling.html').then(function() {
        utilities.setStyle('stage', {
          width: '450px',
          height: '500px'
        }).then(function() {
          utilities.setAttribute('frame1', 'data-wl-fit-to', 'height').then(function() {
            utilities.resizeWindow(800, 599);
            utilities.scrollRight('layer', 3).then(function() {
              protractor.promise.all([utilities.getBoundingClientRect('layer'),
                utilities.getBoundingClientRect('frame1'),
                utilities.getScroll('layer')
              ]).then(function(data) {
                var layer_dimensions = data[0];
                var frame_dimensions = data[1];
                var layer_scroll = data[2];

                expect(layer_scroll.scrollLeft).toBe(frame_dimensions.width - layer_dimensions.width);
              });
            });
          });
        });
      });
    });

    it('start-position=bottom, test whether the scrollTop and length of scrollable area has been set correctly after transition', function() {
      browser.get('scrolling/native_scrolling.html').then(function() {
        protractor.promise.all([utilities.setStyle('frame2', {
          width: '500px',
          height: '800px'
        }), utilities.setStyle('stage', {
          width: '500px',
          height: '500px'
        })]).then(function() {
          utilities.setAttributes('frame2', {
            'data-wl-start-position': 'bottom',
            'data-wl-fit-to': 'width'
          }).then(function() {
            utilities.resizeWindow(800, 599);
            protractor.promise.all([utilities.getBoundingClientRect('frame1'),
              utilities.getScroll('layer')
            ]).then(function(data) {
              var frame1_dimensions_before = data[0];
              var layer_scroll_before = data[1];
              utilities.transitionTo('layer', 'frame2', {}, 1).then(function() {
                utilities.getBoundingClientRect('frame2').then(function(frame2_dimensions_before) {
                  utilities.wait(3000);
                  protractor.promise.all([
                    utilities.getBoundingClientRect('layer'),
                    utilities.getBoundingClientRect('frame2'),
                    utilities.getScroll('layer'),
                    utilities.getBoundingClientRect('scroller'),
                    utilities.getBoundingClientRect('frame1'),
                  ]).then(function(data) {
                    var layer_dimensions = data[0];
                    var frame2_dimensions_after = data[1];
                    var layer_scroll_after = data[2];
                    var scroller_dimensions = data[3];
                    var frame1_dimensions_after = data[4];

                    //test if new frame1 top matches the old frame1 top.(otherwise the animation would appear diagonal)
                    //expect(frame1_dimensions_before.top).toBe(frame1_dimensions_after.top);
                    // top of frame2 should be the same before and after (otherwise the animation would appear diagonal)
                    expect(frame2_dimensions_before.top).toBe(frame2_dimensions_after.top);
                    // top of frame1 + before scrolltop should be 0
                    expect(frame1_dimensions_before.top).toBe(layer_scroll_before.scrollTop * -1);
                    // top of frame2 + new scrolltop should be 0
                    expect(frame2_dimensions_after.top).toBe(layer_scroll_after.scrollTop * -1);
                    // if frame1 was scrolled down:
                    expect(layer_scroll_before.scrollTop).toBe(frame1_dimensions_before.height - layer_dimensions.height);
                    // if frame1 was scrolled up:
                    expect(layer_scroll_before.scrollTop).toBe(0);
                    // check if the new scrollTop is correct
                    expect(layer_scroll_after.scrollTop).toBe(frame2_dimensions_after.height - layer_dimensions.height);
                    expect(scroller_dimensions.height).toBe(frame2_dimensions_after.height);
                  });
                });
              });
            });
          });
        });
      });
    });

    it('start-position=right, test whether the scrollLeft and length of scrollable area has been set correctly after transition', function() {
      browser.get('scrolling/native_scrolling.html').then(function() {
        protractor.promise.all([utilities.setStyle('frame2', {
          width: '800px',
          height: '500px'
        }), utilities.setStyle('stage', {
          width: '500px',
          height: '500px'
        })]).then(function() {
          utilities.setAttributes('frame2', {
            'data-wl-start-position': 'right',
            'data-wl-fit-to': 'height'
          }).then(function() {
            utilities.setAttributes('frame1', {
              'data-wl-start-position': 'left',
              'data-wl-fit-to': 'height'
            }).then(function() {
              utilities.resizeWindow(800, 599);
              protractor.promise.all([utilities.getBoundingClientRect('frame1'),
                utilities.getScroll('layer')
              ]).then(function(data) {
                var frame1_dimensions_before = data[0];
                var layer_scroll_before = data[1];
                utilities.transitionTo('layer', 'frame2', {}, 1).then(function() {
                  utilities.getBoundingClientRect('frame2').then(function(frame2_dimensions_before) {
                    utilities.wait(3000);
                    protractor.promise.all([
                      utilities.getBoundingClientRect('layer'),
                      utilities.getBoundingClientRect('frame2'),
                      utilities.getScroll('layer'),
                      utilities.getBoundingClientRect('scroller'),
                      utilities.getBoundingClientRect('frame1'),
                    ]).then(function(data) {
                      var layer_dimensions = data[0];
                      var frame2_dimensions_after = data[1];
                      var layer_scroll_after = data[2];
                      var scroller_dimensions = data[3];
                      var frame1_dimensions_after = data[4];
                      //test if new frame1 top matches the old frame1 left.(otherwise the animation would appear diagonal)
                      //expect(frame1_dimensions_before.left).toBe(frame1_dimensions_after.left);
                      // top of frame1 + before scrollLeft should be 0
                      expect(frame1_dimensions_before.left).toBe(layer_scroll_before.scrollLeft * -1);
                      // top of frame2 + new scrollLeft should be 0
                      expect(frame2_dimensions_after.left).toBe(layer_scroll_after.scrollLeft * -1);
                      // if frame1 was scrolled down:
                      expect(layer_scroll_before.scrollLeft).toBe(frame1_dimensions_before.width - layer_dimensions.width);
                      // if frame1 was scrolled up:
                      expect(layer_scroll_before.scrollLeft).toBe(0);
                      // check if the new scrollLeft is correct
                      expect(layer_scroll_after.scrollLeft).toBe(frame2_dimensions_after.width - layer_dimensions.width);
                      expect(scroller_dimensions.width).toBe(frame2_dimensions_after.width);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

  });

  describe('native-scrolling=false', function() {

    it('mouse wheel can reach bottom of frame', function() {
      browser.get('scrolling/non_native_scrolling.html').then(function() {
        protractor.promise.all([
          utilities.setStyle('stage', {
            width: '400px',
            height: '30px'
          }),
          utilities.setStyle('frame1', {
            width: '400px',
            height: '40px'
          })
        ]).then(function() {
          utilities.resizeWindow(800, 599);
          utilities.scrollDown('layer', 4).then(function() {
            protractor.promise.all([utilities.getBoundingClientRect('stage'),
              utilities.getBoundingClientRect('frame1'),
              utilities.getScroll('layer')
            ]).then(function(data) {
              var layer_dimensions = data[0];
              var frame_dimensions = data[1];

              expect(frame_dimensions.top).toBe(layer_dimensions.height - frame_dimensions.height);
            })
          });
        });
      });
    });

    it('mouse wheel can reach right of frame', function() {
      browser.get('scrolling/non_native_scrolling.html').then(function() {
        protractor.promise.all([
          utilities.setStyle('stage', {
            width: '30px',
            height: '400px'
          }),
          utilities.setStyle('frame1', {
            width: '40px',
            height: '400px'
          })
        ]).then(function() {
          utilities.setAttributes("frame1", {
            'data-wl-fit-to': 'height'
          }).then(function() {
            utilities.resizeWindow(800, 599);
            utilities.scrollRight('layer', 4).then(function() {
              protractor.promise.all([utilities.getBoundingClientRect('stage'),
                utilities.getBoundingClientRect('frame1'),
                utilities.getScroll('layer')
              ]).then(function(data) {
                var layer_dimensions = data[0];
                var frame_dimensions = data[1];

                expect(frame_dimensions.top).toBe(layer_dimensions.height - frame_dimensions.height);
              });
            });
          });
        });
      });
    });

    it('start-position=bottom, test whether the scrollTop and length of scrollable area has been set correctly after transition', function() {
      browser.get('scrolling/non_native_scrolling.html').then(function() {
        protractor.promise.all([utilities.setStyle('frame2', {
          width: '500px',
          height: '800px'
        }), utilities.setStyle('stage', {
          width: '500px',
          height: '500px'
        })]).then(function() {
          utilities.setAttributes('frame2', {
            'data-wl-start-position': 'bottom',
            'data-wl-fit-to': 'width'
          }).then(function() {
            utilities.resizeWindow(800, 599);
            utilities.getBoundingClientRect('frame1').then(function(frame1_dimensions_before) {
              utilities.transitionTo('layer', 'frame2', {}, 1).then(function() {
                utilities.getBoundingClientRect('frame2').then(function(frame2_dimensions_before) {
                  utilities.wait(3000);
                  protractor.promise.all([
                    utilities.getBoundingClientRect('stage'),
                    utilities.getBoundingClientRect('frame1'),
                    utilities.getBoundingClientRect('frame2'),
                  ]).then(function(data) {
                    var stage_dimensions = data[0];
                    var frame1_dimensions_after = data[1];
                    var frame2_dimensions_after = data[2];

                    expect(frame1_dimensions_before.top).toBe(frame1_dimensions_after.top);
                    expect(frame1_dimensions_after.left).toBe(stage_dimensions.width * -1);

                    expect(frame2_dimensions_before.top).toBe(frame2_dimensions_after.top);
                    expect(frame2_dimensions_after.top).toBe(stage_dimensions.height - frame2_dimensions_after.height);
                    // because the animation was already in progress, subtract 50
                    expect(frame2_dimensions_before.left).toBeWithinRange(frame1_dimensions_before.left + stage_dimensions.width - 50, frame1_dimensions_before.left + stage_dimensions.width);
                  });
                });
              });
            });
          });
        });
      });
    });

    it('start-position=right, test whether the scrollLeft and length of scrollable area has been set correctly after transition', function() {
      browser.get('scrolling/non_native_scrolling.html').then(function() {
        protractor.promise.all([utilities.setStyle('frame2', {
          width: '800px',
          height: '500px'
        }), utilities.setStyle('stage', {
          width: '500px',
          height: '500px'
        })]).then(function() {
          utilities.setAttributes('frame2', {
            'data-wl-start-position': 'right',
            'data-wl-fit-to': 'height'
          }).then(function() {
            utilities.resizeWindow(800, 599);
            utilities.getBoundingClientRect('frame1').then(function(frame1_dimensions_before) {
              utilities.transitionTo('layer', 'frame2', {}, 1).then(function() {
                utilities.getBoundingClientRect('frame2').then(function(frame2_dimensions_before) {
                  utilities.wait(3000);
                  protractor.promise.all([
                    utilities.getBoundingClientRect('stage'),
                    utilities.getBoundingClientRect('frame1'),
                    utilities.getBoundingClientRect('frame2'),
                  ]).then(function(data) {
                    var stage_dimensions = data[0];
                    var frame1_dimensions_after = data[1];
                    var frame2_dimensions_after = data[2];

                    expect(frame1_dimensions_before.top).toBe(frame1_dimensions_after.top);
                    expect(frame1_dimensions_after.left).toBe(frame2_dimensions_after.width * -1);
                    expect(frame2_dimensions_before.top).toBe(frame2_dimensions_after.top);
                    // because the animation was already in progress, subtract 50
                    expect(frame2_dimensions_before.left).toBeWithinRange(frame1_dimensions_before.left + stage_dimensions.width - 50, frame1_dimensions_before.left + stage_dimensions.width);
                    expect(frame2_dimensions_after.left).toBe(stage_dimensions.width - frame2_dimensions_after.width);
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
