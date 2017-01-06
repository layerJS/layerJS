# Introduction #

layerJS is an open source Javascript UI/UX library allowing intuitive, visually intense, mobile app-like experiences for web apps and websites.

We believe that any kind of interactive web content can be created by placing media elements on moving layers. Unlike existing UI frameworks, layerJS does not provide various UI elements (use your favorite lib for that) but focusses on how larger blocks are put together to form websites and apps.

layerJS introduces the Stage-Frame concept. Frames are arbitrary HTML fragments - the content of your site - that can be fit into Stages (viewports) dynamically. The root Stage is usually the browser window and its Frames represent sub pages or app screens. Frames can be exchanged within Stages using animated transitions like swipes, fades or 3D transitions. Stages and Frames can be nested such that a slider can exists within an animated frame. Frames can be placed on overlapping layers allowing effects like floating menus or parallax backgrounds.

layerJS supports directional touch and touchpad gestures to trigger transitions.  Use your fingers to pull down menus or swipe through a list of sub pages. Transitions can further be triggered through API calls or above mentioned links.

Check out the [Wiki](https://github.com/layerJS/layerJS/wiki) for more details and examples.

## Quickstart ##

layerJS can be included into your site from our CDN. Simply include the following tags into the head of your HTML document.
```
<script src="http://cdn.layerjs.org/libs/layerjs/layerjs-0.3.0.js"></script>
<link href="http://cdn.layerjs.org/libs/layerjs/layerjs-0.3.0.css" type="text/css" rel="stylesheet" />
```
If you would like to use the libraries locally, you can download the pre-build archives in the
[releases](https://github.com/layerJS/layerJS/releases) section. Extract the zip file. In your HTML, link the layerjs.js and the layerjs.css.

In layerJS you will define stages, layers in frame simply by adding HTML-attributes to `<div>`s. Here is an example structure:
```
<div data-lj-type="stage">
    <div data-lj-type="layer" data-lj-default-frame="main" >
        <div data-lj-type="frame" >
            … your HTML code …
        </div>
    </div>
</div>
```
The following example HTML document will create a slider that can be controlled by two links at the bottom:
```
<html>
<head>
  <script src="http://cdn.layerjs.org/libs/layerjs/layerjs-0.3.0.js"></script>
  <link href="http://cdn.layerjs.org/libs/layerjs/layerjs-0.3.0.css" type="text/css" rel="stylesheet" />
</head>
<body>
  <div lj-type="stage" style="width:100%;height:500px">
    <div lj-type="layer" lj-default-frame="frame1">
      <div lj-type="frame" lj-name="frame1">
        ... content of frame 1 ...
      </div>
      <div lj-type="frame" lj-name="frame2">
        ... content of frame 2 ...
      </div>
    </div>
  </div>
  <a href="#frame1">Frame 1</a>
  <a href="#frame2">Frame 2</a>
  <script>
    layerJS.init();
  </script>
</body>
</html>
```
The example first includes the library from our CDN, then a structure of two frames inside a single stage with `width:100%`and `height:500px` is defined. This becomes the slider. Below that to links are included that link to `#frame1` and `#frame2` which will trigger transitions to frame1 and frame2, respectively.
In the last part the library is actually initialized using `layerJS.init()`.

## Issues, bug reports and feature requests ##

If you experience any issues or bugs using layerJS or you would like to request features, please let us know through bitbucket [issue tracking](https://github.com/layerJS/layerJS/issues). This issue tracker is open to everyone so we encourage discussion on all issues.

## How to contribute ##

Contributions to layerJS are more than welcome. Get in touch with us at [developers@layerjs.org](mailto:developers@layerjs.org) and discuss your ideas. You can also fork the repository and start building.

layerJS uses a contribution agreement to be able to republish code under future licenses if necessary:
[layerJS contribution agreement](https://bitbucket.org/layerjs/layerjs/wiki/Contribution.md)

[Learn more about Harmony agreements.](harmonyagreements.org)
