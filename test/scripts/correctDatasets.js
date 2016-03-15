var datasetFilenames = [
  "test/spec/datasets/simple_textdata.js", "test/datasets/dataset1.js", "test/spec/datasets/groupdata_with_objdata.js", "test/spec/datasets/simple_groupdata.js", "test/spec/datasets/simple_imagedata.js", "test/spec/datasets/simple_objdata.js", "test/spec/datasets/simple_textdata.js", "test/spec/datasets/simple_framedata.js", "test/spec/datasets/simple_layerdata.js", "test/spec/datasets/simple_stagedata.js", "test/spec/datasets/test_data_set.js", "test/spec/datasets/anchor_objdata.js", "test/spec/datasets/anchor_groupdata.js"
];

var fileSave = require('file-save');

for (var x = 0; x < datasetFilenames.length; x++) {
  var datasetFileName = datasetFilenames[x];

  try {

    var dataset = require("../../" + datasetFileName);
    var length = dataset.length;

    for (var i = 0; i < length; i++) {
      console.log("processing " + datasetFileName + " " + (i + 1) + "/" + length)
      var object = dataset[i];

      if (object.id != undefined) {
        object.id = object.id.toString();
      }

      if (object.children != undefined && Array.isArray(object.children)) {
        for (var c = 0; c < object.children.length; c++) {
          object.children[c] = object.children[c].toString();
        }
      }

      if (object.text != undefined) {
        object.content = object.text;
        delete object.text;
      }

      if (object.scale != undefined) {
        object.scaleX = object.scale.x;
        object.scaleY = object.scale.y;

        delete object.scale;
      }

      if (object.link_to != undefined) {
        object.linkTo = object.link_to;
        delete object.link_to;
      }

      if (object.link_target != undefined) {
        object.linkTarget = object.link_target;
        delete object.link_target;
      }

      if (object.width != undefined && object.width.toString().indexOf('px') == -1 && object.width.toString().indexOf('%') == -1 && && object.width.toString().indexOf('em') == -1) {
        object.width = object.width.toString() + 'px';
      }

      if (object.height != undefined && object.height.toString().indexOf('px') == -1 && object.height.toString().indexOf('%') == -1 && object.height.toString().indexOf('em') == -1) {
        object.height = object.height.toString() + 'px';
      }
    }

    fileSave(datasetFileName)
      .write("var dataset =", "utf8")
      .write(JSON.stringify(dataset))
      .write(";")
      .write("module.exports = dataset;")
      .end();
  } catch (error) {
    console.log("error processing '" + datasetFileName + "' " + error);
  }
}
