module.exports = function(scenario, ViewType, elementFactory, expectedValue) {

  describe(': identify ' + scenario + '=>', function() {
    it('element can be of ViewType "' + ViewType.defaultProperties.type + '"', function() {
      expect(ViewType.identify(elementFactory())).toBe(expectedValue);
    });
  });
};
