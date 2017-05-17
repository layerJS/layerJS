var utilities = require('../helpers/utilities.js');

xdescribe("bootstrap", function() {

  beforeEach(function() {
    browser.driver.manage().window().setSize(800, 600);
  });

  it('show code', function() {
    browser.get('bootstrap/index.html').then(function() {
      element(by.id('showCode')).click();
      element(by.id('collapse1')).isDisplayed().then(function(isVisible) {
        expect(isVisible).toBe(true);
        element(by.id('showCode')).click();
        element(by.id('collapse1')).isDisplayed().then(function(isVisible) {
          expect(isVisible).toBe(false);
        });
      });
    });
  });
});
