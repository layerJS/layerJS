var ElementView = require('../../src/framework/elementview.js');
var ViewsNodeViewTests = require('./helpers/views/node/viewtests.js');
var ViewsElementViewTests = require('./helpers/views/element/viewtests.js');
var ViewsElementParseTests = require('./helpers/views/element/parsetests.js');
var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');

describe('ElementView', function() {

  ViewsCommonParseTests({
    ViewType: ElementView
  });

  ViewsElementParseTests({
    ViewType: ElementView
  });

  ViewsNodeViewTests('simple_elementdata.js', ElementView, require('./datasets/simple_elementdata.js')[0]);

  ViewsElementViewTests('simple_elementdata.js', ElementView, require('./datasets/simple_elementdata.js')[0]);

  ViewsNodeViewTests('anchor_elementdata.js', ElementView, require('./datasets/anchor_elementdata.js')[0]);

  ViewsElementViewTests('anchor_elementdata.js', ElementView, require('./datasets/anchor_elementdata.js')[0]);

});
