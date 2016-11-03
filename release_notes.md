# Release notes #

## New in 0.2
* ObjData, GroupData, FrameData, LayerData and StageData have been removed and replaced with a NodeData object.
* View objects now have a static property that will provide default data that can be used to create a NodeData objects.
* View objects now have a static method that can be used to detect if an HTML-tag is of a specific View.
* A layerView can now switch layout in runtime  using the `switchLayout` method.
* A layerView can now switch between native scrolling and transform scrolling in runtime  using the `switchScrolling` method.
* A router modules has been added to handled link clicks.
 * Filerouter will handled links that will point to an extern document.
 * Hashrouter will handle links that contain a hash (#).
* Static routes can be registered in the router module.
* Transition parameters can be passed in as parameters in a link.
* The WL namespace has been renamed to layerJS and attributes are now prefixed with `data-lj-*` instead of `data-wl-*`.
* `lj-*` attributes are also accepted
* A fade transition has been added to the slidelayout
* A layerView can now transition/show a `null` frame. In the browser this will be shown as an empty frame.
* A State object has been added to keep track of the current state of the HTML document. The state describes which frame is active in which layer (and stage).
* A layerView will now expose beforeTransition, transitionStarted and transitionFinished events when a transition is invoked.
* The framework will detect size changes and will adapt the current frames.
