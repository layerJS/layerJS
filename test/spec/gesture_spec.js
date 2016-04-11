describe('gesture', function() {

  var Gesture = require('../../src/framework/gestures/gesture.js');

  it('can be created', function() {
    var gesture = new Gesture();
    expect(gesture).toBeDefined();
    //just test 1 property of the object
    expect(gesture.cancel).toBe(false);
  });
});
