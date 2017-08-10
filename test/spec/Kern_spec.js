// Copyright (c) 2015, Thomas Handorf, ThomasHandorf@gmail.com, all rights reserverd.

Kern = (typeof Kern !== 'undefined' ? Kern : require('../../src/kern/Kern.js'));
var Perfcollector = require("perfcollector.js");

describe("Kern", function() {
  it('can crate an EventManager', function() {
    var e = new Kern.EventManager();
    expect(e).not.toBeUndefined();
  });

  it('can extend objects', function() {
    var o1 = {
      a: 1,
      b: 2
    };
    var o2 = {
      a: 4,
      c: 5
    };
    var o3 = {
      c: 4,
      d: 6
    };
    Kern._extend(o1, o2, o3);
    expect(o1.a == 4 && o1.b == 2 && o1.c == 4 && o1.d == 6).toBe(true);
  });
  it('can extend objects with keeping existing properties', function() {
    var o1 = {
      a: 1,
      b: 2
    };
    var o2 = {
      a: 4,
      c: 5
    };
    var o3 = {
      c: 4,
      d: 6
    };
    Kern._extendKeep(o1, o2, o3);
    expect(o1.a == 1 && o1.b == 2 && o1.c == 5 && o1.d == 6).toBe(true);
  });
});
describe("EventManager", function() {
  beforeEach(function() {
    this.eventcalled = 0;
    this.e = new Kern.EventManager();
  });
  it('can trigger events on itself', function() {
    that = this;
    that.e.on('testevent', function() {
      that.eventcalled++;
    });
    this.e.trigger('testevent');
    this.e.trigger('testevent');
    expect(this.eventcalled).toBe(2);
  });
  it('doesn\'t trigger events when sender equals itself', function() {
    that = this;
    that.e.on('testevent', function() {
      that.eventcalled++;
    }, {
      ignoreSender: that
    });
    this.e.triggerBy(that, 'testevent');
    this.e.triggerBy(that, 'testevent');
    expect(this.eventcalled).toBe(0);

    this.e.triggerBy({}, 'testevent');
    expect(this.eventcalled).toBe(1);
  });
  it('can trigger events with parameters', function() {
    that = this;
    that.e.on('testevent', function(a, b) {
      that.eventcalled += a * b;
    });
    this.e.trigger('testevent', 3, 1);
    this.e.trigger('testevent', 4, 2);
    this.e.triggerBy({}, 'testevent', 2, 7);
    expect(this.eventcalled).toBe(25);
  });
  it('can trigger events once', function() {
    that = this;
    that.e.once('testevent', function() {
      that.eventcalled++;
    });
    this.e.trigger('testevent');
    this.e.trigger('testevent');
    expect(this.eventcalled).toBe(1);
  });
  it('doesn\'t trigger events once when sender equals itself', function() {
    that = this;
    that.e.once('testevent', function() {
      that.eventcalled++;
    }, {
      ignoreSender: that
    });
    this.e.triggerBy(that, 'testevent');
    this.e.triggerBy(that, 'testevent');
    expect(this.eventcalled).toBe(0);

    this.e.triggerBy({}, 'testevent');
    expect(this.eventcalled).toBe(1);
  });
  it('can trigger events once', function() {
    that = this;
    that.e.once('testevent', function() {
      that.eventcalled++;
    });
    this.e.trigger('testevent');
    this.e.trigger('testevent');
    expect(this.eventcalled).toBe(1);
  });
  it('can register multiple handlers', function() {
    that = this;
    var fa = function() {
      that.eventcalled++;
    }
    var fb = function() {
      that.eventcalled++;
    }
    that.e.on('testevent', fa);
    that.e.on('testevent', fb);
    this.e.trigger('testevent');
    this.e.trigger('testevent');
    expect(this.eventcalled).toBe(4);
  });
  it('can remove single handlers', function() {
    that = this;
    var fa = function() {
      that.eventcalled++;
    }
    var fb = function() {
      that.eventcalled++;
    }
    that.e.on('testevent', fa);
    that.e.on('testevent', fb);
    this.e.trigger('testevent');
    that.e.off('testevent', fa);
    this.e.trigger('testevent');
    expect(this.eventcalled).toBe(3);
  });
  it('can remove all handlers of an event', function() {
    that = this;
    var fa = function() {
      that.eventcalled++;
    }
    var fb = function() {
      that.eventcalled++;
    }
    that.e.on('testevent', fa);
    that.e.on('testevent', fb);
    this.e.trigger('testevent');
    that.e.off('testevent')
    this.e.trigger('testevent');
    expect(this.eventcalled).toBe(2);
  });
  it('can remove all handlers of all events', function() {
    that = this;
    var fa = function() {
      that.eventcalled++;
    }
    var fb = function() {
      that.eventcalled++;
    }
    that.e.on('testevent', fa);
    that.e.on('testevent2', fb);
    this.e.trigger('testevent');
    this.e.trigger('testevent2');
    expect(this.eventcalled).toBe(2);
    that.e.off();
    this.e.trigger('testevent');
    this.e.trigger('testevent2');
    expect(this.eventcalled).toBe(2);
  });
  xit('can bind context to functions and preapply parameters', function() {
    that = this;
    var handler = function(a, b, c, d) {
      that.params = this + a + b + c + d;
      that.eventp = c + d;
    };
    that.e.on('testevent', this.e.bindContext(handler, 1, 2, 4));
    this.e.trigger('testevent', 8, 16);
    expect(this.params).toBe(1 + 2 + 4 + 8 + 16);
    expect(this.eventp).toBe(8 + 16);
  });
  it('can daisy chain methods', function() {
    expect(this.e.on("change", function() {})).toBe(this.e);
    expect(this.e.once("change", function() {})).toBe(this.e);
    expect(this.e.trigger("change")).toBe(this.e);
    expect(this.e.off("change")).toBe(this.e);
  });
  it('can pass in a context for the callback', function() {
    var myContext = {};
    var handlerThis;
    that.e.on('onEvent', function() {
      handlerThis = this;
    }, {
      context: myContext
    });

    that.e.trigger('onEvent');

    expect(handlerThis).toBe(myContext);
  });
  it('can pass in a context for the callback when removing an event', function() {
    var myContext = {};
    var myContext2 = {};
    var myContextHandled = false;
    var myContext2Handled = false;

    that.e.on('onEvent', function() {
      myContextHandled = true;
    }, {
      context: myContext
    });

    that.e.on('onEvent', function() {
      myContext2Handled = true;
    }, {
      context: myContext2
    });

    that.e.off('onEvent', undefined, myContext);
    that.e.trigger('onEvent');

    expect(myContextHandled).toBeFalsy();
    expect(myContext2Handled).toBeTruthy();
  });

  it('can remove all events on a specific context', function() {
    var myContext = {};
    var handled = false;

    that.e.on('onEvent1', function() {
      handled = true;
    }, {
      context: myContext
    });

    that.e.on('onEvent2', function() {
      handled = true;
    }, {
      context: myContext
    });

    that.e.off(undefined, undefined, myContext);
    that.e.trigger('onEvent1');
    expect(handled).toBeFalsy();
    that.e.trigger('onEvent2');
    expect(handled).toBeFalsy();
  });


});

