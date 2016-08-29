describe('router', function() {

  var layerJS, defaults;

  beforeEach(function() {
    layerJS = require('../../../src/framework/layerjs.js');
    defaults = require('../../../src/framework/defaults.js');
  });

  afterEach(function() {
    defaults.transitionParameters.type = 'p';
    defaults.transitionParameters.duration = 't';
    layerJS.router.setCurrentRouter(require('../../../src/framework/router/filerouter.js'));
  });

  it('can be created', function() {
    expect(layerJS.router).toBeDefined();
  });

  it('can set a different router', function() {
    layerJS.router.setCurrentRouter(undefined);
    expect(layerJS.router.currentRouter).toBe(undefined);
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
      handle: function(url) { return true;}
    };

    spyOn(dummyRouter, 'handle');

    layerJS.router.setCurrentRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(dummyRouter.handle).toHaveBeenCalled();
  });

  it('will add a new entry to the history when url is handled', function() {
    var dummyRouter = {
      handle: function(url) { return true;}
    };

    var history = window.history;

    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.setCurrentRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = '#';
    document.body.appendChild(element);
    element.click();

    expect(window.history.pushState).toHaveBeenCalled();

    window.history.pushState.and.callThrough();
  });

  it('will not add a new entry to the history when url can not be handled', function() {
    var dummyRouter = {
      handle: function(url) { return false;}
    };

    var history = window.history;

    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.setCurrentRouter(dummyRouter);
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
        return true;
      }
    };

    spyOn(layerJS.router, '_navigate');
    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    layerJS.router.setCurrentRouter(dummyRouter);
    window.onpopstate();

    expect(layerJS.router._navigate).toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();

    layerJS.router._navigate.and.callThrough();
    window.history.pushState.and.callThrough();
  });

  it('will parse an url for transition options', function() {
    var url = 'http://localhost/index.html?id=1&t=100s&p=left&cat=p';

    var result = layerJS.router._parseUrl(url);

    expect(result.url).toBe('http://localhost/index.html?id=1&cat=p');
    expect(result.transitionOptions).toEqual({
      duration: '100s',
      type: 'left'
    });
  });

  it('the name for the transition options in an url are configurable', function() {

    var types = ['a', 'b', 'c', ];
    var durations = ['z', 'y', 'x', ];

    for (var i = 0; i < types.length; i++) {
      var type = types[i];
      var duration = durations[i];

      defaults.transitionParameters.type = type;
      defaults.transitionParameters.duration = duration;

      var url = 'http://localhost/index.html?id=1&' + duration + '=100s&' + type + '=left&cat=p';
      var result = layerJS.router._parseUrl(url);

      expect(result.url).toBe('http://localhost/index.html?id=1&cat=p');
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

        return true;
      }
    };

    window.history.pushState = function(param1, param2, url) {
      urlHistory = url;
    };

    layerJS.router.setCurrentRouter(dummyRouter);
    layerJS.router._navigate('http://localhost/index.aspx/?1&test=2&t=10s&p=top&a=3', true);

    expect(urlHistory).toBe('http://localhost/index.aspx/?1&test=2&a=3');
    expect(transitionOptions).toEqual({
      duration: '10s',
      type: 'top'
    });
  });
});
