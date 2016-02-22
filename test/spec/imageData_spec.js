var ImageData = require('../../src/framework/imagedata.js');

describe('ImageData', function() {
  it("can be created", function() {
    var imageData = new ImageData();
    expect(imageData).toBeDefined();
  });

  it("is initialised with \'img\' tag", function() {
    var imageData = new ImageData();
    expect(imageData.attributes.tag).toBe('img');
  });

  it('is of type \'image\' by default', function() {
    var imageData = new ImageData();
    expect(imageData.attributes.type).toBe('image');
  });
});
