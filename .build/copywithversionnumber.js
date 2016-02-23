var fs = require('fs-extra')
var newFileName = 'layerjs-' + process.env.npm_package_version + '.js';
var directory = './dist/';

fs.copy(directory + 'layerjs.js', directory + newFileName, function(err) {
  if (err) return console.error(err);
})
