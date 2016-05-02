var fs = require('fs-extra');
var params = process.argv;

params.shift(); // node
params.shift(); // copy.js
console.log(params);

for (var i = 0; i < params.length - 1; i++) {
  fs.copy(params[i], params[params.length - 1], function(err) {
    if (err) {
      console.error(err);
      throw params;
    }
  });
}
