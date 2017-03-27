var utilities = require('../helpers/utilities.js');

describe('delay', function() {

  utilities.resizeWindow(800, 600);

  it('trigger delayed transition', function() {
    browser.get('delay/delay.html').then(function() {
      utilities.wait(300); // time for loading everything
      utilities.getBoundingClientRect('stage').then(function(stage_dimensions) {
        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
        utilities.transitionTo('layer', 'frame2', {
          delay: '1s',
          duration: "500ms",
          type: "left"
        }, 1).then(function() {
          utilities.wait(500); // wait. there should be no transition in that time
          protractor.promise.all([
            utilities.getBoundingClientRect('frame1'),
            utilities.getBoundingClientRect('frame2'),
            utilities.getStyle('frame2', 'display')
          ]).then(function(data) {
            var frame1_dimensions_between = data[0],
              frame2_dimensions_between = data[1],
              frame2_display = data[2];
            expect(frame1_dimensions_between.width).toEqual(stage_dimensions.width);
            expect(frame1_dimensions_between.top).toEqual(stage_dimensions.top);
            expect(frame1_dimensions_between.left).toEqual(stage_dimensions.left);
            expect(frame2_display).toBe('none');

            // now wait for the actual transition
            utilities.listenDimensionsBeforeTransition('layer', 'frame1');
            utilities.listenDimensionsBeforeTransition('layer', 'frame2');
            utilities.wait(1100); // wait. there should be no transition in that time
            protractor.promise.all([
              utilities.getBoundingClientRect('frame1'),
              utilities.getBoundingClientRect('frame2'),
              utilities.getFromStore('frame1'),
              utilities.getFromStore('frame2')
            ]).then(function(data) {
              var frame1_dimensions_after = data[0],
                frame2_dimensions_after = data[1],
                frame1_dimensions_before = data[2],
                frame2_dimensions_before = data[3];
              expect(frame1_dimensions_before).toEqual(frame1_dimensions_between);
              //expect(frame2_dimensions_before).toEqual(frame2_dimensions_between);
              expect(frame2_dimensions_after.width).toBe(stage_dimensions.width);
              expect(frame2_dimensions_after.left).toBe(stage_dimensions.left);
              expect(frame2_dimensions_after.top).toBe(stage_dimensions.top);
              expect(frame1_dimensions_after.top).toBe(stage_dimensions.top);
              expect(frame1_dimensions_after.right).toBe(stage_dimensions.left);
            });
          });
        });
      });
    });
  });
  it('can concatenated transitions with delay', function() {
    browser.get('delay/delay.html').then(function() {
      utilities.wait(300); // time for loading everything
      utilities.getBoundingClientRect('stage').then(function(stage_dimensions) {
        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
        utilities.transitionTo('layer', 'frame2', {
          duration: "500ms",
          type: "left"
        }, 1).then(function() {
          utilities.transitionTo('layer', 'frame3', {
            delay: '1500ms',
            duration: "500ms",
            type: "left"
          }, 1).then(function() {

            utilities.wait(500); // wait. there should be the first transition finished
            protractor.promise.all([
              utilities.getBoundingClientRect('frame1'),
              utilities.getBoundingClientRect('frame2'),
              utilities.getFromStore('frame1'),
              utilities.getFromStore('frame2'),
              utilities.getStyle('frame3', 'display')
            ]).then(function(data) {
              var frame1_dimensions_between = data[0],
                frame2_dimensions_between = data[1],
                frame1_dimensions_before = data[2],
                frame2_dimensions_before = data[3],
                frame3_display = data[4];
              expect(frame1_dimensions_between.width).toEqual(stage_dimensions.width);
              expect(frame2_dimensions_between.width).toEqual(stage_dimensions.width);
              delete frame2_dimensions_between.height;
              delete frame1_dimensions_before.height;
              delete frame2_dimensions_between.bottom;
              delete frame1_dimensions_before.bottom;
              expect(frame2_dimensions_between).toEqual(frame1_dimensions_before);
              expect(frame2_dimensions_between.left).toBe(frame1_dimensions_before.left);
              expect(frame2_dimensions_before.left).toBe(stage_dimensions.right);
              expect(frame3_display).toBe('none');

              // now wait for the 2nd transition
              utilities.listenDimensionsBeforeTransition('layer', 'frame2');
              utilities.listenDimensionsBeforeTransition('layer', 'frame3');
              utilities.wait(2100); // wait. there should be no transition in that time
              protractor.promise.all([
                utilities.getBoundingClientRect('frame2'),
                utilities.getBoundingClientRect('frame3'),
                utilities.getFromStore('frame2'),
                utilities.getFromStore('frame3'),
                utilities.getStyle('frame1', 'display')
              ]).then(function(data) {
                var frame2_dimensions_after2 = data[0],
                  frame3_dimensions_after2 = data[1],
                  frame2_dimensions_before2 = data[2],
                  frame3_dimensions_before2 = data[3],
                  frame1_display = data[4];
                expect(frame1_display).toBe('none');
                delete frame2_dimensions_before2["z-index"];
                delete frame2_dimensions_between["z-index"];
                delete frame2_dimensions_before2.bottom;
                delete frame2_dimensions_before2.height;
                expect(frame2_dimensions_before2).toEqual(frame2_dimensions_between);
                expect(frame3_dimensions_before2.left).toBe(stage_dimensions.right);
                expect(frame3_dimensions_after2.width).toBe(stage_dimensions.width);
                expect(frame3_dimensions_after2.left).toBe(stage_dimensions.left);
                expect(frame3_dimensions_after2.top).toBe(stage_dimensions.top);
                expect(frame2_dimensions_after2.right).toBe(stage_dimensions.left);
              });
            });
          });
        });
      });
    });
  });
  it('a new transition cancels delayed transition', function() {
    browser.get('delay/delay.html').then(function() {
      utilities.wait(300); // time for loading everything
      utilities.getBoundingClientRect('stage').then(function(stage_dimensions) {
        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
        utilities.transitionTo('layer', 'frame2', {
          duration: "500ms",
          delay: '1000ms',
          type: "left"
        }, 1).then(function() {
          utilities.transitionTo('layer', 'frame3', {
            duration: "500ms",
            type: "left"
          }, 1).then(function() {
            utilities.wait(510); // wait. there should be the 2nd transition finished
            utilities.getCurrentFrame('layer').then(function(frameName1) {
              expect(frameName1).toBe('frame3');
              utilities.wait(1100); // wait until delay ends
              utilities.getCurrentFrame('layer').then(function(frameName1) {
                expect(frameName1).toBe('frame3');
              });
            });
          });
        });
      });
    });
  });
  it('delayed and immidiate transitions can be triggered after each other with same triggerID', function() {
    browser.get('delay/delay.html').then(function() {
      utilities.wait(300); // time for loading everything
      utilities.getBoundingClientRect('stage').then(function(stage_dimensions) {
        utilities.listenDimensionsBeforeTransition('layer', 'frame1');
        utilities.listenDimensionsBeforeTransition('layer', 'frame2');
        utilities.transitionTo('layer', 'frame2', {
          duration: "500ms",
          delay: '1000ms',
          type: "left",
          triggerID: 't1'
        }, 1).then(function() {
          utilities.transitionTo('layer', 'frame3', {
            duration: "500ms",
            type: "left",
            triggerID: 't1'
          }, 1).then(function() {
            utilities.wait(510); // wait. there should be the 2nd transition finished
            utilities.getCurrentFrame('layer').then(function(frameName1) {
              expect(frameName1).toBe('frame3');
              utilities.wait(1100); // wait until delay ends
              utilities.getCurrentFrame('layer').then(function(frameName1) {
                expect(frameName1).toBe('frame2');
              });
            });
          });
        });
      });
    });
  });
});
