var Cimagedata = require('../../src/framework/cimagedata.js');

describe('CimageData',function(){
  it("can be created", function() {
    var cimageData = new Cimagedata();
    expect(cimageData).toBeDefined();
  });

  it("is initialised with \'img\' tag",function() {
    var cimageData = new Cimagedata();
    expect(cimageData.attributes.tag).toBe('img');
  });

  it('is of type \'image\' by default',function() {
    var cimageData = new Cimagedata();
    expect(cimageData.attributes.type).toBe('image');
  });
});
