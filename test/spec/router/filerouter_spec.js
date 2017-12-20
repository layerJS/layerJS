describe('Filerouter', function() {
  var FileRouter= require('../../../src/framework/router/filerouter.js');
  var nock = require('nock');
  var utilities = require('../helpers/utilities.js');

  beforeEach(function() {
    state = layerJS.getState();
//    window.location.href = "http://localhost/";

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
    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    var options = {
      location: 'http://localhost/somePage.html',
      queryString : '',
      transitions: [],
      globalTransition: {
        type: 'left'
      }
    };

    var promise = fileRouter.handle(options);
    scope.done();

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(result.paths).toEqual(['contentstage.contentlayer.frame2']);
      expect(result.transitions.length).toBe(1);
      expect(result.transitions[0].type).toBe(options.globalTransition.type);
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

    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    var options = {
      location: 'http://localhost/somePage.html',
      queryString: '',
      transitions: [],
      globalTransition: {}
    };
    var promise = fileRouter.handle(options);
    scope.done();

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(result.paths).toEqual(['contentstage.contentlayer.!none']);
      expect(result.transitions.length).toBe(1);
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

    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle({
      location: 'http://localhost/somePage.html',
      queryString : '',
      transitions: [],
      globalTransition: {}
    });
    scope.done();

    promise.then(function(result) {
      expect(result.paths).toEqual([]);
      expect(result.transitions.length).toBe(0);
      done();
    });
  });

  it('will return false when an error occured', function(done) {
    var fileRouter = new FileRouter();
    var promise = fileRouter.handle({
      location: 'http://localhost/somePage.html',
      transitions: [],
      globalTransition: {}
    });

    promise.then(function(result) {
      expect(result.handled).toBe(false);
      expect(result.stop).toBe(false);
      done();
    });
  });

  it('will keep the state of a loaded page in it\'s cache', function(done) {
    var scope = prepareSomePage();
    var layerView = document.getElementById('contentlayer')._ljView;
    var transitionOptions = {
      duration: '0s',
      type: 'left'
    };

    var options = {
      location: 'http://localhost/somePage.html',
      queryString : '',
      transitions: [],
      globalTransition: transitionOptions
    };

    var fileRouter = new FileRouter();
    var promise = fileRouter.handle(options);
    scope.done();

    promise.then(function(result) {
      expect(fileRouter.routes['http://localhost/somePage.html']).toBeDefined();
      expect(fileRouter.routes['http://localhost/somePage.html']).toEqual(result.paths);
      expect(result.transitions.length).toBe(1);
      done();
    });
  }, 5000);

  it('will load the cached state of an already requested page', function(done) {
    /*utilities.setHtml('<div data-lj-type="stage" id="contentstage">' +
      '<div data-lj-type="layer" id="contentlayer" data-lj-default-frame="frame1" data-lj-layout-type="canvas">' +
      '<div data-lj-type="frame" data-lj-name="frame1" data-lj-fit-to="responsive">' +
      'this is frame 1.' +
      '</div>' +
      '<div data-lj-type="frame" data-lj-name="frame2" data-lj-fit-to="responsive">' +
      'this is frame 2.' +
      '</div>' +
      '</div>' +
      '</div>');
*/
    var transitionOptions = {
      duration: '50ms',
      type: 'left'
    };

    var layerView = document.getElementById('contentlayer')._ljView;

    var fileRouter = new FileRouter();
    fileRouter.routes['http://localhost/somePage.html'] = ['contentstage.contentlayer.frame2'];
    var options = {
      location: 'http://localhost/somePage.html',
      queryString: '',
      transitions: [],
      globalTransition: transitionOptions
    };
    var promise = fileRouter.handle(options);

    promise.then(function(result) {
      expect(result.handled).toBeTruthy();
      expect(result.stop).toBeFalsy();
      expect(result.paths).toEqual(['contentstage.contentlayer.frame2']);
      expect(result.transitions.length).toBe(1);
      done();
    });
  });

  it('can cache current page', function() {
    window.location.href = "http://localhost/";

    var layerView = document.getElementById('contentlayer')._ljView;
    var fileRouter = new FileRouter({
      cacheCurrent: true
    });
    expect(fileRouter.routes['http://localhost/']).toEqual(state.exportState());
  });

  it('can build an url based on it\'s cached states', function() {
    var fileRouter = new FileRouter();

    fileRouter.routes['http://localhost/index.html?id=1&a=4'] = ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer3.frame3'];
    fileRouter.routes['http://localhost/index2.html'] = ['stage1.layer1.frame1', 'stage1.layer2.frame3'];

    var options = {
      url: '',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer4.frame2']
    };

    fileRouter.buildUrl(options);
    expect(options.location).toBe('http://localhost/index.html');
    expect(options.queryString).toBe('id=1&a=4');
    expect(options.state).toEqual(['stage1.layer4.frame2']);
  });

it('can build an url based on it\'s cached states (and will take omittedStates into account)', function() {
    var fileRouter = new FileRouter();

    fileRouter.routes['http://localhost/index.html?id=1&a=4'] = ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer3.frame3'];
    fileRouter.routes['http://localhost/index2.html'] = ['stage1.layer1.frame1', 'stage1.layer2.frame3'];

    var options = {
      url: '',
      state: ['stage1.layer1.frame1', 'stage1.layer4.frame2'],
      omittedStates : ['stage1.layer2.frame2']
    };

    fileRouter.buildUrl(options);
    expect(options.location).toBe('http://localhost/index.html');
    expect(options.queryString).toBe('id=1&a=4');
    expect(options.state).toEqual(['stage1.layer4.frame2']);
  });
});
