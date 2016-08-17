describe('router', function() {

  var WL, defaults;

  beforeEach(function() {

    WL = require('../../../src/framework/wl.js');
    defaults = require('../../../src/framework/defaults.js');
  });

  it('can be created', function() {
    expect(WL.router).toBeDefined();
  });

  it('can set a different router', function() {
    WL.router.setCurrentRouter(undefined);
    expect(WL.router.currentRouter).toBe(undefined);
  });

  it('will detect a link click event', function() {
    var navigate = WL.router._navigate;

    var element = document.createElement('a');
    element.href = 'http://www.google.be';

    document.body.appendChild(element);

    spyOn(WL.router, '_navigate');
    element.click();

    expect(WL.router._navigate).toHaveBeenCalled();
  });

  it('will check if the current router can handle the url', function() {
    var dummyRouter = {
      canHandle: function() {
        return false;
      }
    };
    spyOn(dummyRouter, 'canHandle');

    WL.router.setCurrentRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = 'http://www.google.be';
    document.body.appendChild(element);
    element.click();

    expect(dummyRouter.canHandle).toHaveBeenCalled();
  });

  it('will let the current router can handle the url', function() {
    var dummyRouter = {
      canHandle: function() {
        return true;
      },
      handle: function(url) {}
    };

    spyOn(dummyRouter, 'handle');

    WL.router.setCurrentRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = 'http://www.google.be';
    document.body.appendChild(element);
    element.click();

    expect(dummyRouter.handle).toHaveBeenCalled();
  });

  it('will add a new entry to the history', function() {
    var dummyRouter = {
      canHandle: function() {
        return true;
      },
      handle: function(url) {}
    };

    var history = window.history;

    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    WL.router.setCurrentRouter(dummyRouter);
    var element = document.createElement('a');
    element.href = 'http://www.google.be';
    document.body.appendChild(element);
    element.click();

    expect(window.history.pushState).toHaveBeenCalled();
  });

  it('the window.popState will call the navigate method on the router and won\'t add an entry to the history', function() {
    var dummyRouter = {
      canHandle: function() {
        return true;
      },
      handle: function(url) {}
    };

    spyOn(WL.router, '_navigate');
    window.history.pushState = function() {};
    spyOn(window.history, 'pushState');

    WL.router.setCurrentRouter(dummyRouter);
    window.onpopstate();

    expect(WL.router._navigate).toHaveBeenCalled();
    expect(window.history.pushState).not.toHaveBeenCalled();
  });

  it('will parse an url for transition options', function() {
    var url = 'http://localhost/index.html?id=1&t=100s&p=left&cat=p';

    var result = WL.router._parseUrl(url);

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
      var result = WL.router._parseUrl(url);

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
      canHandle: function() {
        return true;
      },
      handle: function(url, transition) {
        transitionOptions = transition;
      }
    };

    window.history.pushState = function(param1, param2, url) {
      urlHistory = url;
    };

    WL.router.setCurrentRouter(dummyRouter);
    WL.router._navigate('http://localhost/index.aspx/?1&test=2&t=10s&p=top&a=3', true);

    expect(urlHistory).toBe('http://localhost/index.aspx/?1&test=2&a=3');
    expect(transitionOptions).toEqual({
      duration: '10s',
      type: 'top'
    });
  });
});
