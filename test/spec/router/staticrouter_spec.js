describe('staticRouter', function() {

  var StaticRouter = require('../../../src/framework/router/staticrouter.js');
  var utilities = require('../helpers/utilities.js');
  var state = require('../../../src/framework/state.js');

  var staticRouter;

  beforeEach(function() {
    staticRouter = new StaticRouter();
  })

  it('can define states for an url', function() {
    var url = '/index.html';
    var fullUrl = 'http://localhost' + url;
    var routeOptions = {
      pageTitle: 'test',
      state: ['stage1.layer1.frame1', 'stage1.layer1.frame1.layer2.frame2']
    };

    staticRouter.addRoute(url, routeOptions);

    expect(staticRouter.routes.hasOwnProperty(fullUrl)).toBeTruthy();
    expect(staticRouter.routes[fullUrl]).toBe(routeOptions);
  })

  it('can handle a predefined route', function(done) {
    var url = 'http://localhost/test.html';
    var options = {
      location: url,
      queryString: '',
      transitions: [],
      paths: [],
      globalTransition: {}
    };
    var routeOptions = {
      pageTitle: 'test',
      state: ['stage1.layer1.frame2']
    };
    staticRouter.addRoute(url, routeOptions);

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var promise = staticRouter.handle(options);

    promise.then(function(result) {
      setTimeout(function() {
        expect(result.handled).toBeTruthy();
        expect(result.stop).toBe(false);
        expect(result.paths).toEqual(routeOptions.state);
        expect(result.transitions.length).toBe(1);
        done();
      }, 500);
    });
  });

  it('can build an url based on it\'s states', function() {
    staticRouter.addRoute('/index.html?id=1&a=4', {
      pageTitle: 'index',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer3.frame3']
    });
    staticRouter.addRoute('/index2.html', {
      pageTitle: 'index2',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame3']
    });


    var options = {
      url: '',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer4.frame2']
    };

    staticRouter.buildUrl(options);
    expect(options.pageTitle).toBe('index');
    expect(options.location).toBe('http://localhost/index.html');
    expect(options.queryString).toBe('id=1&a=4');
    expect(options.state).toEqual(['stage1.layer4.frame2']);
  });

  it('can build an url based on it\'s states (and will take the ommited state into account)', function() {
    staticRouter.addRoute('/index.html?id=1&a=4', {
      pageTitle: 'index',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame2', 'stage1.layer3.frame3']
    });
    staticRouter.addRoute('/index2.html', {
      pageTitle: 'index2',
      state: ['stage1.layer1.frame1', 'stage1.layer2.frame3']
    });


    var options = {
      url: '',
      state: ['stage1.layer1.frame1'],
      omittedState: ['stage1.layer2.frame2']
    };

    staticRouter.buildUrl(options);
    expect(options.pageTitle).toBe('index');
    expect(options.location).toBe('http://localhost/index.html');
    expect(options.queryString).toBe('id=1&a=4');
    expect(options.state).toEqual([]);
  });

});
