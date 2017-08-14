describe('url', function() {
  var utilities = require('../helpers/utilities.js');

  beforeEach(function(done) {
    //browser.driver.manage().window().setSize(800, 600);
    browser.get('url/index.html').then(function() {
      done();
    });
  });


  it('for showing 1 state', function() {
    utilities.showState(['frame2']).then(function() {
      utilities.wait(2000).then(function() {
        browser.getCurrentUrl().then(function(url) {
          url = url.split('/').pop();
          expect(url).toBe('index.html#frame2');
          expect(element(by.id('frame2')).isDisplayed()).toBeTruthy();
          expect(element(by.id('frameX')).isDisplayed()).toBeTruthy();
        });
      });
    });
  });

  it('for showing multiple states', function() {
    utilities.showState(['frame2', 'frameY']).then(function() {
      utilities.wait(2000).then(function() {
        browser.getCurrentUrl().then(function(url) {
          url = url.split('/').pop();
          expect(url).toBe('index.html#frame2;frameY');
          expect(element(by.id('frame2')).isDisplayed()).toBeTruthy();
          expect(element(by.id('frameY')).isDisplayed()).toBeTruthy();
        });
      });
    });
  });

  it('will deterime initial state of the page', function() {
    browser.get('url/index.html#frameY').then(function() {
      utilities.wait(2000).then(function() {
        utilities.exportState().then(function(exportedState) {
          expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage2.layer2.frameY']);
          expect(element(by.id('frame1')).isDisplayed()).toBeTruthy();
          expect(element(by.id('frameY')).isDisplayed()).toBeTruthy();
          browser.getCurrentUrl().then(function(url) {
            url = url.split('/').pop();
            expect(url).toBe('index.html#frameY');
          });
        });
      });
    });
  });

  it('will remove transition parameters', function() {
    browser.get('url/index.html#frameY?t=1s&p=left').then(function() {
      utilities.wait(2000).then(function() {
        utilities.exportState().then(function(exportedState) {
          expect(exportedState).toEqual(['stage1.layer1.frame1', 'stage2.layer2.frameY']);
          expect(element(by.id('frame1')).isDisplayed()).toBeTruthy();
          expect(element(by.id('frameY')).isDisplayed()).toBeTruthy();
          browser.getCurrentUrl().then(function(url) {
            url = url.split('/').pop();
            expect(url).toBe('index.html#frameY');
          });
        });
      });
    });
  });

});
