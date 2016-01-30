/*
  A simple CgroupData object to use in test senario's.
*/

var simple_cgroupdata =  [{
  "type": "group",
  "width": 1280,
  "height": 396,
  "x": 0,
  "y": 10,
  "scale": {
    "x": 1,
    "y": 1
  },
  "style": "background-color: rgba(240,240,240,0.8);",
  "classes": "someClass",
  "layer": 25,
  "rotation": 360,
  "zIndex" : 5,
  "children" :  [11000],
  "disallow": {},
  "id": 110530
},
{
  "type": "node",
  "text": "",
  "width": 1280,
  "height": 396,
  "x": 0,
  "y": 10,
  "scale": {
    "x": 1,
    "y": 1
  },
  "style": "background-color: rgba(240,240,240,0.8);",
  "classes": "someClass",
  "layer": 25,
  "rotation": 360,
  "zIndex" : 5,
  "children" :  [],
  "disallow": {},
  "id": 11000
}
];

module.exports = simple_cgroupdata;
