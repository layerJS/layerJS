var WL = require('../../src/framework/wl.js');
var defaults = require('../../src/framework/defaults.js');
var utilities = require('./helpers/utilities.js');


describe('ParseMananger', function() {

  var repository = WL.repository;
  var parseManager = WL.parseManager;

  it('will fill add stageData to the repository from DOM elements', function() {
    utilities.setHtml("<div data-wl-id='1' data-wl-type='stage'></div><div data-wl-id='2' data-wl-type='stage'>");

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
