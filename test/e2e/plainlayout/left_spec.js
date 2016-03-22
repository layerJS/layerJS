describe("PlainLayout", function() {

  beforeEach(function() {
    // window size can be set
    browser.driver.manage().window().setSize(800, 600);
  });

  it('can transition a frame to the left', function() {

    browser.get('dataset3.html').then(function() {

      var layer2 = element(by.id('wl-obj-l2'));
      var f1 = element(by.id('wl-obj-f1'));
      var f4 = element(by.id('wl-obj-f4'));

      expect(f1.getCssValue('display')).toBe('block');
      expect(f4.getCssValue('display')).toBe('none');

    // script can be passed in as a string
    // use the arguments to get the callback method
    // using the callback method will trigger the end of the script
    // arguments can be passed in the callback method, these arguments are visible in the .then(function(arguments){}) function
    /*  browser.driver.executeAsyncScript(
        "var el = window.document.getElementById('wl-obj-l2');" +
        "WL.select('#wl-obj-l2').transitionTo('f4', { type : 'left'});" +
        "var callBack = arguments[arguments.length - 1];" +
        "window.setTimeout(callBack, 5000);"
      )*/
      browser.driver.executeAsyncScript(function(callBack) {
          WL.select('#wl-obj-l2').transitionTo('f4', {
            type: 'left'
          });
          //var callBack = arguments[arguments.length - 1];
          window.setTimeout(callBack, 5000);
        })
        .then(function() {
          expect(f1.getCssValue('display')).toBe('none');
          expect(f4.getCssValue('display')).toBe('block');

          f1.getLocation().then(function(location) {
            // location is x:0, y:0. This should be the coordinates after the transform
            console.log(location);

            f4.getLocation().then(function(f4_location) {
              console.log(f4_location);
            })
          })
        });
    });
  });
});
