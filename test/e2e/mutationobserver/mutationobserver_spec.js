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

});
