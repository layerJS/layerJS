# Release notes #

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
