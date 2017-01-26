describe('ParseMananger', function() {
  var layerJS, defaults;
  var utilities = require('./helpers/utilities.js');

  beforeEach(function() {
    layerJS = require('../../src/framework/layerjs.js');
    defaults = require('../../src/framework/defaults.js');
  });

  it('will parse stages from the document', function() {
    utilities.setHtml("<div data-lj-id='1' id='stage1' data-lj-type='stage'></div><div data-lj-id='2' id='stage2' data-lj-type='stage'></div>");

    var parseManager = layerJS.parseManager;
    parseManager.parseDocument();

    var stageView1 = document.getElementById('stage1')._ljView;
    expect(stageView1).toBeDefined();
    expect(stageView1.id()).toBe('1');
    expect(stageView1.type()).toBe('stage');
    expect(stageView1.getChildViews().length).toBe(0);

    var stageView2 = document.getElementById('stage2')._ljView;
    expect(stageView2).toBeDefined();
    expect(stageView2.id()).toBe('2');
    expect(stageView2.type()).toBe('stage');
    expect(stageView2.getChildViews().length).toBe(0);
  });

  it('will parse stages from a specific dom element', function() {
    utilities.setHtml("<div id='container'><div data-lj-id='1' id='stage1' data-lj-type='stage'></div><div data-lj-id='2' id='stage2' data-lj-type='stage'></div></div>");

    var parseManager = layerJS.parseManager;
    parseManager.parseElement(document.getElementById('container'));

    var stageView1 = document.getElementById('stage1')._ljView;
    expect(stageView1).toBeDefined();
    expect(stageView1.id()).toBe('1');
    expect(stageView1.type()).toBe('stage');
    expect(stageView1.getChildViews().length).toBe(0);

    var stageView2 = document.getElementById('stage2')._ljView;
    expect(stageView2).toBeDefined();
    expect(stageView2.id()).toBe('2');
    expect(stageView2.type()).toBe('stage');
    expect(stageView2.getChildViews().length).toBe(0);
  });

});
