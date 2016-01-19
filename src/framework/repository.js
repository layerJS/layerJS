var WL = require('./wl.js');
var defaults = require('./defaults.js');
var Kern = require('../kern/Kern.js');
var CobjData = require('./cobjdata.js');

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
    this.versions[version ||  defaults.version] = data || {};
  },
  /**
   * return a model of a give id from a specified version
   *
   * @param {string} id - the id of the model
   * @param {string} version - the version of the requested model
   * @returns {CobjData} the model
   */
  get: function(id, version) {
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    return this.versions[version].get(id);
  },

});
// initialialize repository
WL.repository = new Repository();
module.exports = WL.repository;
