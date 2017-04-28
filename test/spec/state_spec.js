describe('state', function() {

  var jsdom = require('jsdom');
  var utilities = require('./helpers/utilities.js');
  var StageView = require('../../src/framework/stageview.js');
  var FrameView = require('../../src/framework/frameview.js');
  var State = require('../../src/framework/state.js');

  beforeEach(function() {
    state = layerJS.getState();
  });

  function setHtmlForExport() {
    var html =
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='stage' id='stage2'>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    layerJS.parseManager.parseDocument();
  }

  it('will be created on the document itself', function() {
    var customDocument1 = document.implementation.createHTMLDocument("framedoc");

    var state = new State(customDocument1);
    expect(customDocument1._ljState).toBe(state);
  });

  it('can be defined on multiple documents', function() {
    var customDocument1 = document.implementation.createHTMLDocument("framedoc");
    var state1 = new State(customDocument1);

    var customDocument2 = document.implementation.createHTMLDocument("framedoc");
    var state2 = new State(customDocument2);

    expect(customDocument1._ljState).toBe(state1);
    expect(customDocument2._ljState).toBe(state2);
  });

  xit('can pass in a custom document that will be used to build the tree', function() {
    var customDocument = jsdom.jsdom("<html><head></head><body>" +
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div>" +
      "</div>" +
      "</body></html>", {
        url: 'http://localhost'
      });

    var stageView1 = new StageView({
      el: customDocument.getElementById('stage1')
    });

    var customState = layerJS.getState(customDocument);

    expect(customState.exportState()).toEqual(['stage1.layer1.frame1']);
  });

  it('can have a tree per document object', function() {
    var customDocument1 = document.implementation.createHTMLDocument("framedoc");
    customDocument1.documentElement.innerHTML = "<html><head></head><body>" +
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div>" +
      "</div>" +
      "</body></html>";

    var customDocument2 = document.implementation.createHTMLDocument("framedoc");;
    customDocument2.documentElement.innerHTML = "<html><head></head><body>" +
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>" +
      "</body></html>";

    var stageView1 = new StageView({
      el: customDocument1.getElementById('stage1')
    });

    var stageView2 = new StageView({
      el: customDocument2.getElementById('stage1')
    });
    var customDocument1State = layerJS.getState(customDocument1);
    var customDocument2State = layerJS.getState(customDocument2);

    expect(customDocument1State.exportState()).toEqual(['stage1.layer1.frame1']);
    expect(customDocument2State.exportState()).toEqual(['stage1.layer1.frame2']);
  });

  it('can export the state as an array of strings with only active frames', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;
    var activePaths = state.exportState();
    expect(activePaths.length).toBe(2);
    expect(activePaths[0]).toBe('stage1.layer1.frame1');
    expect(activePaths[1]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
  });


  it('can export the structure as an array of strings ordered by there DOM order', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var structure = state.exportStructure();
    expect(structure.length).toBe(8);
    expect(structure[0]).toBe('stage1');
    expect(structure[1]).toBe('stage1.layer1');
    expect(structure[2]).toBe('stage1.layer1.frame1');
    expect(structure[3]).toBe('stage1.layer1.frame1.stage2');
    expect(structure[4]).toBe('stage1.layer1.frame1.stage2.layer2');
    expect(structure[5]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
    expect(structure[6]).toBe('stage1.layer1.frame1.stage2.layer2.frame3');
    expect(structure[7]).toBe('stage1.layer1.frame4');
  });

  xit('can get a path to a view', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var frameView = document.getElementById('frame2')._ljView;
    var path = state.getPathForView(frameView);
    expect(path).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
  });

  it('can detect a new frame transition', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    layerJS.parseManager.parseDocument();

    var stageView1 = document.getElementById('stage1')._ljView;

    var layerView1 = document.getElementById('layer1')._ljView;

    layerView1.transitionTo('frame2', {
      duration: '0s'
    });

    setTimeout(function() {
      expect(state.exportState()).toEqual(['stage1.layer1.frame2']);
      done();
    }, 800);
  });

  it('can detect a direct show frame', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView1 = new StageView({
      el: document.getElementById('stage1')
    });

    var layerView1 = document.getElementById('layer1')._ljView;
    layerView1.showFrame('frame2');

    setTimeout(function() {
      expect(state.exportState()).toEqual(['stage1.layer1.frame2']);
      done();
    }, 500);

  });

  function transitionTo(html, states, expectedState, expectedFrameName, done) {
    utilities.setHtml(html);

    var stageView1 = new StageView({
      el: document.querySelector("[data-lj-type='stage']")
    });
    var layerView1 = document.querySelector("[data-lj-type='layer']")._ljView;

    state.transitionTo(states);

    setTimeout(function() {
      if (expectedFrameName === 'null') {
        expect(layerView1.currentFrame).toBe(null);
      } else {
        expect(layerView1.currentFrame.name()).toBe('frame2');
      }
      expect(state.exportState()).toEqual(expectedState);
      done();
    }, 100);
  }

  describe('can transition to a named state', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    it('full path', function(done) {
      transitionTo(html, ['stage1.layer1.frame2'], ['stage1.layer1.frame2'], 'frame2', done);
    });

    it('none', function(done) {
      transitionTo(html, ['stage1.layer1.!none'], ['stage1.layer1.!none'], 'null', done);
    });

    it('path layer+frame', function(done) {
      transitionTo(html, ['layer1.frame2'], ['stage1.layer1.frame2'], 'frame2', done);
    });

    it('path frame', function(done) {
      transitionTo(html, ['frame2'], ['stage1.layer1.frame2'], 'frame2', done);
    });
  });

  describe('can transition to a anonymous state', function() {
    var html = "<div data-lj-type='stage'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' data-lj-name='frame1'data-lj-neighbors.l='frame2'  data-lj-neighbors.r='frame4' data-lj-neighbors.t='frame3' data-lj-neighbors.b='frame5'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame4'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame5'></div>" +
      "</div>" +
      "</div>";

    it('full path', function(done) {
      transitionTo(html, ['stage[0].layer[0].frame2'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('none', function(done) {
      transitionTo(html, ['stage[0].layer[0].!none'], ['stage[0].layer[0].!none'], 'null', done);
    });

    it('path layer+frame', function(done) {
      transitionTo(html, ['layer[0].frame2'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path frame', function(done) {
      transitionTo(html, ['frame2'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path layer+left', function(done) {
      showState(html, ['layer[0].!left'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path layer+right', function(done) {
      showState(html, ['layer[0].!right'], ['stage[0].layer[0].frame4'], 'frame4', done);
    });

    it('path layer+top', function(done) {
      showState(html, ['layer[0].!top'], ['stage[0].layer[0].frame3'], 'frame3', done);
    });

    it('path layer+bottom', function(done) {
      showState(html, ['layer[0].!bottom'], ['stage[0].layer[0].frame5'], 'frame5', done);
    });

    it('path layer+next', function(done) {
      showState(html, ['layer[0].!next'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path layer+prev', function(done) {
      showState(html, ['layer[0].!prev'], ['stage[0].layer[0].frame5'], 'frame5', done);
    });
  });

  function showState(html, states, expectedState, expectedFrameName, done) {
    utilities.setHtml(html);

    var stageView1 = new StageView({
      el: document.querySelector("[data-lj-type='stage']")
    });
    var layerView1 = document.querySelector("[data-lj-type='layer']")._ljView;

    state.showState(states);

    setTimeout(function() {
      if (expectedFrameName === '!none') {
        expect(layerView1.currentFrame).toBe(null);
      } else {
        expect(layerView1.currentFrame.name()).toBe(expectedFrameName);
      }
      expect(state.exportState()).toEqual(expectedState);
      done();
    }, 100);
  }

  describe('can show to a named state', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1' data-lj-neighbors.l='frame2'  data-lj-neighbors.r='frame4' data-lj-neighbors.t='frame3' data-lj-neighbors.b='frame5'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'></div>" +
      "<div data-lj-type='frame' id='frame5' data-lj-name='frame5'></div>" +

      "</div>" +
      "</div>";

    it('full path', function(done) {
      showState(html, ['stage1.layer1.frame2'], ['stage1.layer1.frame2'], 'frame2', done);
    });

    it('none', function(done) {
      showState(html, ['stage1.layer1.!none'], ['stage1.layer1.!none'], '!none', done);
    });

    it('path layer+frame', function(done) {
      showState(html, ['layer1.frame2'], ['stage1.layer1.frame2'], 'frame2', done);
    });

    it('path layer+left', function(done) {
      showState(html, ['layer1.!left'], ['stage1.layer1.frame2'], 'frame2', done);
    });

    it('path layer+right', function(done) {
      showState(html, ['layer1.!right'], ['stage1.layer1.frame4'], 'frame4', done);
    });

    it('path layer+top', function(done) {
      showState(html, ['layer1.!top'], ['stage1.layer1.frame3'], 'frame3', done);
    });

    it('path layer+bottom', function(done) {
      showState(html, ['layer1.!bottom'], ['stage1.layer1.frame5'], 'frame5', done);
    });

    it('path layer+next', function(done) {
      showState(html, ['layer1.!next'], ['stage1.layer1.frame2'], 'frame2', done);
    });

    it('path layer+prev', function(done) {
      showState(html, ['layer1.!prev'], ['stage1.layer1.frame5'], 'frame5', done);
    });

    it('path frame', function(done) {
      showState(html, ['frame2'], ['stage1.layer1.frame2'], 'frame2', done);
    });
  });

  describe('can show to a anonymous state', function() {
    var html = "<div data-lj-type='stage'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' data-lj-name='frame1' data-lj-neighbors.l='frame2'  data-lj-neighbors.r='frame4' data-lj-neighbors.t='frame3' data-lj-neighbors.b='frame5'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame4'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame5'></div>" +
      "</div>" +
      "</div>";

    it('full path', function(done) {
      showState(html, ['stage[0].layer[0].frame2'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('none', function(done) {
      showState(html, ['stage[0].layer[0].!none'], ['stage[0].layer[0].!none'], '!none', done);
    });

    it('path layer+frame', function(done) {
      showState(html, ['layer[0].frame2'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path frame', function(done) {
      showState(html, ['frame2'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path layer+left', function(done) {
      showState(html, ['layer[0].!left'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path layer+right', function(done) {
      showState(html, ['layer[0].!right'], ['stage[0].layer[0].frame4'], 'frame4', done);
    });

    it('path layer+top', function(done) {
      showState(html, ['layer[0].!top'], ['stage[0].layer[0].frame3'], 'frame3', done);
    });

    it('path layer+bottom', function(done) {
      showState(html, ['layer[0].!bottom'], ['stage[0].layer[0].frame5'], 'frame5', done);
    });

    it('path layer+next', function(done) {
      showState(html, ['layer[0].!next'], ['stage[0].layer[0].frame2'], 'frame2', done);
    });

    it('path layer+prev', function(done) {
      showState(html, ['layer[0].!prev'], ['stage[0].layer[0].frame5'], 'frame5', done);
    });
  });

  it('state is getting updated when views are added to a layer', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });
    var layerView = document.getElementById('layer1')._ljView;

    var newFrame = document.createElement('div');
    newFrame.setAttribute('data-lj-type', 'frame');
    newFrame.setAttribute('data-lj-name', 'newframe');
    layerView.innerEl.appendChild(newFrame);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1', 'stage1.layer1.newframe']);
      done();
    }, 500);
  });

  it('state is getting updated when views are removed from a layer', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });
    var layerView = document.getElementById('layer1')._ljView;

    layerView.innerEl.removeChild(layerView.innerEl.children[0]);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1']);
      done();
    }, 500);

  });

  it('state is getting updated when views are added to a stage', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });


    var newlayer = document.createElement('div');
    newlayer.setAttribute('data-lj-type', 'layer');
    newlayer.setAttribute('data-lj-name', 'newLayer');
    stageView.innerEl.appendChild(newlayer);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1', 'stage1.newLayer']);
      done();
    }, 500);
  });

  it('state is getting updated when views are removed from a stage', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });
    stageView.innerEl.removeChild(stageView.innerEl.children[0]);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1']);
      done();
    }, 1000);
  });

  it('state is getting updated when views are added to a frame', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });
    var frameView = document.getElementById('frame1')._ljView;

    var newStage = document.createElement('div');
    newStage.setAttribute('data-lj-type', 'stage');
    newStage.setAttribute('data-lj-name', 'newStage');
    newStage.innerHTML = "<div data-lj-type='layer' data-lj-name='newLayer'></div>";
    frameView.innerEl.appendChild(newStage);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1', 'stage1.layer1.frame1.newStage', 'stage1.layer1.frame1.newStage.newLayer']);
      done();
    }, 500)
  });

  it('state is getting updated when views are removed from a frame', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='stage' id='stage2'>" +
      "<div data-lj-type='layer' id='layer2'>" +
      "<div data-lj-type='frame' id='frame2'>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);
    layerJS.parseManager.parseDocument(document);

    var stageView = document.getElementById('stage1')._ljView;
    var frameView = document.getElementById('frame1')._ljView;

    frameView.innerEl.removeChild(frameView.innerEl.children[0]);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1']);
      done();
    }, 500);
  });

  it('state is getting updated when a frameView (not linked to the dom) is added to the dom', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });

    var newFrame = document.createElement('div');
    newFrame.setAttribute('data-lj-name', 'frame2');
    newFrame.setAttribute('data-lj-type', 'frame');

    var frameView = new FrameView({
      el: newFrame
    });

    expect(newFrame._state).not.toBeDefined();
    var exportedState = state.exportStructure();
    expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1']);

    document.getElementById('layer1')._ljView.innerEl.appendChild(newFrame);

    setTimeout(function() {
      exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1', 'stage1.layer1.frame2']);
      done();
    }, 1000);
  });

  it('state is getting updated only for stage, layer and frame views', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });

    var el = document.createElement('div');
    el.id = 'layer1';
    el.setAttribute('data-lj-type', 'layer');
    stageView.innerEl.appendChild(el);

    el = document.createElement('div');
    el.id = 'frame1';
    el.setAttribute('data-lj-type', 'frame');
    el.setAttribute('data-lj-name', 'frame1');
    stageView.innerEl.children[0].appendChild(el);

    el = document.createElement('div');
    el.id = 'something';
    el.setAttribute('data-lj-type', 'group');
    stageView.innerEl.children[0].appendChild(el);

    stageView.innerEl.children[0].appendChild(document.createTextNode("Hello World"));


    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1']);
      done();
    }, 500);
  });

  it('will react on a name change', function(done) {

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });

    var newFrame = document.getElementById('frame1');
    newFrame.setAttribute('data-lj-name', 'frame2');

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame2']);
      done();
    }, 500);
  });

  it('stateChanged is triggered after all layers have invoked \'transitionStarted\' event (transitionTo)', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame3'>" +
      "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });

    var state = layerJS.getState();
    var invoked = 0;
    state.on('stateChanged', function() {
      invoked++;
    });

    state.transitionTo(['stage1.layer1.frame2', 'stage1.layer2.frame4'], [{
      duration: '1s'
    }, {
      duration: '1s'
    }]);

    setTimeout(function() {
      expect(invoked).toBe(1);
      done();
    }, 1000);
  });

  it('stateChanged is triggered after all layers have invoked \'transitionStarted\' event (showState)', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame3'>" +
      "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });

    var state = layerJS.getState();
    var invoked = 0;
    state.on('stateChanged', function() {
      invoked++;
    });

    state.showState(['stage1.layer1.frame2', 'stage1.layer2.frame4']);

    setTimeout(function() {
      expect(invoked).toBe(1);
      done();
    }, 1000);
  });

  it('stateChanged will only be trigger when the state really has changed', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame3'>" +
      "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });

    var state = layerJS.getState();
    var invoked = 0;
    state.on('stateChanged', function() {
      invoked++;
    });

    state.showState(['stage1.layer1.frame2', 'stage1.layer2.frame4']);

    setTimeout(function() {
      expect(invoked).toBe(1);
      state.showState(['stage1.layer1.frame2', 'stage1.layer2.frame4']);
      setTimeout(function() {
        expect(invoked).toBe(1);
        done();
      }, 1000);
    }, 1000);
  });


  describe('can minimise the returned state paths', function() {
    it('when the current frame is the default frame', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>");

      var stageView = new StageView({
        el: document.getElementById('stage1')
      });
      var state = layerJS.getState();
      expect(state.exportState(true)).toEqual([]);
    });

    it('when the current frame is the first element and no default frame is specified', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>");

      var stageView = new StageView({
        el: document.getElementById('stage1')
      });
      var state = layerJS.getState();
      expect(state.exportState(true)).toEqual([]);
    });

    it('when the default frame is a none frame', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='!none'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>");

      var stageView = new StageView({
        el: document.getElementById('stage1')
      });
      var state = layerJS.getState();
      expect(state.exportState(true)).toEqual([]);
    });
  });
});
