xdescribe('UrlData', function() {

  var defaults;
  var utilities = require('../helpers/utilities.js');
  var Kern = require('../../../src/kern/kern.js');
  var UrlData = require('../../../src/framework/url/urldata.js');
  var StageView = require('../../../src/framework/stageview.js');
  var localLayerView;

  beforeEach(function() {
    defaults = require('../../../src/framework/defaults.js');

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    new StageView({
      el: document.getElementById('stage1')
    });

    localLayerView = document.getElementById('layer1')._ljView;
  });

  afterEach(function() {
    defaults.transitionParameters.type = 'p';
    defaults.transitionParameters.duration = 't';
  });

  it('can be created', function() {
    expect(new UrlData("http://localhost/", localLayerView)).toBeDefined();
  });

  it('will parse an url for transition options', function() {
    var url = window.location.origin + '/index.html?id=1&t=100s&p=left&cat=p';

    var urlData = new UrlData(url, localLayerView);
    expect(urlData.transition).toEqual({
      duration: '100s',
      type: 'left'
    });
  });

  it('will parse an url for hash transition options', function() {
    var url = window.location.origin + '/index.html?id=1&cat=p#frame1&t=100s&p=left';
    var urlData = new UrlData(url, localLayerView);

    expect(urlData.transition).toEqual({});
    expect(urlData.hashTransitions.hasOwnProperty('stage1.layer1.frame1')).toBeTruthy();
    expect(urlData.hashTransitions['stage1.layer1.frame1']).toEqual({
      duration: '100s',
      type: 'left'
    });
  });

  it('when no hashtransition if defined, the global transition will be used', function() {
    var url = window.location.origin + '/index.html?id=1&cat=p&t=100s&p=left#frame1';
    var urlData = new UrlData(url, localLayerView);

    expect(urlData.transition).toEqual({
      duration: '100s',
      type: 'left'
    });
    expect(urlData.hashTransitions.hasOwnProperty('stage1.layer1.frame1')).toBeTruthy();
    expect(urlData.hashTransitions['stage1.layer1.frame1']).toEqual(urlData.transition);
  });

  it('will merge the hashtranstion with the global transition', function() {
    var url = window.location.origin + '/index.html?id=1&cat=p&t=100s&p=left#frame1&p=right';
    var urlData = new UrlData(url, localLayerView);

    expect(urlData.transition).toEqual({
      duration: '100s',
      type: 'left'
    });
    expect(urlData.hashTransitions.hasOwnProperty('stage1.layer1.frame1')).toBeTruthy();
    expect(urlData.hashTransitions['stage1.layer1.frame1']).toEqual({
      duration: '100s',
      type: 'right'
    });
  });

  it('will remove transition options form the querystring', function() {
    var url = window.location.origin + '/index.html?id=1&cat=p&t=100s&p=left#frame1';
    var urlData = new UrlData(url, localLayerView);

    expect(urlData.url).toEqual('/index.html?id=1&cat=p#stage1.layer1.frame1');
  });

  it('will remove transition options form the hash', function() {
    var url = window.location.origin + '/index.html?id=1&cat=p#frame1&t=100s&p=left';
    var urlData = new UrlData(url, localLayerView);

    expect(urlData.url).toEqual('/index.html?id=1&cat=p#stage1.layer1.frame1');
  });

  it('will remove transition options form the querystring and hash', function() {
    var url = window.location.origin + '/index.html?id=1&cat=p&t=100s#frame1&p=left';
    var urlData = new UrlData(url, localLayerView);

    expect(urlData.url).toEqual('/index.html?id=1&cat=p#stage1.layer1.frame1');
  });

  it('will resolve relative paths', function() {
    var url = '/dir1/dir2/../index.html';
    var result = new UrlData(url, localLayerView);

    expect(result.url).toBe('/dir1/index.html');
  });

  it('will resolve ~/ paths', function() {
    var url = '~/index.html';

    var result = new UrlData(url, localLayerView);

    expect(result.url).toBe('/index.html');
  });

  it('will resolve /~/ paths', function() {
    var url = 'test/~/index.html';

    var result = new UrlData(url, localLayerView);

    expect(result.url).toBe('/index.html');
  });

  it('will make paths absolute from the same domain', function() {
    var url = window.location.origin + '/dir/../index.html';

    var result = new UrlData(url, localLayerView);

    expect(result.url).toBe('/index.html');
  });

  it('will not resolve paths from other domains', function() {
    var url = 'http://layerjs.org/dir/../index.html';

    var result = new UrlData(url, localLayerView);

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
      var result = new UrlData(url, localLayerView);

      expect(result.transition).toEqual({
        duration: '100s',
        type: 'left'
      });
    }
  });

  function specialFrameNamesTest(href, expectedUrl) {
    var result = new UrlData(href, localLayerView);
    expect(result.url).toBe(expectedUrl);
  }

  it('will append the path to the frame when using a local special frame name', function() {
    specialFrameNamesTest('/#!next', '/#stage1.layer1.frame2');
  });

  it('will append the framename when using a layerpath with a special frame name', function() {
    specialFrameNamesTest('/#stage1.layer1.!next', '/#stage1.layer1.frame2');
  });

  it('will append the framename when using a partial layerpath with a special frame name', function() {
    specialFrameNamesTest('/#layer1.!next', '/#stage1.layer1.frame2');
  });

  it('will not show in url if no-url="true"', function() {
    var url = window.location.href + '#stage1.layer1.frame2';

    localLayerView.outerEl.setAttribute('lj-no-url', 'true');

    var urlData = new UrlData(url, localLayerView);

    expect(urlData.url).toBe('/');
  });

  it('will show in url if no-url="false" or no-url is not set', function() {
    var url = window.location.href + '#stage1.layer1.frame2';

    var urlData = new UrlData(url, localLayerView);
    expect(urlData.url).toBe('/#stage1.layer1.frame2');

    localLayerView.outerEl.setAttribute('lj-no-url', 'false');
    urlData = new UrlData(url, localLayerView);
    expect(urlData.url).toBe('/#stage1.layer1.frame2');
  });

});
