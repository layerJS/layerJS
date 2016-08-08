var TimeoutObserver = require('../../src/framework/observer/timeoutobserver.js');

describe('TimeoutObserver', function() {

  it('can be created', function() {
    var element = document.createElement('div');
    var callBack = function() {};
    var options = {
      attributes: true,
      childList: true,
      changed: callBack
    };

    var observer = new TimeoutObserver(element, options);
    expect(observer).toBeDefined();
    expect(observer.options).toBe(options);
    expect(observer.element).toBe(element);
  });

})
