var utilities = require('../helpers/utilities.js');
utilities.getDimensionsBeforeTransition = function(layerId, frameId) {
  console.log("layerId is ", layerId,"frameId is ", frameId);
  return browser.driver.executeScript(function(layerId, frameId) {
    var lyEl = window.document.getElementById(layerId);
    var frEl = window.document.getElementById(frameId);
    lyEl._ljView.on("transitionPrepared", function(){
    var orgDisplay = frEl.style.display;
    frEl.style.display = 'block';
    var frameResult = frEl.getBoundingClientRect();
    frEl.style.display = orgDisplay;
    (window._selenium_store = window._selenium_store || {})[frameId]=frameResult;
    });
  }, layerId, frameId);
};
utilities.getFromStore = function(id) {
  return browser.driver.executeAsyncScript(function(id, callback) {
    callback(window._selenium_store[id]);
  }, id);
};

describe('scrolling', function() {

  beforeEach(function() {
    utilities.resizeWindow(800, 600);
  });

  describe('native-scrolling=false', function() {

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
            'data-lj-start-position': 'right',
            'data-lj-fit-to': 'height'
          }).then(function() {
            utilities.resizeWindow(800, 599);
            // utilities.getBoundingClientRect('frame1').then(function(frame1_dimensions_before) {//wants to delete this

              utilities.getDimensionsBeforeTransition('layer','frame1'); //original
              // i think the problem is that at this stage the prepared trigger is not yet sent - so initialFrame == null
              // var initialFrame = utilities.getBoundingClientRect('frame1');
              // var initialFrame = {};
              // utilities.getDimensionsBeforeTransition('frame1'); //thought of placing it after trigger prepared is launched

              // var initialFrame = {top:0};   //test = passed

              // var initialLayer = utilities.getDimensionsBeforeTransition('layer');
              console.log(' 1st'); //---------------test
              utilities.transitionTo('layer', 'frame2', {}, 1).then(function() {
                console.log(' 2nd');
                utilities.getBoundingClientRect('frame2').then(function(frame2_dimensions_before) {
                  utilities.wait(3000);
                  protractor.promise.all([
                    utilities.getBoundingClientRect('stage'),
                    utilities.getBoundingClientRect('frame1'),
                    utilities.getBoundingClientRect('frame2'),
                    utilities.getFromStore('frame1')
                  ]).then(function(data) {
                    var stage_dimensions = data[0];
                    var frame1_dimensions_after = data[1];
                    var frame2_dimensions_after = data[2];
                    var frame1_dimensions_before = data[3];
                    // var layer_dimensions_before = data[4];


console.log("  2nd consoleLog - frame1_dimensions_after ; ", frame1_dimensions_after, "   --- frame1_dimensions_before:  ", frame1_dimensions_before);
// result: Fframe1_dimensions_after ; [object Object]   --- frame1_dimensions_before:  null FIXME
// //2) scrolling native-scrolling=false start-position=right, test whether the scrollLeft and length of scrollable area has been set correctly after transition
//   Message:
//     Failed: Cannot read property 'top' of null
//   Stack:
//     TypeError: Cannot read property 'top' of null
//         at C:\Users\ragio\Documents\layerjs\test\e2e\scrolling\scrolling_spec.js:644:52

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
    // });

  });

});
