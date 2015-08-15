module.exports = function() {
  var results = true;
  var onCompleteCallback = function() {};

  this.onComplete = function(callback) {
    onCompleteCallback = callback;
  };

  this.jasmineDone = function() {
    onCompleteCallback(results);
  };

  this.specDone = function(result) {
    if(result.status === 'failed') {
      results = false;
    }
  };

  this.suiteDone = function(result) {
    if (result.failedExpectations && result.failedExpectations.length > 0) {
      results = false;
    }
  };
};