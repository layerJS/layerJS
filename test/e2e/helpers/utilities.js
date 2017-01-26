var utilities = {};

require('jasmine-expect');

utilities.transitionTo = function(layerId, frameName, transition, waitTime) {
  waitTime = waitTime || 3000;

  return browser.driver.executeAsyncScript(function(layerId, frameName, transition, waitTime, callBack) {
    layerJS.select('#' + layerId).transitionTo(frameName, transition);
    window.setTimeout(callBack, waitTime);
  }, layerId, frameName, transition, waitTime);
};

utilities.scrollTo = function(layerId, scrollX, scrollY, transition, waitTime) {
  waitTime = waitTime || 3000;

  return browser.driver.executeAsyncScript(function(layerId, scrollX, scrollY, transition, waitTime, callBack) {
    layerJS.select('#' + layerId).scrollTo(scrollX, scrollY, transition);
    window.setTimeout(callBack, waitTime);
  }, layerId, scrollX, scrollY, transition, waitTime);
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

utilities.setAttributes = function(elementId, attributes) {
  return browser.driver.executeAsyncScript(function(elementId, attributes, callBack) {
    var el = window.document.getElementById(elementId);

    for (var attribute in attributes) {
      el.setAttribute(attribute, attributes[attribute]);
    }

    callBack();
  }, elementId, attributes);
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

utilities.scrollDown = function(elementId, times) {
  times = times || 1;

  var scroll = browser.driver.executeAsyncScript(function(elementId, times, callback) {
    var el = document.getElementById(elementId);
    for (var i = 0; i < times; i++) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(
        'wheel', // in DOMString typeArg,
        true, // in boolean canBubbleArg,
        true, // in boolean cancelableArg,
        window, // in views::AbstractView viewArg,
        0, // in long detailArg,
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

      //http://stackoverflow.com/questions/5527601/normalizing-mousewheel-speed-across-browsers
      // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      // Firefox 1.0+
      var isFirefox = typeof InstallTrigger !== 'undefined';
      // At least Safari 3+: "[object HTMLElementConstructor]"
      var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
      // Internet Explorer 6-11
      var isIE = /*@cc_on!@*/ false || !!document.documentMode;
      // Edge 20+
      var isEdge = !isIE && !!window.StyleMedia;
      // Chrome 1+
      var isChrome = !!window.chrome && !!window.chrome.webstore;

      if (isSafari || isChrome) {
        evt.wheelDeltaY = 120;
        evt.wheelDeltaX = 0;
      } else if (isFirefox || isOpera || isIE || isEdge) {
        evt.deltaY = 100;
        evt.deltaX = 0;
      }


      if (el.scrollTopMax - el.scrollTop < 57) {
        el.scrollTop = el.scrollTopMax;
      } else {
        el.scrollTop += 57;
      }
      el.dispatchEvent(evt);
    }

    callback();
  }, elementId, times);

  return scroll;
};

utilities.ScrollUp = function(elementId, times) {
  times = times || 1;

  var scroll = browser.driver.executeAsyncScript(function(elementId, times, callback) {
    var el = document.getElementById(elementId);
    for (var i = 0; i < times; i++) {
      var evt = document.createEvent("MouseEvents");

      evt.initMouseEvent(
        'wheel', // in DOMString typeArg,
        true, // in boolean canBubbleArg,
        true, // in boolean cancelableArg,
        window, // in views::AbstractView viewArg,
        0, // in long detailArg,
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

      // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      // Firefox 1.0+
      var isFirefox = typeof InstallTrigger !== 'undefined';
      // At least Safari 3+: "[object HTMLElementConstructor]"
      var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
      // Internet Explorer 6-11
      var isIE = /*@cc_on!@*/ false || !!document.documentMode;
      // Edge 20+
      var isEdge = !isIE && !!window.StyleMedia;
      // Chrome 1+
      var isChrome = !!window.chrome && !!window.chrome.webstore;

      if (isSafari || isChrome) {
        evt.wheelDeltaY = -120;
        evt.wheelDeltaX = 0;
      } else if (isFirefox || isOpera || isIE || isEdge) {
        evt.deltaY = -100;
        evt.deltaX = 0;
      }


      if (el.scrollTop < 57) {
        el.scrollTop = 0
      } else {
        el.scrollTop -= 57;
      }

      el.dispatchEvent(evt);
    }
    callback();
  }, elementId, times);

  return scroll;
};

utilities.ScrollLeft = function(elementId, times) {
  times = times || 1;

  var scroll = browser.driver.executeAsyncScript(function(elementId, times, callback) {
    var el = document.getElementById(elementId);
    for (var i = 0; i < times; i++) {
      var evt = document.createEvent("MouseEvents");

      evt.initMouseEvent(
        'wheel', // in DOMString typeArg,
        true, // in boolean canBubbleArg,
        true, // in boolean cancelableArg,
        window, // in views::AbstractView viewArg,
        0, // in long detailArg,
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

      // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      // Firefox 1.0+
      var isFirefox = typeof InstallTrigger !== 'undefined';
      // At least Safari 3+: "[object HTMLElementConstructor]"
      var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
      // Internet Explorer 6-11
      var isIE = /*@cc_on!@*/ false || !!document.documentMode;
      // Edge 20+
      var isEdge = !isIE && !!window.StyleMedia;
      // Chrome 1+
      var isChrome = !!window.chrome && !!window.chrome.webstore;

      if (isSafari || isChrome) {
        evt.wheelDeltaY = 0;
        evt.wheelDeltaX = -1200;
      } else if (isFirefox || isOpera || isIE || isEdge) {
        evt.deltaY = 0;
        evt.deltaX = -100;
      }


      if (el.scrollLeft < 57) {
        el.scrollLeft = 0
      } else {
        el.scrollLeft -= 57;
      }

      el.dispatchEvent(evt);
    }
    callback();
  }, elementId, times);

  return scroll;
};

utilities.scrollRight = function(elementId, times) {
  times = times || 1;

  var scroll = browser.driver.executeAsyncScript(function(elementId, times, callback) {
    var el = document.getElementById(elementId);
    for (var i = 0; i < times; i++) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent(
        'wheel', // in DOMString typeArg,
        true, // in boolean canBubbleArg,
        true, // in boolean cancelableArg,
        window, // in views::AbstractView viewArg,
        0, // in long detailArg,
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

      // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      // Firefox 1.0+
      var isFirefox = typeof InstallTrigger !== 'undefined';
      // At least Safari 3+: "[object HTMLElementConstructor]"
      var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
      // Internet Explorer 6-11
      var isIE = /*@cc_on!@*/ false || !!document.documentMode;
      // Edge 20+
      var isEdge = !isIE && !!window.StyleMedia;
      // Chrome 1+
      var isChrome = !!window.chrome && !!window.chrome.webstore;

      if (isSafari || isChrome) {
        evt.wheelDeltaY = 0;
        evt.wheelDeltaX = 120;
      } else if (isFirefox || isOpera || isIE || isEdge) {
        evt.deltaY = 0;
        evt.deltaX = 100;
      }


      if (el.scrollLeftMax - el.scrollLeft < 57) {
        el.scrollLeft = el.scrollLeftMax;
      } else {
        el.scrollLeft += 57;
      }
      el.dispatchEvent(evt);
    }
    callback();
  }, elementId, times);

  return scroll;
};

utilities.wait = function(miliseconds) {
  return browser.sleep(miliseconds);
};

utilities.setLayout = function(elementId, layout) {
  return browser.driver.executeAsyncScript(function(elementId, layout, callback) {
    var el = document.getElementById(elementId);

    el._ljView.switchLayout(layout);
    callback();
  }, elementId, layout);
};

utilities.switchScrolling = function(elementId, nativeScrolling) {
  return browser.driver.executeAsyncScript(function(elementId, nativeScrolling, callback) {
    var el = document.getElementById(elementId);

    el._ljView.switchScrolling(nativeScrolling);
    callback();
  }, elementId, nativeScrolling);
};

utilities.getDataAttribute = function(elementId, dataAttribute) {
  return browser.driver.executeAsyncScript(function(id, dataAttribute, callback) {
    var element = document.getElementById(id);
    var result;
    for (var attributeName in element._ljView.data.attributes) {
      if (attributeName === dataAttribute) {
        result = element._ljView.data.attributes[attributeName];
        break;
      }
    }

    callback(result);
  }, elementId, dataAttribute);
};

utilities.getChildrenIds = function(elementId) {
  return browser.driver.executeAsyncScript(function(id,callback) {
    var element = document.getElementById(id);
    var view = element._ljView;
    var result = [];

    var childrenViews = view.getChildViews();

    for (var i = 0; i < childrenViews.length; i++) {
      result.push(childrenViews[i].id());
    }

    callback(result);
  }, elementId);
};


utilities.showFrame = function(layerId, frameName, scrollData,waitTime) {
  waitTime = waitTime || 0;

  return browser.driver.executeAsyncScript(function(id, frameName, scrollData, waitTime,callback) {
    layerJS.select('#' + id).showFrame(frameName, scrollData);
    callback();
  }, layerId, frameName, scrollData, waitTime);
};

utilities.addElement= function(parentId, elementHTML) {
  return browser.driver.executeAsyncScript(function(parentId, elementHTML, callBack) {
    var el = document.getElementById(parentId);
    el.insertAdjacentHTML('beforeend', elementHTML);
    callBack();
  }, parentId, elementHTML);
};


module.exports = utilities;
