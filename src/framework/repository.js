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
    if (data) this.importJSON(data, version);
  },
  /**
   * import model repository from JSON Array (or map with {id: model} entries)
   *
   * @param {object} data - JSON data
   * @param {string} version - version to be used
   * @returns {Type} Description
   */
  importJSON(data, version) {
    if (!data) throw "no ModelRepository or data given";
    if (!version) throw "no version to create given";
    if (this.versions.hasOwnProperty(version)) throw "version already present in repository"
    var models = [];
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        models.push(pluginManager.createModel(data[i]));
      }
    } else if (typeof data == 'string') {
      for (var k in Object.keys(data)) {
        var obj = data[k];
        if (obj.attributes.id && obj.attributes.id != k) throw "id mismatch in JSON data"
        obj.attributes.id = k;
        models.push(pluginManager.createModel(data[i]));

      }
    }
    this.versions[version] = new Kern.ModelRepository(data);
  },
  /**
   * clear the repository either for a specified version or for all versions
   *
   * @param {Type} Name - Description
   * @returns {Type} Description
   */
  clear: function(version) {
    if (version !== undefined) {
      this.versions[version] = new Kern.ModelRepository(data);
    } else {
      this.versions = {};
    }
  },
  /**
   * return a model of a give id from a specified version
   *
   * @param {string} id - the id of the model
   * @param {string} version - the version of the requested model
   * @returns {CobjData} the model
   */
  get: function(id, version) {
    version = version || defaults.version;
    if (!this.versions[version]) throw "version not available"; // FIXME: need to fetch new versions at some point
    return this.versions[version].get(id);
  },

});
// initialialize repository
WL.repository = new Repository();
module.exports = WL.repository;
