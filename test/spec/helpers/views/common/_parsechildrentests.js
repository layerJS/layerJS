var defaults = require('../../../../../src/framework/defaults.js');
var utilities = require("../../utilities.js");

module.exports = function(initFunction) {
  describe('_parsechildren test', function() {

    var ViewType, srcElement, expectedChildren;

    beforeEach(function() {
      var init = initFunction();
      ViewType = init.ViewType;
      expectedChildren = init.expectedChildren;
      srcElement = utilities.appendChildHTML(init.htmlElement);
    });

    it('will implement a _parseChildren method', function() {
      var view = new ViewType({
        el: srcElement
      });
      expect(view._parseChildren).toBeDefined();
    });

    it('will parse children on creating view', function() {
      var view = new ViewType({
        el: srcElement
      });

      var childViews = view.getChildViews();
      var childrenIds = [];

      for (var i = 0; i < childViews.length; i++) {
        childrenIds.push(childViews[i].name());
      }

      expect(childrenIds).toEqual(expectedChildren);
    });

    it('will call parse children when a new child element is added', function(done) {
      var view = new ViewType({
        el: srcElement
      });

      spyOn(view, '_parseChildren');
      var childElement = document.createElement('div');
      childElement.setAttribute('lj-name', 'test');
      childElement.setAttribute('lj-type', view.childType);

      srcElement.appendChild(childElement);

      setTimeout(function() {
        expect(view._parseChildren).toHaveBeenCalled();

        var childViews = view.getChildViews();
        var found = false;

        for (var i = 0; i < childViews.length; i++) {
          if (found = childViews[i].name()) {
            break;
          }
        }
        expect(found).toBeTruthy();

        done();
      }, 100);
    });

    it('will trigger a childAdded event when a child element is added', function(done) {
      var view = new ViewType({
        el: srcElement
      });

      var eventTriggered = false;
      var eventParameter;

      view.on('childAdded', function(child) {
        eventTriggered = true;
        eventParameter = child;
      });

      var childElement = document.createElement('div');
      childElement.setAttribute('lj-name', 'test');
      childElement.setAttribute('lj-type', view.childType);

      srcElement.appendChild(childElement);

      setTimeout(function() {
        expect(eventTriggered).toBeTruthy();
        expect(eventParameter).toBe(childElement._ljView);
        done();
      }, 100);
    });

    it('will trigger a childRemoved event when a child element is added', function(done) {
      var view = new ViewType({
        el: srcElement
      });

      var eventTriggered = false;
      var eventParameter;

      view.on('childRemoved', function(child) {
        eventTriggered = true;
        eventParameter = child;
      });

      var childElement = document.createElement('div');
      childElement.setAttribute('lj-name', 'test');
      childElement.setAttribute('lj-type', view.childType);

        srcElement.appendChild(childElement);

      setTimeout(function() {
        srcElement.removeChild(childElement);

        setTimeout(function() {
          expect(eventTriggered).toBeTruthy();
          expect(eventParameter).toBe(childElement._ljView);
          done();
        }, 100);
      }, 100);
    });
  })
};
