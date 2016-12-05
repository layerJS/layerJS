describe('SizeObserver', function() {

  var sizeObserver = require('../../../src/framework/observer/sizeobserver.js');
  var FrameView = require('../../../src/framework/frameview.js');
  var utilities = require('../helpers/utilities.js');

  it('can be created', function() {
    expect(sizeObserver).toBeDefined();
  });


  it('can register views to monitor', function() {
    var frameView1 = new FrameView({
      el: utilities.appendChildHTML(require('../htmlElements/simple_frame_1.js'))
    });
    var callBack = function() {};

    sizeObserver.register([frameView1], callBack);

    expect(sizeObserver.views.hasOwnProperty(frameView1.id()));
    expect(sizeObserver.views[frameView1.id()].view).toEqual(frameView1);
    expect(sizeObserver.views[frameView1.id()].callBack).toBe(callBack);
    expect(sizeObserver.views[frameView1.id()].size.hasOwnProperty("width")).toBeTruthy();
    expect(sizeObserver.views[frameView1.id()].size.hasOwnProperty("height")).toBeTruthy();

  });

  it('can unregister views to monitor', function() {
    var frameView1 = new FrameView({
      el: utilities.appendChildHTML(require('../htmlElements/simple_frame_1.js'))
    });
    var frameView2 = new FrameView({
      el: utilities.appendChildHTML(require('../htmlElements/simple_frame_2.js'))
    });

    var views = [frameView1, frameView2];
    var callBack = function() {};

    sizeObserver.register(views, callBack);

    expect(sizeObserver.views.hasOwnProperty(frameView1.id())).toBeTruthy();
    expect(sizeObserver.views.hasOwnProperty(frameView2.id())).toBeTruthy();

    sizeObserver.unRegister(views);

    expect(sizeObserver.views.hasOwnProperty(frameView1.id())).toBeFalsy();
    expect(sizeObserver.views.hasOwnProperty(frameView2.id())).toBeFalsy();
  });

  it('will execute the callback function when change in dimensions is detected', function(done) {
      var frameView = new FrameView({
      el: utilities.appendChildHTML(require('../htmlElements/simple_frame_1.js'))
    });
    var detected = 0;
    var callBack = function() {
      detected++;
    };
    sizeObserver.register([frameView], callBack);

    if (window.navigator.userAgent.match(/node.js/i)) { // fake content size change in jsdom
      frameView.innerEl.scrollWidth = 200;
      frameView.innerEl.scrollHeight = 200;
    }
    // spyOn(frameView.innerEl, "getBoundingClientRect").and.callFake(function() {
    //   return {
    //     width: 100,
    //     height: 50
    //   };
    // });
    setTimeout(function() {
      expect(detected).toBe(1);

      if (window.navigator.userAgent.match(/node.js/i)) { // fake content size change in jsdom
        frameView.innerEl.clientWidth = 200;
        frameView.innerEl.clientHeight = 200;
      }
    }, 110);
    setTimeout(function() {
      expect(detected).toBe(2);
      done();
    }, 250);
  });
});
