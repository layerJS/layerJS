describe('performance tests', function() {

  var Perfcollector;

  beforeEach(function() {
    Perfcollector = require("perfcollector.js");
  });

  it('slice vs for loop', function() {
    var iterations = 1000000;
    var params = ['a', 'b', 'c', 'd', 'e'];
    var perfs = Perfcollector.create().enable();

    var timerSlice = perfs.start("slice");
    var args;
    for (var i = 0; i < iterations; i++) {
      //  var args = Array.prototype.slice(params,1);
      args = params.slice(1);
    }
    timerSlice.end().logToConsole();

    var timerLoop = perfs.start("loop");
    for (var i = 0; i < iterations; i++) {

      var length = params.length;
      var args = new Array(length - 1);
      for (var j = 0; j < length - 1; j++) {
        args[j] = arguments[j + 1];
      }
    }
    timerLoop.end().logToConsole();


  });

})
