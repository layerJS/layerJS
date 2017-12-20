describe('HashRouter', function() {

  var HashRouter = require('../../../src/framework/router/hashRouter.js');
  var utilities = require('../helpers/utilities.js');
  var state = require('../../../src/framework/state.js');

  var hashRouter;

  beforeEach(function() {
    hashRouter = new HashRouter();
  });

  it('can handle a hashed url', function(done) {
    var url = 'http://localhost/#stage1.layer1.frame2';

    var html = "<div data-lj-type='stage' id='stage1'>" +
      "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
      "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
      "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
      "</div>" +
      "</div>";

    utilities.setHtml(html);

    var options = {
      url: url,
      location: 'http://localhost/',
      hash: 'stage1.layer1.frame2',
      transitions: [],
      globalTransition: {
        type: 'left'
      }
    };
    var promise = hashRouter.handle(options);

    promise.then(function(result) {
      setTimeout(function() {
        expect(result.handled).toBeTruthy();
        expect(result.stop).toBeFalsy();
        expect(result.paths).toEqual(['stage1.layer1.frame2']);
        expect(result.transitions.length).toBe(1);
        expect(result.transitions[0]).toEqual(options.globalTransition);
        done();
      }, 500);
    });
  });

  it('can only handle an url with a hash', function(done) {
    var promise = hashRouter.handle('http://localhost/');

    promise.then(function(result) {
      expect(result.handled).toBeFalsy();
      done();
    });
  });
//Kenny
  xit('can only handle an url with a hash that is the same as the current url', function(done) {
    var promise = hashRouter.handle({
      location: 'http://localhost/test.html',
      hash: 'stage1.layer1.frame2'
    });

    promise.then(function(result) {
      expect(result.handled).toBeFalsy();
      done();
    });
  });

  describe('can create a hash part for a url based on a state', function() {

    it('multiple frame names will be added comma seperated', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>");

      var options = {
        location: 'http://localhost/index.html',
        state: ['stage1.layer1.frame1', 'stage1.layer2.frame2']
      };

      hashRouter.buildUrl(options);
      expect(options.state).toEqual([]);
      expect(options.location).toBe('http://localhost/index.html');
      expect(options.hash).toBe('frame1;frame2');
    });

    it('just the frame name if this one is unique', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div></div>");

      var options = {
        location: 'http://localhost/index.html',
        state: ['stage1.layer1.frame1']
      };

      hashRouter.buildUrl(options);
      expect(options.state).toEqual([]);
      expect(options.location).toBe('http://localhost/index.html');
      expect(options.hash).toBe('frame1');
    });

    it('when a frame name is found multiple times, the parent fragment is added', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div><div data-lj-type='layer' id='layer2' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame1'></div>" +
        "</div></div>");

      var options = {
        location: 'http://localhost/index.html',
        state: ['stage1.layer1.frame1']
      };

      hashRouter.buildUrl(options);
      expect(options.state).toEqual([]);
      expect(options.location).toBe('http://localhost/index.html');
      expect(options.hash).toBe('layer1.frame1');
    });

    it('when a hash part already exists, it will be replaced', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div></div>");

      var options = {
        location: 'http://localhost/index.html',
        hash: 'something',
        state: ['stage1.layer1.frame1']
      };

      hashRouter.buildUrl(options);
      expect(options.state).toEqual([]);
      expect(options.location).toBe('http://localhost/index.html');
      expect(options.hash).toBe('frame1');
    });
  });

  describe('interstage', function() {
    it('can move a frame to a different layer', function(done) {
      var url = 'http://localhost/#stage1.layer1.frame2';

      var html = "<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>";

      utilities.setHtml(html);

      var options = {
        url: url,
        location: 'http://localhost/',
        hash: 'stage1.layer1.frame2',
        transitions: [],
        paths: [],
        globalTransition: {
          type: 'left'
        }
      };
      var promise = hashRouter.handle(options);

      promise.then(function(result) {
        setTimeout(function() {
          expect(result.handled).toBeTruthy();
          expect(result.stop).toBeFalsy();
          expect(result.paths).toEqual(['stage1.layer1.frame2']);
          expect(result.transitions.length).toBe(1);
          expect(result.transitions[0]).toEqual(options.globalTransition);
          done();
        }, 500);
      });
    });


    it('will put the full path of the frame when it is an interstage', function() {
      utilities.setHtml("<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>"+
        "<div data-lj-type='layer' id='layer2' >" +
        "</div></div>");

      var frame1 = document.getElementById('frame1')._ljView;
      var layer2 = document.getElementById('layer2')._ljView;
      frame1.originalParent = layer2;

      var options = {
        location: 'http://localhost/index.html',
        hash: 'something',
        state: ['stage1.layer1.frame1']
      };

      hashRouter.buildUrl(options);
      expect(options.state).toEqual([]);
      expect(options.location).toBe('http://localhost/index.html');
      expect(options.hash).toBe('stage1.layer1.frame1');
    });

    it('can detect a structure changing transition', function(done){
      var url = 'http://localhost/#stage1.layer1.frame2$';

      var html = "<div data-lj-type='stage' id='stage1'>" +
        "<div data-lj-type='layer' id='layer1' data-lj-default-frame='frame1'>" +
        "<div data-lj-type='frame' id='frame1' data-lj-name='frame1'></div>" +
        "</div>" +
        "<div data-lj-type='layer' id='layer2' data-lj-default-frame='frame2'>" +
        "<div data-lj-type='frame' id='frame2' data-lj-name='frame2'></div>" +
        "</div>" +
        "</div>";

      utilities.setHtml(html);

      var options = {
        url: url,
        location: 'http://localhost/',
        hash: 'stage1.layer1.frame2$',
        transitions: [],
        paths: [],
        globalTransition: {
          type: 'left'
        }
      };
      var promise = hashRouter.handle(options);

      promise.then(function(result) {
        setTimeout(function() {
          expect(result.handled).toBeTruthy();
          expect(result.stop).toBeFalsy();
          expect(result.paths).toEqual(['stage1.layer1.frame2$']);
          expect(result.transitions.length).toBe(1);
          done();
        }, 500);
      });
    });
  });

});
