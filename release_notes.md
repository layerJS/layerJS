# Release notes #

## New in 0.4
* The framework has been simplified. Only the stage, layer and frame views are left.
* A new system has been put into place to detect modifications on the actual DOM element (attribute changes, new children) and on it's size. When modifications are detected an event is triggered.
* Added new events on the views
    * sizeChanged
    * attributesChanged
    * renderRequired
* When no `lj-name` attribute is specified, an unique name gets generated.
* The mouse drag has been disabled.
* When transitioning to the same frame, the frame will move up (or down depending on the transition parameters) using an animation. This works in both native and non-native scrolling.
* The `transitionTo()` method of the layerView now also accepts a specific startPosition or scroll positions (scrollX & scrollY).
* A `scrollTo()` method  has been added to the layerView. This method can be used to manipulate the scrolling of the current frame. It accepts a specific startPosition or scroll positions (scrollX & scrollY).
* The fileRouter now has a cache. It will only do an HTMLHttpRequest for pages that haven't been loaded (cached) yet.
