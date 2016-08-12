describe("WL", function(){

  var WL;

  beforeEach(function(){
    WL = require("../../src/framework/wl.js");
  });

  it("has an image path defined", function(){
    expect(WL.imagePath).toBeDefined();
  });

});
