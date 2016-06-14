var datasetFilenames = [
  "test/spec/datasets/simple_nodedata.js",
  "test/datasets/dataset1.js",
  "test/datasets/dataset2.js",
  "test/datasets/dataset3.js",
  "test/spec/datasets/groupdata_with_elementdata.js",
  "test/spec/datasets/simple_groupdata.js",
  "test/spec/datasets/simple_elementdata.js",
  "test/spec/datasets/simple_framedata.js",
  "test/spec/datasets/simple_layerdata.js",
  "test/spec/datasets/simple_stagedata.js",
  "test/spec/datasets/test_data_set.js",
  "test/spec/datasets/anchor_elementdata.js",
  "test/spec/datasets/anchor_groupdata.js"
];

var fileSave = require('file-save');

for (var x = 0; x < datasetFilenames.length; x++) {
  var datasetFileName = datasetFilenames[x];
  var id = 999999;

  try {

    var dataset = require("../../" + datasetFileName);
    var length = dataset.length;

    for (var i = 0; i < length; i++) {
      console.log("processing " + datasetFileName + " " + (i + 1) + "/" + length)
      var object = dataset[i];

      if (object.type === 'text') {
        object.type = 'group';

        var nodeData = {
          id: id++,
          type: 'node',
          nodeType: 3,
          content: object.content,
          version: object.version
        };

        dataset.push(nodeData);
        object.content = '';

        if (!object.children) {
          object.children = [];
        }

        object.children.push(nodeData.id);

      } else if (object.type === 'image') {
        object.type = 'element';
      }

      if (object.id != undefined) {
        object.id = object.id.toString();
      }

      if (object.version === undefined) {
        object.version = 'default';
      }

      if (object.tag === undefined) {
        object.tag = 'div';
      }

      if (object.htmlAttributes === undefined) {
        object.htmlAttributes = [];
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

      if (object.width != undefined && object.width.toString().indexOf('px') == -1 && object.width.toString().indexOf('%') == -1 && object.width.toString().indexOf('em') == -1) {
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
