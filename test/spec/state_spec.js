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
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame3'></div>" +
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


  xit('can build a tree with nested lj elements', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);
    layerJS.parseManager.parseDocument();

    var stageView1 = document.getElementById('stage1')._ljView;

    var stageView1Id = 'stage1';
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
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].children[layerView2Id].children[frameView2Id]).toBeDefined();
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].children[layerView2Id].children[frameView2Id].view).toBe(frameView2);
    expect(tree.children[stageView1Id].children[layerView1Id].children[frameView1Id].children[layerView2Id].children[frameView2Id].active).toBeTruthy();
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
    expect(tree.children['stage1'].children['layer[1]']).toBeDefined();
    expect(tree.children['stage1'].children['layer[1]'].view).toBe(layerView2);
  });

  xit('can export the state as an array of strings with only active frames', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var activePaths = state.exportState();
    expect(activePaths.length).toBe(2);
    expect(activePaths[0]).toBe('stage1.layer1.frame1');
    expect(activePaths[1]).toBe('stage1.layer1.frame1.layer2.frame2');
  });

  xit('can export the structure as an array of strings', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var structure = state.exportStructure();
    expect(structure.length).toBe(4);
    expect(structure[0]).toBe('stage1.layer1.frame1');
    expect(structure[1]).toBe('stage1.layer1.frame1.layer2.frame2');
    expect(structure[2]).toBe('stage1.layer1.frame1.layer2.frame3');
    expect(structure[3]).toBe('stage1.layer1.frame4');
  });

  xit('can get a path to a view', function() {
    setHtmlForExport();

    var stageView1 = document.getElementById('stage1')._ljView;

    var frameView = document.getElementById('frame2')._ljView;
    var path = state.getPathForView(frameView);
    expect(path).toBe('stage1.layer1.frame1.layer2.frame2');
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
    }, 500);
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

  it('can register a frame within the state', function() {
    var frameView = new FrameView({
      el: utilities.appendChildHTML(require('./htmlelements/simple_frame_1.js'))
    });
    state.registerView(frameView);

    var frameViews = state._getRegisteredFrameViews(document);

    var ok = false;
    for (var i = 0; i < frameViews.length; i++) {
      ok = frameView === frameViews[i];
    }

    expect(ok).toBe(true);
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

  xit('state is getting updated when views are added to a frame', function(done) {
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

    var newlayer = document.createElement('div');
    newlayer.setAttribute('data-lj-type', 'layer');
    newlayer.setAttribute('data-lj-name', 'newLayer');
    frameView.innerEl.appendChild(newlayer);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage1.layer1.frame1.newLayer.!none']);
      done();
    }, 500)
  });

  it('state is getting updated when views are removed from a frame', function(done) {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='layer' id='layer2'>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var stageView = new StageView({
      el: document.getElementById('stage1')
    });
    var frameView = document.getElementById('frame1')._ljView;

    frameView.innerEl.removeChild(frameView.innerEl.children[0]);

    setTimeout(function() {
      var exportedState = state.exportStructure();
      expect(exportedState).toEqual(['stage1.layer1.frame1']);
      done();
    }, 500);
  });

  xit('state is getting updated when a frameView (not linked to the dom) is added to the dom', function(done) {
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

  it('performance test', function() {

    //   setHtmlForExport();

    var html = "<div id='top' class='page' role='document'> <header role='banner'> <h1>HTML5 Test Page</h1> <p>This is a test page filled with common HTML elements to be used to provide visual feedback whilst building CSS systems and frameworks.</p> </header> <nav role='navigation'> <ul> <li> <a href='#text'>Text</a> <ul> <li><a href='#text__headings'>Headings</a></li> <li><a href='#text__paragraphs'>Paragraphs</a></li> <li><a href='#text__blockquotes'>Blockquotes</a></li> <li><a href='#text__lists'>Lists</a></li> <li><a href='#text__hr'>Horizontal rules</a></li> <li><a href='#text__tables'>Tabular data</a></li> <li><a href='#text__code'>Code</a></li> <li><a href='#text__inline'>Inline elements</a></li> </ul> </li> <li> <a href='#embedded'>Embedded content</a> <ul> <li><a href='#embedded__images'>Images</a></li> <li><a href='#embedded__audio'>Audio</a></li> <li><a href='#embedded__video'>Video</a></li> <li><a href='#embedded__canvas'>Canvas</a></li> <li><a href='#embedded__meter'>Meter</a></li> <li><a href='#embedded__progress'>Progress</a></li> <li><a href='#embedded__svg'>Inline SVG</a></li> <li><a href='#embedded__iframe'>IFrames</a></li> </ul> </li> <li> <a href='#forms'>Form elements</a> <ul> <li><a href='#forms__input'>Input fields</a></li> <li><a href='#forms__select'>Select menus</a></li> <li><a href='#forms__checkbox'>Checkboxes</a></li> <li><a href='#forms__radio'>Radio buttons</a></li> <li><a href='#forms__textareas'>Textareas</a></li> <li><a href='#forms__html5'>HTML5 inputs</a></li> <li><a href='#forms__action'>Action buttons</a></li> </ul> </li> </ul> </nav> <main role='main'> <section id='text'> <header><h1>Text</h1></header> <article id='text__headings'> <header> <h1>Headings</h1> </header> <div> <h1>Heading 1</h1> <h2>Heading 2</h2> <h3>Heading 3</h3> <h4>Heading 4</h4> <h5>Heading 5</h5> <h6>Heading 6</h6> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__paragraphs'> <header><h1>Paragraphs</h1></header> <div> <p>A paragraph (from the Greek paragraphos, “to write beside” or “written beside”) is a self-contained unit of a discourse in writing dealing with a particular point or idea. A paragraph consists of one or more sentences. Though not required by the syntax of any language, paragraphs are usually an expected part of formal writing, used to organize longer prose.</p> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__blockquotes'> <header><h1>Blockquotes</h1></header> <div> <blockquote> <p>A block quotation (also known as a long quotation or extract) is a quotation in a written document, that is set off from the main text as a paragraph, or block of text.</p> <p>It is typically distinguished visually using indentation and a different typeface or smaller size quotation. It may or may not include a citation, usually placed at the bottom.</p> <cite><a href='#!'>Said no one, ever.</a></cite> </blockquote> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__lists'> <header><h1>Lists</h1></header> <div> <h3>Definition list</h3> <dl> <dt>Definition List Title</dt> <dd>This is a definition list division.</dd> </dl> <h3>Ordered List</h3> <ol> <li>List Item 1</li> <li>List Item 2</li> <li>List Item 3</li> </ol> <h3>Unordered List</h3> <ul> <li>List Item 1</li> <li>List Item 2</li> <li>List Item 3</li> </ul> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__hr'> <header><h1>Horizontal rules</h1></header> <div> <hr> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__tables'> <header><h1>Tabular data</h1></header> <table> <caption>Table Caption</caption> <thead> <tr> <th>Table Heading 1</th> <th>Table Heading 2</th> <th>Table Heading 3</th> <th>Table Heading 4</th> <th>Table Heading 5</th> </tr> </thead> <tfoot> <tr> <th>Table Footer 1</th> <th>Table Footer 2</th> <th>Table Footer 3</th> <th>Table Footer 4</th> <th>Table Footer 5</th> </tr> </tfoot> <tbody> <tr> <td>Table Cell 1</td> <td>Table Cell 2</td> <td>Table Cell 3</td> <td>Table Cell 4</td> <td>Table Cell 5</td> </tr> <tr> <td>Table Cell 1</td> <td>Table Cell 2</td> <td>Table Cell 3</td> <td>Table Cell 4</td> <td>Table Cell 5</td> </tr> <tr> <td>Table Cell 1</td> <td>Table Cell 2</td> <td>Table Cell 3</td> <td>Table Cell 4</td> <td>Table Cell 5</td> </tr> <tr> <td>Table Cell 1</td> <td>Table Cell 2</td> <td>Table Cell 3</td> <td>Table Cell 4</td> <td>Table Cell 5</td> </tr> </tbody> </table> <div data-lj-type='stage' id='stage1'> <div data-lj-type='layer' data-lj-default-frame='frame2'> <div data-lj-type='frame' data-lj-name='frame1'></div> <div data-lj-type='frame' data-lj-name='frame2'></div> <div data-lj-type='frame' data-lj-name='frame3'></div> </div> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__code'> <header><h1>Code</h1></header> <div> <p><strong>Keyboard input:</strong> <kbd>Cmd</kbd></p> <p><strong>Inline code:</strong> <code>&lt;div&gt;code&lt;/div&gt;</code></p> <p><strong>Sample output:</strong> <samp>This is sample output from a computer program.</samp></p> <h2>Pre-formatted text</h2> <pre>P R E F O R M A T T E D T E X T ! ' # $ % &amp; ' ( ) * + , - . / 0 1 2 3 4 5 6 7 8 9 : ; &lt; = &gt; ? @ A B C D E F G H I J K L M N O P Q R S T U V W X Y Z [ \ ] ^ _ ` a b c d e f g h i j k l m n o p q r s t u v w x y z { | } ~ </pre> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='text__inline'> <header><h1>Inline elements</h1></header> <div> <p><a href='#!'>This is a text link</a>.</p> <p><strong>Strong is used to indicate strong importance.</strong></p> <p><em>This text has added emphasis.</em></p> <p>The <b>b element</b> is stylistically different text from normal text, without any special importance.</p> <p>The <i>i element</i> is text that is offset from the normal text.</p> <p>The <u>u element</u> is text with an unarticulated, though explicitly rendered, non-textual annotation.</p> <p><del>This text is deleted</del> and <ins>This text is inserted</ins>.</p> <p><s>This text has a strikethrough</s>.</p> <p>Superscript<sup>®</sup>.</p> <p>Subscript for things like H<sub>2</sub>O.</p> <p><small>This small text is small for for fine print, etc.</small></p> <p>Abbreviation: <abbr title='HyperText Markup Language'>HTML</abbr></p> <p><q cite='https://developer.mozilla.org/en-US/docs/HTML/Element/q'>This text is a short inline quotation.</q></p> <p><cite>This is a citation.</cite></p> <p>The <dfn>dfn element</dfn> indicates a definition.</p> <p>The <mark>mark element</mark> indicates a highlight.</p> <p>The <var>variable element</var>, such as <var>x</var> = <var>y</var>.</p> <p>The time element: <time datetime='2013-04-06T12:32+00:00'>2 weeks ago</time></p> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> </section>  <section id='embedded'> <header><h1>Embedded content</h1></header> <article id='embedded__images'> <header><h2>Images</h2></header> <div> <h3>No <code>&lt;figure&gt;</code> element</h3> <p><img src='http://placekitten.com/480/480' alt='Image alt text'></p> <h3>Wrapped in a <code>&lt;figure&gt;</code> element, no <code>&lt;figcaption&gt;</code></h3> <figure><img src='http://placekitten.com/420/420' alt='Image alt text'></figure> <h3>Wrapped in a <code>&lt;figure&gt;</code> element, with a <code>&lt;figcaption&gt;</code></h3> <figure> <img src='http://placekitten.com/420/420' alt='Image alt text'> <figcaption>Here is a caption for this image.</figcaption> </figure> </div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__audio'> <header><h2>Audio</h2></header> <div><audio controls=''>audio</audio></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__video'> <header><h2>Video</h2></header> <div><video controls=''>video</video></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__canvas'> <header><h2>Canvas</h2></header> <div><canvas>canvas</canvas></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__meter'> <header><h2>Meter</h2></header> <div><meter value='2' min='0' max='10'>2 out of 10</meter></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__progress'> <header><h2>Progress</h2></header> <div><progress>progress</progress></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__svg'> <header><h2>Inline SVG</h2></header> <div><svg width='100px' height='100px'><circle cx='100' cy='100' r='100' fill='#1fa3ec'></circle></svg></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> <article id='embedded__iframe'> <header><h2>IFrame</h2></header> <div><iframe src='index.html' height='300'></iframe></div> <footer><p><a href='#top'>[Top]</a></p></footer> </article> </section> <section id='forms'> <header><h1>Form elements</h1></header> <form> <fieldset id='forms__input'> <legend>Input fields</legend> <p> <label for='input__text'>Text Input</label> <input id='input__text' type='text' placeholder='Text Input'> </p> <p> <label for='input__password'>Password</label> <input id='input__password' type='password' placeholder='Type your Password'> </p> <p> <label for='input__webaddress'>Web Address</label> <input id='input__webaddress' type='url' placeholder='http://yoursite.com'> </p> <p> <label for='input__emailaddress'>Email Address</label> <input id='input__emailaddress' type='email' placeholder='name@email.com'> </p> <p> <label for='input__phone'>Phone Number</label> <input id='input__phone' type='tel' placeholder='(999) 999-9999'> </p> <p> <label for='input__search'>Search</label> <input id='input__search' type='search' placeholder='Enter Search Term'> </p> <p> <label for='input__text2'>Number Input</label> <input id='input__text2' type='number' placeholder='Enter a Number'> </p> <p> <label for='input__text3' class='error'>Error</label> <input id='input__text3' class='is-error' type='text' placeholder='Text Input'> </p> <p> <label for='input__text4' class='valid'>Valid</label> <input id='input__text4' class='is-valid' type='text' placeholder='Text Input'> </p> </fieldset> <p><a href='#top'>[Top]</a></p> <fieldset id='forms__select'> <legend>Select menus</legend> <p> <label for='select'>Select</label> <select id='select'> <optgroup label='Option Group'> <option>Option One</option> <option>Option Two</option> <option>Option Three</option> </optgroup> </select> </p> </fieldset> <p><a href='#top'>[Top]</a></p> <fieldset id='forms__checkbox'> <legend>Checkboxes</legend> <ul class='list list--bare'> <li><label for='checkbox1'><input id='checkbox1' name='checkbox' type='checkbox' checked='checked'> Choice A</label></li> <li><label for='checkbox2'><input id='checkbox2' name='checkbox' type='checkbox'> Choice B</label></li> <li><label for='checkbox3'><input id='checkbox3' name='checkbox' type='checkbox'> Choice C</label></li> </ul> </fieldset> <div data-lj-type='stage' id='stage2'> <div data-lj-type='layer' data-lj-default-frame='frame2'> <div data-lj-type='frame' data-lj-name='frame1'></div> <div data-lj-type='frame' data-lj-name='frame2'></div> <div data-lj-type='frame' data-lj-name='frame3'></div> </div> </div> <p><a href='#top'>[Top]</a></p> <fieldset id='forms__radio'> <legend>Radio buttons</legend> <ul class='list list--bare'> <li><label for='radio1'><input id='radio1' name='radio' type='radio' class='radio' checked='checked'> Option 1</label></li> <li><label for='radio2'><input id='radio2' name='radio' type='radio' class='radio'> Option 2</label></li> <li><label for='radio3'><input id='radio3' name='radio' type='radio' class='radio'> Option 3</label></li> </ul> </fieldset> <p><a href='#top'>[Top]</a></p> <fieldset id='forms__textareas'> <legend>Textareas</legend> <p> <label for='textarea'>Textarea</label> <textarea id='textarea' rows='8' cols='48' placeholder='Enter your message here'></textarea> </p> </fieldset> <p><a href='#top'>[Top]</a></p> <fieldset id='forms__html5'> <legend>HTML5 inputs</legend> <p> <label for='ic'>Color input</label> <input type='color' id='ic' value='#000000'> </p> <p> <label for='in'>Number input</label> <input type='number' id='in' min='0' max='10' value='5'> </p> <p> <label for='ir'>Range input</label> <input type='range' id='ir' value='10'> </p> <p> <label for='idd'>Date input</label> <input type='date' id='idd' value='1970-01-01'> </p> <p> <label for='idm'>Month input</label> <input type='month' id='idm' value='1970-01'> </p> <p> <label for='idw'>Week input</label> <input type='week' id='idw' value='1970-W01'> </p> <p> <label for='idt'>Datetime input</label> <input type='datetime' id='idt' value='1970-01-01T00:00:00Z'> </p> <p> <label for='idtl'>Datetime-local input</label> <input type='datetime-local' id='idtl' value='1970-01-01T00:00'> </p> </fieldset> <p><a href='#top'>[Top]</a></p> <fieldset id='forms__action'> <legend>Action buttons</legend> <p> <input type='submit' value='<input type=submit>'> <input type='button' value='<input type=button>'> <input type='reset' value='<input type=reset>'> <input type='submit' value='<input disabled>' disabled> </p> <p> <button type='submit'>&lt;button type=submit&gt;</button> <button type='button'>&lt;button type=button&gt;</button> <button type='reset'>&lt;button type=reset&gt;</button> <button type='button' disabled>&lt;button disabled&gt;</button> </p> </fieldset> <p><a href='#top'>[Top]</a></p> </form> </section> </main> <footer role='contentinfo'> <p>Made by <a href='http://twitter.com/cbracco'>@cbracco</a>. Code on <a href='http://github.com/cbracco/html5-test-page'>GitHub</a>.</p> </footer> </div>";

    utilities.setHtml(html);

    var Perfcollector = require('perfcollector.js');
    var perfs = Perfcollector.create().enable();

    var stageView1 = new StageView({
      el: document.getElementById('stage1')
    });
    var stageView2 = new StageView({
      el: document.getElementById('stage2')
    });

    var newWay = perfs.start("newWay");

    state.buildTree2();
    newWay.end();


    var oldWay = perfs.start("oldWay");
    state.buildTree();
    oldWay.end();

    expect(newWay.stats().averageMs).toBeLessThan(oldWay.stats().averageMs);
  });
});
