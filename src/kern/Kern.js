'use strict';
//jshint unused:false

// Copyright (c) 2015, Thomas Handorf, ThomasHandorf@gmail.com, all rights reserverd.

(function() { // private scope

  var scope = function() { // a scope which could be given a dependency as parameter (e.g. AMD or node require)
    /**
     * extend an object with properties from one or multiple objects
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var _extend = function(obj) {
      var len = arguments.length;
      if (len < 2) throw ("too few arguments in _extend");
      if (obj === null) throw ("no object provided in _extend");
      // run through extending objects
      for (var i = 1; i < len; i++) {
        var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
        // run through properties of extending object
        for (var j = 0; j < props.length; j++) {
          obj[props[j]] = arguments[i][props[j]];
        }
      }
      return obj;
    };
    /**
     * extend an object with properties from one or multiple object. Keep properties of earlier objects if present.
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var _extendKeep = function(obj) {
      var len = arguments.length;
      if (len < 2) throw ("too few arguments in _extend");
      if (obj === null) throw ("no object provided in _extend");
      // run through extending objects
      for (var i = 1; i < len; i++) {
        var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
        // run through properties of extending object
        for (var j = 0; j < props.length; j++) {
          if (!obj.hasOwnProperty(props[j])) obj[props[j]] = arguments[i][props[j]];
        }
      }
      return obj;
    };
    /**
     * returns a simple deep copy of an object. Only considers plain object and arrays (and of course scalar values)
     *
     * @param {object} obj - The object to be deep cloned
     * @returns {obj} a fresh copy of the object
     */
    var _deepCopy = function(obj) {
      if (typeof obj === 'object') {
        var temp;
        if (Array.isArray(obj)) {
          temp = [];
          for (var i = obj.length - 1; i >= 0; i--) {
            temp[i] = _deepCopy(obj[i]);
          }
          return temp;
        }
        if (obj === null) {
          return null;
        }
        temp = {};
        for (var k in Object.keys(obj)) {
          if (obj.hasOwnProperty(k)) {
            temp[k] = _deepCopy(obj[k]);
          }
        }
        return temp;
      }
      return obj;
    };
    /**
     * extend an object with properties from one or multiple object. Keep properties of earlier objects if present.
     * Will deep copy object and arrays from the exteding objects (needed for copying default values in Model)
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var _extendKeepDeepCopy = function(obj) {
      var len = arguments.length;
      if (len < 2) throw ("too few arguments in _extend");
      if (obj === null) throw ("no object provided in _extend");
      // run through extending objects
      for (var i = 1; i < len; i++) {
        var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
        // run through properties of extending object
        for (var j = 0; j < props.length; j++) {
          if (!obj.hasOwnProperty(props[j])) {
            obj[props[j]] = _deepCopy(arguments[i][props[j]]);
          }
        }
      }
      return obj;
    };
    // the module
    var Kern = {
      _extend: _extend,
      _extendKeep: _extendKeep,
      _extendKeepDeepCopy: _extendKeepDeepCopy
    };
    /**
     * Kern.Base is the Base class providing extend capability
     */
    var Base = Kern.Base = function() {

    };
    // create a contructor with a (function) name
    function createNamedConstructor(name, constructor) {
      // wrapper function created dynamically constructor to allow instances to be identified in the debugger
      var fn = new Function('c', 'return function ' + name + '(){c.apply(this, arguments)}'); //jshint ignore:line
      return fn(constructor);
    }
    // this function can extend classes; it's a class function, not a object method
    Base.extend = function(prototypeProperties, staticProperties) {
      // create child as a constructor function which is
      // either supplied in prototypeProperties.constructor or set up
      // as a generic constructor function calling the parents contructor
      prototypeProperties = prototypeProperties || {};
      staticProperties = staticProperties || {};
      var parent = this; // Note: here "this" is the class (which is the constructor function in JS)
      var child = (prototypeProperties.hasOwnProperty('constructor') ? prototypeProperties.constructor : function() {
        return parent.apply(this, arguments); // Note: here "this" is actually the object (instance)
      });
      // name constructor (for beautiful stacktraces) if name is given
      if (staticProperties && staticProperties.className) {
        child = createNamedConstructor(staticProperties.className, child);
      }
      delete prototypeProperties.constructor; // this should not be set again.
      // create an instance of parent and assign it to childs prototype
      child.prototype = Object.create(parent.prototype); // NOTE: this does not call the parent's constructor (instead of "new parent()")
      child.prototype.constructor = child; //NOTE: this seems to be an oldish artefact; we do it anyways to be sure (http://stackoverflow.com/questions/9343193/why-set-prototypes-constructor-to-its-constructor-function)
      // extend the prototype by further (provided) prototyp properties of the new class
      _extend(child.prototype, prototypeProperties);
      // extend static properties (e.g. the extend static method itself)
      _extend(child, this, staticProperties);
      return child;
    };
    /**
     * a class that can handle events
     */
    var EventManager = Kern.EventManager = Base.extend({
      constructor: function() {
        this.__listeners__ = {};
      },
      /**
       * register event listerner
       * @param {string} event event name
       * @param {Function} callback the callback function
       * @param {Object} options { ignoreSender: this }
       * @return {Object} this object
       */
      on: function(event, callback, options) {
        this.__listeners__[event] = this.__listeners__[event] || [];
        this.__listeners__[event].push({
          callback: callback,
          options: options || {}
        });
        return this;
      },
      /**
       * register event listerner. will be called only once, then unregistered.
       * @param {string} event event name
       * @param {Function} callback the callback function
       * @param {Object} options { ignoreSender: this }
       * @return {Object} this object
       */
      once: function(event, callback, options) {
        var that = this;
        var helper = function() {
          callback.apply(this, arguments);
          that.off(event, helper);
        };
        this.on(event, helper, options);
        return this;
      },
      /**
       * unregister event handler.
       * @param {string} event the event name
       * @param {Function} callback the callback
       * @param {Object} context the object that registered the listener (if given as options.context when binding)
       * @return {Object} this object
       */
      off: function(event, callback, context) {
        var i, listeners;
        if (event) {
          if (callback || context) {
            // remove specific callback / context for given event
            listeners = this.__listeners__[event];
            for (i = 0; i < listeners.length; i++) {
              if ((!callback || listeners[i].callback === callback) && (!context || listeners[i].options.context === context)) {
                listeners.splice(i, 1);
              }
            }
          } else {
            // remove all callbacks for event
            delete this.__listeners__[event];
          }
        } else {
          if (callback || context) {
            // remove specific callback in all event
            for (var ev in this.__listeners__) {
              if (this.__listeners__.hasOwnProperty(ev)) {
                listeners = this.__listeners__[ev];
                for (i = 0; i < listeners.length; i++) {
                  if ((!callback || listeners[i].callback === callback) && (!context || listeners[i].options.context === context)) {
                    listeners.splice(i, 1);
                  }
                }
              }
            }
          } else {
            // remove all callbacks from all events
            this.__listeners__ = {};
          }
        }
        return this;
      },
      /**
       * trigger an event
       * @param {string} event event name
       * @param {...} arguments further arguments
       * @return {object} this object
       */
      trigger: function(event) {
        if (this.__listeners__[event]) {
          for (var i = 0; i < this.__listeners__[event].length; i++) {

            // copy arguments as we need to remove the first argument (event)
            // and arguments is read only
            // loop is faster then .slice method
            var length = arguments.length;
            var args = new Array(length - 1);
            for (var j = 0; j < length - 1; j++) {
              args[j] = arguments[j + 1];
            }
            // call the callback
            var listener = this.__listeners__[event][i];
            listener.callback.apply(listener.options.context || this, args);
          }
        }
        return this;
      },
      /**
       * trigger an event. This also notes the object or channel that sends the event. This is compared to the ignoreSender option provided during the .on() registration.
       * @param {object} object/channel that fired the event. You can use the object (e.g. this) or just a string that identifies a channel as long as it is consitien with what you have specified as ignoreSender option when registering the listener.
       * @param {string} event event name
       * @param {...} arguments further arguments
       * @return {object} this object
       */
      triggerBy: function(sender, event) {
        if (this.__listeners__[event]) {
          for (var i = 0; i < this.__listeners__[event].length; i++) {

            // check if the sender equals the ignoreSender from the options
            if (this.__listeners__[event][i].options.ignoreSender && this.__listeners__[event][i].options.ignoreSender === sender) {
              continue;
            }

            // copy arguments as we need to remove the first argument (event)
            // and arguments is read only
            var length = arguments.length;
            var args = new Array(length - 2);
            for (var j = 0; j < length - 2; j++) {
              args[j] = arguments[j + 2];
            }
            // call the callback
            var listener = this.__listeners__[event][i];
            listener.callback.apply(listener.options.context || this, args);
          }
        }
        return this;
      },
    });

    /**
     * A simple Promise implementation
     *
     */
    var Promise = Kern.Promise = Base.extend({
      constructor: function() {
        this.state = undefined;
        this.value = undefined;
        this.reason = undefined;
      },
      /**
       * register resolve and reject handlers
       *
       * @param {Function} fn - function to be called if Promise is resolved.
       * first parameter is the value of the Promise
       * can return a further promise whice is passes to the returned promise
       * @param {Function} errFn - function called if promise is rejected
       * first parameter is a reason1
       * @returns {Promise} return a further promise which allows chaining of then().then().then() calls
       */
      then: function(fn, errFn) {
        this.nextPromise = new Promise();
        this.fn = fn;
        this.errFn = errFn;
        if (this.state !== undefined) this.execute();
        return this.nextPromise;
      },
      /**
       * resolve the promise
       *
       * @param {Anything} value - value of the promise
       * @returns {void}
       */
      resolve: function(value) {
        if (this.state !== undefined) {
          console.warn("Promise: double resolve/reject (ignored).");
          return;
        }
        this.state = true;
        this.value = value;
        this.execute();
      },
      /**
       * reject the promise
       *
       * @param {Anything} reason - specify the reason of rejection
       * @returns {void}
       */
      reject: function(reason) {
        if (this.state !== undefined) {
          console.warn("Promise: double resolve/reject (ignored).");
          return;
        }
        this.state = false;
        this.reason = reason;
        this.execute();
      },
      /**
       * internal fulfilemnt function. Will pass the promise behaviour of the resolve function to the Promise returned in then()
       *
       * @returns {void}
       */
      execute: function() {
        if (!this.nextPromise) return;
        var that = this;
        if (this.state === true) {
          if (!this.fn) return;
          try {
            var result = this.fn(this.value);
            if (result instanceof Promise) {
              result.then(function(value) {
                that.nextPromise.resolve(value);
              }, function(reason) {
                that.nextPromise.reject(reason);
              });
            } else {
              that.nextPromise.resolve(result);
            }
          } catch (e) {
            console.log("in Promise handler:", e);
            this.nextPromise.reject(e);
          }
        } else if (this.state === false) {
          if (this.errFn) this.errFn(this.reason);
          this.nextPromise.reject(this.reason);
        }
      }
    });
    /**
     * a simple semaphore which registers a set of stakeholders (just counts up the number of them) and the lets them synchronize through calling semaphore.sync().then(...)
     *
     */
    var Semaphore = Kern.Semaphore = Base.extend({
      constructor: function(num) {
        this.num = num || 0;
        this.cc = 0;
        this.ps = [];
        this.ls = [];
        this.ls2 = [];
      },
      /**
       * register a stakeholder for this semaphore
       *
       * @returns {Semaphore} the semaphore itself to be passed on
       */
      register: function() {
        this.num++;
        return this;
      },
      /**
       * register a listener for this semaphore which will not influence the waiting process
       *
       * @param {boolean} before - determines if listener fires before stakeholders
       * @returns {Semaphore} the semaphore itself to be passed on
       */
      listen: function(before) {
        var p = new Kern.Promise();

        if (before) {
          this.ls.push(p);
        } else {
          this.ls2.push(p);
        }

        return p;
      },
      /**
       * reduces the number of stakeholders by one. If this was the last one it will actually trigger sync.
       *
       * @returns {void}
       */
      skip: function() {
        this.num--;
        if (this.num < 0) throw "semaphore: skipped stakeholder that was not registered";
        if (this.num === this.cc) {
          this.cc--; // let on more to go for triggering synchronization in normal syn method (may become negative)
          this.sync();
        }
      },
      /**
       * wait for all other stakeholders. returns a promise that will be fullfilled if all other stakeholders are in sync state as well (have called sync())
       *
       * @returns {Promise} the promise to be resolved when all stakeholders are in sync.
       */
      sync: function() {
        var p;
        this.cc++;
        this.ps.push(p = new Kern.Promise());
        if (this.cc === this.num) {
          for (var x = 0; x < this.ls.length; x++) {
            this.ls[x].resolve(this.num);
          }
          for (var i = 0; i < this.ps.length; i++) {
            this.ps[i].resolve(this.num);
          }
          var that = this;
          setTimeout(function() { // needs to be called with setTimeout to call listeners after then() function of last sync
            for (var i = 0; i < that.ls2.length; i++) {
              that.ls2[i].resolve(that.num);
            }
          }, 0);
        } else if (this.cc >= this.num) {
          throw "semaphore: more syncs than stakeholders";
        }
        return p;
      }
    });
    /**
     * Simple queue which makes sure entries are executed one after each other. Add a new entry with myQueue.add() which returns a promise. Do whatever has to be done with this entry within the promise's then() part and afterwards call myQueue.continue() to start triggering the next entry.
     *
     */
    var Queue = Kern.Queue = Base.extend({
      constructor: function() {
        this.q = []; // a queue of promises which will be fullfilled one after each other
        this.waiting = false; // are we waiting for a queue entry to complete (NOTE: this could be true even if q[] is empty)
      },
      /**
       * add an entry to the queue. A new promise is returned that will resolve when all previous entries have finished
       *
       * @param {string} category - a category so we can debounce
       * @returns {Type} Description
       */
      add: function(category) {
        var p = new Kern.Promise();
        if (!this.waiting) {
          p.resolve();
          this.waiting = true;
        } else {
          var debounce = this.q.length > 0 && category === this.q[this.q.length - 1].category;
          if (undefined !== category && debounce) {
            this.q.pop().promise.reject();
          }
          this.q.push({
            promise: p,
            category: category
          });
        }
        return p;
      },
      /**
       * indicate that the execution of the current entry has finished and that the next entry can resolve (if any)
       *
       * @param {Type} Name - Description
       * @returns {Type} Description
       */
      continue: function() {
        if (this.q.length) {
          var p = this.q.shift().promise;
          p.resolve();
        } else {
          this.waiting = false;
        }
      },
      /**
       * indicate that the execution of the current entry has finished and that the next entry can resolve (if any)
       *
       * @param {Type} Name - Description
       * @returns {Type} Description
       */
      clear: function() {
        while (this.q.length > 0) {
          var p = this.q.shift().promise;
          p.reject();
        }
        this.waiting = false;
      }
    });
    return Kern;
  };

  // export to the outside
  //
  // test whether this is in a requirejs environment
  if (typeof define === "function" && define.amd) {
    define("Kern", [], scope);
  } else if (typeof module !== 'undefined' && module.exports) { // node js environment
    var Kern = scope();
    module.exports = Kern;
    // this.Kern = Kern; export to the global object in nodejs
  } else { // standard browser environment
    window.Kern = scope(); // else just export 'Kern' globally using globally defined underscore (_)
  }
})();
