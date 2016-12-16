describe('DOMObserver', function() {

  var DOMObserver = require('../../../src/framework/observer/domobserver.js');
  var utilities = require('../helpers/utilities.js');

  it('can be created', function() {
    var domObserver = new DOMObserver({});

    expect(domObserver).toBeDefined();
  });

  describe('sizeChanged event', function() {
    it('will fire when dimensions are changed', function(done) {
      var element = utilities.appendChildHTML('<div></div>');
      var domObserver = new DOMObserver({});

      domObserver.observe(element, {
        size: true
      });
      element.clientWidth = 200;
      element.clientHeight = 200;

      domObserver.on('sizeChanged', function() {
        expect(true).toBeTruthy();
        done();
      });

    });
  });

  describe('childrenChanged event', function() {

    it('will fire when child is added', function(done) {
      var element = utilities.appendChildHTML('<div></div>');
      var domObserver = new DOMObserver({});

      domObserver.observe(element, {
        children: true
      });

      element.appendChild(document.createElement('div'));

      domObserver.on('childrenChanged', function(result) {
        expect(true).toBeTruthy();
        done();
      });
    });
  });

  describe('attributesChanged event', function() {

    it('will fire when attributes are added', function(done) {
      var element = utilities.appendChildHTML('<div></div>');
      var domObserver = new DOMObserver({});

      domObserver.observe(element, {
        attributes: true
      });

      element.setAttribute('lj-id', 'test');

      domObserver.on('attributesChanged', function(result) {
        expect(result['lj-id']).toBeDefined();
        expect(result['lj-id']).toEqual({
          oldValue: undefined,
          newValue: 'test'
        });
        done();
      });
    });

    it('will fire events when attributes are changed', function(done) {
      var element = utilities.appendChildHTML('<div lj-id="test"></div>');
      var domObserver = new DOMObserver({});

      domObserver.observe(element, {
        attributes: true
      });

      element.setAttribute('lj-id', 'test2');

      domObserver.on('attributesChanged', function(result) {
        expect(result['lj-id']).toBeDefined();
        expect(result['lj-id']).toEqual({
          oldValue: 'test',
          newValue: 'test2'
        });
        done();
      });
    });

    it('will fire events when attributes are removed', function(done) {
      var element = utilities.appendChildHTML('<div lj-id="test"></div>');
      var domObserver = new DOMObserver({});

      domObserver.observe(element, {
        attributes: true
      });

      element.removeAttribute('lj-id');

      domObserver.on('attributesChanged', function(result) {
        expect(result['lj-id']).toBeDefined();
        expect(result['lj-id']).toEqual({
          oldValue: 'test',
          newValue: undefined
        });
        done();
      });
    });

  });

});
