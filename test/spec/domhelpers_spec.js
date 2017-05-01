describe('DomHelpers', function() {

  var defaults = require('../../src/framework/defaults.js');
  var domHelpers = require('../../src/framework/domhelpers.js');

  afterEach(function() {
    defaults.transitionParameters.type = 'p';
    defaults.transitionParameters.duration = 't';
  });

  it('can parse the queryString for transitionParameters', function() {
    var url = window.location.origin + '/index.html?id=1&t=100s&p=left&cat=p';
    var result = domHelpers.parseQueryString(url);

    expect(result.url).toEqual(window.location.origin + '/index.html?id=1&cat=p');
    expect(result.transition).toEqual({
      duration: '100s',
      type: 'left'
    });
  });

  it('can parse the queryString for transitionParameters and not remove the transition parameters', function() {
    var url = window.location.origin + '/index.html?id=1&t=100s&p=left&cat=p';
    var result = domHelpers.parseQueryString(url, true);

    expect(result.url).toEqual(window.location.origin + '/index.html?id=1&t=100s&p=left&cat=p');
    expect(result.transition).toEqual({
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

      var url = window.location.origin + '/index.html?id=1&' + duration + '=100s&' + type + '=left&cat=p';
      var result = domHelpers.parseQueryString(url);

      expect(result.url).toEqual(window.location.origin + '/index.html?id=1&cat=p');
      expect(result.transition).toEqual({
        duration: '100s',
        type: 'left'
      });
    }
  });

  it('will resolve relative paths', function() {
    var url = '/dir1/dir2/../index.html';
    var result = domHelpers.getAbsoluteUrl(url);

    expect(result).toBe('/dir1/index.html');
  });

  it('will resolve ~/ paths', function() {
    var url = '~/index.html';

    var result = domHelpers.getAbsoluteUrl(url);

    expect(result).toBe('/index.html');
  });

  it('will resolve /~/ paths', function() {
    var url = 'test/~/index.html';

    var result = domHelpers.getAbsoluteUrl(url);

    expect(result).toBe('/index.html');
  });

  it('will make paths absolute from the same domain', function() {
    var url = window.location.origin + '/dir/../index.html';

    var result = domHelpers.getAbsoluteUrl(url);

    expect(result).toBe('/index.html');
  });

  it('will not resolve paths from other domains', function() {
    var url = 'http://layerjs.org/dir/../index.html';

    var result =domHelpers.getAbsoluteUrl(url);

    expect(result).toBe('http://layerjs.org/dir/../index.html');
  });

});
