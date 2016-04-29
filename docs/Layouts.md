# Layouts
How the layer renders and navigates to it's different frames is specified by the data-wl-layout-type attribute on the layer. At the moment, layerjs contains 2 different layouts that you can choose from.

## Slide
In the slide mode, only 1 frame at a time will be visible in the layer. When the layer does a transition to a different frame, this frame will "slide" in to stage from a specific direction. The exiting frame will "slide" out of the scope in the same direction the new frame is sliding in. This is the default layout in layerjs.

```
<div data-wl-type="stage">
  <div data-wl-type="layer" data-wl-default-frame="frame1" data-wl-layout-type="slide">
    <div data-wl-type="frame" data-wl-name="frame1" style="width:450px"> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea      takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. </div>
    <div data-wl-type="frame" data-wl-name="frame2" style="width:1440px"> But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder  of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure? </div>
  </div>
</div>
```

## Canvas
In the canvas mode, all frames are visible in the layer. When the layer transitions to an other layer, all frames will move in the same direction as the target frame. It will look like the complete layer is moved just to bring a specific frame into the stage.

```
<div id="root" data-wl-type="stage">
  <div data-wl-type="layer" data-wl-default-frame="frame1" data-wl-layout-type="canvas">
    <div data-wl-type="frame" data-wl-x="-300" data-wl-name="frame1"style="width:450px"> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. </div>
    <div data-wl-type="frame" data-wl-x="200" data-wl-y="100" data-wl-name="frame2" style="width:1440px"> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </div>
    <div data-wl-type="frame" data-wl-x="50" data-wl-y="10" data-wl-name="frame3"style="width:1440px" data-wl-scale-x="0.5" data-wl-scale-y="0.5" data-wl-rotation="30">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </div>
  </div>
</div>
```
