var StageView = require('../../src/framework/stageview.js');
var state = require('../../src/framework/state.js');
var utilities = require("./helpers/utilities.js");

var ViewsCommon_renderChildPositionTests = require('./helpers/views/common/_renderchildpositiontests.js');
var ViewsCommon_parseChildrenTests = require('./helpers/views/common/_parseChildrentests.js');
var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');
var ViewsCommonViewTests = require('./helpers/views/common/viewtests.js')

describe("StageView", function() {

    ViewsCommonViewTests('simple_stagedata_nochilden', function() {
      return {
        ViewType: StageView,
        htmlElement: require('./htmlelements/stage_nochildren_1.js')
      };
    });

    ViewsCommonIdentifyTests('div data-lj-type="stage"', StageView, function() {
      var element = document.createElement('div');
      element.setAttribute('data-lj-type', 'stage');

      return element;
    }, true);

    ViewsCommonIdentifyTests('div', StageView, function() {
      return document.createElement('div');
    }, false);

    ViewsCommon_renderChildPositionTests('simple_stage_1.js', function() {
      return {
        htmlElement: require('./htmlelements/simple_stage_1.js'),
        ViewType: StageView
      };
    });

    ViewsCommon_parseChildrenTests(function() {
      return {
        ViewType: StageView,
        htmlElement: require('./htmlelements/simple_stage_1.js'),
        expectedChildren: ['simple_layer_1']
      }
    });

    describe('event', function() {

      describe('childrenChanged', function() {
        it('when a node is added the _parseChildren should be called', function(done) {
          var stageView = new StageView({
            el: utilities.appendChildHTML(require('./htmlelements/stage_nochildren_1.js'))
          });

          spyOn(stageView, '_parseChildren');

          stageView.on('childrenChanged', function(options){
            expect(options.addedNodes.length).toBe(1);
            expect(stageView._parseChildren).toHaveBeenCalled();
            done();
          });

          stageView.innerEl.innerHTML = require('./htmlelements/simple_layer_1.js');
        });


        it('when a node is removed the _parseChildren and updateChildren should be called from the state', function(done) {
          var stageView = new StageView({
            el: utilities.appendChildHTML(require('./htmlelements/simple_stage_1.js'))
          });

          spyOn(stageView, '_parseChildren');

          stageView.on('childrenChanged', function(options){
            expect(options.removedNodes.length).toBe(1);
            expect(stageView._parseChildren).toHaveBeenCalled();
            done();
          });

          stageView.innerEl.innerHTML = '';
        });
      });

      describe('sizeChanged', function() {
        it('will trigger a renderRequired event', function(done) {
          var element = utilities.appendChildHTML(require('./htmlelements/simple_stage_1.js'));
          var stageView = new StageView({
            el: element
          });

          stageView.on('renderRequired', function() {
            expect(true).toBe(true);
            done();
          });

          stageView.trigger('sizeChanged');
        });
      });

  describe('renderRequired', function() {
    it('will call the showFrame method of it\'s layer', function(done) {
      var stageView = new StageView({
        el: utilities.appendChildHTML(require('./htmlelements/simple_stage_1.js'))
      });

      var layerView = stageView.getChildViews()[0];

      spyOn(layerView, 'transitionTo');

      stageView.on('renderRequired', function() {
        expect(layerView.transitionTo).toHaveBeenCalled();
        done();
      });

      stageView.trigger('renderRequired');
    });

      });

    });
  });
