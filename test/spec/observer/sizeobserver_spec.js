describe('TimeoutObserver', function() {

  var sizeObserver = require('../../../src/framework/observer/sizeobserver.js');
  var FrameView = require('../../../src/framework/frameview.js');
  var utilities = require('../helpers/utilities.js');

  it('can be created', function() {
    expect(sizeObserver).toBeDefined();
  });


  it('can register views to monitor', function() {
    var frameView1 = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))));
    var callBack = function() {};

    sizeObserver.register([frameView1], callBack);

    expect(sizeObserver.views.hasOwnProperty(frameView1.data.attributes.id))
    expect(sizeObserver.views[frameView1.data.attributes.id].view).toEqual(frameView1);
    expect(sizeObserver.views[frameView1.data.attributes.id].callBack).toBe(callBack);
    expect(sizeObserver.views[frameView1.data.attributes.id].boundingClientRect).toEqual(frameView1.innerEl.getBoundingClientRect());

  });

  it('can unregister views to monitor', function() {
    var frameView1 = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))));
    var frameView2 = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))));
    var views = [frameView1, frameView2];
    var callBack = function() {};

    sizeObserver.register(views, callBack);

    expect(sizeObserver.views.hasOwnProperty(frameView1.data.attributes.id)).toBeTruthy();
    expect(sizeObserver.views.hasOwnProperty(frameView2.data.attributes.id)).toBeTruthy();

    sizeObserver.unregister(views);

    expect(sizeObserver.views.hasOwnProperty(frameView1.data.attributes.id)).toBeFalsy();
    expect(sizeObserver.views.hasOwnProperty(frameView2.data.attributes.id)).toBeFalsy();
  });

  it('will execute the callback function when change in dimensions is detected', function(done) {
    utilities.setHtml('<div id="frame"></div>');
    var el = document.getElementById('frame');

    var frameView = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))), {
      el: el
    });
    var detected = false;
    var callBack = function() {
      detected = true;
    };

    sizeObserver.register([frameView], callBack);

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
