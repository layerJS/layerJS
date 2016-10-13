describe('TimeoutObserver', function() {

  var sizeObserver = require('../../../src/framework/observer/sizeobserver.js');
  var FrameView = require('../../../src/framework/frameview.js');
  var utilities = require('../helpers/utilities.js');

  it('can be created', function() {
    expect(sizeObserver).toBeDefined();
  });


  it('can register a view to monitor', function() {
    var frameView = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))));
    var callBack = function() {};

    sizeObserver.register(frameView, callBack);

    expect(sizeObserver.views.hasOwnProperty(frameView.data.attributes.id))
    expect(sizeObserver.views[frameView.data.attributes.id].view).toBe(frameView);
    expect(sizeObserver.views[frameView.data.attributes.id].callBack).toBe(callBack);
    expect(sizeObserver.views[frameView.data.attributes.id].boundingClientRect).toEqual(frameView.innerEl.getBoundingClientRect());
  });

  it('will execute the callback function when  change is detected', function(done) {
    utilities.setHtml('<div id="frame"></div>');
    var el = document.getElementById('frame');

    var frameView = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))), {
      el: el
    });
    var detected = false;
    var callBack = function() {
      detected = true;
    };

    sizeObserver.register(frameView, callBack);

    spyOn(frameView.innerEl, "getBoundingClientRect").and.callFake(function() {
      return {
        width: 100,
        height: 50
      };
    });

    setTimeout(function() {
      expect(detected).toBeTruthy();
      done();
    }, 110);
  });
});
