describe('inter stage', function() {
  var utilities = require('../helpers/utilities.js');

  beforeEach(function(done) {
    browser.get('interstage/index.html').then(function() {
      done();
    });
  });

  it('do a simple transition', function() {
    var frameX = element(by.id('frameX'));
    var stage2 = frameX.element('ancestor::[@id="stage2"][1]');
    expect(stage2).toBeDefined();

    utilities.transitionTo('layer1', 'frameX', {})
      .then(function() {
        var stage1 = frameX.element('ancestor::[@id="stage1"][1]');
        expect(stage1).toBeDefined();
        browser.getCurrentUrl().then(function(url) {
          url = url.split('/').pop();
          expect(url).toBe('index.html#frameX;layer2.!none');
          expect(element(by.id('frame1')).isDisplayed()).toBeFalsy();
          expect(element(by.id('frameX')).isDisplayed()).toBeTruthy();
        });
      });
  });

  it('do a simple show frame', function() {
    var frameX = element(by.id('frameX'));
    var stage2 = frameX.element('ancestor::[@id="stage2"][1]');
    expect(stage2).toBeDefined();

    utilities.showFrame('layer1', 'frameX', {})
      .then(function() {
        var stage1 = frameX.element('ancestor::[@id="stage1"][1]');
        expect(stage1).toBeDefined();
        browser.getCurrentUrl().then(function(url) {
          url = url.split('/').pop();
          expect(url).toBe('index.html#frameX;layer2.!none');
          expect(element(by.id('frame1')).isDisplayed()).toBeFalsy();
          expect(element(by.id('frameX')).isDisplayed()).toBeTruthy();
        });
      });
  });
});
