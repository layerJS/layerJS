var utilities = require('../helpers/utilities.js');

describe('attribute mutations:', function() {
  /*
   *  Tests for all lj-* and data-lj-* attributes the actually visible result
   */
  beforeEach(function() {
    utilities.resizeWindow(950, 750);
    // browser.get('attributemutations/attribute_mutations.html');
  });

  // data-lj-/lj-width fails for now 27-04-2017
  describe('data-lj-width and lj-width,', function() {

    it('800 to 600 on active frame', function() {
      browser.get('attributemutations/attribute_mutations.html').then(function() {

        // var f1 = element(by.id('frame1'));
        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {
          //  utilities.wait(1200); // tmp toBeRemoved
          var f1widthAttr = prefix[i] + 'width'; //once data-lj-, once lj-
          var css = {};
          css[f1widthAttr] = "600px";
          //is as
          // var css={
          //   data-lj-width: "600px"
          // };

          utilities.setAttributes('frame1', css);

          //  utilities.wait(1200); // tmp toBeRemoved
          protractor.promise.all([
            utilities.getBoundingClientRect('frame1')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];
            //console.log(frame_dimensions_after);
            expect(frame_dimensions_after.width).toBe(600); //Expected 800 to be 600.
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-width');
          utilities.removeAttribute('frame1', 'lj-width');
        }

      });
    });

    it('400 to 600 on inactive frame in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {
          var f2widthAttr = prefix[i] + 'width'; //once data-lj-, once lj-
          var css = {};
          css[f2widthAttr] = "600px";

          utilities.setAttributes('frame2', css);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            expect(frame_dimensions_after.width).toBe(600); // Expected 400 to be 600.
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame2', 'data-lj-width');
          utilities.removeAttribute('frame2', 'lj-width');
        }

      });
    });

  });

  // data-lj-/lj-height fails for now 27-04-2017
  describe('data-lj-height and lj-height,', function() {

    it('600 to 400 on active frame', function() {
      browser.get('attributemutations/attribute_mutations.html').then(function() {
        // var f1 = element(by.id('frame1'));
        var prefix = ['data-lj-', 'lj-'];
        for (var i = 0; i < prefix.length; i++) {
          var f1heightAttr = prefix[i] + 'height'; //once data-lj-, once lj-
          var css = {};
          css[f1heightAttr] = "400px";
          utilities.setAttributes('frame1', css);

          // //wouldn't work cuz of the way the string is defined - needs the key value structure
          // utilities.setAttributes('frame1', {
          //   f1heightAttr: '400px'
          // });

          protractor.promise.all([
            utilities.getBoundingClientRect('frame1')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];
            //console.log(frame_dimensions_after);
            expect(frame_dimensions_after.height).toBe(400); // Expected 600 to be 400.
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-height');
          utilities.removeAttribute('frame1', 'lj-height');
        }
      });
    });

    it('600 to 400 on inactive frame in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {
        var prefix = ['data-lj-', 'lj-'];
        for (var i = 0; i < prefix.length; i++) {
          var f2heightAttr = prefix[i] + 'height'; //once data-lj-, once lj-
          var css = {};
          css[f2heightAttr] = "400px";
          utilities.setAttributes('frame2', css);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            expect(frame_dimensions_after.height).toBe(400); // Expected 600 to be 400.
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame2', 'data-lj-height');
          utilities.removeAttribute('frame2', 'lj-height');
        }
      });
    });

  });

  // data-lj-/lj-x fails for now 27-04-2017
  describe('data-lj-x and lj-x,', function() {

    it('0 to 600 on active frame', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        // var f1 = element(by.id('frame1'));
        // var f2 = element(by.id('frame2'));
        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {
          var framexAttr = prefix[i] + 'x'; //once data-lj-, once lj-
          var attPositionX = {};
          attPositionX[framexAttr] = "600px";
          utilities.setAttributes('frame1', attPositionX);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame1')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            // testing results
            console.log(frame_dimensions_after.right); // 800
            console.log(frame_dimensions_after.width); // 800
            console.log(frame_dimensions_after.left); // 0

            expect(frame_dimensions_after.left).toBe(600); // Expected 0 to be 600.
            expect(frame_dimensions_after.right).toBe(frame_dimensions_after.width + frame_dimensions_after.left); // did 800 toBe 800 + 0 . should have been: 1400 toBe 800 + 600
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-x');
          utilities.removeAttribute('frame1', 'lj-x');
        }
      });
    });

    it('800 to 900 on inactive frame in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {
          var framexAttr = prefix[i] + 'x'; //once data-lj-, once lj-
          var attPositionX = {};
          attPositionX[framexAttr] = "900px";
          utilities.setAttributes('frame2', attPositionX);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            // originally frame2 is: style="left:800px; width:400px";

            // testing results
            console.log(frame_dimensions_after.right); // 1200
            console.log(frame_dimensions_after.width); // 400
            console.log(frame_dimensions_after.left); // 800

            expect(frame_dimensions_after.left).toBe(900); //  Expected 800 to be 900.
            expect(frame_dimensions_after.right).toBe(frame_dimensions_after.width + frame_dimensions_after.left); // did 1200 toBe 400 + 800 . should have been: 1300 toBe 900 + 400
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame2', 'data-lj-x');
          utilities.removeAttribute('frame2', 'lj-x');
        }
      });
    });

  });

  // data-lj-/lj-y fails for now 27-04-2017
  describe('data-lj-y and lj-y,', function() {

    it('0 to 400 on active frame', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frameYAttr = prefix[i] + 'y'; //once data-lj-, once lj-
          var attPositionY = {};
          attPositionY[frameYAttr] = "400px";
          utilities.setAttributes('frame1', attPositionY);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame1')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            // testing results
            console.log(frame_dimensions_after.bottom); // 600
            console.log(frame_dimensions_after.top); // 0
            console.log(frame_dimensions_after.height); // 600

            expect(frame_dimensions_after.top).toBe(400); //  Expected 0 to be 400.
            expect(frame_dimensions_after.bottom).toBe(frame_dimensions_after.top + frame_dimensions_after.height); // did 600 toBe 0 + 600 . should have been: 1000 toBe 400 + 600
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-y');
          utilities.removeAttribute('frame1', 'lj-y');
        }
      });
    });

    it('0 to 400 on inactive frame in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frameYAttr = prefix[i] + 'y'; //once data-lj-, once lj-
          var attPositionY = {};
          attPositionY[frameYAttr] = "400px";
          utilities.setAttributes('frame2', attPositionY);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            // testing results
            console.log(frame_dimensions_after.bottom); // 600
            console.log(frame_dimensions_after.top); // 0
            console.log(frame_dimensions_after.height); // 600

            expect(frame_dimensions_after.top).toBe(400); //  Expected 0 to be 400.
            expect(frame_dimensions_after.bottom).toBe(frame_dimensions_after.top + frame_dimensions_after.height); // did 600 toBe 0 + 600 . should have been: 1000 toBe 400 + 600
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame2', 'data-lj-y');
          utilities.removeAttribute('frame2', 'lj-y');
        }
      });
    });

  });

  // data-lj-/lj-scale-x passes 08-05-2017
  describe('data-lj-scale-x and lj-scale-x,', function() {

    it('1 to 0.5 on active frame', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'scale-x'; //once data-lj-, once lj-
          var attScaleX = {};
          attScaleX[frdataLjAtt] = "0.5";
          utilities.setAttributes('frame1', attScaleX);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            expect(frame_dimensions_after.left).toBe(1600); // because f1 is scaled to 400 width and then it is doubled to fit the stage at 800, so the left=800 of f2 is also doubled.
            expect(frame_dimensions_after.right).toBe(frame_dimensions_after.left + frame_dimensions_after.width);
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-scale-x');
          utilities.removeAttribute('frame1', 'lj-scale-x');
        }
      });
    });

    it('1 to 0.5 on inactive frame in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'scale-x'; //once data-lj-, once lj-
          var attScaleX = {};
          attScaleX[frdataLjAtt] = "0.5";
          utilities.setAttributes('frame2', attScaleX);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            expect(frame_dimensions_after.left).toBe(800);
            expect(frame_dimensions_after.right).toBe(frame_dimensions_after.left + frame_dimensions_after.width);
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame2', 'data-lj-scale-x');
          utilities.removeAttribute('frame2', 'lj-scale-x');
        }
      });
    });

  });

  // data-lj-/lj-scale-y passes 08-05-2017
  describe('data-lj-scale-y and lj-scale-y,', function() {

    it('1 to 0.5 on active frame', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout_vertical.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'scale-y'; //once data-lj-, once lj-
          var attScaleY = {};
          attScaleY[frdataLjAtt] = "0.5";
          utilities.setAttributes('frame1', attScaleY);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            expect(frame_dimensions_after.top).toBe(1200); // because f1 is scaled to 300 width and then it is doubled to fit the stage at 600, so the top=600 of f2 is also doubled.
            expect(frame_dimensions_after.bottom).toBe(frame_dimensions_after.top + frame_dimensions_after.height);
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-scale-y');
          utilities.removeAttribute('frame1', 'lj-scale-y');
        }
      });
    });

    it('1 to 0.5 on inactive frame in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_canvaslayout_vertical.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'scale-y'; //once data-lj-, once lj-
          var attScaleY = {};
          attScaleY[frdataLjAtt] = "0.5";
          utilities.setAttributes('frame2', attScaleY);

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame_dimensions_after = data[0];

            expect(frame_dimensions_after.top).toBe(600);
            expect(frame_dimensions_after.bottom).toBe(frame_dimensions_after.top + frame_dimensions_after.height);
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame2', 'data-lj-scale-y');
          utilities.removeAttribute('frame2', 'lj-scale-y');
        }
      });
    });

  });

  // data-lj-/lj-fit-to passed with active frame and failed for inactive frame after transition - 08-05-2017
  describe('data-lj-fit-to and lj-fit-to,', function() {
    it('fixed to elastic-width with elastic-left and elastic-right on active frame', function() {
      browser.get('attributemutations/attribute_mutations_elastic_width.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'fit-to'; //once data-lj-, once lj-
          var att1 = {};
          att1[frdataLjAtt] = "elastic-width";

          var frdataLjAttLeft = prefix[i] + 'elastic-left';
          att1[frdataLjAttLeft] = 50;

          var frdataLjAttRight = prefix[i] + 'elastic-right';
          att1[frdataLjAttRight] = 50;

          utilities.setAttributes('frame1', att1);

          protractor.promise.all([
            utilities.getBoundingClientRect("stage"),
            utilities.getBoundingClientRect("layer"),
            utilities.getBoundingClientRect("frame1"),
            utilities.getScale("frame1")
          ]).then(function(data) {
            var stage_dimensions = data[0];
            var layer_dimensions = data[1];
            var frame_dimensions = data[2];
            var frame_scale = data[3];

            expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
            expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
            expect(stage_dimensions.width).toBe(frame_dimensions.width);
            expect(frame_scale > 1).toBeTruthy();
            expect(frame_dimensions.left).toBe(0);

            // remove the attributes to allow a reset for next iteration in the for loop
            utilities.removeAttribute('frame1', 'data-lj-elastic-width');
            utilities.removeAttribute('frame1', 'lj-elastic-width');
            utilities.removeAttribute('frame1', 'data-lj-elastic-left');
            utilities.removeAttribute('frame1', 'lj-elastic-left');
            utilities.removeAttribute('frame1', 'data-lj-elastic-right');
            utilities.removeAttribute('frame1', 'lj-elastic-right');
          });
        }
      });
    });

    it('fixed to elastic-width with elastic-left and elastic-right on inactive frame', function() {
      browser.get('attributemutations/attribute_mutations_elastic_width.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'fit-to'; //once data-lj-, once lj-
          var att1 = {};
          att1[frdataLjAtt] = "elastic-width";

          var frdataLjAttLeft = prefix[i] + 'elastic-left';
          att1[frdataLjAttLeft] = 50;

          var frdataLjAttRight = prefix[i] + 'elastic-right';
          att1[frdataLjAttRight] = 50;

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame2_dimensions_before = data[0];

            utilities.setAttributes('frame2', att1).then(function() {

              protractor.promise.all([
                utilities.getBoundingClientRect('frame2')
              ]).then(function(data) {
                var frame2_dimensions_after = data[0];

                expect(frame2_dimensions_before).toEqual(frame2_dimensions_after); // no effect in inactive frame - passed

                utilities.transitionTo('layer', 'frame2', {}).then(function() {
                  protractor.promise.all([
                    utilities.getBoundingClientRect("stage"),
                    utilities.getBoundingClientRect("layer"),
                    utilities.getBoundingClientRect("frame2"),
                    utilities.getScale("frame2")
                  ]).then(function(data) {
                    var stage_dimensions = data[0];
                    var layer_dimensions = data[1];
                    var frame_dimensions = data[2];
                    var frame_scale = data[3];

                    // After transitionTo f2, should have effect
                    expect(stage_dimensions.height).not.toBe(frame_dimensions.height);
                    expect(layer_dimensions.height).not.toBe(frame_dimensions.height);
                    expect(stage_dimensions.width).toBe(frame_dimensions.width); //  Expected 700 to be 550.
                    expect(frame_scale > 1).toBeTruthy(); //  Expected false to be truthy.
                    expect(frame_dimensions.left).toBe(0);

                    // remove the attributes to allow a reset for next iteration in the for loop
                    utilities.removeAttribute('frame2', 'data-lj-elastic-width');
                    utilities.removeAttribute('frame2', 'lj-elastic-width');
                    utilities.removeAttribute('frame2', 'data-lj-elastic-left');
                    utilities.removeAttribute('frame2', 'lj-elastic-left');
                    utilities.removeAttribute('frame2', 'data-lj-elastic-right');
                    utilities.removeAttribute('frame2', 'lj-elastic-right');
                  });
                });
              });
            });
          });
        }
      });
    });

    it('fixed to elastic-height with elastic-top and elastic-bottom on active frame', function() {
      browser.get('attributemutations/attribute_mutations_elastic_height.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'fit-to'; //once data-lj-, once lj-
          var att2 = {};
          att2[frdataLjAtt] = "elastic-height";

          var frdataLjAttTop = prefix[i] + 'elastic-top';
          att2[frdataLjAttTop] = 50;

          var frdataLjAttBottom = prefix[i] + 'elastic-bottom';
          att2[frdataLjAttBottom] = 50;
          utilities.setAttributes('frame1', att2);

          protractor.promise.all([
            utilities.getBoundingClientRect("stage"),
            utilities.getBoundingClientRect("layer"),
            utilities.getBoundingClientRect("frame1"),
            utilities.getScale("frame1")
          ]).then(function(data) {
            var stage_dimensions = data[0];
            var layer_dimensions = data[1];
            var frame_dimensions = data[2];
            var frame_scale = data[3];

            expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
            expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
            expect(stage_dimensions.height).toBe(frame_dimensions.height);
            expect(frame_scale > 1).toBeTruthy();
            expect(frame_dimensions.top).toBe(0);
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-elastic-height');
          utilities.removeAttribute('frame1', 'lj-elastic-height');
          utilities.removeAttribute('frame1', 'data-lj-elastic-top ');
          utilities.removeAttribute('frame1', 'lj-elastic-top');
          utilities.removeAttribute('frame1', 'data-lj-elastic-bottom');
          utilities.removeAttribute('frame1', 'lj-elastic-bottom');
        }
      });
    });

    it('fixed to elastic-height with elastic-top and elastic-bottom on inactive frame', function() {
      browser.get('attributemutations/attribute_mutations_elastic_height.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'fit-to'; //once data-lj-, once lj-
          var att2 = {};
          att2[frdataLjAtt] = "elastic-height";

          var frdataLjAttLeft = prefix[i] + 'elastic-top';
          att2[frdataLjAttLeft] = 50;

          var frdataLjAttRight = prefix[i] + 'elastic-bottom';
          att2[frdataLjAttRight] = 50;

          protractor.promise.all([
            utilities.getBoundingClientRect('frame2')
          ]).then(function(data) {
            var frame2_dimensions_before = data[0];

            utilities.setAttributes('frame2', att2).then(function() {

              protractor.promise.all([
                utilities.getBoundingClientRect('frame2')
              ]).then(function(data) {
                var frame2_dimensions_after = data[0];

                expect(frame2_dimensions_before).toEqual(frame2_dimensions_after);

                utilities.transitionTo('layer', 'frame2', {}).then(function() {
                  protractor.promise.all([
                    utilities.getBoundingClientRect("stage"),
                    utilities.getBoundingClientRect("layer"),
                    utilities.getBoundingClientRect("frame2"),
                    utilities.getScale("frame2")
                  ]).then(function(data) {
                    var stage_dimensions = data[0];
                    var layer_dimensions = data[1];
                    var frame_dimensions = data[2];
                    var frame_scale = data[3];

                    // After transitionTo f2, should have effect
                    expect(stage_dimensions.width).not.toBe(frame_dimensions.width);
                    expect(layer_dimensions.width).not.toBe(frame_dimensions.width);
                    expect(stage_dimensions.height).toBe(frame_dimensions.height); //  Expected 700 to be 400.
                    expect(frame_scale > 1).toBeTruthy(); //  Expected false to be truthy.
                    expect(frame_dimensions.top).toBe(0);

                    // remove the attributes to allow a reset for next iteration in the for loop
                    utilities.removeAttribute('frame2', 'data-lj-elastic-height');
                    utilities.removeAttribute('frame2', 'lj-elastic-height');
                    utilities.removeAttribute('frame2', 'data-lj-elastic-top');
                    utilities.removeAttribute('frame2', 'lj-elastic-top');
                    utilities.removeAttribute('frame2', 'data-lj-elastic-bottom');
                    utilities.removeAttribute('frame2', 'lj-elastic-bottom');
                  });
                });
              });
            });
          });
        }
      });
    });

  });

  // data-lj-/lj-start-position passed - 02-05-2017
  describe('data-lj-start-position and lj-start-position,', function() {

    it('left to right with fit-to=height on active frame', function() {
      browser.get('attributemutations/attribute_mutations_start_position.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'start-position'; //once data-lj-, once lj-
          var strtPosAtrr = {};
          strtPosAtrr[frdataLjAtt] = "right";

          utilities.setAttributes('frame1', strtPosAtrr);

          protractor.promise.all([
            utilities.getBoundingClientRect('layer'),
            utilities.getBoundingClientRect('frame1'),
            utilities.getScroll('layer')
          ]).then(function(data) {
            var layer_dimensions = data[0];
            var frame_dimensions = data[1];
            var layer_scroll = data[2];

            expect(layer_scroll.scrollLeft).toBe((frame_dimensions.width - layer_dimensions.width));
          });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-start-position');
          utilities.removeAttribute('frame1', 'lj-start-position');
        }
      });
    });

    it('left to right with fit-to=height on inactive frame', function() {
      browser.get('attributemutations/attribute_mutations_start_position.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'start-position'; //once data-lj-, once lj-
          var strtPosAtrr = {};
          strtPosAtrr[frdataLjAtt] = "right";

          utilities.setAttributes('frame2', strtPosAtrr);

          utilities.transitionTo('layer', 'frame2', {}).then(function() {
            protractor.promise.all([
              utilities.getBoundingClientRect('layer'),
              utilities.getBoundingClientRect('frame2'),
              utilities.getScroll('layer')
            ]).then(function(data) {
              var layer_dimensions = data[0];
              var frame_dimensions = data[1];
              var layer_scroll = data[2];

              expect(layer_scroll.scrollLeft).toBe((frame_dimensions.width - layer_dimensions.width));
            });

            // remove the attributes to allow a reset for next iteration in the for loop
            utilities.removeAttribute('frame2', 'data-lj-start-position');
            utilities.removeAttribute('frame2', 'lj-start-position');
          });
        }
      });
    });

  });

  // data-lj-/lj-neighbors passed - 03-05-2017 //1 spec, 0 failures
  describe('data-lj-neighbors and lj-neighbors,', function() {
    it('move left then up(top) then right then down(bottom)', function() {
      browser.get('attributemutations/attribute_mutations_neighbors.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var f1 = element(by.id('frame1'));
          var f2 = element(by.id('frame2'));
          var f3 = element(by.id('frame3'));
          var f4 = element(by.id('frame4'));

          expect(f1.getCssValue('display')).toBe('block');
          expect(f2.getCssValue('display')).toBe('none');
          expect(f3.getCssValue('display')).toBe('none');
          expect(f4.getCssValue('display')).toBe('none');

          var fr1dataLjAtt = prefix[i] + 'neighbors' + '.l'; //once data-lj-, once lj-
          var neighborAttr = {};
          neighborAttr[fr1dataLjAtt] = "frame2";
          utilities.setAttributes('frame1', neighborAttr);

          utilities.transitionTo('layer', 'frame2', {
              type: 'right'
            })
            .then(function() {
              protractor.promise.all([
                f1.getCssValue('display'),
                f2.getCssValue('display'),
                f3.getCssValue('display'),
                f4.getCssValue('display')
              ]).then(function(data) {
                var f1_display = data[0];
                var f2_display = data[1];
                var f3_display = data[2];
                var f4_display = data[3];

                expect(f1_display).toBe('none');
                expect(f2_display).toBe('block');
                expect(f3_display).toBe('none');
                expect(f4_display).toBe('none');
              });
            });

          var fr2dataLjAtt = prefix[i] + 'neighbors' + '.t';
          neighborAttr = {};
          neighborAttr[fr2dataLjAtt] = "frame3";
          utilities.setAttributes('frame2', neighborAttr);

          utilities.transitionTo('layer', 'frame3', {
              type: 'down'
            })
            .then(function() {
              protractor.promise.all([
                f1.getCssValue('display'),
                f2.getCssValue('display'),
                f3.getCssValue('display'),
                f4.getCssValue('display')
              ]).then(function(data) {
                var f1_display = data[0];
                var f2_display = data[1];
                var f3_display = data[2];
                var f4_display = data[3];

                expect(f1_display).toBe('none');
                expect(f2_display).toBe('none');
                expect(f3_display).toBe('block');
                expect(f4_display).toBe('none');
              });
            });

          var fr3dataLjAtt = prefix[i] + 'neighbors' + '.r';
          neighborAttr = {};
          neighborAttr[fr3dataLjAtt] = "frame4";
          utilities.setAttributes('frame3', neighborAttr);

          utilities.transitionTo('layer', 'frame4', {
              type: 'left'
            })
            .then(function() {
              protractor.promise.all([
                f1.getCssValue('display'),
                f2.getCssValue('display'),
                f3.getCssValue('display'),
                f4.getCssValue('display')
              ]).then(function(data) {
                var f1_display = data[0];
                var f2_display = data[1];
                var f3_display = data[2];
                var f4_display = data[3];

                expect(f1_display).toBe('none');
                expect(f2_display).toBe('none');
                expect(f3_display).toBe('none');
                expect(f4_display).toBe('block');
              });
            });

          var fr4dataLjAtt = prefix[i] + 'neighbors' + '.b';
          neighborAttr = {};
          neighborAttr[fr4dataLjAtt] = "frame1";
          utilities.setAttributes('frame4', neighborAttr);

          utilities.transitionTo('layer', 'frame1', {
              type: 'up'
            })
            .then(function() {
              protractor.promise.all([
                f1.getCssValue('display'),
                f2.getCssValue('display'),
                f3.getCssValue('display'),
                f4.getCssValue('display')
              ]).then(function(data) {
                var f1_display = data[0];
                var f2_display = data[1];
                var f3_display = data[2];
                var f4_display = data[3];

                expect(f1_display).toBe('block');
                expect(f2_display).toBe('none');
                expect(f3_display).toBe('none');
                expect(f4_display).toBe('none');
              });
            });

          // remove the attributes to allow a reset for next iteration in the for loop
          utilities.removeAttribute('frame1', 'data-lj-neighbors.l');
          utilities.removeAttribute('frame1', 'lj-neighbors.l');
          utilities.removeAttribute('frame1', 'data-lj-neighbors.r');
          utilities.removeAttribute('frame1', 'lj-neighbors.r');
          utilities.removeAttribute('frame1', 'data-lj-neighbors.t');
          utilities.removeAttribute('frame1', 'lj-neighbors.t');
          utilities.removeAttribute('frame1', 'data-lj-neighbors.b');
          utilities.removeAttribute('frame1', 'lj-neighbors.b');
        }
      });
    });
  });

  // data-lj-/lj-rotation  fails for now - 03-04-05-2017
  describe('data-lj-rotation and lj-rotation,', function() {
    it('0 to 40 - for active and inactive frames in canvas layout', function() {
      browser.get('attributemutations/attribute_mutations_rotation.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'rotation';
          var rotationAtrr = {};
          rotationAtrr[frdataLjAtt] = 40;

          utilities.setAttributes('frame2', rotationAtrr); //test for inactive frame in canvas layout

          protractor.promise.all([
            utilities.getRotation('frame2')
          ]).then(function(data) {
            var f2_rotation = data[0];

            expect(f2_rotation).toBe(40); // Expected 0 to be 40.
          });

          utilities.setAttributes('frame1', rotationAtrr); // test for active frame in canvas layout

          protractor.promise.all([
            utilities.getRotation('frame1')
          ]).then(function(data) {
            var f1_rotation = data[0];

            expect(f1_rotation).toBe(40); // Expected 0 to be 40.
          });

          // reset to original value
          utilities.removeAttribute('frame2', 'data-lj-rotation');
          utilities.removeAttribute('frame2', 'lj-rotation');
          utilities.removeAttribute('frame1', 'data-lj-rotation');
          utilities.removeAttribute('frame1', 'lj-rotation');
        }
      });
    });
  });

  // data-lj-/lj-no-scrolling fails - 03-05-2017 -- doesn't seem to set the attribute
  describe('data-lj-no-scrolling and lj-no-scrolling,', function() {
    it('not set to true and then to false with native-scroll false and true', function() {
      browser.get('attributemutations/attribute_mutations_no_scrolling.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];
        var native = ['true', 'false'];

        for (var x = 0; x < native.length; x++) {
          for (var i = 0; i < prefix.length; i++) {

            //data-lj-native-scroll= "false" / "true"
            var nativeAttr = prefix[i] + 'native-scroll'; //once data-lj-, once lj-
            var nativeScrollAttr = {};
            nativeScrollAttr[nativeAttr] = native[x];
            utilities.setAttributes('layer', nativeScrollAttr);

            //'no-scrolling' is not defined, so is false as default.
            utilities.scrollDown('layer', 2).then(function() {
              protractor.promise.all([
                utilities.getBoundingClientRect('layer'),
                utilities.getBoundingClientRect('frame1'),
                utilities.getScroll('layer')
              ]).then(function(data) {
                var layer_dimensions = data[0];
                var frame_dimensions = data[1];
                var layer_scroll = data[2];
                expect(layer_scroll.scrollTop).toBe(frame_dimensions.height - layer_dimensions.height);
              });
            });

            //no-scrolling = true
            var frdataLjAtt = prefix[i] + 'no-scrolling'; //once data-lj-, once lj-
            var noScrollAttr = {};
            noScrollAttr[frdataLjAtt] = true;

            utilities.setAttributes('frame1', noScrollAttr);

            utilities.scrollDown('layer', 2).then(function() {
              protractor.promise.all([
                utilities.getScroll('layer')
              ]).then(function(data) {
                var layer_scroll = data[0];

                // console.log((layer_scroll.scrollTop)); //50
                // console.log((frame_dimensions.height));//450
                // console.log((layer_dimensions.height));//400
                expect(layer_scroll.scrollTop).toBe(0); // Expected 50 to be 0. //test is right
              });
            });

            //no-scrolling = true
            var noScrollAttr = {};
            noScrollAttr[frdataLjAtt] = false;

            utilities.setAttributes('frame1', noScrollAttr);

            utilities.scrollDown('layer', 2).then(function() {
              protractor.promise.all([
                utilities.getBoundingClientRect('layer'),
                utilities.getBoundingClientRect('frame1'),
                utilities.getScroll('layer')
              ]).then(function(data) {
                var layer_dimensions = data[0];
                var frame_dimensions = data[1];
                var layer_scroll = data[2];
                // console.log((layer_scroll.scrollTop)); //50
                // console.log((frame_dimensions.height));//450
                // console.log((layer_dimensions.height));//400
                expect(layer_scroll.scrollTop).toBe(frame_dimensions.height - layer_dimensions.height);
              });
            });

            // remove the attributes to allow a reset for next iteration in the for loop
            utilities.removeAttribute('frame1', 'data-lj-no-scrolling');
            utilities.removeAttribute('frame1', 'lj-no-scrolling');
          }
        }
      });
    });
  });

  // data-lj-/lj-name passed - 08-05-2017
  describe('data-lj-name and lj-name,', function() {
    it('change name frame1 to frame10', function() {
      browser.get('attributemutations/attribute_mutations.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'name'; //once data-lj-, once lj-
          var frNewName = {};
          frNewName[frdataLjAtt] = 'frame10';

          utilities.setAttributes('frame1', frNewName);

          protractor.promise.all([
            utilities.getCurrentExportStructure('layer')
          ]).then(function(data) {
            var stateExportStrct = data[0];

            expect(stateExportStrct).toEqual(['stage.layer.frame10']);

            // reset for next iteration in the for loop
            frNewName[frdataLjAtt] = 'frame1';
            utilities.setAttributes('frame1', frNewName);
          });
        }
      });
    });
  });

  // data-lj-/lj-id failed, id and lj-name passed 09-05-2017
  describe('data-lj-id and lj-id and lj-name changes according to id,', function() {
    //failed
    it('change data-lj/lj-id frame1 to frame10 and check that lj-name gets the new lj-id as a name', function() {
      browser.get('attributemutations/attribute_mutations_id.html').then(function() {

        // when not setting a name the name is the id and if data-lj/lj-id is set then name should be that.

        // defining id different than frame1 to be able to tell apart id and lj-id
        utilities.setAttribute('frame1', 'id', 'frameIdToIgnore');

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'id'; //once data-lj-, once lj-
          var frNewLjId = {};
          frNewLjId[frdataLjAtt] = 'frame1';

          utilities.setAttributes('frameIdToIgnore', frNewLjId).then(function() {
            protractor.promise.all([
              utilities.getCurrentExportStructure('layer')
            ]).then(function(data) {
              var stateExportStrct = data[0];
              expect(stateExportStrct).toEqual(['stage.layer.frame1']); // Expected $[0] = 'stage.layer.frameIdToIgnore' to equal 'stage.layer.frame1'.

              // test after changing data-lj/lj-id if data-lj-name changes to new lj-id value.
              frNewLjId[frdataLjAtt] = 'frame10';

              utilities.setAttributes('frameIdToIgnore', frNewLjId).then(function() {
                protractor.promise.all([
                  utilities.getCurrentExportStructure('layer')
                ]).then(function(data) {
                  var stateExportStrct = data[0];
                  expect(stateExportStrct).toEqual(['stage.layer.frame10']); //  Expected $[0] = 'stage.layer.frameIdToIgnore' to equal 'stage.layer.frame10'.

                  // remove the attributes to allow a reset for next iteration in the for loop
                  utilities.removeAttribute('frameIdToIgnore', 'data-lj-id');
                  utilities.removeAttribute('frameIdToIgnore', 'lj-id');
                });
              });
            });
          });
        }
      });
    });

    // passed. 09-05-2017
    it('change id frame1 to frame10 and check that lj-name gets the new id as a name', function() {
      browser.get('attributemutations/attribute_mutations_id.html').then(function() {

        // when not setting a name the name is the id

        // test undefined lj-name has the id as name.
        protractor.promise.all([
          utilities.getCurrentExportStructure('layer')
        ]).then(function(data) {
          var stateExportStrct = data[0];
          expect(stateExportStrct).toEqual(['stage.layer.frame1']); // passed. 09-05-2017

          utilities.setAttribute('frame1', 'id', 'frame10');

          // test if lj-name that got it's name from the id will change when the id is changed.
          protractor.promise.all([
            utilities.getCurrentExportStructure('layer')
          ]).then(function(data) {
            var stateExportStrct = data[0];
            expect(stateExportStrct).toEqual(['stage.layer.frame10']); // passed. 09-05-2017
          });
        });
      });
    });

  });


  // TODO check with utilities.setLayout(elementId, layout) TODO FIXME TODO FIXME TODO FIXME
  // data-lj-/lj-layout-type FIXME failed OR passed? 09-05-2017 // implemented but has an issue with getting the css display value of the inactive frame in canvas layout.
  describe('data-lj-layout-type and lj-layout-type,', function() {

    it('change undefined layout-type to canvas', function() {
      browser.get('attributemutations/attribute_mutations_layout_type.html').then(function() {

        // TODO ? add test for default as slide type?

        // var f2 = element(by.id('frame2')); // unsuccessfully, tried, after the change to canvas, to get the css display value(that is suppose to be block)

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'layout-type'; //once data-lj-, once lj-
          var layoutType = {};
          // expect(f2.getCssValue('display')).toBe('none');

          // switch to canvas
          layoutType[frdataLjAtt] = 'canvas';
          utilities.setAttributes('layer', layoutType);

          // test that layout-type has changed (if for data-lj- or lj-) //passed
          if (i == 0) {
            protractor.promise.all([
              utilities.getAttribute('layer', 'data-lj-layout-type')
            ]).then(function(data) {
              var att = data[0];

              expect(att).toEqual('canvas'); // passed 09-05-2017
            });
          } else {
            protractor.promise.all([
              utilities.getAttribute('layer', 'lj-layout-type')
            ]).then(function(data) {
              var att = data[0];

              expect(att).toEqual('canvas'); // passed 09-05-2017
            });
          }

          // expect(f2.getCssValue('display')).toBe('block');

          // show inactive frames at right position
          protractor.promise.all([
            utilities.getBoundingClientRect('frame2'),
            // f2.getCssValue('display')
            // utilities.getStyle('frame2', 'display'),
            // utilities.getStyle('frame1', 'display')
          ]).then(function(data) {
            var inactive_frame_dimensions = data[0];
            // var f2_display = data[1];

            //FIXME not sure if to check dimensions if the change is on the display value and not the positioning
            expect(inactive_frame_dimensions.top).toBe(300);
            expect(inactive_frame_dimensions.left).toBe(300);
            expect(inactive_frame_dimensions.right).toBe(inactive_frame_dimensions.left + inactive_frame_dimensions.width);
            expect(inactive_frame_dimensions.bottom).toBe(inactive_frame_dimensions.top + inactive_frame_dimensions.height);
            expect(inactive_frame_dimensions.width).toBe(200);
            expect(inactive_frame_dimensions.height).toBe(200);

            // console.log(f2_display);
            // expect(f2_display).toBe('block'); // Expected 'none' to be 'block'.

            // remove the attributes to allow a reset for next iteration in the for loop
            utilities.removeAttribute('layer', 'data-lj-layout-type');
            utilities.removeAttribute('layer', 'lj-layout-type');
          });
        }
      });
    });

    it('change layout-type canvas to slide', function() {
      browser.get('attributemutations/attribute_mutations_layout_type.html').then(function() {

        var f2 = element(by.id('frame2'));

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'layout-type'; //once data-lj-, once lj-
          var layoutType = {};

          // set layout-type to canvas
          layoutType[frdataLjAtt] = 'canvas';
          utilities.setAttributes('layer', layoutType);

          // test that layout-type has changed to canvas(if for data-lj- or lj-) //passed
          if (i == 0) {
            protractor.promise.all([
              utilities.getAttribute('layer', 'data-lj-layout-type')
            ]).then(function(data) {
              var att = data[0];

              expect(att).toEqual('canvas'); // TODO DID IT passed 09-05-2017
            });
          } else {
            protractor.promise.all([
              utilities.getAttribute('layer', 'lj-layout-type')
            ]).then(function(data) {
              var att = data[0];

              expect(att).toEqual('canvas'); //  TODO DID IT passed 09-05-2017
            });
          }

          expect(f2.getCssValue('display')).toBe('block'); // in canvas layout // Expected 'none' to be 'block'. - same fail as in previous test of canvas layout - failed 10-05-2017

          // switch to slide (is default when layout-type is not defined is slide)
          layoutType = {};
          layoutType[frdataLjAtt] = 'slide';
          utilities.setAttributes('layer', layoutType);

          // test that layout-type has changed to slide(if for data-lj- or lj-) //passed  - 10-05-2017
          if (i == 0) {
            protractor.promise.all([
              utilities.getAttribute('layer', 'data-lj-layout-type')
            ]).then(function(data) {
              var att = data[0];

              expect(att).toEqual('slide'); // passed 10-05-2017
            });
          } else {
            protractor.promise.all([
              utilities.getAttribute('layer', 'lj-layout-type')
            ]).then(function(data) {
              var att = data[0];

              expect(att).toEqual('slide'); // passed 10-05-2017
            });
          }

          // test that the display for the inactive frame changed from block in canvas layout to none in slide laoyout.
          expect(f2.getCssValue('display')).toBe('none'); // passed in slide layout - 10-05-2017 // but if wansn't 'block' in canvas, nothing has changed.

          // show inactive frames at right position
          protractor.promise.all([
            utilities.getBoundingClientRect('frame2'),
            f2.getCssValue('display')
            // utilities.getStyle('frame2', 'display')
            // utilities.getStyle('frame1', 'display')
          ]).then(function(data) {
            var inactive_frame_dimensions = data[0];
            var f2_display = data[1];

            expect(f2_display).toBe('none'); // passed in slide layout - 10-05-2017

            //FIXME not sure if to check dimensions if the change is on the display value and not the positioning
            // expect(inactive_frame_dimensions.top).toBe(300);
            // expect(inactive_frame_dimensions.left).toBe(300);
            // expect(inactive_frame_dimensions.right).toBe(inactive_frame_dimensions.left + inactive_frame_dimensions.width);
            // expect(inactive_frame_dimensions.bottom).toBe(inactive_frame_dimensions.top + inactive_frame_dimensions.height);
            // expect(inactive_frame_dimensions.width).toBe(200);
            // expect(inactive_frame_dimensions.height).toBe(200);

            // console.log(f2_display);
            // expect(f2_display).toBe('block'); // Expected 'none' to be 'block'.

            // remove the attributes to allow a reset for next iteration in the for loop
            utilities.removeAttribute('layer', 'data-lj-layout-type');
            utilities.removeAttribute('layer', 'lj-layout-type');
          });
        }
      });
    });

  });

  // data-lj-/lj-native-scroll failed 10-05-2017 - TODO try another way to implement - suggestion at end of 'it'
  describe('data-lj-native-scroll and lj-native-scroll,', function() {

    it('change data-lj/lj-native-scroll', function() {
      browser.get('attributemutations/attribute_mutations_native_scroll.html').then(function() {

        var prefix = ['data-lj-', 'lj-'];

        for (var i = 0; i < prefix.length; i++) {

          var frdataLjAtt = prefix[i] + 'native-scroll'; //once data-lj-, once lj-
          var nativeScroll = {};

          nativeScroll[frdataLjAtt] = true;
          utilities.setAttributes('layer', nativeScroll);

          // test that 'layer' has 'lj-helper' child element
          protractor.promise.all([
            utilities.childHasAttribute('layer', 'lj-helper')
          ]).then(function(data) {
            var hasHelper = data[0];

            expect(hasHelper).toBe(true); // passed. 10-05-2017 - but as default, when no native-scroll is the defined, it is defined as native-scroll='true' and so will have the lj-helper even when native-scroll is not defined manually.

            nativeScroll[frdataLjAtt] = false;
            utilities.setAttributes('layer', nativeScroll).then(function() {

              // test that 'layer' doesn't have a 'lj-helper' child element
              protractor.promise.all([
                utilities.childHasAttribute('layer', 'lj-helper')
              ]).then(function(data) {
                var hasHelper = data[0];

                expect(hasHelper).toBe(false); //  failed 10-05-2017 - result: Expected true to be false.

                // remove the attributes to allow a reset for next iteration in the for loop
                utilities.removeAttribute('layer', 'data-lj-native-scroll');
                utilities.removeAttribute('layer', 'lj-native-scroll');

                //another way to try changing the native scroll: from layerjs.js:
                /**
                 * Will toggle native and non-native scrolling
                 *
                 * @param {boolean} nativeScrolling
                 */
                // utilities.switchScrolling('layer', nativeScrolling);
                // maybe need to do inside a  protractor.promise.all
              });
            });
          });
        }
      });
    });

  });

});
