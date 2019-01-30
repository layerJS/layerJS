# Introduction #

[![Join the chat at https://gitter.im/layerJS/layerJS](https://badges.gitter.im/layerJS/layerJS.svg)](https://gitter.im/layerJS/layerJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[layerJS.org](https://layerjs.org) is an open source Javascript UI/UX library allowing intuitive, visually intense, mobile app-like experiences for web apps and websites. 

UX patterns like menus, sliders, layers & light boxes, parallax effects, page-swipes, zoom effects, etc. are really just interactive animated layers. layerJS provides one simple universal concept to create such patterns in pure HTML: the Stage-Frame concept. Frames are containers that contain your content, e.g. sub pages, screens, menu panes, lightboxes, cards, slides, etc. Stages are viewports into which the frame content is dynamically fit. The root Stage is usually the browser window and its Frames represent sub pages or app screens. Frames can be exchanged within Stages using animated transitions like swipes, fades. Stages and Frames can be nested, so in an app screen(frame) a slider(stage) can exist which contains a set of slides (frames). Stages can have one or more overlapping layers with different frames, allowing effects like floating menus or parallax backgrounds.

layerJS’ concept resembles the principles of material design. In particular, layerJS’ frames are the papers/surfaces in material design. The stages are a convenient way to define the layout and the principal movements of the surfaces. With stages, animated transitions of the user interface can simply be defined by which frame should be shown in which stage in the next step.

Transitions are triggered through plain HTML links which simply name the frame which should be navigated to. layerJS also supports directional touch and touchpad gestures to trigger transitions. Use your fingers to pull down menus or swipe through a list of sub pages. Transitions can also be triggered through the API.

Watch this animation on how it works: [https://layerjs.org/#explain-animation](https://layerjs.org/#explain-animation)


## Quickstart ##

layerJS can be included into your site from our CDN. Simply include the following tags into the head of your HTML document.
```
<script src="http://cdn.layerjs.org/libs/layerjs/layerjs-0.6.1.min.js"></script>
<link href="http://cdn.layerjs.org/libs/layerjs/layerjs-0.6.1.css" type="text/css" rel="stylesheet" />
```

In layerJS you will define stages, layers and frames simply by adding HTML-attributes to `<div>`s. Here is an example structure:
```
<div data-lj-type="stage">
    <div data-lj-type="layer" data-lj-default-frame="main" >
        <div data-lj-type="frame" >
            … your HTML code …
        </div>
    </div>
</div>
```
Find examples and live demos on our project website [layerjs.org](http://layerjs.org/examples.html). 

Check out the [Wiki](https://github.com/layerJS/layerJS/wiki) for more details. 

## Issues, bug reports and feature requests ##

If you experience any issues or bugs using layerJS or you would like to request features, please let us know through bitbucket [issue tracking](https://github.com/layerJS/layerJS/issues). This issue tracker is open to everyone so we encourage discussion on all issues.

## How to contribute ##

Contributions to layerJS are more than welcome. Get in touch with us at [developers@layerjs.org](mailto:developers@layerjs.org) and discuss your ideas. You can also fork the repository and start building.

layerJS uses a contribution agreement to be able to republish code under future licenses if necessary:
[layerJS contribution agreement](https://github.com/layerJS/layerJS/blob/master/CONTRIBUTING.md)

[Learn more about Harmony agreements.](http://harmonyagreements.org)
