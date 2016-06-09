var ObjView = require('../../src/framework/objview.js');
var CommonViewTests = require('./helpers/Commonviewtests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe("ObjView", function() {

  ViewsCommonParseTests({
    ViewType: ObjView
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
});
