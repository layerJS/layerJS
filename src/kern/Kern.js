'use strict';

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
      if (obj == null) throw ("no object provided in _extend");
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
      if (obj == null) throw ("no object provided in _extend");
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
      if (typeof obj == 'object') {
        if (Array.isArray(obj)) {
          var temp = [];
          for (var i = obj.length - 1; i >= 0; i--) {
            temp[i] = _deepCopy(obj[i]);
          }
          return temp;
        }
        if (obj === null) {
          return null;
        }
        var temp = {};
        for (var k in Object.keys(obj)) {
          temp[k] = _deepCopy(obj[k]);
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
      if (obj == null) throw ("no object provided in _extend");
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
        delete prototypeProperties.constructor; // this should not be set again.
        // create an instance of parent and assign it to childs prototype
        child.prototype = Object.create(parent.prototype); // NOTE: this does not call the parent's constructor (instead of "new parent()")
        child.prototype.constructor = child; //NOTE: this seems to be an oldish artefact; we do it anyways to be sure (http://stackoverflow.com/questions/9343193/why-set-prototypes-constructor-to-its-constructor-function)
        // extend the prototype by further (provided) prototyp properties of the new class
        _extend(child.prototype, prototypeProperties);
        // extend static properties (e.g. the extend static method itself)
        _extend(child, this, staticProperties);
        return child;
      }
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
       * @return {Object} this object
       */
      on: function(event, callback) {
        this.__listeners__[event] = this.__listeners__[event] || [];
        this.__listeners__[event].push({
          callback: callback
        });
        return this;
      },
      /**
       * register event listerner. will be called only once, then unregistered.
       * @param {string} event event name
       * @param {Function} callback the callback function
       * @return {Object} this object
       */
      once: function(event, callback) {
        var that = this;
        var helper = function() {
          callback.apply(this, arguments);
          that.off(event, helper);
        }
        this.on(event, helper);
        return this;
      },
      /**
       * unregister event handler.
       * @param {string} event the event name
       * @param {Function} callback the callback
       * @return {Object} this object
       */
      off: function(event, callback) {
        if (event) {
          if (callback) {
            // remove specific call back for given event
            for (var i = 0; i < this.__listeners__[event].length; i++) {
              if (this.__listeners__[event][i].callback == callback) {
                this.__listeners__[event].splice(i, 1);
              }
            }
          } else {
            // remove all callbacks for event
            delete this.__listeners__[event];
          }
        } else {
          if (callback) {
            // remove specific callback in all event
            for (var ev in this.__listeners__) {
              for (var i = 0; i < this.__listeners__[ev].length; i++) {
                if (this.__listeners__[ev][i].callback == callback) {
                  this.__listeners__[ev].splice(i, 1);
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
            var length = arguments.length;
            var args = new Array(length - 1);
            for (var j = 0; j < length - 1; j++) {
              args[j] = arguments[j + 1];
            }
            // call the callback
            this.__listeners__[event][i].callback.apply(this, args);
          }
        }
        return this;
      },
      /**
       * return a functions that calls callback function with "this" set to context and
       * further argements supplied in bind and supplied to the returned function
       *
       * @param {function} callback the function to be called
       * @param {Object} context this context of the function to be called
       * @param {arguments} arguments further arguments supplied to the callback on each call
       * @return {Function} a function that can be called anywhere (eg as an event handler)
       */
      bindContext: function(callback, context) { // WARN: this method seems to introduce an extreme performance hit!
        var length = arguments.length;
        var args = new Array(length - 2);
        for (var j = 0; j < length - 2; j++) {
          args[j] = arguments[j + 2];
        }
        return function() {
          var length = args.length;
          var length2 = arguments.length;
          var args2 = new Array(length + length2);
          for (var j = 0; j < length; j++) {
            args2[j] = args[j];
          }
          for (var j = 0; j < length2; j++) {
            args2[j + length] = arguments[j];
          }
          callback.apply(context, args2)
        }
      }
    });
    /**
     * Kern.Model is a basic model class supporting getters and setters and change events
     */
    var Model = Kern.Model = EventManager.extend({
      /**
       * constructor of the Model
       * @param {Object} attributes prefills attributes (not copied)
       * @return {Object} this object
       */
      constructor: function(attributes) {
        // call super constructor
        EventManager.call(this);
        this.silent = false; // fire events on every "set"
        this.history = false; // don't track changes
        this.attributes = _extendKeepDeepCopy(attributes || {}, this.defaults || {}); // initialize attributes if given (don't fire change events); Note: this keeps the original attributes object.
        return this;
      },
      /**
       * changedAttributes will have original values of attributes in event handlers if called
       * @return {Object} this object
       */
      trackChanges: function() {
        this.history = true;
        return this;
      },
      /**
       * stop tracking changes
       * @return {Object} this object
       */
      dontTrackChanges: function() {
        this.history = false;
        return this;
      },
      /**
       * don't send change events until manually triggering with fire()
       * Note: if silence is called nestedly, the same number of "fire"
       * calls have to be made in order to trigger the change events!
       */
      silence: function() {
        this.silent++;
        return this;
      },
      /**
       * fire change events manually after setting attributes
       * @return {Boolean} true if event was fired (not silenced)
       */
      fire: function() {
        if (this.silent > 0) {
          this.silent--;
        }
        this._fire();
        return !this.silent;
      },
      /**
       * internal fire function (also used by set)
       * @return {[type]} [description]
       */
      _fire: function() {
        if (this.silent) {
          return;
        }
        // trigger change event if something has changed
        var that = this;
        if (this.changedAttributes) {
          Object.keys(this.changedAttributes).forEach(function(attr) {
            that.trigger("change:" + attr, that, that.attributes[attr]);
          });
        }
        this.trigger("change", this);
        delete this.changedAttributes;
        delete this.newAttributes;
        delete this.deletedAttributes;
      },
      /**
       * set a property or several properties and fires change events
       * set(attributes) and set(attribute, value) syntax supported
       * @param {Object} attributes {attribute: value}
       */
      set: function(attributes) {
        if (attributes == null) {
          return this;
        }
        if (typeof attributes !== 'object') { // support set(attribute, value) syntax
          this._set.apply(this, arguments);
        } else { // support set({attribute: value}) syntax
          for (var prop in attributes) {
            if (attributes.hasOwnProperty(prop)) {
              this._set(prop, attributes[prop]);
            }
          }
        }
        this._fire();
        return this;
      },
      /**
       * internal function setting a single attribute
       * @param {string} attribute attribute name
       * @param {Object} value the value
       */
      _set: function(attribute, value) {
        var str;
        // check whether this is a new attribute
        if (!this.attributes.hasOwnProperty(attribute)) {
          if (!this.changedAttributes) this.changedAttributes = {};
          this.changedAttributes[attribute] = undefined;
          if (!this.newAttributes) this.newAttributes = {};
          this.newAttributes[attribute] = true;
          // set the value
          this.attributes[attribute] = value;
          return;
        }
        if (this.checkdiff) {
          str = JSON.stringify(this.attributes[attribute]);
          if (str == JSON.stringify(value)) {
            return;
          }
        }
        if (!this.changedAttributes) this.changedAttributes = {};
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            str = str || JSON.stringify(this.attributes[attribute]);
            this.changedAttributes[attribute] = JSON.parse(str); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        // set the value
        this.attributes[attribute] = value;
      },
      /**
       * modify an attribute without changing the reference. Only makes sense for deep models
       * only works if change event firing is silent (as it cannot fire automatically after
       * you made the change to the object)
       * @param {string} attribute attribute name
       * @return {Object} returns the value that can be modifed if it's an array or object
       */
      update: function(attribute) {
        if (!this.silent) {
          throw ('You cannot use update method without manually firing change events.')
        }
        if (!this.changedAttributes) this.changedAttributes = {};
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            this.changedAttributes[attribute] = JSON.parse(JSON.stringify(this.attributes[attribute])); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        return this.attributes[attribute];
      },
      /**
       * delete the specified attribute
       * @param {string} attribute the attribute to be removed
       * @return {Object} this object
       */
      unset: function(attribute) {
        if (!this.changedAttributes) this.changedAttributes = {};
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            this.changedAttributes[attribute] = JSON.parse(JSON.stringify(this.attributes[attribute])); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        if (!this.deletedAttributes) this.deletedAttributes = {};
        this.deletedAttributes[attribute] = true;
        delete this.attributes[attribute];
        this._fire();
        return this;
      },
      /**
       * get the value of an attrbute
       * you can use .attributes.'attribute' instead
       * @param {string} attribute attribute name
       * @return {Object} returns the value
       */
      get: function(attribute) {
        return this.attributes[attribute]
      }
    });
    /**
     * Class for a Repository (hash) of Models
     * not a sorted list, its a key-value store
     * assumes model id's to be the keys
     */
    var ModelRepository = Kern.ModelRepository = EventManager.extend({
      /**
       * create a Model Repository. Models are safed by id that not necessarily needs to be stored
       * in the model, although it maybe difficult to identify the models in event callback later on.
       * @param {Object/Array} data and array of json objects which should be used to create models. Submit undefined if you don't want data initialized but want to set options
       * @param {Object} options {idattr: string determining id property, model: The model class (default=Kern.Model)}
       */
      constructor: function(data, options) {
        EventManager.call(this); // call SUPER constructor
        this.models = {};
        options = options || {};
        this.idattr = options.idattr || this.idattr || 'id';
        this.model = options.model || this.model || Model;
        var that = this;
        this.modelChangeHandler = function() {
          that._modelChangeHandler.apply(that, arguments);
        }
        if (Array.isArray(data)) {
          this.add(data, {
            noEvents: true
          });
        } else if (typeof data == "object") {
          this.add(data, {
            isHash: true,
            noEvents: true
          });
        }
      },
      /**
       * add model(s) to the repository (or add models by json data)
       * @param {Object|Model|Array} data Model or json data or an Array of those describing the model(s)
       * @param {object} options options.id allows to specify the id; options.isHash allows adding object of objects {id1: {}, id2: {}}
       */
      add: function(data, options) {
        var model;
        options = options || {};
        if (options.isHash) { // interpret as {id1: {}, id2: {}}
          for (var i in data) {
            this.add(data[i], {
              id: i
            });
          }
        } else if (Array.isArray(data)) { // if array loop over array
          for (var i = 0; i < data.length; i++) {
            this.add(data[i]);
          };
        } else {
          if (data instanceof this.model) { // model given
            model = data;
            var nid = (options && options.id) || model.attributes[this.idattr]; // id given as param or in model?
            if (!nid) throw ('model with no id "' + this.idattr + '"');
            this._add(model, nid, options.noEvents);
          } else if (typeof data == 'object') { // interpret as (single) json data
            var nid = (options && options.id) || data[this.idattr]; // id given as param or in json?
            if (!nid) throw ('model with no id "' + this.idattr + '"');
            var model = new this.model(data);
            this._add(model, nid, options.noEvents);
          } else { // interpret as id

          }
        }
        return this;
      },
      /**
       * internal function to add model. sets event listeners and triggers events
       * @param {string} id the id of the model
       * @param {Model} model the model
       */
      _add: function(model, id, noEvents) {
        if (this.models.hasOwnProperty(id)) {
          throw ('cannot add model with same id');
        }
        if (model.attributes[this.idattr] && (model.attributes[this.idattr] != id)) {
          throw ('adding model with wrong id');
        }
        // do not use bindContext, too slow!!!
        // model.on('change', this.callbacks[id] = this.bindContext(this._modelChangeHandler, this));
        model.on('change', this.modelChangeHandler);
        this.models[id] = model;
        noEvents || this.trigger('add', model, this);
        return this;
      },
      /**
       * removes a model(s) from this Repository
       * @param {String|Model|Array} model in id (string) or Model or an Array of those to be removed
       * @return {Object} this object
       */
      remove: function(model) {
        if (Array.isArray(model)) { // if array loop over array
          for (var i = 0; i < model.length; i++) {
            this.remove(model[i]);
          };
        } else {
          var oldmodel;
          if (model instanceof this.model) { // model given?
            // remove change handler from model
            oldmodel = this.models[model.attributes[this.idattr]].off("change", this.modelChangeHandler);
            // delete reference to model
            delete this.models[model.attributes[this.idattr]];
          } else { // interpret as id
            // remove change handler from model
            oldmodel = this.models[model].off("change", this.modelChangeHandler);
            // delete reference to model
            delete this.models[model];
          }
          this.trigger("remove", oldmodel, this);
        }
        return this;
      },
      /**
       * handler listening to changes of the models in the repository
       * @param {Object} model the model being changed
       */
      _modelChangeHandler: function(model) {
        this.trigger("change", model) //FIXME make backbone compatible
      },
      /**
       * return number of objects in repository
       * @return {number} the number of objects
       */
      length: function() {
        return Object.keys(this.models).length;
      },
      /**
       * return the model with the corresponding id
       * @return {Model} the requested model
       */
      get: function(id) {
        if (!this.models[id]) {
          throw "model not in repository";
        }
        return this.models[id];
      }
    });
    return Kern;
  }

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
