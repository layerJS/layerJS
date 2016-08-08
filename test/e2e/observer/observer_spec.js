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

  var detectChildrenChanges = function(elementId) {
    it('can detect new children', function() {
      browser.get('observer/observer.html').then(function() {
        utilities.getDataAttribute(elementId, 'children').then(function(beforeChildren) {
          browser.driver.executeAsyncScript(function(id, callback) {
            var element = document.getElementById(id);
            var child = document.createElement('p');
            child.setAttribute('data-wl-type', 'element');
            element.appendChild(child);
            callback();
          }, elementId).then(function() {
            utilities.getDataAttribute(elementId, 'children').then(function(afterChildren) {
              expect(afterChildren.length).toBe(beforeChildren.length + 1);
            });
          });
        });
      });
    });
  };

  describe('elementView', function() {

    detectAttributeChanges('element', 'data-wl-x', 'x', '100');

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

  describe('groupView', function() {
    detectAttributeChanges('group', 'data-wl-x', 'x', '100');
    detectChildrenChanges('group');
  });

  describe('frameView', function() {
    detectAttributeChanges('frame', 'data-wl-x', 'x', '100');
    detectChildrenChanges('frame');
  });

  describe('layerView', function() {
    detectAttributeChanges('layer', 'data-wl-x', 'x', '100');
    detectChildrenChanges('layer');
  });

  describe('stageView', function() {
    detectAttributeChanges('stage', 'data-wl-x', 'x', '100');
    detectChildrenChanges('stage');
  });
});
