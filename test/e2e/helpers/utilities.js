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
    tr = tr.replace(/(\d)\,(\d)/g, "$1.$2"); // fix for weird commata in matrix fields in chrome on mac
    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    callBack(Math.sqrt(a * a + b * b), tr);
  }, elementId);
};

utilities.getRotation = function(elementId) {
  return browser.driver.executeAsyncScript(function(elementId, callback) {
    var el = document.getElementById(elementId);
    var st = window.getComputedStyle(el, null);
    var tr = st.getPropertyValue("-webkit-transform") ||
      st.getPropertyValue("-moz-transform") ||
      st.getPropertyValue("-ms-transform") ||
      st.getPropertyValue("-o-transform") ||
      st.getPropertyValue("transform") ||
      "FAIL";

    tr = tr.replace(/(\d)\,(\d)/g, "$1.$2"); // fix for weird commata in matrix fields in chrome on mac
    var values = tr.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var c = values[2];
    var d = values[3];

    var radians = Math.atan2(b, a);
    callback(Math.round(radians * (180 / Math.PI)));
  }, elementId);
};

utilities.getScroll = function(elementId) {
  return browser.driver.executeAsyncScript(function(elementId, callback) {
    var el = document.getElementById(elementId);
    callback({
      scrollTop: el.scrollTop,
      scrollLeft: el.scrollLeft
    });
  }, elementId);
};

utilities.resizeWindow = function(width, height) {
  browser.driver.manage().window().setSize(width, height);
};

utilities.setAttribute = function(elementId, attribute, value) {
  return browser.driver.executeAsyncScript(function(elementId, attribute, value, callBack) {
    var el = window.document.getElementById(elementId);
    el.setAttribute(attribute, value);
    callBack();
  }, elementId, attribute, value);
};

utilities.setStyle = function(elementId, style) {
  return browser.driver.executeAsyncScript(function(elementId, style, callback) {
    var el = document.getElementById(elementId);

    for (var styleName in style) {
      el.style[styleName] = style[styleName];
    }

    callback();
  }, elementId, style);
};

utilities.scrollDown = function(elementId) {
  var scroll = browser.driver.executeAsyncScript(function(elementId, callback) {
    var el = document.getElementById(elementId);
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
      'wheel', // in DOMString typeArg,
      true, // in boolean canBubbleArg,
      true, // in boolean cancelableArg,
      window, // in views::AbstractView viewArg,
      120, // in long detailArg,
      0, // in long screenXArg,
      0, // in long screenYArg,
      0, // in long clientXArg,
      0, // in long clientYArg,
      0, // in boolean ctrlKeyArg,
      0, // in boolean altKeyArg,
      0, // in boolean shiftKeyArg,
      0, // in boolean metaKeyArg,
      0, // in unsigned short buttonArg,
      null // in EventTarget relatedTargetArg
    );

    if (el.scrollTopMax - el.scrollTop < 57) {
      el.scrollTop = el.scrollTopMax;
    } else {
      el.scrollTop += 57;
    }
    el.dispatchEvent(evt);
    callback();
  }, elementId);

  return scroll;
};

utilities.ScrollUp = function(elementId) {
  var scroll = browser.driver.executeAsyncScript(function(elementId, callback) {
    var el = document.getElementById(elementId);
    var evt = document.createEvent("MouseEvents");

    evt.initMouseEvent(
      'wheel', // in DOMString typeArg,
      true, // in boolean canBubbleArg,
      true, // in boolean cancelableArg,
      window, // in views::AbstractView viewArg,
      -120, // in long detailArg,
      0, // in long screenXArg,
      0, // in long screenYArg,
      0, // in long clientXArg,
      0, // in long clientYArg,
      0, // in boolean ctrlKeyArg,
      0, // in boolean altKeyArg,
      0, // in boolean shiftKeyArg,
      0, // in boolean metaKeyArg,
      0, // in unsigned short buttonArg,
      null // in EventTarget relatedTargetArg
    );

    if (el.scrollTop < 57) {
      el.scrollTop = 0
    } else {
      el.scrollTop -= 57;
    }

    el.dispatchEvent(evt);
    callback();
  }, elementId);

  return scroll;
};

utilities.ScrollLeft = function(elementId) {
  var scroll = browser.driver.executeAsyncScript(function(elementId, callback) {
    var el = document.getElementById(elementId);
    var evt = document.createEvent("MouseEvents");

    evt.initMouseEvent(
      'wheel', // in DOMString typeArg,
      true, // in boolean canBubbleArg,
      true, // in boolean cancelableArg,
      window, // in views::AbstractView viewArg,
      -120, // in long detailArg,
      0, // in long screenXArg,
      0, // in long screenYArg,
      0, // in long clientXArg,
      0, // in long clientYArg,
      0, // in boolean ctrlKeyArg,
      0, // in boolean altKeyArg,
      0, // in boolean shiftKeyArg,
      0, // in boolean metaKeyArg,
      0, // in unsigned short buttonArg,
      null // in EventTarget relatedTargetArg
    );

    if (el.scrollLeft < 57) {
      el.scrollLeft = 0
    } else {
      el.scrollLeft -= 57;
    }

    el.dispatchEvent(evt);
    callback();
  }, elementId);

  return scroll;
};

utilities.scrollRight = function(elementId) {
  var scroll = browser.driver.executeAsyncScript(function(elementId, callback) {
    var el = document.getElementById(elementId);
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
      'wheel', // in DOMString typeArg,
      true, // in boolean canBubbleArg,
      true, // in boolean cancelableArg,
      window, // in views::AbstractView viewArg,
      120, // in long detailArg,
      0, // in long screenXArg,
      0, // in long screenYArg,
      0, // in long clientXArg,
      0, // in long clientYArg,
      0, // in boolean ctrlKeyArg,
      0, // in boolean altKeyArg,
      0, // in boolean shiftKeyArg,
      0, // in boolean metaKeyArg,
      0, // in unsigned short buttonArg,
      null // in EventTarget relatedTargetArg
    );

    if (el.scrollLeftMax - el.scrollLeft < 57) {
      el.scrollLeft = el.scrollLeftMax;
    } else {
      el.scrollLeft += 57;
    }
    el.dispatchEvent(evt);
    callback();
  }, elementId);

  return scroll;
};

module.exports = utilities;
