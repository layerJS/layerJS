# Scrolling
Scrolling within a frame will occur when the stage dimensions are to small for the frame. This will indirect be the result of the "data-wl-fit-to" attribute that is placed on the frame. In layerjs their are 2 way that you can scroll, native and non-native. This is configured trough the layer's attribute "data-wl-native-scroll".

When a transition is happening, layerjs will take the scroll position of the current frame into account when the new frame is sliding in. This way the transition will look smooth and natural.

## Native Scrolling
Native scrolling will let the browser be responsible to do the scrolling. The browser will put a scrollbar on the frame in order to make it possible to scroll in the frame.

```
<div data-wl-type="stage">
  <div data-wl-type="layer" data-wl-default-frame="frame1" data-wl-native-scroll="true">
      <div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="width" style="width:600px; height:600px"> But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure? </div>    
  </div>
</div>
```

Behind the scenes, layerjs will actually wrap the frame in a scroller div. This is done automatically, but you can also manually add this scroller div.

```
<div data-wl-type="stage">
  <div data-wl-type="layer" data-wl-default-frame="frame1" data-wl-native-scroll="true">
    <div data-wl-helper="scroller">
      <div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="width" style="width:600px; height:600px"> But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure? </div>  
  </div>
</div>
```

## Non-native Scrolling
In non-native scrolling, layerjs will take full responsibility of the scrolling mechanisme. In this mode, no scrollbar will be available to scroll. layerjs will actually change the position of the current frame to mimic a scroll behaviour.

```
<div data-wl-type="stage">
  <div  data-wl-type="layer" data-wl-default-frame="frame1" data-wl-native-scroll="false">
    <div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="width" style="width:600px; height:600px"> But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure? </div>
  </div>
</div>
```
