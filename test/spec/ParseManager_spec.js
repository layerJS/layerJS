describe('ParseMananger', function() {
  var layerJS, defaults;
  var utilities = require('./helpers/utilities.js');

  beforeEach(function() {
    layerJS = require('../../src/framework/layerjs.js');
    defaults = require('../../src/framework/defaults.js');
  });


  it('will fill add stageData to the repository from DOM elements', function() {
    utilities.setHtml("<div data-lj-id='1' data-lj-type='stage'></div><div data-lj-id='2' data-lj-type='stage'>");

    var repository = layerJS.repository;
    var parseManager = layerJS.parseManager;

    parseManager.parseDocument();

    var stage = repository.get(1, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('1');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);

    stage = repository.get(2, defaults.version);
    expect(stage).toBeDefined();
    expect(stage.attributes.id).toBe('2');
    expect(stage.attributes.type).toBe('stage');
    expect(stage.attributes.children.length).toBe(0);
  });
});
