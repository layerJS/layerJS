var utilities = {};

require('jasmine-expect');

utilities.transitionTo = function(layerId, frameName, transition) {
  return browser.driver.executeAsyncScript(function(layerId, frameName, transition, callBack) {
    WL.select('#' + layerId).transitionTo(frameName, transition);
    window.setTimeout(callBack, 5000);
  }, layerId, frameName, transition);
};

utilities.getBoundingClientRect = function(elementId) {
  return browser.driver.executeAsyncScript(function(elementId, callBack) {
    var el = window.document.getElementById(elementId);
    var orgDisplay = el.style.display;

    el.style.display = 'block';
    var result = el.getBoundingClientRect();
    el.style.display = orgDisplay;

    callBack(result);
  }, elementId);
};

utilities.getScale = function(elementId) {
  return browser.driver.executeAsyncScript(function(elementId, callBack) {
    var el = document.getElementById(elementId);
    var st = window.getComputedStyle(el, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
      st.getPropertyValue("-moz-transform") ||
      st.getPropertyValue("-ms-transform") ||
      st.getPropertyValue("-o-transform") ||
      st.getPropertyValue("transform") ||
      "FAIL";

    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];


    callBack(Math.sqrt(a * a + b * b));
  }, elementId);
};

module.exports = utilities;
