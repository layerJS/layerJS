var Ctextdata = require('../../src/framework/ctextdata.js');

describe('CtextData',function(){
  it("can be created", function() {
    var ctextData = new Ctextdata();
    expect(ctextData).toBeDefined();
  });

  it("is initialised with \'div\' tag",function() {
    var ctextData = new Ctextdata();
    expect(ctextData.attributes.tag).toBe('div');
  });

  it('is of type \'text\' by default',function() {
    var ctextData = new Ctextdata();
    expect(ctextData.attributes.type).toBe('text');
  });
});
