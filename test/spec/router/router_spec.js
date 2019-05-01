describe('router', function() {

  var utilities = require('../helpers/utilities.js');
  var state = require('../../../src/framework/state.js');
  var Kern = require('../../../src/kern/Kern.js');
  var FileRouter = require('../../../src/framework/router/filerouter.js');
  var HashRouter = require('../../../src/framework/router/hashrouter.js');
  var StaticRouter = require('../../../src/framework/router/staticrouter.js');
  var layerJS = require('../../../src/framework/layerjs.js');
  var defaults = require('../../../src/framework/defaults.js');

  beforeEach(function() {
    layerJS.router.clearRouters();
  });

  afterEach(function() {
    defaults.transitionParameters.type = 'p';
    defaults.transitionParameters.duration = 't';
    layerJS.router.clearRouters();
    layerJS.router.addRouter(new FileRouter());
    layerJS.router.addRouter(new HashRouter());
    window.location.href = "http://localhost/";
  });

  it('can be created', function() {
    expect(layerJS.router).toBeDefined();
  });


  it('will mark the staticrouter', function() {
    var staticRouter = new StaticRouter();

    layerJS.router.addRouter(staticRouter);
    expect(layerJS.router.routers.length).toBe(1);
    expect(layerJS.router.routers[0] instanceof StaticRouter).toBeTruthy();
    expect(layerJS.router.staticRouter).toBe(staticRouter);
  });

  it('will detect a link click event', function() {
    var navigate = layerJS.router.navigate;

    var element = document.createElement('a');
    element.href = '#';

    document.body.appendChild(element);

    spyOn(layerJS.router, 'navigate');
    element.click();

    expect(layerJS.router.navigate).toHaveBeenCalled();

    layerJS.router.navigate.and.callThrough();
  });

  it('will let the current router can handle the url', function() {
    var called = false;
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        called = true;
        return promise;
      }
    };

    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(called).toBeTruthy();
  });

  it('will ignore links with data-lj-no-link attribute', function() {
    var called = false;
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        called = true;
        return promise;
      }
    };

    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.setAttribute('data-lj-no-link','true');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(called).toBeFalsy();
  });

  it('will ignore links with target attribute !== _self', function() {
    var called = false;
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        called = true;
        return promise;
      }
    };

    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.setAttribute('target','_new');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(called).toBeFalsy();
  });


  it('will not add a new entry to the history when url can not be handled', function(done) {
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: false,
          stop: false
        });
        return promise;
      }
    };

    var history = window.history;
    var called = false;
    window.history.pushState = function() {
      called = true
    };


    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    setTimeout(function() {
      expect(called).toBe(false);
      delete window.history.replaceState;
      done();
    }, 1000);
  });

  it('the window.popState will call the navigate method on the router and won\'t add an entry to the history', function() {
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        return promise;
      }
    };

    spyOn(layerJS.router, 'navigate');
    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.addRouter(dummyRouter);
    window.onpopstate();

    expect(layerJS.router.navigate).toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();

    layerJS.router.navigate.and.callThrough();
    window.history.pushState.and.callThrough();
  });

  it('will stop iterating routers when a router return stop == true', function() {
    var url = window.location.origin + '/index.html';
    var handled = false;
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        return promise;
      }
    };

    var dummyRouter2 = {
      handle: function(url) {
        handled = true;
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        return promise;
      }
    };

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    window.history.pushState = function(param1, param2, url) {};

    layerJS.router.addRouter(dummyRouter);
    layerJS.router.addRouter(dummyRouter2);

    layerJS.router.navigate(url, true);
    expect(handled).toBe(false);
  });

  it('will iterate to the next router when a router return stop == false but handled the url', function() {
    var url = window.location.origin + '/index.html';
    var handled = false;
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: false,
          paths: []
        });
        return promise;
      }
    };

    var dummyRouter2 = {
      handle: function(url) {
        handled = true;
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true,
          paths: []
        });
        return promise;
      }
    };


    layerJS.router.addRouter(dummyRouter);
    layerJS.router.addRouter(dummyRouter2);
    layerJS.router.navigate(url, true);
    expect(handled).toBe(true);
  });

  //TODO: Look at more detail
  it('will use the pushState after a transition that started with a click', function(done) {
    var newUrl;
   var newState;
    window.history.pushState = function(param1, param2, url) {
      newUrl = url;
      newState = param1.state;
    };

    layerJS.router.addRouter(new FileRouter());
    layerJS.router.addRouter(new HashRouter());

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<a href='/#frame2' id='link'>click me </a>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    document.getElementById('link').click();

    setTimeout(function() {
      expect(newUrl).toBe('http://localhost/#frame2');
      expect(document.getElementById('layer1')._ljView.currentFrame.id()).toBe('frame2');
      expect(newState).toEqual(['stage1.layer1.frame2','stage1.layer1.frame1$' ])
      done();
    }, 2000);
  });

  it('will use the replacestate after a transition that started with a click (no-url)', function(done) {
    debugger;
    var newUrl;
    var newState;
    window.history.replaceState = function(param1, param2, url) {
      newUrl = url;
      newState = param1.state;
    };

    layerJS.router.addRouter(new FileRouter());
    layerJS.router.addRouter(new HashRouter());

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1' data-lj-no-url='true'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<a href='/#frame2' id='link'>click me </a>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    document.getElementById('link').click();

    setTimeout(function() {
      expect(newUrl).toBe('http://localhost/');
      expect(document.getElementById('layer1')._ljView.currentFrame.id()).toBe('frame2');
      expect(newState).toEqual(['stage1.layer1.frame2','stage1.layer1.frame1$' ])
      done();
    }, 2000);
  },5000);

  it('layerJS.init() will call the navigate function', function() {
    var promise = new Kern.Promise();
    promise.resolve(true);
    spyOn(layerJS.router, 'navigate').and.returnValue(promise);

    layerJS.init();

    expect(layerJS.router.navigate).toHaveBeenCalled();

    layerJS.router.navigate.and.callThrough();
  });

  it('will use the paths from the routers to transition', function() {
    var dummyRouter1 = {
      handle: function() {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: false,
          paths: ['contentStage1.contentLayer1.frame1']
        });
        return promise;
      }
    };

    var dummyRouter2 = {
      handle: function() {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: false,
          paths: ['contentStage2.contentLayer1.frame1']
        });
        return promise;
      }
    };

    layerJS.router.addRouter(dummyRouter1);
    layerJS.router.addRouter(dummyRouter2);
    var state = layerJS.getState();
    var paths;
    spyOn(state, 'transitionTo').and.callFake(function(states) {
      paths = states;
    });

    var promise = layerJS.router.navigate(window.location.origin + '/index.html', false);

    promise.then(function() {
      expect(state.transitionTo).toHaveBeenCalled();
      expect(paths).toEqual(['contentStage1.contentLayer1.frame1', 'contentStage2.contentLayer1.frame1']);
    });
  });

});
