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

    expect(sizeObserver.views.hasOwnProperty(frameView1.data.attributes.id));
    expect(sizeObserver.views[frameView1.data.attributes.id].view).toEqual(frameView1);
    expect(sizeObserver.views[frameView1.data.attributes.id].callBack).toBe(callBack);
    expect(sizeObserver.views[frameView1.data.attributes.id].size.hasOwnProperty("width")).toBeTruthy();
    expect(sizeObserver.views[frameView1.data.attributes.id].size.hasOwnProperty("height")).toBeTruthy();

  });

  it('can unregister views to monitor', function() {
    var frameView1 = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))));
    var frameView2 = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))));
    var views = [frameView1, frameView2];
    var callBack = function() {};

    sizeObserver.register(views, callBack);

    expect(sizeObserver.views.hasOwnProperty(frameView1.data.attributes.id)).toBeTruthy();
    expect(sizeObserver.views.hasOwnProperty(frameView2.data.attributes.id)).toBeTruthy();

    sizeObserver.unRegister(views);

    expect(sizeObserver.views.hasOwnProperty(frameView1.data.attributes.id)).toBeFalsy();
    expect(sizeObserver.views.hasOwnProperty(frameView2.data.attributes.id)).toBeFalsy();
  });

  it('will execute the callback function when change in dimensions is detected', function(done) {
    utilities.setHtml('<div id="frame"></div>');
    var el = document.getElementById('frame');

    var frameView = new FrameView(new FrameView.Model(JSON.parse(JSON.stringify(FrameView.defaultProperties))), {
      el: el
    });
    var detected = 0;
    var callBack = function() {
      detected++;
    };
    sizeObserver.register([frameView], callBack);

    if (window.navigator.userAgent.match(/node.js/i)){ // fake content size change in jsdom
      frameView.innerEl.scrollWidth=200;
      frameView.innerEl.scrollHeight=200;
    }
    // spyOn(frameView.innerEl, "getBoundingClientRect").and.callFake(function() {
    //   return {
    //     width: 100,
    //     height: 50
    //   };
    // });
    setTimeout(function() {
      expect(detected).toBe(1);

      if (window.navigator.userAgent.match(/node.js/i)){ // fake content size change in jsdom
        frameView.innerEl.clientWidth=200;
        frameView.innerEl.clientHeight=200;
      }
    }, 110);
    setTimeout(function() {
      expect(detected).toBe(2);
      done();
    }, 210);
  });
});
