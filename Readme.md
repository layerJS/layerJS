# Introduction #

[![Join the chat at https://gitter.im/layerJS/layerJS](https://badges.gitter.im/layerJS/layerJS.svg)](https://gitter.im/layerJS/layerJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

layerJS is an open source Javascript UI/UX library allowing intuitive, visually intense, mobile app-like experiences for web apps and websites.

layerJS follows the idea that any kind of interactive web content is composed of media elements on moving layers. Unlike existing UI frameworks, layerJS does not provide various UI elements (use your favorite framework for that) but focusses on how larger blocks are put together to form websites and apps and how these blocks will behave upon user interaction.

layerJS introduces the Stage-Frame concept. Frames are defined HTML fragments of your site - like sub pages, menues, cards, lightboxes or layers - that can be dynamically fit into Stages (viewports). The root Stage is usually the browser window and its Frames represent sub pages or app screens. Frames can be exchanged within Stages using animated transitions like swipes, fades or 3D transitions. Stages and Frames can be nested such that a slider can exists within an animated frame. Frames can be placed on overlapping layers allowing effects like floating menus or parallax backgrounds.

layerJS supports directional touch and touchpad gestures to trigger transitions.  Use your fingers to pull down menus or swipe through a list of sub pages. Transitions can also be triggered through plain HTML links or through the API.

## Quickstart ##

layerJS can be included into your site from our CDN. Simply include the following tags into the head of your HTML document.
```
<script src="http://cdn.layerjs.org/libs/layerjs/layerjs-0.5.2.min.js"></script>
<link href="http://cdn.layerjs.org/libs/layerjs/layerjs-0.5.2.css" type="text/css" rel="stylesheet" />
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
