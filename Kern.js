'use strict';

(function() { // private scope

  var scope = function() { // a scope which could be given a dependency as parameter (e.g. AMD or node require)
    /**
     * extend an object with properties from one or multiple objects
     * @param {Object} obj the object to be extended
     * @param {arguments} arguments list of objects that extend the object
     */
    var objExtend = function(obj) {
        var len = arguments.length;
        if (len < 2) throw ("too few arguments in objExtend");
        if (obj == null) throw ("no object provided in objExtend");
        // run through extending objects
        for (var i = 1; i < len; i++) {
          var props = Object.keys(arguments[i]); // this does not run through the prototype chain; also does not return special properties like length or prototype
          // run through properties of extending object
          for (var j = 0; j < props.length; j++) {
            obj[props[j]] = arguments[i][props[j]];
          }
        }
      }
      // the module
    var Kern = {};
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
      prototypeProperties = prototypeProperties || {};
      staticProperties = staticProperties || {};
      var parent = this; // Note: here "this" is the class (which is the constructor function in JS)
      var child = prototypeProperties.constructor || function() {
        return parent.apply(this, arguments); // Note: here "this" is actually the object (instance)
      };
      child.prototype = Object.create(this.prototype, prototypeProperties);
      objExtend(child, this, staticProperties);
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
            var args = new Array(length);
            for (var i = 0; i < length; i++) {
              args[i] = arguments[i + 1];
            }
            // call the callback
            this.__listeners__[event][i].callback.apply(this, args);
          }
        }
        return this;
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
        this.ceased = 0;
        this.attributes = attributes;
        return this;
      },
      /**
       * don't send change events until manually triggering with fire()
       */
      ceaseFire: function() {
        this.ceased++;
      },
      /**
       * fire change events manually after setting attributes
       * @return {Object} this
       */
      fire: function() {
        if (this.ceased > 0) {
          this.ceased--;
        }
        _fire();
        return this;
      },
      /**
       * internal fire function (also used by set)
       * @return {[type]} [description]
       */
      _fire: function() {
        if (this.ceased) {
          return;
        }
        // trigger change event if something has changed
        for (var attr in Object.keys(this.changedAttributes)) {
          this.trigger("change:" + attr);
        }
        this.trigger("change");
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
          this._set(arguments);
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
          this.changedAttributes[attribute] = undefined;
          this.newAttributes[attribute] = true;
          return;
        }
        if (this.checkdiff) {
          str = JSON.stringfy(this.attributes[attribute]);
          if (str == JSON.stringfy(value)) {
            return;
          }
        }

        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            str = str ||  JSON.stringfy(this.attributes[attribute]);
            this.changedAttributes[attribute] = JSON.parse(str); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        this.attributes[attribute] = value;
      },
      /**
       * modify an attribute without changing the reference. Only makes sense for deep models
       * only works if change event firing is ceased (as it cannot fire automatically after
       * you made the change to the object)
       * @param {string} attribute attribute name
       * @return {Object} returns the value that can be modifed if it's an array or object
       */
      update: function(attribute)  {
        if (!this.ceased) {
          throw ('You cannot use update method without manually firing change events.')
        }
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            this.changedAttributes[attribute] = JSON.parse(JSON.stringfy(this.attributes[attribute])); //FIXME: replace by better deep clone
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
        // only save first value of attribute when accumulating change events
        if (!this.changedAttributes.hasOwnProperty(attribute)) {
          // save orig value of attribute if history is "on"
          if (this.history) {
            this.changedAttributes[attribute] = JSON.parse(JSON.stringfy(this.attributes[attribute])); //FIXME: replace by better deep clone
          } else {
            this.changedAttributes[attribute] = true;
          }
        }
        this.deletedAttributes[attribute] = true;
        delete this.attributes[attribute];
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