describe('Promise', function() {
  it('can be created', function() {
    var p = new Kern.Promise();
    expect(p).toBeDefined();
  });
  it('can be resolved', function() {
    var p = new Kern.Promise();
    p.resolve(5);
    expect(p.value).toBe(5);
  });
  it('can be rejected', function() {
    var p = new Kern.Promise();
    p.reject(5);
    expect(p.reason).toBe(5);
  });
  it('can trigger function with then()', function() {
    var p = new Kern.Promise();
    var test = 0;
    var p2 = p.then(function(value) {
      return test = value + 5
    })
    expect(p2.value).toBeUndefined();
    p.resolve(5);
    expect(test).toBe(10);
    expect(p2.value).toBe(10);
  });
  it('can trigger rejection function with then()', function() {
    var p = new Kern.Promise();
    var test = 0;
    var p2 = p.then(function() {}, function(reason) {
      return test = reason + 5;
    })
    expect(p2.value).toBeUndefined();
    p.reject(5);
    expect(test).toBe(10);
    expect(p2.value).toBeUndefined();
    expect(p2.reason).toBe(5);
  });
  it('final promise is rejected if resolve function throws', function() {
    var p = new Kern.Promise();
    var test = 0;
    var p2 = p.then(function(value) {
      throw value + 6;
    })
    expect(p2.value).toBeUndefined();
    p.resolve(5);
    expect(p2.reason).toBe(11);
    expect(p2.value).toBeUndefined();
  });
  it('can chain then\'s', function() {
    var p = new Kern.Promise();
    var test = 0;
    var p2 = p.then(function(value) {
      return value + 6;
    }).then(function(value) {
      return value + 8;
    })
    expect(p2.value).toBeUndefined();
    p.resolve(5);
    expect(p2.value).toBe(19);
  });
  it('can chain then\'s returning new promises in the resolve functions', function() {
    var p = new Kern.Promise();
    var ip;
    var test = 0;
    var p2 = p.then(function(value) {
      var innerPromise = new Kern.Promise();
      ip = function(value2) {
        innerPromise.resolve(2 * (value + value2));
      }
      return innerPromise;
    }).then(function(value) {
      return value + 8;
    });
    expect(p2.value).toBeUndefined();
    p.resolve(5);
    expect(p2.value).toBeUndefined();
    ip(4);
    expect(p2.value).toBe(26);
  });
});

describe('Queue', function() {

  var queue;

  beforeEach(function() {
    queue = new Kern.Queue();
  });

  it('can add something to the queue', function(done) {
    queue.add().then(function() {
      expect(true).toBe(true);
      done();
    });
  });

  it('will wait to advance until the continue method is called ', function(done) {
    queue.add();

    queue.add().then(function() {
      expect(queue.waiting).toBe(true);
      queue.continue();
      expect(queue.waiting).toBe(false);
      done();
    });

    expect(queue.waiting).toBe(true);
    queue.continue();
  });

  it('can be cleared', function() {

    queue.add();
    queue.add();

    expect(queue.q.length).toBeGreaterThan(0);
    queue.clear();
    expect(queue.q.length).toBe(0);
  });

  it('can debouce items', function(){
    queue.add();
    queue.add('debounce');
    expect(queue.q.length).toBe(1);
    queue.add('debounce');
    expect(queue.q.length).toBe(1);
    queue.add();
    expect(queue.q.length).toBe(2);
    queue.add('test');
    expect(queue.q.length).toBe(3);
    queue.add('test');
    expect(queue.q.length).toBe(3);
  });

  it('will not debouce items', function(){
    queue.add();
    queue.add();
    expect(queue.q.length).toBe(1);
    queue.add();
    expect(queue.q.length).toBe(2);
  });
});
