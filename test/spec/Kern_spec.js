Kern = (typeof Kern !== 'undefined' ? Kern : require('../../src/core/Kern.js'));

describe("Kern", function() {
  it('can crate an EventManager', function() {
    var e = new Kern.EventManager();
    console.log(e);
    expect(e).not.toBeUndefined();
  });
  it('can create a Model', function() {
    var m = new Kern.Model();
    expect(m).not.toBeUndefined();
  });
  it('allows to create sub classes of Model', function() {
    var SubModel = Kern.Model.extend();
    var m = new SubModel();
    expect(m).not.toBeUndefined();
    expect(m.extend).not.toBeUndefined;
  });
  it('allows to create sub classes of Model (with constructor)', function() {
    var test = false;
    var SubModel = Kern.Model.extend({
      constructor: function() {
        test = true
      }
    });
    var m = new SubModel();
    expect(m).not.toBeUndefined();
    expect(m.extend).not.toBeUndefined;
    expect(test).toBe(true);
  });
  it('creates objects of correct class', function() {
    var m1 = new Kern.Model();
    var SubModel = Kern.Model.extend();
    var m2 = new SubModel();
    expect(m1 instanceof Kern.Model).toBe(true);
    expect(m1 instanceof SubModel).not.toBe(true);
    expect(m2 instanceof SubModel).toBe(true);
    expect(m2 instanceof Kern.Model).toBe(true);
  })
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
  it('can trigger events with parameters', function() {
    that = this;
    that.e.on('testevent', function(a, b) {
      that.eventcalled += a * b;
    });
    this.e.trigger('testevent', 3, 1);
    this.e.trigger('testevent', 4, 2);
    expect(this.eventcalled).toBe(11);
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
  it('can bind context to functions and preapply parameters', function() {
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
});
describe('Model', function() {
  it('can be created with attributes', function() {
    var m = new Kern.Model({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    expect(m.get('a')).toBe(1);
    expect(m.get('b').c).toBe(2);
    expect(m.get('d')[1]).toBe(2);
  });
  it("attributes can be accessed directly", function() {
    var m = new Kern.Model({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    expect(m.attributes.a).toBe(1);
    expect(m.attributes.b.c).toBe(2);
    expect(m.attributes.d[1]).toBe(2);
  });
  it("can set attributes separately", function() {
    var m = new Kern.Model();
    m.set('a', 1);
    m.set('b', {
      c: 2
    });
    m.set('d', [1, 2, 3]);
    expect(m.attributes.a).toBe(1);
    expect(m.attributes.b.c).toBe(2);
    expect(m.attributes.d[1]).toBe(2);
  });
  it("can set multiple attributes at once", function() {
    var m = new Kern.Model();
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    expect(m.attributes.a).toBe(1);
    expect(m.attributes.b.c).toBe(2);
    expect(m.attributes.d[1]).toBe(2);
  });
  it("can listen to change events with changedAttributes set", function() {
    var m = new Kern.Model();
    var that = this;
    m.on('change', function(model) {
      // list changed attributes
      that.changed = Object.keys(this.changedAttributes).sort().toString();
      that.new = Object.keys(this.newAttributes).sort().toString();
      that.object=model;
    })
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    expect(this.changed).toBe("a,b,d");
    expect(this.new).toBe("a,b,d");
    expect(this.object).toBe(m);
    expect(m.newAttributes).toBeUndefined();
    expect(m.removedAttributes).toBeUndefined();
    expect(m.changedAttributes).toBeUndefined();
  });
  it("can listen to specific change events with changedAttributes set", function() {
    var m = new Kern.Model();
    var that = this;
    m.on('change:b', function(model,value) {
      // list changed attributes
      that.changed = Object.keys(this.changedAttributes).sort().toString();
      that.new = Object.keys(this.newAttributes).sort().toString();
      that.object=model;
      that.value=value;
    })
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    expect(this.changed).toBe("a,b,d");
    expect(this.new).toBe("a,b,d");
    expect(this.object).toBe(m);
    expect(this.value).toBe(m.attributes.b);
    expect(m.newAttributes).toBeUndefined();
    expect(m.deletedAttributes).toBeUndefined();
    expect(m.changedAttributes).toBeUndefined();
  });
  it("can listen to change events on modifying an attribute", function() {
    var m = new Kern.Model();
    var that = this;
    this.called = 0;
    m.on('change:b', function() {
      // list changed attributes
      that.changed = Object.keys(this.changedAttributes).sort().toString();
      that.new = this.newAttributes
      that.called++;
    })
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    m.set("b", 3);
    expect(this.changed).toBe("b");
    expect(this.new).toBeUndefined();
    expect(this.called).toBe(2);
  });
  it("can listen to change events on attribute deletetion", function() {
    var m = new Kern.Model();
    var that = this;
    m.on('change', function() {
      // list changed attributes
      that.changed = Object.keys(this.changedAttributes).sort().toString();
      that.new = this.newAttributes && Object.keys(this.newAttributes).sort().toString();
      that.deleted = this.deletedAttributes && Object.keys(this.deletedAttributes).sort().toString();

    })
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    m.unset("a");
    expect(m.attributes.hasOwnProperty("a")).toBe(false);
    expect(this.changed).toBe("a");
    expect(this.deleted).toBe("a");
    expect(this.new).toBeUndefined();
    expect(m.newAttributes).toBeUndefined();
    expect(m.deletedAttributes).toBeUndefined();
    expect(m.changedAttributes).toBeUndefined();
  });
  it("cannot use update if not silenced", function() {
    var m = new Kern.Model();
    var that = this;
    this.called = 0;
    m.on('change', function() {
      // list changed attributes
      that.changed = Object.keys(this.changedAttributes).sort().toString();
      that.new = this.newAttributes && Object.keys(this.newAttributes).sort().toString();
      that.deleted = this.deletedAttributes && Object.keys(this.deletedAttributes).sort().toString();
      that.called++;

    });
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    var fun = function() {
      m.update("b").c = 4;
    }
    expect(fun).toThrow();
    expect(this.called).toBe(1);
  });
  it("can update a deep model and listen to change events", function() {
    var m = new Kern.Model();
    var that = this;
    this.called = 0;
    m.on('change', function() {
      that.called++;
      that.changed = Object.keys(this.changedAttributes).sort().toString();
    });
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    m.silence();
    m.update("b").c = 4;
    m.set("a", 5);
    m.fire();
    expect(this.changed).toBe("a,b");
    m.set("e", 3);
    expect(this.called).toBe(3);
    expect(m.attributes.b.c).toBe(4);
    expect(m.attributes.a).toBe(5);
    expect(m.attributes.e).toBe(3);
  });
  it("changes get agglomerated if 'trackChanges' is set", function() {
    var m = new Kern.Model();
    var that = this;
    this.called = 0;
    m.on('change', function() {
      that.changed = this.changedAttributes;
      that.called++;
    });
    m.trackChanges();
    m.set({
      a: 1,
      b: {
        c: 2
      },
      d: [1, 2, 3]
    });
    expect(this.changed.hasOwnProperty("a")).toBe(true);
    expect(this.changed.hasOwnProperty("b")).toBe(true);
    expect(this.changed.hasOwnProperty("d")).toBe(true);
    expect(this.changed.a).toBeUndefined();
    expect(this.changed.b).toBeUndefined();
    expect(this.changed.d).toBeUndefined();
    m.silence();
    m.update("b").c = 4;
    m.update("b").d = 3;
    m.set("a", 5);
    m.set("a", 8);
    m.unset("d");
    m.fire();
    expect(this.changed.b.c).toBe(2);
    expect(this.changed.b.hasOwnProperty("d")).toBe(false);
    expect(this.changed.a).toBe(1);
    expect(this.changed.d.toString()).toBe("1,2,3");
    expect(m.attributes.a).toBe(8);
    expect(m.attributes.b.d).toBe(3);
    expect(m.attributes.hasOwnProperty("d")).toBe(false);
  });

})
