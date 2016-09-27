describe('router', function() {

  var layerJS, defaults, StateRouter;
  var utilities = require('../helpers/utilities.js');
  var StageView = require('../../../src/framework/stageview.js');
  var state = require('../../../src/framework/state.js');

  beforeEach(function() {
    layerJS = require('../../../src/framework/layerjs.js');
    defaults = require('../../../src/framework/defaults.js');
    StateRouter = require('../../../src/framework/router/staterouter.js');
    layerJS.router.clearRouters();
  });

  afterEach(function() {
    defaults.transitionParameters.type = 'p';
    defaults.transitionParameters.duration = 't';
    layerJS.router.clearRouters();
    layerJS.router.addRouter(require('../../../src/framework/router/filerouter.js'));
  });

  it('can be created', function() {
    expect(layerJS.router).toBeDefined();
  });

  it('will add the a staterouter at the beginning of the router pipline', function() {
    layerJS.router.addRouter(undefined)
    expect(layerJS.router.routers.length).toBe(2);
    expect(layerJS.router.routers[0] instanceof StateRouter).toBeTruthy();
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
        promise.resolve(true);
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
        promise.resolve(true);
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
        promise.resolve(false);
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
        promise.resolve(true);
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

  it('will make paths absolute from the same domain', function(){
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

      var url =  window.location.origin + '/index.html?id=1&' + duration + '=100s&' + type + '=left&cat=p';
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
        promise.resolve(true);
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

  it('will add the exiting state to the stateRouter when a new navigation is done', function() {
    var url = window.location.origin + '/index.html';
    var dummyRouter = {
    handle: function(url) {
      var promise = new Kern.Promise();
      promise.resolve(true);
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
    expect(layerJS.router.routers[0].routes.hasOwnProperty('/#')).toBeTruthy();
    expect(layerJS.router.routers[0].routes['/#']).toEqual(['stage1.layer1.frame1']);
  });
});
