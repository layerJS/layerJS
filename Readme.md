# Introduction #

layerJS is an open source Javascript UX (User Experience) library allowing intuitive, mobile app-like experiences for web apps and websites.

layerJS introduces the Stage-Frame concept. Frames are arbitrary HTML fragments - the content of your site - that can be fit into Stages (viewports) dynamically. The root Stage is usually the browser window and its Frames represent sub pages or app screens. Frames can be exchanged within Stages using animated transitions like swipes, fades or 3D transitions. Stages and Frames can be nested such that a slider can exists within an animated frame. Frames can be placed on overlapping layers allowing effects like floating menus or parallax backgrounds. 

layerJS has been developed as a lean library that goes out of your way when it is not needed. You can use any framework to build your website or app and just use layerJS to do the Frame transitions. layerJS also does not break the linking-paradigm of the web. Switching Frames within Stages changes the URL through the router. This also supports using relative links to trigger Frame transition.

layerJS supports directional touch and touchpad gestures to trigger transitions.  Use your finger to pull down menus or swipe through a list of sub pages. Transition can further be triggered through API calls or above mentioned links.

## Quickstart ##

In the simplest case layerJS will fit a frame which exists on a layer into a single stage
```
<div data-wl-type="stage">
    <div data-wl-type="layer" data-wl-defaultFrame="main" >
        <div data-wl-type="frame" data-wl-name="main" data-wl-fitTo="width" data-wl-startPostion="top" width="1440">
            … your HTML code …
        </div>
    </div>
</div>
```

The above example will fit the fixed-width frame 'main' into the stage (whose site can be set by regular CSS) by scaling it such that the frame's width fits the stage's width. There is many other fitting types available.

In the above example layerJS wouldn't support any transitions between frames until there is another frame available in the same layer:

```
<div data-wl-type="stage">
    <div id="layer1" data-wl-type="layer" data-wl-defaultFrame="main" >
        <div data-wl-type="frame" data-wl-name="main" data-wl-fitTo="width" data-wl-startPostion="top" width="1440">
            … your HTML code for frame 'main'…
        </div>
        <div data-wl-type="frame" data-wl-name="second" data-wl-fitTo="width" data-wl-startPostion="top" width="1440">
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

Building layerjs requires nodejs and npm. Necessary node packages can be installed using:
```
npm install
```

The build process can be started using
```
npm run build
```
which automatically runs all unit tests via `npm test`. The result can be found in the `./dist` directory.