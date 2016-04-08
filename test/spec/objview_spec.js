var ObjView = require('../../src/framework/objview.js');
var ObjData = require('../../src/framework/objdata.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe("ObjView", function() {

  ViewsCommonParseTests({
    ViewType: ObjView,
    viewTypeName: 'ObjView',
    type: 'node'
  });

  CommonViewTests('simple_objdata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/simple_objdata.js')[0])),
      ViewType: ObjView
    };
  });

  CommonViewTests('anchor_objdata.js', function() {
    return {
      data: JSON.parse(JSON.stringify(require('./datasets/anchor_objdata.js')[0])),
      ViewType: ObjView
    };
  });

  it('can be created', function() {
    var cv = new ObjView(new ObjData);
    expect(cv).not.toBeUndefined();
    expect(document.getElementById('wl-obj-css').innerHTML).toBe('');
  });
});
