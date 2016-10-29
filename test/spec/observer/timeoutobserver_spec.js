describe('TimeoutObserver', function() {

  var TimeoutObserver;

  beforeEach(function() {
    TimeoutObserver = require('../../../src/framework/observer/timeoutobserver.js');
  });

  it('can be created', function() {
    var element = document.createElement('div');
    var callBack = function() {};
    var options = {
      attributes: true,
      childList: true,
      callback: callBack
    };

    var observer = new TimeoutObserver(element, options);
    expect(observer).toBeDefined();
    expect(observer.options).toBe(options);
    expect(observer.element).toBe(element);
  });

  describe('attributes', function() {
    it('can detect new attributes', function(done) {
      var element = document.createElement('div');
      var ok = false;
      var callBack = function(param) {
        ok = param.attributes.indexOf('something') != -1;
      };
      var options = {
        attributes: true,
        childList: false,
        callback: callBack,
        timeout: 50
      };

      var observer = new TimeoutObserver(element, options);

      observer.observe();
      element.setAttribute('something', '1');

      setTimeout(function() {
        expect(ok).toBe(true);
        observer.stop();
        done();
      }, 55);
    });

    it('can detect changed attributes', function(done) {
      var element = document.createElement('div');
      element.setAttribute('something', '1');
      var ok = false;
      var callBack = function(param) {
        ok = param.attributes.indexOf('something') != -1;
      };
      var options = {
        attributes: true,
        childList: false,
        callback: callBack,
        timeout: 50
      };

      var observer = new TimeoutObserver(element, options);
      observer.observe();
      element.setAttribute('something', '2');

      setTimeout(function() {
        expect(ok).toBe(true);
        observer.stop();
        done();
      }, 55);
    });

    it('can detect removed attributes', function(done) {
      var element = document.createElement('div');
      element.setAttribute('something', '1');
      var ok = false;
      var callBack = function(param) {
        ok = param.attributes.indexOf('something') != -1;
      };
      var options = {
        attributes: true,
        childList: false,
        callback: callBack,
        timeout: 50
      };

      var observer = new TimeoutObserver(element, options);
      observer.observe();
      element.removeAttribute('something');

      setTimeout(function() {
        expect(ok).toBe(true);
        observer.stop();
        done();
      }, 55);
    });


    it('can apply an attributeFilter', function(done) {
      var element = document.createElement('div');
      element.setAttribute('something', '1');
      var ok = false;
      var callBack = function(param) {
        ok = true;
      };
      var options = {
        attributes: true,
        childList: false,
        callback: callBack,
        attributeFilter : ['id'],
        timeout: 50
      };

      var observer = new TimeoutObserver(element, options);
      observer.observe();
      element.setAttribute('something', '2');

      setTimeout(function() {
        expect(ok).toBe(false);
        element.setAttribute('id', '1');
        setTimeout(function(){
          expect(ok).toBe(true);
          done();
        },55);
      }, 55);
    });


    it('attributeFilter can accept wildcards', function(done) {
      var element = document.createElement('div');
      element.setAttribute('something', '1');
      element.setAttribute('data-lj-something', '1');
      var ok = false;
      var callBack = function(param) {
        ok = true;
      };
      var options = {
        attributes: true,
        childList: false,
        callback: callBack,
        attributeFilter : ['data-lj-*'],
        timeout: 50
      };

      var observer = new TimeoutObserver(element, options);
      observer.observe();
      element.setAttribute('something', '2');

      setTimeout(function() {
        expect(ok).toBe(false);
        element.setAttribute('data-lj-something', '2');
        setTimeout(function(){
          expect(ok).toBe(true);
          done();
        },55);
      }, 55);
    });




  });

  describe('childNodes', function() {
    it('can detect new children', function(done) {
      var element = document.createElement('div');
      var ok = false;
      var child = document.createElement('div');

      var callBack = function(param) {
        ok = param.addedNodes.indexOf(child) != -1;
      };
      var options = {
        attributes: false,
        childList: true,
        callback: callBack,
        timeout: 50
      };

      var observer = new TimeoutObserver(element, options);
      observer.observe();
      element.appendChild(child);

      setTimeout(function() {
        expect(ok).toBe(true);
        observer.stop();
        done();
      }, 55);
    });

    it('can detect removed children', function(done) {
      var element = document.createElement('div');
      var ok = false;
      var child = document.createElement('div');
      var callBack = function(param) {
        ok = param.removedNodes.indexOf(child) != -1;
      };
      var options = {
        attributes: false,
        childList: true,
        callback: callBack,
        timeout: 50
      };

      element.appendChild(child);
      var observer = new TimeoutObserver(element, options);
      observer.observe();
      element.removeChild(child);

      setTimeout(function() {
        expect(ok).toBe(true);
        observer.stop();
        done();
      }, 55);
    });

  });

})
