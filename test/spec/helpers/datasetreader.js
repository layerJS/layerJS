var DatasetReader = new Function();
DatasetReader.prototype = {
  readFromFile: function(datasetFileName) {
    return JSON.parse(JSON.stringify(require('../datasets/' + datasetFileName)));
  }
}
module.exports = DatasetReader;
