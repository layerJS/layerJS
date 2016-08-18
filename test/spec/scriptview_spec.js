
var scriptView = function() {
  return require('../../src/framework/scriptview.js');
};
var utilities = require('./helpers/utilities.js');

var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
var NodeViewTests = require('./helpers/views/node/viewtests.js');
var GroupView_parseChildrenTests = require('./helpers/views/group/_parseChildrenTests.js');

//var ElementViewTest = require('./helpers/views/element/viewtests.js');
var ElementParseTests = require('./helpers/views/element/parsetests.js');

describe("ScriptView", function() {

  var layerJS, ScriptView, repository;

  beforeEach(function(){
    repository = require('../../src/framework/repository.js');
    ScriptView = scriptView();
    layerJS = require('../../src/framework/layerjs.js');

  });

  describe('will identify all DOM elements with a script tag', function() {
    ViewsCommonIdentifyTests('div', scriptView, function() {
      return document.createElement('div');
    }, false);

    ViewsCommonIdentifyTests('div', scriptView, function() {
      var element = document.createElement('div');
      element.setAttribute('data-lj-type', 'script');
      return element;
    }, false);

    ViewsCommonIdentifyTests('script', scriptView, function() {
      return document.createElement('script');
    }, true);
  });

  ViewsCommonParseTests(function() {
    return {
      ViewType: scriptView()
    };
  });

  NodeViewTests('simple_scriptdata.js', scriptView, {
    "type": "script",
    "id": "116530",
    "nodeType": 1,
    "version": "default",
    "tag": "script",
    "htmlAttributes": [],
    "children": []
  });

  GroupView_parseChildrenTests(function() {
    return {
      ViewType: scriptView(),
      HTML: "<script id='100'>" +
        "var a = 1;" +
        "</script>",
      expectedChildren: []
    };
  });

  ElementParseTests(function() {
    return {
      ViewType: scriptView()
    };
  });

  it('will render the src attribute when layerJS.executeScriptCode equals true', function() {
    layerJS.executeScriptCode = true;
    var data = JSON.parse(JSON.stringify(ScriptView.defaultProperties));
    data.htmlAttributes = {
      'src': 'someScript.js'
    };

    var viewData = new ScriptView.Model(data);
    var view = new ScriptView(viewData);
    var element = view.innerEl;

    expect(element.hasAttribute('src')).toBeTruthy();
    expect(element.getAttribute('src')).toBe(data.htmlAttributes.src);
  });


  it('will render childNodes when layerJS.executeScriptCode equals true', function() {
    layerJS.executeScriptCode = true;
    var data = JSON.parse(JSON.stringify(require('./datasets/simple_scriptdata.js')));
    layerJS.repository.importJSON(data, data[0].version);

    var viewData = layerJS.repository.get(data[0].id, data[0].version);
    var view = new ScriptView(viewData);
    var element = view.innerEl;
    expect(element.childNodes.length).toBe(1);
  });

  it('will not render the src attribute when layerJS.executeScriptCode equals false', function() {
    layerJS.executeScriptCode = false;
    var data = JSON.parse(JSON.stringify(ScriptView.defaultProperties));
    data.htmlAttributes = {
      'src': 'someScript.js'
    };

    var viewData = new ScriptView.Model(data);
    var view = new ScriptView(viewData);
    var element = view.innerEl;

    expect(element.hasAttribute('src')).toBeFalsy();
  });

  it('will not render childNodes when layerJS.executeScriptCode equals false', function() {
    layerJS.executeScriptCode = false;
    var data = JSON.parse(JSON.stringify(require('./datasets/simple_scriptdata.js')));
    layerJS.repository.importJSON(data, data[0].version);

    var viewData = layerJS.repository.get(data[0].id, data[0].version);
    var view = new ScriptView(viewData);
    var element = view.innerEl;
    expect(element.childNodes.length).toBe(0);
  });
});
