describe('StateRouter', function() {

  var StateRouter = require('../../../src/framework/router/staterouter.js');
  var utilities = require('../helpers/utilities.js');
  var StageView = require('../../../src/framework/stageview.js')
  var state = require('../../../src/framework/state.js');

  var stateRouter;

  beforeEach(function() {
    stateRouter = new StateRouter();
  })

  it('can define states for an url', function() {
    var url = '/index.html';
    var states = ['stage1.layer1.frame1', 'stage1.layer1.frame1.layer2.frame2'];

    stateRouter.addRoute(url, states);

    expect(stateRouter.routes.hasOwnProperty(url)).toBeTruthy();
    expect(stateRouter.routes[url]).toBe(states);
  })

  it('can handle a predefined route', function(done) {
    var url = '/test.html';

    stateRouter.addRoute(url, ['stage1.layer1.frame2']);

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree();

    var handled = stateRouter.handle(url, {});

    expect(handled).toBeTruthy();

    setTimeout(function() {
      var layerView = document.getElementById('layer1')._ljView;
      expect(layerView.currentFrame.data.attributes.name).toBe('frame2');
      done();
    }, 500);
  });

});
