var layoutmanager = require('../../src/framework/layoutmanager.js');

describe('LayoutManager', function() {
  it('can be initialized', function() {
    expect(layoutmanager).toBeDefined();
  });
  it('can register layout functions and execute them', function() {
    var cc = 1;
    var fn = function(param) {
      cc += param;
    }
    layoutmanager.registerType('gordon', fn);
    layoutmanager.get('gordon').call(this, 4);
    expect(cc).toBe(5);
  })
});
