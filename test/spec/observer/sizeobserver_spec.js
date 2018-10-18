describe('SizeObserver', function() {

  var SizeObserver = require('../../../src/framework/observer/sizeobserver.js');
  var utilities = require('../helpers/utilities.js');

  it('can be created', function() {
    expect(new SizeObserver(document.createElement('div'), {})).toBeDefined();
  });

  it('will execute the callback function when change in dimensions is detected', function(done) {
    var element = utilities.appendChildHTML(require('../htmlElements/simple_frame_1.js'));

    var detected = 0;
    var callback = function() {
      detected++;
    };
    var sizeObserver = new SizeObserver(element, {
      callback: callback
    });

    sizeObserver.observe();

    if (window.navigator.userAgent.match(/node.js/i)) { // fake content size change in jsdom
      element.clientWidth = 200;
      element.clientHeight = 200;
    }
  
    setTimeout(function() {
      expect(detected).toBe(1);
      done();
    }, 250);
  });
});
