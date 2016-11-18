var LayerView = require('../../src/framework/layerview.js');
var StageView = require('../../src/framework/stageview.js');
var state = require('../../src/framework/state.js');

var ViewsGroupViewTests = require('./helpers/views/group/viewtests.js');

var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var ViewsCommon_renderChildPositionTests = require('./helpers/views/common/_renderchildpositiontests.js');
var ViewsGroup_parseChildrenTests = require('./helpers/views/group/_parseChildrentests.js');

var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js');

describe("LayerView", function() {

  var utilities = require('./helpers/utilities.js');

  ViewsCommonViewTests('simple_layerdata_nochildren.js', function() {
    return {
      ViewType: LayerView,
      data: require('./datasets/simple_layerdata_nochildren.js')[0]
    }
  });

  ViewsGroupViewTests('simple_layerdata.js', function() {
    return {
      data: require('./datasets/simple_layerdata.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

  ViewsCommon_renderChildPositionTests('simple_layerdata.js', function() {
    return {
      data: require('./datasets/simple_layerdata.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

  ViewsGroupViewTests('test_data_set.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/test_data_set.js'))),
      ViewType: LayerView,
      parentId: 5
    };
  });

  ViewsCommon_renderChildPositionTests('test_data_set.js', function() {
    return {
      data: require('./datasets/test_data_set.js'),
      ViewType: LayerView,
      parentId: 5
    };
  });

  ViewsCommonParseTests(function() {
    return {
      ViewType: LayerView
    }
  });

  it('the Parse method will set nativeScroll to true if the DOM element has a data-lj-native-scroll attribute equals true', function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-native-scroll', 'true');
    element.innerHTML = "<div data-lj-helper='scroller'/>";

    var layerView = new LayerView(null, {
      el: element
    });
    var dataModel = layerView.data;

    expect(dataModel.attributes.nativeScroll).toBeTruthy();
  });

  it('the Parse method will set nativeScroll to false if the DOM element has a data-lj-native-scroll attribute equals false', function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-native-scroll', 'false');
    element.innerHTML = "<div/>";

    var layerView = new LayerView(null, {
      el: element
    });
    var dataModel = layerView.data;

    expect(dataModel.attributes.nativeScroll).toBeFalsy();
  });

  ViewsGroup_parseChildrenTests(function() {
    return {
      ViewType: LayerView,
      viewTypeName: 'LayerView',
      type: 'layer',
      HTML: "<div id='100' data-lj-id='100' data-lj-type='layer'>" +
        "<div id='101' data-lj-id='101' data-lj-type='frame'></div>" +
        "<div id='102' data-lj-id='102' data-lj-type='frame'></div>" +
        "<div/>" +
        "</div>",
      expectedChildren: ['101', '102']
    };
  });

  ViewsCommonIdentifyTests('div data-lj-type="layer"', LayerView, function() {
    var element = document.createElement('div');
    element.setAttribute('data-lj-type', 'layer');

    return element;
  }, true);

  ViewsCommonIdentifyTests('div', LayerView, function() {
    return document.createElement('div');
  }, false);


  it('show frame will trigger events', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    var layerView1 = document.getElementById('layer1')._ljView;
    var beforeTransition = false;
    var transitionStarted = false;
    var transitionFinished = false;

    layerView1.on('beforeTransition', function() {
      beforeTransition = true;
    });
    layerView1.on('transitionStarted', function() {
      transitionStarted = true;
    });
    layerView1.on('transitionFinished', function() {
      transitionFinished = true;
    });
    layerView1.showFrame('frame2');

    setTimeout(function() {
      expect(beforeTransition).toBeTruthy();
      expect(transitionStarted).toBeTruthy();
      expect(transitionFinished).toBeTruthy();
      done();
    }, 100);
  });

  it('will register itself with the state', function() {
    spyOn(state, 'registerView');
    var layerView = new LayerView(new LayerView.Model(LayerView.defaultProperties));
    expect(state.registerView).toHaveBeenCalledWith(layerView);
  });

  describe('can transition to special frame name', function() {

    function check(html, specialFrameName, expectedFrameName, done) {
      utilities.setHtml(html);

      var stageView1 = new StageView(null, {
        el: document.getElementById('stage1')
      });

      var layerView1 = document.getElementById('layer1')._ljView;

      layerView1.transitionTo(specialFrameName);
      setTimeout(function() {
        if (null === expectedFrameName) {
          expect(layerView1.currentFrame).toBe(null);
        } else {
          expect(layerView1.currentFrame.data.attributes.name).toBe(expectedFrameName);
        }
        done();
      }, 100);
    }

    it('!none', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "</div>", '!none', null, done);
    });

    it('!next', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!next', 'frame2', done);
    });

    it('!prev', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame2'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "</div>" +
        "</div>", '!prev', 'frame1', done);
    });

    it('!left', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.l='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!left', 'frame2', done);
    });

    it('!right', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.r='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!right', 'frame2', done);
    });

    it('!top', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.t='frame2'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!top', 'frame2', done);
    });

    it('!bottom', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.b='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!bottom', 'frame2', done);
    });
  });

  describe('can show to special frame name', function() {

    function check(html, specialFrameName, expectedFrameName, done) {
      utilities.setHtml(html);

      var stageView1 = new StageView(null, {
        el: document.getElementById('stage1')
      });

      var layerView1 = document.getElementById('layer1')._ljView;

      layerView1.showFrame(specialFrameName);
      setTimeout(function() {
        if (null === expectedFrameName) {
          expect(layerView1.currentFrame).toBe(null);
        } else {
          expect(layerView1.currentFrame.data.attributes.name).toBe(expectedFrameName);
        }
        done();
      }, 100);
    }

    it('!none', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "</div>", '!none', null, done);
    });

    it('!next', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!next', 'frame2', done);
    });

    it('!prev', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame2'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "</div>" +
        "</div>", '!prev', 'frame1', done);
    });

    it('!left', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.l='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!left', 'frame2', done);
    });

    it('!right', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.r='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!right', 'frame2', done);
    });

    it('!top', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.t='frame2'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!top', 'frame2', done);
    });

    it('!bottom', function(done) {
      check("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.b='frame2'></div>" +
        "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>", '!bottom', 'frame2', done);
    });
  });
})
