var Textdata = require('../../src/framework/textdata.js');

describe('TextData', function() {
  it("can be created", function() {
    var textData = new Textdata();
    expect(textData).toBeDefined();
  });

  it("is initialised with \'div\' tag", function() {
    var textData = new Textdata();
    expect(textData.attributes.tag).toBe('div');
  });

  it('is of type \'text\' by default', function() {
    var textData = new Textdata();
    expect(textData.attributes.type).toBe('text');
  });
});
