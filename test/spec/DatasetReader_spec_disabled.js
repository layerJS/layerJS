var DatasetReader = require('./helpers/datasetreader.js');

describe("datasetReader", function() {
  var datasetReader;

  beforeEach(function() {
    datasetReader = new DatasetReader();
  });

  it('throws an error when dataset file from the datasets directory can\' be read', function() {
    var fun = function() {
      datasetReader.readFromFile('file_that_is_fake.js')
    };

    expect(fun).toThrow();
  });

  it('throws an error when the dataset file contains a type it can\'t map to a framework object', function() {
    delete datasetReader.mapping.stage;

    var fun = function() {
      datasetReader.readFromFile('test_data_set.js')
    };

    expect(fun).toThrow('no mapper for type:stage');
  });

  it('can read dataset file from the datasets directory', function() {
    datasetReader.readFromFile('test_data_set.js');
  });

  it('can create framework data objects from a dataset file', function() {
    var result = datasetReader.readFromFile('test_data_set.js');

    expect(result).toBeDefined();

    for (var i in result) {
      var obj = result[i];
      if (datasetReader.mapping[obj.attributes.type]) {
        expect(obj instanceof datasetReader.mapping[obj.attributes.type]).toBeTruthy();
      } else {
        throw 'dataset reader shouldn\'t be able to create this object type:' + obj.type;
      }
    }
  });
});
