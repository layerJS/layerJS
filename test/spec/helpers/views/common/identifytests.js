module.exports = function(scenario, viewType, elementFactory, expectedValue) {

  describe(': identify ' + scenario + '=>', function() {

    var ViewType;
    beforeEach(function(){
      ViewType = viewType;
    });

    it('element can be of ViewType', function() {
      expect(ViewType.identify(elementFactory())).toBe(expectedValue);
    });
  });
};
