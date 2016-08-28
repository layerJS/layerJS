describe('state', function() {

  var utilities = require('./helpers/utilities.js');
  var StageView = require('../../src/framework/stageview.js');
  var State = require('../../src/framework/state.js');


  it('can get the active frames of all the layers', function() {
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

    var state = new State();
    state.getStates();

    var stageView1Id = stageView1.data.attributes.id;
    var stageView2Id = stageView2.data.attributes.id;
    var layerView1 = document.getElementById('layer1')._ljView;
    var layerView2 = document.getElementById('layer2')._ljView;
    var layerView3 = document.getElementById('layer3')._ljView;
    var layerView1Id = layerView1.data.attributes.id;
    var layerView2Id = layerView2.data.attributes.id;
    var layerView3Id = layerView3.data.attributes.id;

    expect(state.stages[stageView1Id]).toBeDefined();
    expect(state.stages[stageView1Id].view).toBe(stageView1);

    expect(state.stages[stageView1Id].layers[layerView1Id]).toBeDefined();
    expect(state.stages[stageView1Id].layers[layerView1Id].view).toBe(layerView1);
    expect(state.stages[stageView1Id].layers[layerView1Id].activeFrame).toBe('frame1');

    expect(state.stages[stageView1Id].layers[layerView2Id]).toBeDefined();
    expect(state.stages[stageView1Id].layers[layerView2Id].view).toBe(layerView2);
    expect(state.stages[stageView1Id].layers[layerView2Id].activeFrame).toBe('frame3');

    expect(state.stages[stageView2Id]).toBeDefined();
    expect(state.stages[stageView2Id].view).toBe(stageView2);

    expect(state.stages[stageView2Id].layers[layerView3Id]).toBeDefined();
    expect(state.stages[stageView2Id].layers[layerView3Id].view).toBe(layerView3);
    expect(state.stages[stageView2Id].layers[layerView3Id].activeFrame).toBe('frame5');
  });

  it('can detect a new frame transition', function() {
    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>" ;

    utilities.setHtml(html);

    var stageView1 = new StageView(null, {
      el: document.getElementById('stage1')
    });

    var state = new State();
    state.getStates();

    var stageView1Id = stageView1.data.attributes.id;
    var layerView1 = document.getElementById('layer1')._ljView;
    var layerView1Id = layerView1.data.attributes.id;

    layerView1.transitionTo('frame2', {});

    expect(state.stages[stageView1Id]).toBeDefined();
    expect(state.stages[stageView1Id].view).toBe(stageView1);
    expect(state.stages[stageView1Id].layers[layerView1Id]).toBeDefined();
    expect(state.stages[stageView1Id].layers[layerView1Id].view).toBe(layerView1);
    expect(state.stages[stageView1Id].layers[layerView1Id].activeFrame).toBe('frame2');
  });
});
