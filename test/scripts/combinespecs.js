
var temp;
var that = this;

var globule = require('globule');
var files = globule.find(["./test/spec/helpers/*.js"]);
files = files.concat(globule.find(['./test/spec/datasets/*.js']));
files = files.concat(globule.find(['./test/spec/*_spec.js']));

var fs = require('fs');
var stream = fs.createWriteStream("./build/test/js/globalspecs.js");

stream.once('open', function(fd) {
  for (var i = 0; i < files.length; i++) {
    stream.write("require('../../../" + files[i] + "');");
  }
  stream.end();
});
