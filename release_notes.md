# Release notes #

## New in 0.6.2

 * frame neighbors can now take hashrouter routes, so multiple transitions can be triggered by a gesture. Note: you need to specify the transition type manually, it will not be determined from the gesture direction as when only the framename is specified
 * fixed: loadFrame doesn't need to wait for next render
 * canvaslayout: currentFrame positions are corrected before transition, if the whole canvas layout layer wasn't shown before.
 * allow scrolling to an element
 * added transition option "ScrollIfNeeded"
 * fix: autoheight/autowidth didn't always work as css style was missing "px" unit
 * fix: allowing autoheight+ autowidth at the same time; 
 * fixing wrong throwing behaviour for fitting and autolength mode

## New in 0.6.1

 * fixed: when switching from a repsonsive fitting mode back to another fitting mode that is based on the original frame width/height, the width/height of the responsive frame was kept. This was a problem for example when switching from fixed to responsive and back depending on mediaquery. 

## New in 0.6.0

 * introducing CSS custom properties. Most layerJS attributes can now be configured as custom CSS properties starting with '--lj-'. This allows responsive behaviour with mediaqueries. https://blog.logrocket.com/custom-responsive-behaviour-using-custom-css-properties-14e2ed8a578f

## New in 0.5.3

 * new slide layout transition types: inouttop, inoutleft, inoutright, inoutbottom: will transition in and out at the same side
 * autoWidth/autoHeight: now you can provide a simple "true" which will just adapt stage dimensions to first layer frames
 * added special frame "!toggle" which will set the !none frame if a there is a current acgtive frame or the first frame if the current frame is !none. Useful for collapsibles together with autoHeight
 * added "scrolled" event which fires upon scrolling in native and transform scrolling modes
 * filerouter: the title tag is now read from the loaded document and set to the current page
 * fix: linking to anchors from external did not work (issue #79)
 * fix: when transition was disrupted by external scripts the transitionEnd handling wasn't called which lead to incorrect scroll borders (issue #76)
 * fix: margin was not considered when setting width and height in responsive modes
 * fix: target attribute for links was ignored (issue #75)


## New in 0.5.2

 * fix: interstage: calculate pre-position correctly if 3d transform is applied (using 3d matrix)
 * filerouter & state: minimized state now distinguishes between relevant state, default state and omitted state
 * filerouter: scripts in loaded sub pages are now executed
 * linking to new sub page (filerouter) and using scroll anchor (hashrouter) now works simultaneously
 * defaults are available in layerJS.default
 * layerJS.defaults.defaultDuration can be set (default duration of transitions)
 * fix: frame length was possibly wrongly determined when wrapping occurs in native scrolling

## New in 0.5.1

 * layerjs will inialize on its own (no layerJS.init() necessary)
 * creating minified version of layerJS with closure compiler
 * fix: update classes is now also fired in all interstage transitions

## New in 0.5.0

 * interstage transitions. you can send frames between stages using otherlayer.frameName
 * state now also contains inactive frames with a trailing '$'
 * interstage transitions can also work with inactive frames
 * showframe and scrollto now use generic transitionTo
 * now each frame has its own transitionEnd. this allows transforms on other frames already be started while the first one is ending.
 * refactored registration of view in state

## New in 0.4.4
 * The layer now has a transition queue. Events and transition are now getting queued. This gets a more defined behavior if gestures/trigger overlap. The queue is freed after the "transitionPrepared" event is triggered.
 * Refactoring showFrame and scrollTo methods of a layer. Both now use the transitionTo method for showing frames and scrolling. This also puts them into the queue
 * Filerouter is disabled by default. To enable add `lj-router="filerouter"` to the body of the HTML document.
 * Fixes for swipping left/right caused by the history button on chrome Mac. (fix of 0.4.3 fix)
 * Fixed the detection of innerscrolling (scrollable containers within a frame). (fix of 0.4.3 fix)
 * A `lj-nolink` attribute can be added to anchor tags. When true the links will be ignored by the router(s).

## New in 0.4.3
* fix scrolling on IOS devices. Basically native scrolling for divs wasn't working. Also inertial scrolling was not working.

## New in 0.4.2
* Refactored how layerJS keeps track of it's internal state.
* The page url gets calculated when the state of the page changes. Default frames will not be shown in the url.
* Added a public method "navigate" on the router that can be used to navigate.
* Refactored the caching mechanism on the FileRouter.
* The "stateChanged" event will only be triggered when there is a difference between the previous and current state and also when all layers have started the transition.
* Showing multiple frames at once is done synchronized.
* Fixed a bug that removed the hash part of the url when the page reloaded.
* Will scroll smoothly to an anchor tag.
* inertia (kinetic) scrolling on nested elements now works in IOS
* optimized scrolling for nested layers
* On startup the frames are just getting showed instead of transitioned.
* UrlData has been removed.
* The width and height of a frame now includes the margin.

## New in 0.4.1
* allow specifying the default transition type on the frame or layer (HTML attribute lj-transition).
* allow specifying the reverse transition by prepending "r:" to the transition type
* refactored slide transition code. Now a transition is composed of an "in" and an "out" part. This makes it easy to calculate the reverse transitions. Make code more compact.
* synchronized multi frame transitions. if two frames (in two layers) were transitioning in parallel, there could be out of sync if one frame was already present while the other still had to be loaded.
* new event "transitionPrepared" which is triggered right before the actual animation starts
* new lj-startPosition options (top-left, top-right, top-center, middle-left, etc.) for initial positioning of frame in stage
* fixed a bug where the router could trigger click handlers twice on links
* fixed issue in transition To where the transition end wasn't detected if the transition was triggered twice (through double click on link)
* fixed an issue in Firefox where touch pad swipe gestures where not reliably detected.
* fixed elastic fitting
* allow using lj-layout (instead of lj-layout-type) for setting layer layout
* fixed a bug that scrolled to top if '#'-link was clicked
* moved ./dist/css/layerjs.css -> ./dist/layerjs.css
* remove some old unnecessary code

## New in 0.4
* The framework has been simplified. Only the stage, layer and frame views are left.
* A new system has been put into place to detect modifications on the actual DOM element (attribute changes, new children) and on it's size. When modifications are detected an event is triggered.
* Added new events on the views
    * sizeChanged
    * attributesChanged
    * renderRequired
* When no `lj-name` attribute is specified, an unique name gets generated.
* The npm scripts now work on both Windows and Unix like systems.
* The mouse drag has been disabled.
* When transitioning to the same frame, the frame will move up (or down depending on the transition parameters) using an animation. This works in both native and non-native scrolling.
* The `transitionTo()` method of the layerView now also accepts a specific startPosition or scroll positions (scrollX & scrollY).
* A `scrollTo()` method  has been added to the layerView. This method can be used to manipulate the scrolling of the current frame. It accepts a specific startPosition or scroll positions (scrollX & scrollY).
* The fileRouter now has a cache. It will only do an HTMLHttpRequest for pages that haven't been loaded (cached) yet.

## New in 0.3
* A router module has been added to handled link clicks.
 * Static routes can be registered in the router module.
 * a Filerouter will handled links that will point to an external (layerJS) document.
 * a Hashrouter will handle links that contain a hash (#).
* Transition parameters can be passed in as parameters in a link.
* A State object has been added to keep track of the current state of the HTML document. The state describes which frame is active in which layer (and stage).
* A layerView can now switch layout at runtime using the `switchLayout()` method.
* A layerView can now switch between native scrolling and transform scrolling in runtime  using the `switchScrolling()` method.
* The WL namespace has been renamed to layerJS and attributes are now prefixed with `data-lj-*` instead of `data-wl-*`.
* `lj-*` attributes are also accepted
* A fade transition has been added to the slidelayout
* A layerView can now transitionTo/show a `null` frame. In the browser this will be shown as an empty frame.
* A layerView will now expose beforeTransition, transitionStarted and transitionFinished events when a transition is invoked.
* The framework will detect size changes and will adapt the current frames.
* ObjData, GroupData, FrameData, LayerData and StageData have been removed and replaced with a NodeData object.
* View objects now have a static property that will provide default data that can be used to create a NodeData objects.
* View objects now have a static method that can be used to detect if an HTML-tag is of a specific View.
