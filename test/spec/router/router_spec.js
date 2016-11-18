describe('router', function() {

  var layerJS, defaults, StaticRouter;
  var utilities = require('../helpers/utilities.js');
  var StageView = require('../../../src/framework/stageview.js');
  var state = require('../../../src/framework/state.js');

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
    layerJS.router.addRouter(require('../../../src/framework/router/filerouter.js'));
    layerJS.router.addRouter(require('../../../src/framework/router/hashrouter.js'));
  });

  it('can be created', function() {
    expect(layerJS.router).toBeDefined();
  });

  it('will add the a StaticRouter at the beginning of the router pipline', function() {
    layerJS.router.addRouter(undefined)
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

    spyOn(dummyRouter, 'handle');

    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(dummyRouter.handle).toHaveBeenCalled();
  });

  it('will add a new entry to the history when url is handled', function() {
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

    var history = window.history;

    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(window.history.pushState).toHaveBeenCalled();

    window.history.pushState.and.callThrough();
  });

  it('will not add a new entry to the history when url can not be handled', function() {
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

    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.addRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(window.history.pushState).not.toHaveBeenCalled();

    window.history.pushState.and.callThrough();
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

  it('will parse an url for transition options', function() {
    console.log();
    var url = window.location.origin + '/index.html?id=1&t=100s&p=left&cat=p';

    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('/index.html?id=1&cat=p');
    expect(result.transitionOptions).toEqual({
      duration: '100s',
      type: 'left'
    });
  });

  it('will resolve relative paths', function() {
    var url = '/dir1/dir2/../index.html';
    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('/dir1/index.html');
  });

  it('will resolve ~/ paths', function() {
    var url = '~/index.html';

    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('/index.html');
  });

  it('will resolve /~/ paths', function() {
    var url = 'test/~/index.html';

    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('/index.html');
  });

  it('will make paths absolute from the same domain', function() {
    var url = window.location.origin + '/dir/../index.html';

    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('/index.html');
  });

  it('will not resolve paths from other domains', function() {
    var url = 'http://layerjs.org/dir/../index.html';

    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('http://layerjs.org/dir/../index.html');
  });

  it('the name for the transition options in an url are configurable', function() {

    var types = ['a', 'b', 'c', ];
    var durations = ['z', 'y', 'x', ];

    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var duration = durations[i];

      defaults.transitionParameters.type = type;
      defaults.transitionParameters.duration = duration;

      var url = window.location.origin + '/index.html?id=1&' + duration + '=100s&' + type + '=left&cat=p';
      var result = layerJS.router._parseUrl(url);

      expect(result.url).toBe('/index.html?id=1&cat=p');
      expect(result.transitionOptions).toEqual({
        duration: '100s',
        type: 'left'
      });
    }
  });

  it('will pass the transition options to the current router and will add a cleaned up url to the history', function() {
    var transitionOptions, urlHistory;

    var dummyRouter = {
      handle: function(url, transition) {
        transitionOptions = transition;

        var promise = new Kern.Promise();
        promise.resolve({
          handled: true,
          stop: true
        });
        return promise;
      }
    };

    window.history.pushState = function(param1, param2, url) {
      urlHistory = url;
    };

    layerJS.router.addRouter(dummyRouter);
    layerJS.router._navigate(window.location.origin + '/index.aspx/?1&test=2&t=10s&p=top&a=3', true);

    expect(urlHistory).toBe('/index.aspx/?1&test=2&a=3');
    expect(transitionOptions).toEqual({
      duration: '10s',
      type: 'top'
    });
  });

  it('will add the exiting state to the StaticRouter when a new navigation is done', function() {
    var url = window.location.origin + '/index.html';
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

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    window.history.pushState = function(param1, param2, url) {};

    new StageView(null, {
      el: document.getElementById('stage1')
    });

    layerJS.router.addRouter(dummyRouter);

    layerJS.router._navigate(url, true);
    console.log(layerJS.router.routers[0].routes);
    expect(layerJS.router.routers[0].routes.hasOwnProperty('/#')).toBeTruthy();
    expect(layerJS.router.routers[0].routes['/#']).toEqual(['stage1.layer1.frame1']);
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

    new StageView(null, {
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
          stop: false
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

    new StageView(null, {
      el: document.getElementById('stage1')
    });

    layerJS.router.addRouter(dummyRouter);
    layerJS.router.addRouter(dummyRouter2);
    layerJS.router._navigate(url, true);
    expect(handled).toBe(true);
  });

  it('layerJS.init() will call the navigate function', function() {
    var promise = new Kern.Promise();
    promise.resolve(true);
    spyOn(layerJS.router, '_navigate').and.returnValue(promise);

    layerJS.init();

    expect(layerJS.router._navigate).toHaveBeenCalled();

    layerJS.router._navigate.and.callThrough();
  });

  it('will append the layer path to a local special frame name', function() {
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

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'><a id='next' href='#!next'>next</a></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    new StageView(null, {
      el: document.getElementById('stage1')
    });

    var resultUrl;
    var dummyRouter = {
      handle: function(url) {
        var promise = new Kern.Promise();
        resultUrl = url;
        promise.resolve({
          handled: true,
          stop: true
        });
        return promise;
      }
    };

    layerJS.router.addRouter(dummyRouter);
    var element = document.getElementById('next');
    element.click();

    expect(resultUrl).toBe('/#stage1.layer1.!next');
  });
});
