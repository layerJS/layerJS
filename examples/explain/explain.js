var animator = function(commands) {
  var f = function() {
    if (commands.length === 0) return;
    var command = commands.shift();
    var instruction = command.shift();
    var wait = command.shift();
    if (instruction === 'navigate') {
      layerJS.router.navigate(command[0]);
    }
    if (instruction === 'scroll') {
      var layer = document.querySelector(command[0])._ljView;
      if (layer && layer.scrollTo) {
        layer.scrollTo(command[1], command[2] || 0, {
          duration: command[3] + 's'
        })
      }
    }
    if (instruction === 'fadein') {
      document.querySelectorAll(command[0]).forEach(function(e) {
        e.style['transition'] = 'opacity ' + command[1] + 's';
        e.style['opacity'] = '1';
      })
    }
    if (instruction === 'fadeout') {
      document.querySelectorAll(command[0]).forEach(function(e) {
        e.style['transition'] = 'opacity ' + command[1] + 's';
        e.style['opacity'] = '0';
      })
    }
    if (instruction === 'text') {
      var t = document.querySelector('#explainer-text');
      t.style['transition'] = "opacity " + (command[1] || 0.25) + 's';
      t.style['opacity'] = "0";
      setTimeout(function() {
        t.innerHTML = command[0];
        t.style['opacity'] = "1";
      }, command[1] || 250)
    }
    if (instruction === '3d') {
      var w = document.querySelector('#window');
      w.style['transition'] = 'transform ' + command[1] + 's';
      document.querySelectorAll('[lj-type]').forEach(function(e) {
        e.style['transition'] = 'border ' + command[1] + 's';
      });
      if (command[0] === 'off') {
        w.className = "d3t"
        setTimeout(function() {
          w.className = "";
        }, command[1] * 1000)
      } else {
        w.className = "d3";
      }
    }
    setTimeout(f, wait * 1000);
  }
  f();
}
setTimeout(function() {
  animator([
    ['text', 0, '<b><span class="hlayer">layerJS</span></b> lets you animate your user interface in pure HTML and CSS.', 0],
    ['navigate', 1, '#mlayer.hmenu'],
    ['navigate', 1, '#clayer.content3'],
    ['scroll', 1, '#clayer', 0, 200, 1],
    ['navigate', 0, '#slayer.i3'],
    ['navigate', 3, '#mlayer.!none'],

    ['fadeout', 0, '#window', 0],
    ['fadeout', 0, '#stage', 0],
    ['fadeout', 0, '#stage>*', 0],
    ['scroll', 0, '#clayer', 0, 0, 0],
    ['navigate', 0, '#clayer.content1', 0],
    ['navigate', 0, '#slayer.i1'],

    ['text', 3, 'How does this work?', 0],
    ['fadein', 0, '#window', 0],
    ['text', 0, 'Let\'s start at the browser window and look at the user interface as 3D stacked layers', 0],
    ['3d', 5, 'on', 1],
    ['text', 2, 'Create a <span class="hstage">Stage</span> filling the whole window.', 0],
    ['fadein', 2, '#stage', 1],
    ['text', 2, 'Now add a <span class="hframe">Frame</span> for your first content page', 0],
    ['fadein', 3, '#stage>*', 1],
    ['text', 2, 'If you add more <span class="hframe">Frames</span> you can navigate at the page level', 0],
    ['navigate', 2, '#clayer.content2'],
    ['navigate', 2, '#clayer.content1&p=right'],
    ['navigate', 2, '#clayer.content2'],
    ['text', 2, 'Add <span class="hlayer">Layers</span> to create overlapping elements like menues or popups - which are also just <span class="hframe">Frames</span>', 0],
    ['navigate', 2, '#mlayer.hmenu'],
    ['navigate', 2, '#mlayer.menu'],
    ['navigate', 2, '#mlayer.!none'],

    ['text', 0, '<span class="hstage">Stages</span> can be everywhere in the document, not just at the body.', 0],
    ['navigate', 1, '#clayer.content3'],
    ['scroll', 5, '#clayer', 0, 200, 1],
    ['text', 1, '... so you can create navigation just where you need it.', 0],
    ['navigate', 1, '#slayer.i2'],
    ['navigate', 1, '#slayer.i3'],
    ['navigate', 1, '#slayer.i1'],

    ['text', 0, '<span class="hlayer">Layer layouts</span> lets you arrange <span class="hframe">Frames</span> differently, like in a grid.', 0],
    ['navigate', 4, '#clayer.content4'],
    ['text', 0, 'You can send <span class="hframe">Frames</span> to different <span class="hstage">Stages</span> to create even more engaging effects.', 0],
    ['navigate', 2, '#top.card2'],
    ['navigate', 2, '#canvas.card2$'],


  ]);
}, 3000);
