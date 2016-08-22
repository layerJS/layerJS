describe("Mutation observer", function() {
  console.log("Mutation observer");
  var iterations = 300;

  it("setting attribute test", function() {
    console.log("setting attribute test");
    browser.get("mutationobserver/mutationobserver.html").then(function() {

      browser.driver.executeAsyncScript(function(iterations, callBack) {

        if (window.MutationObserver == undefined) {
          callBack(null);
        }

        var result = {};
        var element = document.getElementById("test");

        var observer = new MutationObserver(function(mutations) {


        });


        //without mutationobserver
        var startDate = new Date();

        for (var i = 0; i < iterations; i++) {
          element.setAttribute("test1" + i, "something");
        }

        var endData = new Date();
        result.without_mutationobserver = (endData - startDate);

        //with mutationobserver
        startDate = new Date();
        observer.observe(element, {
          attributes: true,
          childList: false,
          characterData: true,
          subtree: false
        });

        for (var i = 0; i < iterations; i++) {
          element.setAttribute("test2" + i, "something");
        }

        observer.disconnect();
        endData = new Date();
        result.with_mutationobserver = (endData - startDate);


        //with connect/disconnect mutationobserver
        startDate = new Date();
        observer.observe(element, {
          attributes: true,
          childList: false,
          characterData: true,
          subtree: false
        });

        for (var i = 0; i < iterations; i++) {
          observer.observe(element, {
            attributes: true,
            childList: false,
            characterData: true,
            subtree: false
          });
          element.setAttribute("test3" + i, "something");
          observer.disconnect();
        }
        endData = new Date();
        result.with_connect_disconnect_mutationobserver = (endData - startDate);

        callBack(result);
      }, iterations).then(function(result) {

        if (!result)
          console.log("browser does not support muation observers");
        else {
          console.log(result);
        }
      });
    });
  });

  it("adding children", function() {
    console.log("adding children");
    browser.get("mutationobserver/mutationobserver.html").then(function() {

      browser.driver.executeAsyncScript(function(iterations, callBack) {

        if (!window.MutationObserver) {
          callBack(false);
        }

        var result = {};
        var element = document.getElementById("test");

        var observer = new MutationObserver(function(mutations) {});

        //without mutationobserver
        var startDate = new Date();

        for (var i = 0; i < iterations; i++) {
          element.appendChild(document.createElement("div"));
        }

        var endData = new Date();
        result.without_mutationobserver = (endData - startDate);

        //with mutationobserver
        startDate = new Date();
        observer.observe(element, {
          attributes: true,
          childList: false,
          characterData: true,
          subtree: false
        });

        for (var i = 0; i < iterations; i++) {
          element.appendChild(document.createElement("div"));
        }

        observer.disconnect();
        endData = new Date();
        result.with_mutationobserver = (endData - startDate);


        //with connect/disconnect mutationobserver
        startDate = new Date();
        observer.observe(element, {
          attributes: true,
          childList: false,
          characterData: true,
          subtree: false
        });

        for (var i = 0; i < iterations; i++) {
          observer.observe(element, {
            attributes: true,
            childList: false,
            characterData: true,
            subtree: false
          });
          element.appendChild(document.createElement("div"));
          observer.disconnect();
        }
        endData = new Date();
        result.with_connect_disconnect_mutationobserver = (endData - startDate);

        callBack(result);
      }, iterations).then(function(result) {

        if (!result)
          console.log("browser does not support muation observers");
        else {
          console.log(result);
        }
      });
    });
  });

  it("applying transform", function() {
    console.log("applying transform");
    browser.get("mutationobserver/mutationobserver.html").then(function() {

      browser.driver.executeAsyncScript(function(iterations, callBack) {

        if (!window.MutationObserver) {
          callBack(false);
        }

        var result = {};
        var element = document.getElementById("test");

        var observer = new MutationObserver(function(mutations) {});

        //without mutationobserver
        var startDate = new Date();

        for (var i = 0; i < iterations; i++) {
          element.style["transform"] = "scale(" + (iterations / (i + 1)) + ")";
        }

        var endData = new Date();
        result.without_mutationobserver = (endData - startDate);

        //with mutationobserver
        startDate = new Date();
        observer.observe(element, {
          attributes: true,
          childList: false,
          characterData: true,
          subtree: false
        });

        for (var i = 0; i < iterations; i++) {
          element.style["transform"] = "scale(" + (iterations / (i + 1)) + ")";
        }

        observer.disconnect();
        endData = new Date();
        result.with_mutationobserver = (endData - startDate);


        //with connect/disconnect mutationobserver
        startDate = new Date();
        observer.observe(element, {
          attributes: true,
          childList: false,
          characterData: true,
          subtree: false
        });

        for (var i = 0; i < iterations; i++) {
          observer.observe(element, {
            attributes: true,
            childList: false,
            characterData: true,
            subtree: false
          });
          element.style["transform"] = "scale(" + (iterations / (i + 1)) + ")";
          observer.disconnect();
        }
        endData = new Date();
        result.with_connect_disconnect_mutationobserver = (endData - startDate);

        callBack(result);
      }, iterations).then(function(result) {

        if (!result)
          console.log("browser does not support muation observers");
        else {
          console.log(result);
        }
      });
    });
  });

  it("mutationobserver performance test with observer installed", function() {

    console.log("mutationobserver performance test");
    browser.get("mutationobserver/mutationobserver.html").then(function() {

      browser.driver.executeAsyncScript(function(callBack) {
        var mainResult = {};
        var parentElement = document.getElementById('test');
        parentElement.innerHTML = '';

        var manipulations = function() {
          var startTime, endTime;
          var result = {};
          var numberOfChildElements = 100;
          var numberOfSubChildElements = 100;

          startTime = new Date();
          for (var i = 0; i < numberOfChildElements; i++) {
            var childElement = document.createElement('div');
            childElement.id = childElement.innerHTML = 'child_' + i;
            parentElement.appendChild(childElement);

            for (var x = 0; x < numberOfSubChildElements; x++) {
              var subChildElement = document.createElement('div');
              subChildElement.id = subChildElement.innerHTML = 'child_' + i + '_' + x;
              childElement.appendChild(subChildElement);
            }
          }

          endTime = new Date();
          result.adding = (endTime - startTime) + ' ms';

          startTime = new Date();

          for (var i = 0; i < numberOfChildElements; i++) {
            var childElement = document.getElementById('child_' + i);
            childElement.setAttribute('custom', i.toString());

            for (var x = 0; x < numberOfSubChildElements; x++) {
              var subChildElement = document.getElementById('child_' + i + '_' + x);
              subChildElement.setAttribute('custom', x.toString());
              subChildElement.className="aclass";
            }
          }

          endTime = new Date();
          result.modifying = (endTime - startTime) + ' ms';
          return result;
        };


        var info = {
          called: 0
        };

        var observer = new MutationObserver(function(mutations) {
          info.width = parentElement.offsetWidth;
          info.height = parentElement.offsetHeight;
          info.called++;
        });

        observer.observe(parentElement, {
          attributes: true,
          childList: true,
          characterData: true,
          subtree: true
        });

        mainResult.mutationObserver = manipulations();
        mainResult.mutationObserver.info = info;

        setTimeout(function() {
          callBack(mainResult);
        }, 1000);

      }).then(function(result) {
        console.log(result);
      });
    });
  }, 600000);
  it("mutationobserver performance test without observer", function() {

    console.log("mutationobserver performance test");
    browser.get("mutationobserver/mutationobserver.html").then(function() {

      browser.driver.executeAsyncScript(function(callBack) {
        var mainResult = {};
        var parentElement = document.getElementById('test');
        parentElement.innerHTML = '';

        var manipulations = function() {
          var startTime, endTime;
          var result = {};
          var numberOfChildElements = 100;
          var numberOfSubChildElements = 100;

          startTime = new Date();
          for (var i = 0; i < numberOfChildElements; i++) {
            var childElement = document.createElement('div');
            childElement.id = childElement.innerHTML = 'child_' + i;
            parentElement.appendChild(childElement);

            for (var x = 0; x < numberOfSubChildElements; x++) {
              var subChildElement = document.createElement('div');
              subChildElement.id = subChildElement.innerHTML = 'child_' + i + '_' + x;
              childElement.appendChild(subChildElement);
              subChildElement.className="aclass";
            }
          }

          endTime = new Date();
          result.adding = (endTime - startTime) + ' ms';

          startTime = new Date();

          for (var i = 0; i < numberOfChildElements; i++) {
            var childElement = document.getElementById('child_' + i);
            childElement.setAttribute('custom', i.toString());

            for (var x = 0; x < numberOfSubChildElements; x++) {
              var subChildElement = document.getElementById('child_' + i + '_' + x);
              subChildElement.setAttribute('custom', x.toString());
            }
          }

          endTime = new Date();
          result.modifying = (endTime - startTime) + ' ms';
          return result;
        };

        mainResult.noMutationObserver = manipulations();


        setTimeout(function() {
          callBack(mainResult);
        }, 1000);

      }).then(function(result) {
        console.log(result);
      });
    });
  }, 600000);
});
