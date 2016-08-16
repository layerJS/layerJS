describe('router', function() {

  var WL, router;

  beforeEach(function() {

    WL = require('../../../src/framework/wl.js');
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
});
