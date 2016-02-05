var datasetFilenames = [
          "test/spec/datasets/simple_ctextdata.js"
          ,"test/datasets/dataset1.js"
          ,"test/spec/datasets/cgroupdata_with_cobjdata.js"
          ,"test/spec/datasets/simple_cgroupdata.js"
          ,"test/spec/datasets/simple_cimagedata.js"
          ,"test/spec/datasets/simple_cobjdata.js"
          ,"test/spec/datasets/simple_ctextdata.js"
          ,"test/spec/datasets/simple_framedata.js"
          ,"test/spec/datasets/simple_layerdata.js"
          ,"test/spec/datasets/simple_stagedata.js"
          ,"test/spec/datasets/test_data_set.js"
          ,"test/spec/datasets/anchor_cobjdata.js"
          ,"test/spec/datasets/anchor_cgroupdata.js"
];

var fileSave = require('file-save');

for (var x = 0; x < datasetFilenames.length; x++) {
  var datasetFileName =datasetFilenames[x];

  try {

    var dataset = require("../../" + datasetFileName);
    var length = dataset.length;

    for (var i = 0; i < length; i++) {
      console.log("processing " + datasetFileName + " " + (i+1) + "/" + length)
      var object = dataset[i];

      if ( object.text != undefined)
      {         
        object.content = object.text;
        delete object.text;
      }

      if (object.scale != undefined)
      {
        object.scaleX = object.scale.x;
        object.scaleY = object.scale.y;

        delete object.scale;
      }
      
      if (object.link_to != undefined)
      {
        object.linkTo = object.link_to;
        delete object.link_to;
      }
      
      if (object.link_target != undefined)
      {
        object.linkTarget = object.link_target;
        delete object.link_target;
      }
    }

    fileSave(datasetFileName)
      .write("var dataset =","utf8")
      .write(JSON.stringify(dataset))
      .write (";")
      .write("module.exports = dataset;")
      .end();
  }
  catch(error)
  {
    console.log("error processing '" + datasetFileName +"' " + error);
  }
}
