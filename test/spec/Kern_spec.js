// Copyright (c) 2015, Thomas Handorf, ThomasHandorf@gmail.com, all rights reserverd.

Kern = (typeof Kern !== 'undefined' ? Kern : require('../../src/kern/Kern.js'));

describe("Kern", function() {
  it('can crate an EventManager', function() {
    var e = new Kern.EventManager();
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
      constructor: function() { // Note: don't do that as it does not call the SUPER constructor
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
  });
  it('can extend objects',function(){
    var o1={a:1,b:2};
    var o2={a:4,c:5};
    var o3={c:4,d:6};
    Kern._extend(o1,o2,o3);
    expect(o1.a==4 && o1.b==2 && o1.c==4 && o1.d==6).toBe(true);
  });
  it('can extend objects with keeping existing properties',function(){
    var o1={a:1,b:2};
    var o2={a:4,c:5};
    var o3={c:4,d:6};
    Kern._extendKeep(o1,o2,o3);
    expect(o1.a==1 && o1.b==2 && o1.c==5 && o1.d==6).toBe(true);
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
  it('can daisy chain methods', function() {
    expect(this.e.on("change", function() {})).toBe(this.e);
    expect(this.e.once("change", function() {})).toBe(this.e);
    expect(this.e.trigger("change")).toBe(this.e);
    expect(this.e.off("change")).toBe(this.e);
  })
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
      that.object = model;
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
    m.on('change:b', function(model, value) {
      // list changed attributes
      that.changed = Object.keys(this.changedAttributes).sort().toString();
      that.new = Object.keys(this.newAttributes).sort().toString();
      that.object = model;
      that.value = value;
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
  it('can be initialized with class defaults', function() {
    var SubModel = Kern.Model.extend({
      defaults: {
        a: 3,
        b: 4,
        c: 5
      }
    });
    var m=new SubModel({d:7,b:9});
    expect(m.attributes.a).toBe(3);
    expect(m.attributes.b).toBe(9);
    expect(m.attributes.d).toBe(7);
  })
});

describe("ModelRepository", function() {
  var data1 = {
    a: 1,
    b: "string",
    c: {
      from: 1,
      to: 5
    },
    id: "1"
  };
  var data2 = {
    query: "drgwerge",
    answer: [1, 2, 3, 4],
    id: "2"
  };
  var data3 = {
    cid: "3",
    b: 4
  };
  var datalist = [data1, data2];
  var SubModel = Kern.Model.extend({});
  it('can be instantiated', function() {
    var r = new Kern.ModelRepository();
    expect(r).toBeDefined();
  });
  it('can be instantiated with model data', function() {
    var r = new Kern.ModelRepository(datalist);
    expect(r.length()).toBe(2);
    expect(r.get("1") instanceof Kern.Model).toBe(true);
    expect(r.get("2").attributes.answer[0]).toBe(1);
    var r2 = new Kern.ModelRepository({
      3: data3
    });
    expect(r2.get("3").attributes.b).toBe(4);
  });
  it('cannot be initiated without ids', function() {
    var r = new Kern.ModelRepository();
    var fun = function() {
      r.add(data3);
    }
    expect(fun).toThrow();
  });
  it('can add models', function() {
    var m = new Kern.Model(data1);
    var r = new Kern.ModelRepository();
    r.add(m);
    expect(r.length()).toBe(1);
    expect(r.get('1').attributes.b).toBe("string");
  });
  it('can create models of a specific model type', function() {
    var r = new Kern.ModelRepository(datalist, {
      model: SubModel
    });
    expect(r.get('2') instanceof SubModel).toBe(true);
    expect(r.get('2') instanceof Kern.Model).toBe(true);
  });
  it('can listen to change events from models', function() {
    var mdl, chg;
    var r = new Kern.ModelRepository(datalist);
    r.on('change', function(model) {
      mdl = model;
      chg = model.changedAttributes;
    });
    r.get('2').set('query', "dust");
    expect(mdl.attributes.id).toBe('2');
    expect(chg.hasOwnProperty('query')).toBe(true);
  });
  it('can trigger add events', function() {
    var cnt = 0,
      mdl;
    var r = new Kern.ModelRepository();
    r.on('add', function(model, repo) {
      cnt++;
      mdl = model; // the last model
    });
    r.add(datalist);
    expect(mdl.attributes.id).toBe('2');
    expect(cnt).toBe(2);
  });
  it('can trigger remove events', function() {
    var cnt = 0,
      mdl;
    var r = new Kern.ModelRepository();
    r.on('remove', function(model, repo) {
      cnt++;
      mdl = model; // the last model
    });
    r.add(datalist);
    r.remove('2')
    expect(mdl.attributes.id).toBe('2');
    expect(cnt).toBe(1);
    r.remove(r.get('1'));
    expect(mdl.attributes.id).toBe('1');
    expect(cnt).toBe(2);
  });
  it('correctly removes change handlers from models', function() {
    var mdl, cnt = 0;
    var r = new Kern.ModelRepository(datalist);
    var model = r.get('2');
    r.on('change', function(model) {
      mdl = model;
      cnt++;
    });
    expect(model.__listeners__.change.length).toBe(1); // that's interal poking and shouldn't be public interface. If it breaks fix the test.
    r.remove('2');
    model.set('query', "dust");
    expect(mdl).toBeUndefined();
    expect(cnt).toBe(0);
    expect(model.__listeners__.change.length).toBe(0); // that's interal poking and shouldn't be public interface. If it breaks fix the test.
  });
  it('can contain a lot of models', function(){
    console.log(Date.now());
    var data={};
    for (var i=0;i<10000;i++){
      data['x'+i]=data3;
    }
    console.log(Date.now());
    var r = new Kern.ModelRepository(data);
    expect(r.get('x50').attributes.b).toBe(4);
    console.log(Date.now());
  })
})
