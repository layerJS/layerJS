var layoutmanager = require('../../src/framework/layoutmanager.js');

describe('LayoutManager', function() {
  it('can be initialized', function() {
    expect(layoutmanager).toBeDefined();
  });
  it('can register layout functions and execute them', function() {
    var cc = 1;
    var layouter = function(){ // dummy LayerLayout
      this.fn=function(param) {
        cc += param;
      }
    }
    layoutmanager.registerType('gordon', layouter);
    (new (layoutmanager.get('gordon'))).fn(4);
    expect(cc).toBe(5);
  })
});
