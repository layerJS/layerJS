'use strict';
var WL = require('./wl.js');
var defaults = require('./defaults.js');
var Kern = require('../kern/Kern.js');
var pluginManager = require('./pluginmanager.js');

var Repository = Kern.EventManager.extend({
  /**
   * create a Repository
   *
   * @param {Object} data - key value store of all objects in the prepository
   * @param {string} [version] - the version of the data objects
   * @returns {This}
   */
  constructor: function(data, version) {
    this.versions = {};
    if (data) {
      this.importJSON(data, version);
    }
  },
  /**
   * import model repository from JSON Array (or map with {id: model} entries)
   *
   * @param {object} data - JSON data
   * @param {string} version - version to be used
   * @returns {Type} Description
   */
  importJSON: function(data, version) {
    if (!data) throw "no ModelRepository or data given";
    if (!version) throw "no version to create given";
    if (this.versions.hasOwnProperty(version)) throw "version already present in repository";
    var models = [];
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        models.push(pluginManager.createModel(data[i]));
      }
    } else if (typeof data === 'string') { //<-- FIXME this seems wrong
      for (var k in Object.keys(data)) {
        if (data.hasOwnProperty(k)) {
          var obj = data[k];
          if (obj.attributes.id && obj.attributes.id !== k) throw "id mismatch in JSON data";
          obj.attributes.id = k;
          models.push(pluginManager.createModel(data[k]));
        }
      }
    }
    this.versions[version] = new Kern.ModelRepository(models);
  },
  /**
   * clear the repository either for a specified version or for all versions
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  clear: function(version) {
    if (version !== undefined) {
      this.versions[version] = new Kern.ModelRepository();
    } else {
      this.versions = {};
    }
  },
  /**
   * return a model of a give id from a specified version
   *
   * @param {string} id - the id of the model
   * @param {string} version - the version of the requested model
   * @returns {ObjData} the model
   */
  get: function(id, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    return this.versions[version].get(id);
  },
  /**
   * add a data model to the repository of the specified version
   *
   * @param {ObjData} model - the model to be added
   * @param {string} version - the version of the repository/model
   * @returns {void}
   */
  add: function(model, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    this.versions[version].add(model);
  },
  /**
   * Check if a specific model is already added to a certain version
   *
   * @param {string} id
   * @param {string} version - the version of the repository/model
   * @returns {bool}
   */
  contains: function(id, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point

    return this.versions[version].models[id] !==undefined;
  },
  /**
   * Generates an id for a data object. This id should be unique
   * This method should be looked at in the future.
   *
   * @returns {string} the id
   */
  getId: function() {
    if (this.previous === undefined)
      this.previous = 0;

    var next = (new Date()).getTime();

    if (next <= this.previous) {
      next = this.previous + 1;
    }

    this.previous = next;
    return next.toString();
  },
  /**
   * Will check if a specific version is added to the repository
   *
   * @param {string} version - the version of the repository
   * @returns {bool} the id
   */
  hasVersion: function(version) {
    return this.versions[version] !== undefined;
  },
  /**
   * Will create a new version in the repository
   *
   * @param {string} version - the version of the repository
   */
  createVersion: function(version) {
    if (this.versions[version]) throw "version already exists";
    this.versions[version] = new Kern.ModelRepository();
  }
});
// initialialize repository
WL.repository = new Repository();
module.exports = WL.repository;
