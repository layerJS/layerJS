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

  it('can pass in a custom document that will be used to build the tree', function() {
    var customDocument = jsdom.jsdom("<html><head></head><body>" +
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div>" +
      "</div>" +
      "</body></html>", {
        url: 'http://localhost'
      });

    var parseManager = layerJS.parseManager;
    parseManager.parseDocument(customDocument);


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

    var parseManager = layerJS.parseManager;
    parseManager.parseDocument(customDocument1);
    parseManager.parseDocument(customDocument2);

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

  it('can export the state as an array of strings with only active frames and structure changes', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    document.getElementById('frame3')._ljView.originalParent = document.getElementById('layer1')._ljView;

    var activePaths = state.exportState();
    expect(activePaths.length).toBe(3);
    expect(activePaths[0]).toBe('stage1.layer1.frame1');
    expect(activePaths[1]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
    expect(activePaths[2]).toBe('stage1.layer1.frame1.stage2.layer2.frame3$');
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
    expect(structure[6]).toBe('stage1.layer1.frame1.stage2.layer2.frame3$');
    expect(structure[7]).toBe('stage1.layer1.frame4$');
  });

  it('can export the structure as an array of strings ordered by there DOM order for a specific view type', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var structure = state.exportStructure('frame');

    expect(structure.length).toBe(4);
    expect(structure[0]).toBe('stage1.layer1.frame1');
    expect(structure[1]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
    expect(structure[2]).toBe('stage1.layer1.frame1.stage2.layer2.frame3$');
    expect(structure[3]).toBe('stage1.layer1.frame4$');
  });

  it('can export the structure as an array of strings ordered by there DOM order and can mark paths not active', function() {
    setHtmlForExport();
    var stageView1 = document.getElementById('stage1')._ljView;

    var structure = state.exportStructure('frame');
    expect(structure.length).toBe(4);
    expect(structure[0]).toBe('stage1.layer1.frame1');
    expect(structure[1]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
    expect(structure[2]).toBe('stage1.layer1.frame1.stage2.layer2.frame3$');
    expect(structure[3]).toBe('stage1.layer1.frame4$');
  });

  it('can detect a new frame transition', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView1 = document.getElementById('stage1')._ljView;

    var layerView1 = document.getElementById('layer1')._ljView;

    layerView1.transitionTo('frame2', {
      duration: '1s'
    });

    setTimeout(function() {
      expect(state.exportState()).toEqual(['stage1.layer1.frame2']);
      done();
    }, 1200);
  });

  it('can detect a direct show frame', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var layerView1 = document.getElementById('layer1')._ljView;
    layerView1.showFrame('frame2');

    setTimeout(function() {
      expect(state.exportState()).toEqual(['stage1.layer1.frame2']);
      done();
    }, 500);

  });

  function transitionTo(html, states, expectedState, expectedFrameName, done) {
    utilities.setHtml(html);

    var layerView1 = document.querySelector("[data-lj-type='layer']")._ljView;

    state.transitionTo(states);

    setTimeout(function() {
      if (expectedFrameName === 'null') {
        expect(layerView1.currentFrame).toBe(null);
      } else {
        expect(layerView1.currentFrame.name()).toBe(expectedFrameName);
      }
      expect(state.exportState()).toEqual(expectedState);
      done();
    }, 1000);
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

    it('path layer+current', function(done) {
      showState(html, ['layer[0].!current'], ['stage[0].layer[0].frame1'], 'frame1', done);
    });
  });

  function showState(html, states, expectedState, expectedFrameName, done) {
    utilities.setHtml(html);

    var layerView1 = document.querySelector("[data-lj-type='layer']")._ljView;

    state.showState(states);

    setTimeout(function() {
      if (expectedFrameName === '!none') {
        expect(layerView1.currentFrame).toBe(null);
      } else {
        expect(layerView1.currentFrame.name()).toBe(expectedFrameName);
      }

      var exportedState = state.exportState();
      expect(exportedState).toEqual(expectedState);
      done();
    }, 200);
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

    it('path layer+current', function(done) {
      showState(html, ['layer1.!current'], ['stage1.layer1.frame1'], 'frame1', done);
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

    it('path layer+current', function(done) {
      showState(html, ['layer[0].!current'], ['stage[0].layer[0].frame1'], 'frame1', done);
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


    var layerView = document.getElementById('layer1')._ljView;

    var newFrame = document.createElement('div');
    newFrame.setAttribute('data-lj-type', 'frame');
    newFrame.setAttribute('data-lj-name', 'newframe');
    layerView.innerEl.appendChild(newFrame);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1', 'stage1.layer1.newframe$']);
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
    var stageView = document.getElementById('stage1')._ljView;
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

    var stageView = document.getElementById('stage1')._ljView;
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
    //layerJS.parseManager.parseDocument(document);

    var stageView = document.getElementById('stage1')._ljView;
    var frameView = document.getElementById('frame1')._ljView;

    frameView.innerEl.removeChild(frameView.innerEl.children[0]);

    setTimeout(function() {    
      var exportedState = layerJS.getState().exportStructure();
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
      expect(exportedState).toEqual(['stage1', 'stage1.layer1', 'stage1.layer1.frame1', 'stage1.layer1.frame2$']);
      done();
    }, 1000);
  });

  it('state is getting updated only for stage, layer and frame views', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = document.getElementById('stage1')._ljView;
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


  describe('can minimize the returned state paths', function() {
    it('when the current frame is the default frame', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div></div>");

      var state = layerJS.getState();
      var exportedState = state.exportMinimizedState();
      expect(exportedState.state).toEqual([]);
      expect(exportedState.omittedState).toEqual(['stage1.layer1.frame1']);
    });

    it('when the layer has no url defined', function(done) {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1' data-lj-no-url='true'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div></div>");


      document.getElementById('layer1')._ljView.transitionTo('frame2', {
        duration: ''
      });

      window.setTimeout(function() {
        var state = layerJS.getState();
        var exportedState = state.exportMinimizedState();
        expect(exportedState.state).toEqual([]);
        expect(exportedState.omittedState).toEqual(['stage1.layer1.frame1$', 'stage1.layer1.frame2']);
        done();
      }, 1000);
    });

    it('when the current frame is the first element and no default frame is specified', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div></div>");

      var state = layerJS.getState();
      var exportedState = state.exportMinimizedState();
      expect(exportedState.state).toEqual([]);
      expect(exportedState.omittedState).toEqual(['stage1.layer1.frame1']);
    });

    it('when the default frame is a none frame', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='!none'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div></div>");

      var state = layerJS.getState();
      var state = layerJS.getState();
      var exportedState = state.exportMinimizedState();
      expect(exportedState.state).toEqual([]);
      expect(exportedState.omittedState).toEqual(['stage1.layer1.frame1$', 'stage1.layer1.!none']);
    });

    it('frames with frames that our outside there default layers should be added', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='!none'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "<div data-lj-type='layer' id='layer2' data-lj-default-frame='!none'>" + "</div></div>");


      document.getElementById('frame1')._ljView.originalParent = document.getElementById('layer2')._ljView;

      var state = layerJS.getState();
      var state = layerJS.getState();
      var exportedState = state.exportMinimizedState();
      expect(exportedState.state).toEqual(['stage1.layer1.frame1$']);
      expect(exportedState.omittedState).toEqual(['stage1.layer1.!none', 'stage1.layer2.!none']);
    });


    /*it('will detect same frame transitions', function(done) {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>");

      var stageView = new StageView({
        el: document.getElementById('stage1')
      });
      var state = layerJS.getState();

      var layerView1 = document.getElementById('layer1')._ljView;
      var layerView2 = document.getElementById('layer2')._ljView;

      var layer1Transition = false;
      var layer2Transition = false;

      layerView1.on('transitionFinished', function(frameName) {
        console.log('layer 1 transitionFinished ' + frameName);
        layer1Transition = frameName == 'frame1';
      });

      layerView2.on('transitionFinished', function(frameName) {
        console.log('layer 2 transitionFinished ' + frameName);
        layer2Transition = frameName == 'frame1';
      });

      state.transitionTo(["stage1.layer1.frame1", "stage1.layer2.frame1"]);

      setTimeout(function() {
        expect(layer1Transition).toBe(false);
        expect(layer2Transition).toBe(true);
        done();
      }, 2000);

    });*/
  });

  describe('can resolve a path', function() {

    it("of a frame that should not be activated", function(done) {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='!none'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "<div data-lj-type='layer' id='layer2' data-lj-default-frame='!none'>" + "</div></div>");

      document.getElementById('frame1')._ljView.originalParent = document.getElementById('layer2')._ljView;

      var state = layerJS.getState();

      setTimeout(function() {

        var result = state.resolvePath('stage1.layer1.frame1$');
        expect(result.length).toBe(1);
        expect(result[0].view).toBe(document.getElementById('frame1')._ljView);
        expect(result[0].noActivation).toBe(true);

        done();
      }, 2000);
    });

  });

});
