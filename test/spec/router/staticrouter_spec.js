describe('staticRouter', function() {

  var StaticRouter = require('../../../src/framework/router/staticRouter.js');
  var utilities = require('../helpers/utilities.js');
  var StageView = require('../../../src/framework/stageview.js')
  var state = require('../../../src/framework/state.js');

  var staticRouter;

  beforeEach(function() {
    staticRouter = new StaticRouter();
  })

  it('can define states for an url', function() {
    var url = '/index.html';
    var states = ['stage1.layer1.frame1', 'stage1.layer1.frame1.layer2.frame2'];

    staticRouter.addRoute(url, states);

    expect(staticRouter.routes.hasOwnProperty(url)).toBeTruthy();
    expect(staticRouter.routes[url]).toBe(states);
  })

  it('can handle a predefined route', function(done) {
    var url = '/test.html';

    staticRouter.addRoute(url, ['stage1.layer1.frame2']);

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

    var promise = staticRouter.handle({ url, transition: {}});

    promise.then(function(result) {
      setTimeout(function() {
        expect(result.handled).toBeTruthy();
        expect(result.stop).toBeTruthy();
        var layerView = document.getElementById('layer1')._ljView;
        expect(layerView.currentFrame.name()).toBe('frame2');
        done();
      }, 500);
    });
  });

});
