describe('router', function() {

  var layerJS, defaults, StaticRouter;
  var utilities = require('../helpers/utilities.js');
  var StageView = require('../../../src/framework/stageview.js');
  var state = require('../../../src/framework/state.js');
  var Kern = require('../../../src/kern/kern.js');
  var FileRouter = require('../../../src/framework/router/filerouter.js');
  var HashRouter = require('../../../src/framework/router/hashrouter.js');

  beforeEach(function() {
    layerJS = require('../../../src/framework/layerjs.js');
    defaults = require('../../../src/framework/defaults.js');
    StaticRouter = require('../../../src/framework/router/staticrouter.js');
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

  it('will add the a StaticRouter at the beginning of the router pipline', function() {
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

    layerJS.router.addRouter(dummyRouter);
    expect(layerJS.router.routers.length).toBe(2);
    expect(layerJS.router.routers[0] instanceof StaticRouter).toBeTruthy();
  });

  it('will detect a link click event', function() {
    var navigate = layerJS.router._navigate;

    var element = document.createElement('a');
    element.href = '#';

    document.body.appendChild(element);

    spyOn(layerJS.router, '_navigate');
    element.click();

    expect(layerJS.router._navigate).toHaveBeenCalled();

    layerJS.router._navigate.and.callThrough();
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


  xit('will not add a new entry to the history when url can not be handled', function(done) {
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

    spyOn(layerJS.router, '_navigate');
    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.addRouter(dummyRouter);
    window.onpopstate();

    expect(layerJS.router._navigate).toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();

    layerJS.router._navigate.and.callThrough();
    window.history.pushState.and.callThrough();
  });

  xit('will add the exiting state to the StaticRouter when a new navigation is done', function(done) {
    var url = window.location.origin + '/index.html';
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true,
          paths: []
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

    new StageView({
      el: document.getElementById('stage1')
    });

    layerJS.router.addRouter(dummyRouter);
    layerJS.router._navigate(url, true).then(function() {
      expect(layerJS.router.routers[0].routes.hasOwnProperty('http://localhost/')).toBeTruthy();
      expect(layerJS.router.routers[0].routes['http://localhost/']).toEqual(['stage1.layer1.frame1']);
      done();
    });
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

    new StageView({
      el: document.getElementById('stage1')
    });

    layerJS.router.addRouter(dummyRouter);
    layerJS.router.addRouter(dummyRouter2);

    layerJS.router._navigate(url, true);
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
    layerJS.router._navigate(url, true);
    expect(handled).toBe(true);
  });

  it('will use the pushState after a transition that started with a click', function(done) {
    var newUrl;
    window.history.pushState = function(param1, param2, url) {
      newUrl = url;
    };

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<a href='/#frame2' id='link'>click me </a>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    new StageView({
      el: document.getElementById('stage1')
    });

    layerJS.router.addRouter(new FileRouter());
    layerJS.router.addRouter(new HashRouter());
    document.getElementById('link').click();

    setTimeout(function() {
      expect(newUrl).toBe('http://localhost/#frame2');
      done();
    }, 2000);
  });

  it('layerJS.init() will call the navigate function', function() {
    var promise = new Kern.Promise();
    promise.resolve(true);
    spyOn(layerJS.router, '_navigate').and.returnValue(promise);

    layerJS.init();

    expect(layerJS.router._navigate).toHaveBeenCalled();

    layerJS.router._navigate.and.callThrough();
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

    var promise = layerJS.router._navigate(window.location.origin + '/index.html', false);

    promise.then(function() {
      expect(state.transitionTo).toHaveBeenCalled();
      expect(paths).toEqual(['contentStage1.contentLayer1.frame1', 'contentStage2.contentLayer1.frame1']);
    });
  });

});
