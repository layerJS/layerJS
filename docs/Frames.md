# Frames

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="width" data-wl-start-position="top"
data-wl-neighbors.b="frame2">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget est sed odio facilisis dapibus at ut nisl. Quisque purus mi, laoreet nec orci in, finibus finibus metus. Maecenas vel pretium dolor.
  </div>
```

## data-wl-type
This property defines the role of the div within layerjs. To create a frame you must specify the type as "frame".

## data-wl-name
Here you can define a name for the frame so layerjs can identify frames.

## data-wl-fit-to
Because the dimensions of the frame doesn't always match the dimensions of the frame, we can specify which fitting strategy it used to adapt the frame to his stage. It's default value is "width".
- Scale
- Elastic
- Responsive
- Fixed

### Scale
The frame is scaled such that the frame width fits the stage width, for "width" or the frame height fits the stage height for "height". The other frame dimension is scaled accordingly and hence can be smaller or larger than the corresponding dimension of the stage. if longer, this leads to a scrollable frame in that direction.

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="width"/>

<div data-wl-type="frame" data-wl-name="frame2" data-wl-fit-to="height"/>
```

### Elastic
For elastic fitting frames have kind of margin areas which contain dispensable content. The fitting function will try to keep the scale at 1 if that can be done by placing the border inside the margin areas. If the border would be inside the relevant area, the frame would be scaled to fit the inner margin border into the stage. if the border would be outside, the frame is scaled to fit the outer margin border into the stage. This is done for the width or the height for "elatic-width" or "elastic-height", respectively.

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="elastic-width"/>

<div data-wl-type="frame" data-wl-name="frame2" data-wl-fit-to="elastic-height"/>
```

The frame properties "data-wl-elastic_left", "data-wl-elastic_right", "data-wl-elastic_top", "data-wl-elastic_bottom" specify the margins and can be all different or even be 0. if the counterparts (e.g. left & right) are different and the fitting works in the non-scaling range, the borders are placed at the same percentage for both margins (e.g. 40% of the left margin & 40% of the right margin).

![elastic] (elastic.gif)

With elastic-left=0 and elastic-right=50 this essentially works like a regular div with min-width="width"-50px and max-width="width" but with scaling when it hits the max/min.

### Responsive
The frame will get the same width/height as the stage and no scaling will happen.

A "responsive-width" value will give the frame width  the same as the stage width. The height will be defined elsewhere and may lead to scrolling. A "responsive-height" value will give the frame the same as the stage height A "responsive" value will give the frame the same width and height as the stage.

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="responsive-width"/>

<div data-wl-type="frame" data-wl-name="frame2" data-wl-fit-to="responsive-height"/>

<div data-wl-type="frame"data-wl-name="frame3" data-wl-fit-to="responsive"/>
```

### Fixed
"fixed" means that width and height are fixed and scrolling will happen in both x and y direction if the stage is smaller than the frame.

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-fit-to="fixed"/>
```

## data-wl-start-position
This attribute becomes relevant if the non-fitted dimension is shorter or longer than the stage. In that case the first or the last border (e.g. for width fitting top or the bottom border) will touch the first or last border of the stage (i.e. the top or bottom border of the stage).
- Possible values
  - "top": align top border of frame with top border of stage (also if frame height is smaller than stage height); applies to width fitting
  - "bottom": align bottom borders (analogous to above)
  - "center": center vertically (for frame heights smaller or larger than stage heights)
  - "left": align left border of frame with left border of stage (otherwise as above); applies to height fitting
  - "right": analogous to above
  - "center": center horizontally
  - "xx%": position at xx% of frame height/width, depending on width/height fitting correspondingly 50% is the same as middle/center  
  - "xx": position at xx pixels from top/left depending on width/height fitting correspondingly.

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-start-position="center"/>
```

## data-wl-neighbors ##
When you scroll or swipe in a frame and you hit the border of that frame, the layer can transition to an other frame. These frames are called neighbors. A frame can have 4 neighbors.

  - neighbors.b = Up direction
  - neighbors.t = Down direction
  - neighbors.l = Right direction
  - neighbors.r = Left direction

```
<div data-wl-type="frame" data-wl-name="frame1" data-wl-neighbors.b="frame2" data-wl-neighbors.t="frame3" data-wl-neighbors.l="frame3" data-wl-neighbors.r="frame4">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget est sed odio facilisis dapibus at ut nisl. Quisque purus mi, laoreet nec orci in, finibus finibus metus. Maecenas vel pretium dolor.
  </div>
```
