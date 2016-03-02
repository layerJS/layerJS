module.exports = function(options) {

  var ViewType = options.ViewType;
  var DataType = ViewType.Model;
  var type = options.type;

  describe(options.viewTypeName + ": _parseChildren =>", function() {

    it('will contain a _parseChildren method to read the parse it\'s children from it\'s DOM element', function() {
      var data = new DataType({});
      var view = new ViewType(data, {});
      expect(view._parseChildren).toBeDefined();
    });

  });


};
