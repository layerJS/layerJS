describe('Filerouter', function() {
  var FileRouter, StageView;
  var utilities, nock;

  beforeEach(function() {
    nock = require('nock');
    FileRouter = require('../../../src/framework/router/filerouter.js');
    utilities = require('../helpers/utilities.js');
    StageView = require('../../../src/framework/stageview.js');
    state = require('../../../src/framework/state.js');

    utilities.setHtml('<div data-lj-type="stage" id="contentstage">' +
      '<div data-lj-type="layer" id="contentlayer" data-lj-default-frame="frame1">' +
      '<div data-lj-type="frame" data-lj-name="frame1" data-lj-fit-to="responsive">' +
      'this is frame 1.' +
      '<a id="link" href="http://localhost/somePage.html">link</a>' +
      '</div>' +
      '</div>' +
      '</div>');
  });

  function prepareSomePage() {
    var scope = nock('http://localhost')
      .get('/somePage.html')
      .reply(200, '<div data-lj-type="stage" id="contentstage">' +
        '<div data-lj-type="layer" id="contentlayer" data-lj-default-frame="frame2">' +
        '<div data-lj-type="frame" data-lj-name="frame2" data-lj-fit-to="responsive">' +
        'this is frame 2.' +
        '</div>' +
        '</div>' +
        '</div>');

    return scope;
  }

  it('can be created', function() {
    var fileRouter = new FileRouter();
    expect(fileRouter).toBeDefined();
  });

  it('will load a frame from another page', function(done) {
    var scope = prepareSomePage();

    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('http://localhost/somePage.html');
    scope.done();

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(layerView.currentFrame.name()).toBe('frame2');
      done();
    });

  });

  it('will load a null frame from another page', function(done) {
    var scope = nock('http://localhost')
      .get('/somePage.html')
      .reply(200, '<div data-lj-type="stage" id="contentstage">' +
        '<div data-lj-type="layer" id="contentlayer" data-lj-default-frame="!none">' +
        '</div>' +
        '</div>');

    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('http://localhost/somePage.html');
    scope.done();

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(layerView.currentFrame).toBe(null);
      done();
    });

  });

  it('when no matching path is found, the current frame stays', function(done) {
    var scope = nock('http://localhost')
      .get('/somePage.html')
      .reply(200, '<div data-lj-type="stage" id="contentstage1">' +
        '<div data-lj-type="layer" id="contentlayer1" data-lj-default-frame="frame2">' +
        '<div data-lj-type="frame" data-lj-name="frame2" data-lj-fit-to="responsive">' +
        'this is frame 2.' +
        '</div>' +
        '</div>' +
        '</div>');

    new StageView({
      el: document.getElementById('contentstage')
    });
    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('/somePage.html');
    scope.done();

    promise.then(function() {
      expect(layerView.currentFrame.name()).toBe('frame1');
      done();
    });
  });

  it('will pass transition options to the layer when navigating to a frame', function(done) {
    var scope = prepareSomePage();
    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;
    spyOn(layerView, 'transitionTo');

    var transitionOptions = {
      duration: '2s',
      type: 'left'
    };

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('/somePage.html', transitionOptions);
    scope.done();

    promise.then(function() {
      expect(layerView.transitionTo).toHaveBeenCalledWith('frame2', transitionOptions);
      done();
    });
  });

  it('will return false when an error occured', function(done) {
    new StageView({
      el: document.getElementById('contentstage')
    });

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('/somePage.html');

    promise.then(function(result) {
      expect(result.handled).toBe(false);
      expect(result.stop).toBe(false);
      done();
    });
  });

  it('will keep the state of a loaded page in it\'s cache', function(done) {
    var scope = prepareSomePage();

    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;
    var transitionOptions = {
      duration: '0s',
      type: 'left'
    };

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('/somePage.html', transitionOptions);
    scope.done();

    promise.then(function(result) {
      expect(fileRouter._cache['/somePage.html']).toBeDefined();
      expect(fileRouter._cache['/somePage.html']).toEqual(state.exportState());
      done();
    });
  });

  it('will load the cached state of an already requested page', function(done) {
    utilities.setHtml('<div data-lj-type="stage" id="contentstage">' +
      '<div data-lj-type="layer" id="contentlayer" data-lj-default-frame="frame1" data-lj-layout-type="canvas">' +
      '<div data-lj-type="frame" data-lj-name="frame1" data-lj-fit-to="responsive">' +
      'this is frame 1.' +
      '</div>' +
      '<div data-lj-type="frame" data-lj-name="frame2" data-lj-fit-to="responsive">' +
      'this is frame 2.' +
      '</div>' +
      '</div>' +
      '</div>');

    new StageView({
      el: document.getElementById('contentstage')
    });

    var transitionOptions = {
      duration: '50ms',
      type: 'left'
    };

    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    fileRouter._cache['/somePage.html'] = ['contentstage.contentlayer.frame2'];
    var promise = fileRouter.handle('/somePage.html', transitionOptions);

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(layerView.currentFrame.name()).toBe('frame2');
      done();
    });
  });

  it('can cache current page', function() {
    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;
    var fileRouter = new FileRouter({cacheCurrent : true});
    expect(fileRouter._cache['/']).toEqual(state.exportState());
  });
});
