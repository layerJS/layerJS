  var elementView = (function() {
        return require('../../src/framework/elementview.js')
        });
      var ViewsNodeViewTests = require('./helpers/views/node/viewtests.js');
      var ViewsElementViewTests = require('./helpers/views/element/viewtests.js');
      var ViewsElementParseTests = require('./helpers/views/element/parsetests.js');
      var ViewsCommonParseTests = require('./helpers/views/common/parsetests.js');
      var ViewsCommonIdentifyTests = require('./helpers/views/common/identifytests.js');

      describe('ElementView', function() {

        ViewsCommonParseTests(function() {
          return {
            ViewType: elementView()
          }
        });

        ViewsElementParseTests(function() {
          return {
            ViewType: elementView()
          }
        });

        ViewsNodeViewTests('simple_elementdata.js', elementView, require('./datasets/simple_elementdata.js')[0]);

        ViewsElementViewTests('simple_elementdata.js', elementView, require('./datasets/simple_elementdata.js')[0]);

        ViewsNodeViewTests('anchor_elementdata.js', elementView, require('./datasets/anchor_elementdata.js')[0]);

        ViewsElementViewTests('anchor_elementdata.js', elementView, require('./datasets/anchor_elementdata.js')[0]);

        (function() {
          var tags = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];

          for (var i = 0; i < tags.length; i++) {
            var createTest = function(tag) {
              return function() {
                ViewsCommonIdentifyTests(tag, elementView, function() {
                  return document.createElement(tag)
                }, true);
              }
            }(tags[i]);

            createTest();
          }
        })();

        ViewsCommonIdentifyTests('div', elementView, function() {
          return document.createElement('div');
        }, false);

      });
