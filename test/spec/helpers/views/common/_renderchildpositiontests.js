var defaults = require('../../../../../src/framework/defaults.js');
var utilities = require("../../utilities.js");

var Common_renderChildPositionTests = function(scenario, initFunction) {
  describe('(base test for all objects that implement _renderChildPosition) ' + scenario, function() {

    var ViewType, data, srcElement;

    beforeEach(function() {
      var init = initFunction();
      ViewType = init.ViewType;
      srcElement = utilities.appendChildHTML(init.htmlElement);
    });

    it('will implement a _renderChildPosition method', function() {
      var view = new ViewType({
        el: srcElement
      });
      expect(view._renderChildPosition).toBeDefined();
    });

  })
};
module.exports = Common_renderChildPositionTests;
