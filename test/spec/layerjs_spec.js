describe("layerJS", function(){

  var layerJS;

  beforeEach(function(){
    layerJS = require("../../src/framework/layerjs.js");
  });

  it("has an image path defined", function(){
    expect(layerJS.imagePath).toBeDefined();
  });

});
