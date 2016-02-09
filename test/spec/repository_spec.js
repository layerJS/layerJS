var repository = require('../../src/framework/repository.js');

describe('Repository', function() {
  it('can generate unique client ids', function() {
    var ids = [];

    for (var i = 0; i < 500; i++) {
      ids.push(repository.getId());
    }

    var length = ids.length;
    //console.log(ids);
    for (var i = 0; i < length; i++) {
      var count = 0;
      for (var x = 0; i < length; i++) {
        if( ids[i] == ids[x])
        count++;
      }

      expect(count).toBe(1);
    }
  });

});
