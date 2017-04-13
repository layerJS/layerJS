describe('Filerouter', function() {
  var FileRouter, StageView, UrlData;
  var utilities, nock;

  beforeEach(function() {
    nock = require('nock');
    FileRouter = require('../../../src/framework/router/filerouter.js');
    utilities = require('../helpers/utilities.js');
    StageView = require('../../../src/framework/stageview.js');
    state = require('../../../src/framework/state.js').getState();

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
      expect(result.paths).toEqual(['contentstage.contentlayer.frame2']);
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
      expect(result.paths).toEqual(['contentstage.contentlayer.!none']);
      done();
    });

  }, 5000);

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

    promise.then(function(result) {
      expect(result.paths).toEqual([]);
      done();
    });
  });

  xit('will pass transition options to the layer when navigating to a frame', function(done) {
    var scope = prepareSomePage();
    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;
    spyOn(state, 'transitionTo');

    var transitionOptions = {
      duration: '2s',
      type: 'left'
    };

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle('/somePage.html?t=2s&p=left');
    scope.done();

    setTimeout(function() {
      promise.then(function(result) {
        expect(state.transitionTo).toHaveBeenCalledWith(['contentstage.contentlayer.frame2'], urlData.transition); //, urlData.transition);
        done();
      });
    }, 1000);
  }, 5000);

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
    var promise = fileRouter.handle('/somePage.html');
    scope.done();

    promise.then(function(result) {
      expect(fileRouter._cache['/somePage.html']).toBeDefined();
      expect(fileRouter._cache['/somePage.html']).toEqual(result.paths);
      done();
    });
  }, 5000);

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
    var promise = fileRouter.handle('/somePage.html');

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(result.paths).toEqual(['contentstage.contentlayer.frame2']);
      done();
    });
  });

  it('can cache current page', function() {
    new StageView({
      el: document.getElementById('contentstage')
    });

    var layerView = document.getElementById('contentlayer')._ljView;
    var fileRouter = new FileRouter({
      cacheCurrent: true
    });
    expect(fileRouter._cache['/']).toEqual(state.exportState());
  });

  it('can build an url based on it\'s cached states', function() {
    var fileRouter = new FileRouter();

    fileRouter._cache['/index.html?id=1&a=4'] = ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer3.frame3'];
    fileRouter._cache['/index2.html'] = ['stage1.layer1.frame1', 'stage1.layer2.frame3'];

    var options = {
      url: '',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer4.frame2']
    };

    fileRouter.buildUrl(options);
    expect(options.url).toBe('/index.html?id=1&a=4');
    expect(options.state).toEqual(['stage1.layer4.frame2']);
  });
});
