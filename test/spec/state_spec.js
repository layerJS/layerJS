describe('state', function() {

  var jsdom = require('jsdom');
  var utilities = require('./helpers/utilities.js');
  var StageView = require('../../src/framework/stageview.js');
  var FrameView = require('../../src/framework/frameview.js');
  var state = require('../../src/framework/state.js');

  function setHtmlForExport() {
    var html =
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='stage' id='stage2'>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame3'></div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    layerJS.parseManager.parseDocument();
  }

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

    var stageView1 = new StageView({
      el: customDocument.getElementById('stage1')
    });

    expect(state.exportState(customDocument)).toEqual(['stage1.layer1.frame1']);
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

    expect(state.exportState(customDocument1)).toEqual(['stage1.layer1.frame1']);
    expect(state.exportState(customDocument2)).toEqual(['stage1.layer1.frame2']);

  });

  it('can build a tree that contains all stages, layers and frames', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame3'>" +
      "<div data-lj-type='frame' id='frame3' data-lj-name='frame3'></div>" +
      "<div data-lj-type='frame' id='frame4' data-lj-name='frame4'></div>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='stage' id='stage2'>" +
      "<div data-lj-type='layer' id='layer3' data-lj-default-frame='frame5'>" +
      "<div data-lj-type='frame' id='frame5' data-lj-name='frame5'></div>" +
      "<div data-lj-type='frame' id='frame6' data-lj-name='frame6'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView1 = new StageView({
      el: document.getElementById('stage1')
    });

    var stageView2 = new StageView({
      el: document.getElementById('stage2')
    });

    var stageView1Id = 'stage1';
    var stageView2Id = 'stage2';
    var layerView1 = document.getElementById('layer1')._ljView;
    var layerView2 = document.getElementById('layer2')._ljView;
    var layerView3 = document.getElementById('layer3')._ljView;
    var layerView1Id = 'layer1';
    var layerView2Id = 'layer2';
    var layerView3Id = 'layer3';

    var frameView1 = document.getElementById('frame1')._ljView;
    var frameView2 = document.getElementById('frame2')._ljView;
    var frameView3 = document.getElementById('frame3')._ljView;
    var frameView4 = document.getElementById('frame4')._ljView;
    var frameView5 = document.getElementById('frame5')._ljView;
    var frameView6 = document.getElementById('frame6')._ljView;
    var frameView1Id = 'frame1';
    var frameView2Id = 'frame2';
    var frameView3Id = 'frame3';
    var frameView4Id = 'frame4';
    var frameView5Id = 'frame5';
    var frameView6Id = 'frame6';

    var tree = state._getTree(document);

    expect(tree.children[stageView1Id]).toBeDefined();
    expect(tree.children[stageView1Id].view).toBe(stageView1);

    expect(tree.children[stageView1Id].children[layerView1Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].view).toBe(layerView1);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].view).toBe(frameView1);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].active).toBeTruthy();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView2Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView2Id].view).toBe(frameView2);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView2Id].active).toBeFalsy();

    expect(tree.children[stageView1Id].children[layerView2Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView2Id].view).toBe(layerView2);
    expect(tree.children[stageView1Id].children[layerView2Id].children[frameView3Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView2Id].children[frameView3Id].view).toBe(frameView3);
    expect(tree.children[stageView1Id].children[layerView2Id].children[frameView3Id].active).toBeTruthy();
    expect(tree.children[stageView1Id].children[layerView2Id].children[frameView4Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView2Id].children[frameView4Id].view).toBe(frameView4);
    expect(tree.children[stageView1Id].children[layerView2Id].children[frameView4Id].active).toBeFalsy();

    expect(tree.children[stageView2Id]).toBeDefined();
    expect(tree.children[stageView2Id].view).toBe(stageView2);
    expect(tree.children[stageView2Id].children[layerView3Id]).toBeDefined();
    expect(tree.children[stageView2Id].children[layerView3Id].view).toBe(layerView3);
    expect(tree.children[stageView2Id].children[layerView3Id].children[frameView5Id]).toBeDefined();
    expect(tree.children[stageView2Id].children[layerView3Id].children[frameView5Id].view).toBe(frameView5);
    expect(tree.children[stageView2Id].children[layerView3Id].children[frameView5Id].active).toBeTruthy();
    expect(tree.children[stageView2Id].children[layerView3Id].children[frameView6Id]).toBeDefined();
    expect(tree.children[stageView2Id].children[layerView3Id].children[frameView6Id].view).toBe(frameView6);
    expect(tree.children[stageView2Id].children[layerView3Id].children[frameView6Id].active).toBeFalsy();

  });


  it('can build a tree with nested lj elements', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='stage' id='stage2'>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>"
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);
    layerJS.parseManager.parseDocument();

    var stageView1 = document.getElementById('stage1')._ljView;
    var stageView1Id = 'stage1';
    var stageView2 = document.getElementById('stage2')._ljView;
    var stageView2Id = 'stage2';
    var layerView1 = document.getElementById('layer1')._ljView;
    var layerView2 = document.getElementById('layer2')._ljView;
    var layerView1Id = 'layer1';
    var layerView2Id = 'layer2';

    var frameView1 = document.getElementById('frame1')._ljView;
    var frameView2 = document.getElementById('frame2')._ljView;
    var frameView1Id = 'frame1';
    var frameView2Id = 'frame2';

    var tree = state._getTree(document);

    expect(tree.children[stageView1Id]).toBeDefined();
    expect(tree.children[stageView1Id].view).toBe(stageView1);
    expect(tree.children[stageView1Id].children[layerView1Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].view).toBe(layerView1);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].view).toBe(frameView1);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].active).toBeTruthy();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].children[stageView2Id].children[layerView2Id].children[frameView2Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].children[stageView2Id].children[layerView2Id].children[frameView2Id].view).toBe(frameView2);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].children[stageView2Id].children[layerView2Id].children[frameView2Id].active).toBeTruthy();
  });

  it('will use the lj-name as identifier if the attribute is on the element', function() {
    var html = "<div data-lj-type='stage' data-lj-name='myStage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div></div>";

    utilities.setHtml(html);

    layerJS.parseManager.parseDocument();

    var stageView1 = document.getElementById('stage1')._ljView;
    var tree = state._getTree(document);
    expect(tree.children['myStage']).toBeDefined();
    expect(tree.children['myStage'].view).toBe(stageView1);
  });

  it('will use the id as identifier when lj-name is not provide', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div></div>";
    utilities.setHtml(html);

    var stageView1 = new StageView({
      el: document.getElementById('stage1')
    });

    var tree = state._getTree(document);
    expect(tree.children['stage1']).toBeDefined();
    expect(tree.children['stage1'].view).toBe(stageView1);
  });

  it('will use child index of the type as identifier', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stage1Element = document.getElementById('stage1')
    var stageView1 = new StageView({
      el: stage1Element
    });

    var layerView1 = stage1Element.children[0]._ljView;
    var layerView2 = stage1Element.children[1]._ljView;

    var tree = state._getTree(document);

    expect(tree.children['stage1']).toBeDefined();
    expect(tree.children['stage1'].view).toBe(stageView1);
    expect(tree.children['stage1'].children['layer1']).toBeDefined();
    expect(tree.children['stage1'].children['layer1'].view).toBe(layerView1);
    expect(tree.children['stage1'].children['layer[0]']).toBeDefined();
    expect(tree.children['stage1'].children['layer[0]'].view).toBe(layerView2);
  });

  it('can export the state as an array of strings with only active frames', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var activePaths = state.exportState();
    expect(activePaths.length).toBe(2);
    expect(activePaths[0]).toBe('stage1.layer1.frame1');
    expect(activePaths[1]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
  });

  it('can export the structure as an array of strings', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var structure = state.exportStructure();
    expect(structure.length).toBe(4);
    expect(structure[0]).toBe('stage1.layer1.frame1');
    expect(structure[1]).toBe('stage1.layer1.frame1.stage2.layer2.frame2');
    expect(structure[2]).toBe('stage1.layer1.frame1.stage2.layer2.frame3');
    expect(structure[3]).toBe('stage1.layer1.frame4');
  });

  it('can get a path to a view', function() {
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
      expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage1.layer1.newframe']);
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
      expect(exportedState).toEqual(['stage1.layer1.!none']);
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
      expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage1.newLayer.!none']);
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
      expect(exportedState).toEqual([]);
      done();
    }, 500);


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
      expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage1.layer1.frame1.newStage.newLayer.!none']);
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
      expect(exportedState).toEqual(['stage1.layer1.frame1']);
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
    expect(exportedState).toEqual(['stage1.layer1.frame1']);

    document.getElementById('layer1')._ljView.innerEl.appendChild(newFrame);

    setTimeout(function() {
      exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage1.layer1.frame2']);
      done();
    }, 500);
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
      expect(exportedState).toEqual(['stage1.layer1.frame1']);
      done();
    }, 500);
  });

  it('will react on a name change', function(done) {

    var view = new FrameView({
      el: utilities.appendChildHTML(require('./htmlelements/simple_frame_1.js'))
    });


    var oldName = view.name();

    expect(view.outerEl._state.parent.children[oldName]).toBeDefined();
    expect(view.outerEl._state.parent.children['newName']).not.toBeDefined();

    view.outerEl.setAttribute('lj-name', 'newName');

    setTimeout(function() {
      expect(view.name()).toBe('newName');
      expect(view.outerEl._state.parent.children[oldName]).not.toBeDefined();
      expect(view.outerEl._state.parent.children['newName']).toBeDefined();
      done();
    }, 60);

  });

});
