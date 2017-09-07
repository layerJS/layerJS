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
    protractor.promise.all([
      utilities.listenDimensionsBeforeTransition('layer1', 'frameX'),
      utilities.getBoundingClientRect('frameX'),
    ]).then(function(data) {
      var frameX_dimensions_org = data[1];
      utilities.transitionTo('layer1', 'frameX', {})
        .then(function() {
          var stage1 = frameX.element('ancestor::[@id="stage1"][1]');
          expect(stage1).toBeDefined();
          protractor.promise.all([
              browser.getCurrentUrl(),
              utilities.getBoundingClientRect('stage1'),
              utilities.getBoundingClientRect('frameX'),
              utilities.getFromStore('frameX')
            ])
            .then(function(data) {
              var url = data[0];
              var stage1_dimensions = data[1];
              var frameX_dimensions = data[2];
              var frameX_dimensions_before = data[3];
              url = url.split('/').pop();
              expect(url).toBe('index.html#frameX;layer2.!none');

              // check position of frame in stage2 with position of frame before transition when already put in stage1
              expect(frameX_dimensions_org.bottom.toFixed(3)).toBe(frameX_dimensions_before.bottom.toFixed(3));
              expect(frameX_dimensions_org.height.toFixed(3)).toBe(frameX_dimensions_before.height.toFixed(3));
              expect(frameX_dimensions_org.left.toFixed(3)).toBe(frameX_dimensions_before.left.toFixed(3));
              expect(frameX_dimensions_org.right.toFixed(3)).toBe(frameX_dimensions_before.right.toFixed(3));
              expect(frameX_dimensions_org.opacity).toBe(frameX_dimensions_before.opacity);
              expect(frameX_dimensions_org.top.toFixed(3)).toBe(frameX_dimensions_before.top.toFixed(3));
              expect(frameX_dimensions_org.width.toFixed(3)).toBe(frameX_dimensions_before.width.toFixed(3));


              expect(stage1_dimensions.bottom).toBe(frameX_dimensions.bottom);
              expect(stage1_dimensions.height).toBe(frameX_dimensions.height);
              expect(stage1_dimensions.left).toBe(frameX_dimensions.left);
              expect(stage1_dimensions.right).toBe(frameX_dimensions.right);
              expect(stage1_dimensions.opacity).toBe(frameX_dimensions.opacity);
              expect(stage1_dimensions.top).toBe(frameX_dimensions.top);
              expect(stage1_dimensions.width).toBe(frameX_dimensions.width);
            });
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
        protractor.promise.all([
            browser.getCurrentUrl(),
            utilities.getBoundingClientRect('stage1'),
            utilities.getBoundingClientRect('frameX'),
          ])
          .then(function(data) {
            var url = data[0];
            var stage1_dimensions = data[1];
            var frameX_dimensions = data[2];
            url = url.split('/').pop();
            expect(url).toBe('index.html#frameX;layer2.!none');
            expect(element(by.id('frame1')).isDisplayed()).toBeFalsy();
            expect(element(by.id('frameX')).isDisplayed()).toBeTruthy();

            expect(stage1_dimensions.bottom).toBe(frameX_dimensions.bottom);
            expect(stage1_dimensions.height).toBe(frameX_dimensions.height);
            expect(stage1_dimensions.left).toBe(frameX_dimensions.left);
            expect(stage1_dimensions.right).toBe(frameX_dimensions.right);
            expect(stage1_dimensions.opacity).toBe(frameX_dimensions.opacity);
            expect(stage1_dimensions.top).toBe(frameX_dimensions.top);
            expect(stage1_dimensions.width).toBe(frameX_dimensions.width);
          });
      });
  });
});
