var utilities = require('../helpers/utilities.js');

describe("css properties", function() {

  var baseFolder = "cssproperties/";

  beforeEach(function() {
    // window size can be set
    browser.driver.manage().window().setSize(800, 600);
  });


  describe("fit to", function() {

    it("screen < 600px", function() {
      browser.driver.manage().window().setSize(599, 599).then(function() {
        browser.get(baseFolder + "fitto_css.html").then(function() {
          utilities.getFitTo('frame').then(function(result) {
            expect(result).toBe('contain');
          });
        });
      });
    });

    it("screen > 600px", function() {
      browser.driver.manage().window().setSize(800, 601).then(function() {
        browser.get(baseFolder + "fitto_css.html").then(function() {
          utilities.getFitTo('frame').then(function(result) {
            expect(result).toBe('width');
          });
        });
      });
    });
  });
});
