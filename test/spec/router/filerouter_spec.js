describe('Filerouter', function() {
  var FileRouter, StageView;
  var utilities, nock;

  beforeEach(function() {
    nock = require('nock');
    FileRouter = require('../../../src/framework/router/filerouter.js');
    utilities = require('../helpers/utilities.js');
    StageView = require('../../../src/framework/stageview.js');
  });

  it('can be created', function() {
    var fileRouter = new FileRouter();
    expect(fileRouter).toBeDefined();
  });

  it('will load a frame from another page', function(done) {
    utilities.setHtml('<div data-wl-type="stage" id="contentstage">' +
      '<div data-wl-type="layer" id="contentlayer" data-wl-default-frame="frame1">' +
      '<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="responsive">' +
      'this is frame 1.' +
      '<a id="link" href="http://localhost/somePage.html">link</a>' +
      '</div>' +
      '</div>' +
      '</div>');

    var scope = nock('http://localhost')
      .get('/somePage.html')
      .reply(200, '<div data-wl-type="stage" id="contentstage">' +
        '<div data-wl-type="layer" id="contentlayer" data-wl-default-frame="frame1">' +
        '<div data-wl-type="frame" data-wl-name="frame2" data-wl-fit-to="responsive">' +
        'this is frame 2.' +
        '</div>' +
        '</div>' +
        '</div>');

    var link = document.getElementById('link');
    var stageElement = document.getElementById('contentstage');
    var layerElement = document.getElementById('contentlayer');
    var stageView = new StageView(undefined, {
      el: stageElement
    });

    var fileRouter = new FileRouter();
    fileRouter.handle('http://localhost/somePage.html');
    scope.done();

    setTimeout(function() {
      console.log(window.location.href);
      expect(layerElement._wlView.currentFrame.data.attributes.name).toBe('frame2');
      done();
    }, 55);
  });

  it('when no matching path is found, the current frame stays', function(done) {
    utilities.setHtml('<div data-wl-type="stage" id="contentstage">' +
      '<div data-wl-type="layer" id="contentlayer" data-wl-default-frame="frame1">' +
      '<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="responsive">' +
      'this is frame 1.' +
      '<a id="link" href="http://localhost/somePage.html">link</a>' +
      '</div>' +
      '</div>' +
      '</div>');

    var scope = nock('http://localhost')
      .get('/somePage.html')
      .reply(200, '<div data-wl-type="stage" id="contentstage1">' +
        '<div data-wl-type="layer" id="contentlayer1" data-wl-default-frame="frame1">' +
        '<div data-wl-type="frame" data-wl-name="frame2" data-wl-fit-to="responsive">' +
        'this is frame 2.' +
        '</div>' +
        '</div>' +
        '</div>');

    var link = document.getElementById('link');
    var stageElement = document.getElementById('contentstage');
    var layerElement = document.getElementById('contentlayer');
    var stageView = new StageView(undefined, {
      el: stageElement
    });

    var fileRouter = new FileRouter();
    fileRouter.handle('http://localhost/somePage.html');
    scope.done();

    setTimeout(function() {
      expect(layerElement._wlView.currentFrame.data.attributes.name).toBe('frame1');
      done();
    }, 55);
  });

});
