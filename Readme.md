# Introduction #

layerJS is an open source Javascript UI/UX library allowing intuitive, visually intense, mobile app-like experiences for web apps and websites. 

We believe that any kind of interactive web content can be created by placing media elements on moving layers. Unlike existing UI frameworks layerJS does not provide various UI elements (use your favorite lib for that) but focusses on how larger blocks are put together to form websites and apps.

layerJS introduces the Stage-Frame concept. Frames are arbitrary HTML fragments - the content of your site - that can be fit into Stages (viewports) dynamically. The root Stage is usually the browser window and its Frames represent sub pages or app screens. Frames can be exchanged within Stages using animated transitions like swipes, fades or 3D transitions. Stages and Frames can be nested such that a slider can exists within an animated frame. Frames can be placed on overlapping layers allowing effects like floating menus or parallax backgrounds.

layerJS supports directional touch and touchpad gestures to trigger transitions.  Use your fingers to pull down menus or swipe through a list of sub pages. Transitions can further be triggered through API calls or above mentioned links.

Check out the [Wiki](https://bitbucket.org/layerjs/layerjs/wiki/) for more details.

## Quickstart ##

Download [layerJS](https://bitbucket.org/layerjs/layerjs/downloads). Extract the zip file. In your HTML, link the layerjs.js and the layerjs.css.

```
<link rel="stylesheet" type="text/css" href="/path/to/layerjs.css">
<script src="/path/to/layerjs.js"></script>
```

In the simplest case layerJS will fit a frame which exists on a layer into a single stage
```
<div data-wl-type="stage">
    <div data-wl-type="layer" data-wl-default-frame="main" >
        <div data-wl-type="frame" data-wl-name="main" data-wl-fit-to="width" data-wl-startPostion="top" width="1440">
            … your HTML code …
        </div>
    </div>
</div>
```

The above example will fit the fixed-width frame 'main' into the stage (whose site can be set by regular CSS) by scaling it such that the frame's width fits the stage's width. There is many other fitting types available.

In the above example layerJS wouldn't support any transitions between frames until there is another frame available in the same layer:

```
<div data-wl-type="stage">
    <div id="layer1" data-wl-type="layer" data-wl-default-frame="main" >
        <div data-wl-type="frame" data-wl-name="main" data-wl-fit-to="width" data-wl-start-postion="top" width="1440">
            … your HTML code for frame 'main'…
        </div>
        <div data-wl-type="frame" data-wl-name="second" data-wl-fit-to="width" data-wl-start-postion="top" width="1440">
            … your HTML code for frame 'second'…
        </div>
    </div>
</div>
```

layerJS can now be used to trigger transitions between the two frames:
```
WL.init();
WL.select('#layer1').transitionTo('second',{type: 'left'});
```

above code example will trigger a 'swipe left' transition between the two frames.


## How to build ##

Building layerjs requires nodejs and npm. Necessary node packages can be installed by following these simple instructions:

Open a console/command line (for example: command prompt (CMD) or Terminal).

Install mercurial (if you haven't already) and clone the repository with the following command:

```
hg clone https://bitbucket.org/layerjs/layerjs
```
you can also use other programs like Sourcetree to clone the directory.

Navigate to the layerJS folder: 
```
cd layerjs
```
Enter the command:
```
npm install
```
and press Enter.

At the end of the installation, in order to start The build process, 

enter the command:
```
npm run build
```
which automatically runs all unit tests via `npm test`. The result can be found in the `./dist` directory.

## More examples ##

Check out the `./examples` directory in the package to find more examples on how to use layerjs.

## Issues, bug reports and feature requests ##

If you experience any issues or bugs using layerJS or you would like to request features, please let us now through bitbucket [issue tracking](https://bitbucket.org/layerjs/layerjs/issues?status=new&status=open). This issue tracker is open to everyone so we encourage discussion on all issues.

## How to contribute ##

layerJS is in alpha currently so things still change. It's best to get in contact with us at [developers@layerjs.org](mailto:developers@layerjs.org) and discuss your ideas.

Of course it is possible to fork the repo and submit pull requests.

In order to have your code included into the layerJS framework you need to sign our [Harmony Code Contribution agreement](https://bitbucket.org/layerjs/layerjs/wiki/Contribution.md) which allows us to additionally license layerJS under other license terms in future. [Learn more about Harmony agreements.](harmonyagreements.org)