(function(doc, win) {
  var template_3 = '<div class="annotation"></div><div class="anno-lines"></div><div class="anno-code"></div>';
  var template_2 = '<div class="annotation"></div><div class="anno-lines"></div><div class="anno-code"></div>';
  var separator = '(?:\\s+\/\/|\/\/\\s+|\\s*<\\!--|\\s*&lt;!--)';
  var endseparator = '(?:-->\\s*|--&gt;\\s*)';
  var listen_blocks = [];
  var apply_create = function(anno_block, template) {
    var anno_blocks;
    if (anno_block instanceof HTMLElement) {
      anno_blocks = [anno_block];
    } else {
      anno_blocks = doc.querySelectorAll('[data-annotate]'); // blocks to be annotated;
    }
    var pre_docu = '';
    for (var i = 0; i < anno_blocks.length; i++) {
      var anno = anno_blocks[i];
      console.log('apply_create', anno.id);
      var templ = template;
      if (!templ) {
        var templ_attr = anno.getAttribute('data-annotate');
        switch (templ_attr) {
          case '3-col':
            templ = template_3;
            break;
          case '2-col':
            templ = template_2;
        }
      }
      if (!templ) {
        if (!anno.querySelector('.annotation') || !anno.querySelector('.anno-code')) {
          templ = template_2;
        }
      }
      var anno_lang = anno.getAttribute('data-annotate-lang');
      var pre = anno.querySelector('pre');
      anno.removeChild(pre);
      if (typeof templ === 'string' && templ) {
        anno.innerHTML = templ;
      } else if (templ instanceof HTMLElement) {
        anno = templ;
      }
      var col_anno = anno.querySelector('.annotation');
      var col_lines = anno.querySelector('.anno-lines');
      var col_code = anno.querySelector('.anno-code');
      var lines = pre.innerHTML.split(/\n/);
      var linenr = 0;
      while (lines.length) {
        var l = lines.shift();
        l = l.replace(RegExp(endseparator + "$"), '');
        var segments = l.split(RegExp(separator + "\\s*"), 2);
        if (segments[0].match(/^\s*$/) && segments[1]) {
          pre_docu += segments[1] + "\n";
          continue;
        }
        var line_anno = doc.createElement('div');
        line_anno.innerHTML = pre_docu + (segments[1] ? segments[1] : (pre_docu ? '' : '&nbsp;'));
        col_anno.appendChild(line_anno);
        var line_code = doc.createElement('pre');
        line_code.style.display = 'flex';
        var parts = segments[0].split(/^(\s*)/);
        var code = '';
        if (parts[1]) {
          code = '<span style="flex: 0 0 ' + (parts[1].length) + 'ex;white-space:pre">' + parts[1] + "</span>";
        }
        code += "<span" + (anno_lang ? ' class="' + anno_lang + '"' : '') + ">" + (parts[parts.length - 1] || "&nbsp;") + "</span>";
        line_code.innerHTML = code;
        col_code.appendChild(line_code);
        // support for code highlighting
        if (typeof hljs !== "undefined") {
          hljs.highlightBlock(line_code.querySelectorAll('span')[parts[1] ? 1 : 0]);
        }
        if (col_lines) {
          var line_lines = doc.createElement('pre');
          line_lines.innerHTML = ++linenr;
          col_lines.appendChild(line_lines);
        }
        pre_docu = '';
      }
      listen_blocks.push(anno);
      (function(a) { // need to save anno in a local variable (a) as otherwise it will point to another anno as it changes in the loop
        setTimeout(function() {
          apply_format(a, 0);
        }, 1);
      })(anno);
    }
  };
  var apply_format = function(anno, call) {
    var helper;
    console.log('apply_format', anno.id, call);
    if (!call && anno._anno_apply) { // ignore new calls of apply_format if a former call is still in the setTimeout phase.
      return;
    }
    anno._anno_apply = true;
    var chld_anno = anno.querySelector('.annotation').children;
    var chld_lines = anno.querySelector('.anno-lines') ? anno.querySelector('.anno-lines').children : undefined;
    var chld_code = anno.querySelector('.anno-code').children;
    for (var i = 0; i < chld_anno.length; i++) {
      var h_anno = chld_anno[i].clientHeight - (parseInt(chld_anno[i].style['padding-bottom']) || 0);
      var h_code = chld_code[i].clientHeight - (parseInt(chld_code[i].style['padding-bottom']) || 0);
      var max = Math.max(h_anno, h_code);
      if (!max) { // NaN or 0
        if (call > 3 && !anno._anno_parent) {
          // if element is hidden we'll never get a height; so copy to tranparent helper and render
          helper = doc.createElement('div');
          helper.style.opacity = 0;
          helper.style['pointer-event'] = 'none';
          anno._anno_parent = anno.parentNode;
          anno._anno_next = anno.nextSibling;
          doc.body.appendChild(helper);
          helper.appendChild(anno);
        }
        setTimeout(function() {
          apply_format(anno, ++call);
        }, 1);
        return;
      }
      chld_anno[i].style['padding-bottom'] = (max - h_anno) + 'px';
      chld_code[i].style['padding-bottom'] = (max - h_code) + 'px';
      if (chld_lines) {
        var h_lines = chld_lines[i].clientHeight - (parseInt(chld_lines[i].style['padding-bottom']) || 0);
        chld_lines[i].style['padding-bottom'] = (max - h_lines) + 'px';
      }
    }
    if (anno._anno_parent) { // copy anno back to original DOM position
      helper = anno.parentNode;
      if (anno._anno_next) {
        anno._anno_parent.insertBefore(anno, anno._anno_next);
      } else {
        anno._anno_parent.appendChild(anno);
      }
      delete anno._anno_parent;
      delete anno._anno_next;
      helper.parentNode.removeChild(helper);
    }
    delete anno._anno_apply;
  };
  switch (document.readyState) {
    case 'loading':
      doc.addEventListener('DOMContentLoaded', function() {
        apply_create();
      });
      break;
    default:
      apply_create();
  }

  // throttling resize events
  var running = false;
  var func = function() {
    if (running) {
      return;
    }
    running = true;
    requestAnimationFrame(function() {
      win.dispatchEvent(new CustomEvent('slowResize'));
      running = false;
    });
  };
  win.addEventListener('resize', func);

  // handle resize event
  win.addEventListener("slowResize", function() {
    for (var i = 0; i < listen_blocks.length; i++) {
      apply_format(listen_blocks[i], 0);
    }
  });
})(document, window);
