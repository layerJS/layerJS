var repository = require('../../src/framework/repository.js');
var NodeData = require('../../src/framework/nodedata.js');

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
            if (ids[i] == ids[x]) count++;
          }

          expect(count).toBe(1);
        }
      });

      it('can add a version', function() {
        repository.createVersion('test');
        expect(repository.hasVersion('test')).toBeTruthy();
      });

      it('will throw an exception when the version already exists', function() {
        repository.createVersion('test');

        var func = function() {
          repository.createVersion('test');
        };

        expect(func).toThrow('version already exists');
      });

      it('can check if a version already exists', function() {
        expect(repository.hasVersion('test')).toBeFalsy();
        repository.createVersion('test');
        expect(repository.hasVersion('test')).toBeTruthy();
      });

      it('can check if a dataModel already exists in a specific version', function() {
        repository.createVersion('test');
        expect(repository.contains('1', 'test')).toBeFalsy();

        var nodeData = new NodeData({
          id: '1',
          version: 'test'
        });

        repository.add(nodeData, 'test');

        expect(repository.hasVersion('test')).toBeTruthy();
      });
    });
