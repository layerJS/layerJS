describe('observer', function() {

  var utilities = require('../helpers/utilities.js');

  beforeEach(function() {
    utilities.resizeWindow(500, 500);
  });

  var detectAttributeChanges = function(elementId, dataWlAttributes, dataAttribute, dataAttributeValue) {
    it('can detect attribute changes', function() {
      browser.get('observer/observer.html').then(function() {
        utilities.setAttribute(elementId, dataWlAttributes, dataAttributeValue).then(function() {
          utilities.getDataAttribute(elementId, dataAttribute).then(function(result) {
            expect(result).toBe('100');
          });
        });
      });
    });
  };

  var detectChildrenChanges = function(elementId, childType) {
    it('can detect new children', function() {
      browser.get('observer/observer.html').then(function() {
        utilities.getChildrenIds(elementId).then(function(beforeChildren) {
          browser.driver.executeAsyncScript(function(id, type, callback) {
            var element = document.getElementById(id);
            var child = document.createElement('div');
            child.setAttribute('data-lj-type', type);
            element.appendChild(child);
            callback();
          }, elementId, childType).then(function() {
            utilities.getChildrenIds(elementId).then(function(afterChildren) {
              expect(afterChildren.length).toBe(beforeChildren.length + 1);
            });
          });
        });
      });
    });
  };

  xdescribe('elementView', function() {

    detectAttributeChanges('element', 'data-lj-x', 'x', '100');

    it('can\'t detect new children', function() {
      browser.get('observer/observer.html').then(function() {
        browser.driver.executeAsyncScript(function(id, callback) {
          var element = document.getElementById(id);
          element.appendChild(document.createElement('p'));
          callback();
        }, 'element').then(function() {
          utilities.getDataAttribute('element', 'children').then(function(dataAttribute) {
            expect(dataAttribute).toBe(null);
          });
        });
      });
    });
  });

  xdescribe('groupView', function() {
    detectAttributeChanges('group', 'data-lj-x', 'x', '100');
    detectChildrenChanges('group');
  });

  describe('frameView', function() {
    // detectAttributeChanges('frame', 'data-lj-x', 'x', '100');
    // detectChildrenChanges('frame');
  });

  describe('layerView', function() {
    // detectAttributeChanges('layer', 'data-lj-x', 'x', '100');
    detectChildrenChanges('layer', 'frame');
  });

  describe('stageView', function() {
    // detectAttributeChanges('stage', 'data-lj-x', 'x', '100');
    detectChildrenChanges('stage', 'layer');
  });
});
