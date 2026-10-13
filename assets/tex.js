/* ============================================================
   tex.js — offline LaTeX typesetting for the course pages
   ------------------------------------------------------------
   KaTeX is vendored locally (assets/katex/), so this needs no
   network at all. Any element marked `.tex` is rendered from the
   LaTeX source held in its own text:

     <div class="formula tex">y - y_1 = m(x - x_1)</div>   display
     <span class="m tex">y = 2x - 1</span>                 inline

   If KaTeX cannot parse something the source text is left visible
   (styled as code) and a warning is logged — a page never goes blank.

   Rendering is re-run on DOM mutation, so maths injected later by the
   animated boards is typeset too.
   ============================================================ */
(function () {
  "use strict";

  if (!window.katex) { return; }

  var BASE = {
    throwOnError: false,
    strict: false,
    trust: false,
    output: "html",
    /* a few shorthands the course uses over and over */
    macros: {
      "\\tg": "\\tan",
      "\\degrees": "^\\circ",
      "\\vect": "\\mathbf{#1}"
    }
  };

  function opts(display) {
    var o = {}, k;
    for (k in BASE) if (Object.prototype.hasOwnProperty.call(BASE, k)) o[k] = BASE[k];
    o.displayMode = !!display;
    return o;
  }

  function renderEl(el) {
    if (el.getAttribute("data-texed") === "1") return;
    var src = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (!src) return;
    el.setAttribute("data-texed", "1");
    var display = el.tagName === "DIV" || el.tagName === "P" ||
      el.classList.contains("disp");
    try {
      el.innerHTML = window.katex.renderToString(src, opts(display));
      el.classList.add("texed");
    } catch (e) {
      el.classList.add("tex-fail");
      if (window.console && window.console.warn) {
        window.console.warn("tex failed: " + src + "  \u2014 " + (e && e.message ? e.message : e));
      }
    }
  }

  function render(root) {
    var host = root || document;
    if (!host.querySelectorAll) return;
    var list = host.querySelectorAll(".tex");
    for (var i = 0; i < list.length; i++) renderEl(list[i]);
  }

  function boot() {
    render(document);
    if (!window.MutationObserver) return;
    var pending = 0;
    new window.MutationObserver(function (records) {
      var hit = false;
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.addedNodes && r.addedNodes.length) { hit = true; break; }
      }
      if (!hit) return;
      window.clearTimeout(pending);
      pending = window.setTimeout(function () { render(document); }, 60);
    }).observe(document.body || document.documentElement,
      { childList: true, subtree: true });
  }

  /* expose it so other scripts can typeset after injecting markup */
  window.WB = window.WB || {};
  window.WB.tex = { render: render, renderEl: renderEl };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
