var StageView = require('../../src/framework/stageview.js');
var LayerView = require('../../src/framework/layerview.js');
var FrameView = require('../../src/framework/frameview.js');
var utilities = require("./helpers/utilities.js");

describe('data-lj-*, lj-*and attributes Combination', function() {
  describe('tests all attributes on stage, layer and frame', function() {
    /*
     *  once go over all attributes
     *  once with data-lj-*
     *  and once with lj-*
     */
    it('stage and layer lj-type with frame data-lj-type', function() {
      /**
       * All attributes array
       * arrays elements[[0,1,2,3]] // 0 == attribute, 1 == value, 2 == function(defined usually in baseview.js or in dist/layerjs.js), 3 == result.
       */
      var attArr = [
        ["id",
          "simple_frame_1",
          "id",
          "simple_frame_1"
        ],
        [
          "name",
          "simple_frame_1",
          "name",
          "simple_frame_1"
        ],
        [
          "width",
          800,
          "width",
          800
        ],
        [
          "height",
          700,
          "height",
          700
        ],
        [
          "x",
          1800,
          "x",
          1800
        ],
        [
          "y",
          400,
          "y",
          400
        ],
        [
          "scale-x",
          1,
          "scaleX",
          1
        ],
        [
          "scale-y",
          1,
          "scaleY",
          1
        ],
        [
          "fit-to",
          "width", //other option can be "cover"
          "fitTo",
          "width"
        ],
        [
          "elastic-left",
          "0px",
          "elasticLeft",
          "0px"
        ],
        [
          "elastic-right",
          "1200px",
          "elasticRight",
          "1200px"
        ],
        [
          "elastic-top",
          "0px",
          "elasticTop",
          "0px"
        ],
        [
          "elastic-bottom",
          "900px",
          "elasticBottom",
          "900px"
        ],
        [
          "start-position",
          "top-left",
          "startPosition",
          "top-left"
        ],
        [
          "neighbors.l",
          "simple_frame_2", //TODO create
          "neighbors",
          {
            l: "simple_frame_2",
            r: null,
            t: null,
            b: null
          }
        ],
        [
          "neighbors.r",
          "simple_frame_3", //TODO create
          "neighbors",
          {
            l: null,
            r: "simple_frame_3",
            t: null,
            b: null
          }
        ],
        [
          "neighbors.t",
          "simple_frame_4", //TODO create
          "neighbors",
          {
            l: null,
            r: null,
            t: "simple_frame_4",
            b: null
          }
        ],
        [
          "neighbors.b",
          "simple_frame_5", //TODO create
          "neighbors",
          {
            l: null,
            r: null,
            t: null,
            b: "simple_frame_5"
          }
        ],
        [
          "rotation",
          '0',
          "rotation",
          '0'
        ],
        [
          "no-scrolling",
          false,
          "noScrolling",
          false
        ],
        [
          "layout-type",
          "slide",
          "layoutType",
          "slide"
        ],
        [
          "default-frame",
          "simple_frame_1",
          "defaultFrame",
          "simple_frame_1"
        ],
        [
          "native-scroll",
          true,
          "nativeScroll",
          true
        ]
      ];

      var prefix = ['data-lj-', 'lj-'];
      var stgLyrFrmArr = ['stage', 'layer', 'frame'];

      for (var dataOrLj = 0; dataOrLj < prefix.length; dataOrLj++) {
        for (var type = 0; type < stgLyrFrmArr.length; type++) {
          for (var outerArr = 0; outerArr < attArr.length; outerArr++) {

            var div = document.createElement('div');
            // iterates over stgLyrFrmArr array
            div.setAttribute('data-lj-type', stgLyrFrmArr[type]); // TODO vary type and 'data-'
            // iterates over attArr array, sets all attributes and their values + does it with 'data-lj-' and 'lj-'
            div.setAttribute(prefix[dataOrLj] + attArr[outerArr][0], attArr[outerArr][1]); //vary “data-“ and attribute
            utilities.appendChild(div);
            var view;
            if (stgLyrFrmArr[type] == 'frame') {
              view = new FrameView({
                el: div
              });
            }
            if (stgLyrFrmArr[type] == 'layer') {
              view = new LayerView({
                el: div
              });
            }
            if (stgLyrFrmArr[type] == 'stage') {
              view = new StageView({
                el: div
              });
            }

            var valueInView = view[attArr[outerArr][2]]();
            var definedValue = attArr[outerArr][3];
            expect(valueInView).toEqual(definedValue);
            utilities.setHtml(""); // reset at the end of each test
          }
        }
      }
    });
  });
});
