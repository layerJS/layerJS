describe('state', function() {

  var utilities = require('./helpers/utilities.js');
  var StageView = require('../../src/framework/stageview.js');
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
  }

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

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    var stageView2 = new StageView(null, {
      el: document.getElementById('stage2')
    });

    state.buildTree2();

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

    expect(state.tree[stageView1Id]).toBeDefined();
    expect(state.tree[stageView1Id].view).toBe(stageView1);

    expect(state.tree[stageView1Id][layerView1Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView1Id].view).toBe(layerView1);
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id].view).toBe(frameView1);
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id].active).toBeTruthy();
    expect(state.tree[stageView1Id][layerView1Id][frameView2Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView1Id][frameView2Id].view).toBe(frameView2);
    expect(state.tree[stageView1Id][layerView1Id][frameView2Id].active).toBeFalsy();

    expect(state.tree[stageView1Id][layerView2Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView2Id].view).toBe(layerView2);
    expect(state.tree[stageView1Id][layerView2Id][frameView3Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView2Id][frameView3Id].view).toBe(frameView3);
    expect(state.tree[stageView1Id][layerView2Id][frameView3Id].active).toBeTruthy();
    expect(state.tree[stageView1Id][layerView2Id][frameView4Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView2Id][frameView4Id].view).toBe(frameView4);
    expect(state.tree[stageView1Id][layerView2Id][frameView4Id].active).toBeFalsy();

    expect(state.tree[stageView2Id]).toBeDefined();
    expect(state.tree[stageView2Id].view).toBe(stageView2);
    expect(state.tree[stageView2Id][layerView3Id]).toBeDefined();
    expect(state.tree[stageView2Id][layerView3Id].view).toBe(layerView3);
    expect(state.tree[stageView2Id][layerView3Id][frameView5Id]).toBeDefined();
    expect(state.tree[stageView2Id][layerView3Id][frameView5Id].view).toBe(frameView5);
    expect(state.tree[stageView2Id][layerView3Id][frameView5Id].active).toBeTruthy();
    expect(state.tree[stageView2Id][layerView3Id][frameView6Id]).toBeDefined();
    expect(state.tree[stageView2Id][layerView3Id][frameView6Id].view).toBe(frameView6);
    expect(state.tree[stageView2Id][layerView3Id][frameView6Id].active).toBeFalsy();
  });

  it('can build a tree with nested lj elements', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'>" +
      "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>"
    "</div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree2();

    var stageView1Id = 'stage1';
    var layerView1 = document.getElementById('layer1')._ljView;
    var layerView2 = document.getElementById('layer2')._ljView;
    var layerView1Id = 'layer1';
    var layerView2Id = 'layer2';

    var frameView1 = document.getElementById('frame1')._ljView;
    var frameView2 = document.getElementById('frame2')._ljView;
    var frameView1Id = 'frame1';
    var frameView2Id = 'frame2';

    expect(state.tree[stageView1Id]).toBeDefined();
    expect(state.tree[stageView1Id].view).toBe(stageView1);

    expect(state.tree[stageView1Id][layerView1Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView1Id].view).toBe(layerView1);
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id].view).toBe(frameView1);
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id].active).toBeTruthy();
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id][layerView2Id][frameView2Id]).toBeDefined();
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id][layerView2Id][frameView2Id].view).toBe(frameView2);
    expect(state.tree[stageView1Id][layerView1Id][frameView1Id][layerView2Id][frameView2Id].active).toBeTruthy();
  });

  it('will use the lj-name as identifier if the attribute is on the element', function() {
    var html = "<div data-lj-type='stage' data-lj-name='myStage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div></div>";

    utilities.setHtml(html);

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree();

    expect(state.tree['myStage']).toBeDefined();
    expect(state.tree['myStage'].view).toBe(stageView1);
  });

  it('will use the id as identifier when lj-name is not provide', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "</div></div>";
    utilities.setHtml(html);

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree2();

    expect(state.tree['stage1']).toBeDefined();
    expect(state.tree['stage1'].view).toBe(stageView1);
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
    var stageView1 = new StageView(null, {
      el: stage1Element
    });

    var layerView1 = stage1Element.children[0]._ljView;
    var layerView2 = stage1Element.children[1]._ljView;


    state.buildTree2();
    expect(state.tree['stage1']).toBeDefined();
    expect(state.tree['stage1'].view).toBe(stageView1);
    expect(state.tree['stage1']['layer1']).toBeDefined();
    expect(state.tree['stage1']['layer1'].view).toBe(layerView1);
    expect(state.tree['stage1']['layer[1]']).toBeDefined();
    expect(state.tree['stage1']['layer[1]'].view).toBe(layerView2);
  });

  it('can export the state as an array of strings with only active frames', function() {
    setHtmlForExport();

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree2();

    var activePaths = state.exportStateAsArray();
    expect(activePaths.length).toBe(2);
    expect(activePaths[0]).toBe('stage1.layer1.frame1');
    expect(activePaths[1]).toBe('stage1.layer1.frame1.layer2.frame2');
  });

  it('can export the state as string with only active frames', function() {
    setHtmlForExport();

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree2();

    var activePaths = state.exportState();
    expect(activePaths).toBe('stage1.layer1.frame1;stage1.layer1.frame1.layer2.frame2');
  });

  it('can export the structure as an array of strings', function() {
    setHtmlForExport();

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree2();

    var structure = state.exportStructureAsArray();
    expect(structure.length).toBe(4);
    expect(structure[0]).toBe('stage1.layer1.frame1');
    expect(structure[1]).toBe('stage1.layer1.frame1.layer2.frame2');
    expect(structure[2]).toBe('stage1.layer1.frame1.layer2.frame3');
    expect(structure[3]).toBe('stage1.layer1.frame4');
  });

  it('can export the structure as string', function() {
    setHtmlForExport();

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    state.buildTree2();

    var structure = state.exportStructure();
    expect(structure).toBe('stage1.layer1.frame1;stage1.layer1.frame1.layer2.frame2;stage1.layer1.frame1.layer2.frame3;stage1.layer1.frame4');
  });

  it('can detect a new frame transition', function(done) {
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

    state.buildTree2();

    var layerView1 = document.getElementById('layer1')._ljView;

    layerView1.transitionTo('frame2', {
      duration: '0s'
    });

    setTimeout(function() {
      expect(state.exportState()).toBe('stage1.layer1.frame2');
      done();
    }, 500);
  });

  it('performance test', function() {

    //   setHtmlForExport();


    var html =
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' data-lj-name='frame1'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'>" +
      "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' data-lj-name='frame1'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" + "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
      "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
      "</div>" +
      "</div>" +
      "<div data-lj-type='frame' data-lj-name='frame4'></div>" +
      "</div>" +
      "</div>"
    "</div>" +
    "</div>" +
    "</div>" +
    "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
    "</div>" +
    "<div data-lj-type='layer' data-lj-default-frame='frame2'>" +
    "<div data-lj-type='frame' data-lj-name='frame2'></div>" +
    "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
    "</div>" +
    "</div>" +
    "<div data-lj-type='frame' data-lj-name='frame3'></div>" +
    "</div>" +
    "</div>" +
    "<div data-lj-type='frame' data-lj-name='frame4'></div>" +
    "</div>" +
    "</div>";

    utilities.setHtml(html);

    var Perfcollector = require('perfcollector.js');

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    var perfs = Perfcollector.create().enable();



    var newWay = perfs.start("newWay");
    state.buildTree2();
    newWay.end().logToConsole();

    var oldWay = perfs.start("oldWay");
    state.buildTree();
    oldWay.end().logToConsole();





  });
});
