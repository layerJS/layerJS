describe('inter stage', function() {
  var utilities = require('../helpers/utilities.js');

  beforeEach(function(done) {
    browser.get('interstage/index.html').then(function() {
      done();
    });
  });

  function validate() {
    var frameX = element(by.id('frameX'));
    var stage1 = frameX.element('ancestor::[@id="stage1"][1]');
    expect(stage1).toBeDefined();
    protractor.promise.all([
        browser.getCurrentUrl(),
        utilities.getBoundingClientRect('layer1'),
        utilities.getBoundingClientRect('frameX')
      ])
      .then(function(data) {
        var url = data[0];
        var stage1_dimensions = data[1];
        var frameX_dimensions = data[2];
        url = url.split('/').pop();
        expect(url).toBe('index.html#frameX;layer2.!none');

        expect(stage1_dimensions.bottom).toBe(frameX_dimensions.bottom);
        expect(stage1_dimensions.height).toBe(frameX_dimensions.height);
        expect(stage1_dimensions.left).toBe(frameX_dimensions.left);
        expect(stage1_dimensions.right).toBe(frameX_dimensions.right);
        expect(stage1_dimensions.opacity).toBe(frameX_dimensions.opacity);
        expect(stage1_dimensions.top).toBe(frameX_dimensions.top);
        expect(stage1_dimensions.width).toBe(frameX_dimensions.width);
      });
  }

  it('do a simple transition', function() {
    var frameX = element(by.id('frameX'));
    var stage2 = frameX.element('ancestor::[@id="stage2"][1]');
    expect(stage2).toBeDefined();
    utilities.transitionTo('layer1', 'frameX', {})
      .then(function() {
        validate();
      });
  });

  it('do a simple show frame', function() {
    var frameX = element(by.id('frameX'));
    var stage2 = frameX.element('ancestor::[@id="stage2"][1]');
    expect(stage2).toBeDefined();

    utilities.showFrame('layer1', 'frameX', {})
      .then(function() {
        validate();
      });
  });
});
