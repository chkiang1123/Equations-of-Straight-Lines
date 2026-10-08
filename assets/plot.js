/* ============================================================
   plot.js — tiny SVG plotting engine for the straight-line course
   Offline, dependency-free. All coordinates are maths coordinates;
   the Plot object converts to pixels.
   ============================================================ */
(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- number + algebra formatting ---------- */

  // format a number with the proper Unicode minus sign
  function nf(v, d) {
    if (d === undefined) d = 2;
    var r = Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
    if (Object.is(r, -0)) r = 0;
    var s = String(r);
    return s.replace(/-/g, "\u2212");
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }

  // reduce a/b to a pretty HTML fraction
  function fracHTML(a, b) {
    var s = (a < 0) !== (b < 0) ? "\u2212" : "";
    var A = Math.abs(a), B = Math.abs(b);
    var k = gcd(A, B);
    A /= k; B /= k;
    if (A === 0) return "0";
    if (B === 1) return s + A;
    return s + '<span class="frac"><span class="num">' + A + '</span><span class="den">' + B + "</span></span>";
  }

  // is x close to a small fraction? returns [a,b] or null
  function rat(x, maxDen, tol) {
    if (maxDen === undefined) maxDen = 12;
    if (tol === undefined) tol = 1e-9;
    for (var b = 1; b <= maxDen; b++) {
      var a = Math.round(x * b);
      if (Math.abs(x - a / b) < tol) return [a, b];
    }
    return null;
  }

  // HTML for "2x", "−x", "x", or "(2/3)x"
  function slopeCoeff(m) {
    if (m === 0) return "";
    var neg = m < 0, a = Math.abs(m), r = rat(a), body;
    if (a === 1) body = "x";
    else if (r && r[1] !== 1) body = fracHTML(r[0], r[1]) + "x";
    else body = nf(a) + "x";
    return (neg ? "\u2212" : "") + body;
  }

  // HTML for " + 3" / " − 4" / " + 2/3"
  function constTerm(c, withSign) {
    if (c === 0) return withSign === false ? "0" : "";
    var neg = c < 0, a = Math.abs(c), r = rat(a);
    var body = (r && r[1] !== 1) ? fracHTML(r[0], r[1]) : nf(a);
    return withSign === false ? (neg ? "\u2212" : "") + body : (neg ? " \u2212 " : " + ") + body;
  }

  // y = mx + c  (pretty HTML)
  function eqLine(m, c) {
    if (m === 0) return "y = " + nf(c);
    return "y = " + slopeCoeff(m) + constTerm(c);
  }

  // Ax + By + C = 0
  function eqGeneral(A, B, C) {
    function coef(v, varname, first) {
      if (v === 0) return "";
      var neg = v < 0, a = Math.abs(v);
      var r = rat(a), body;
      if (a === 1) body = varname;
      else if (r && r[1] !== 1) body = fracHTML(r[0], r[1]) + varname;
      else body = nf(a) + varname;
      if (first) return (neg ? "\u2212" : "") + body;
      return (neg ? " \u2212 " : " + ") + body;
    }
    var s = coef(A, "x", true);
    var b = coef(B, "y", false);
    s += b;
    if (C !== 0) { var last = coef(C, "", false); if (!b && !A) last = constTerm(C, false); s += last; }
    if (s === "") s = "0";
    return s + " = 0";
  }

  function setRangeFill(inp) {
    var min = +inp.min, max = +inp.max, v = +inp.value;
    inp.style.setProperty("--p", ((v - min) / (max - min) * 100) + "%");
  }

  function r2(x, p) { var k = Math.pow(10, p === undefined ? 2 : p); return Math.round(x * k) / k; }

  /* ---------- Plot ---------- */

  function Plot(svg, opt) {
    opt = opt || {};
    this.svg = svg;
    this.xmin = opt.xmin === undefined ? -10 : opt.xmin;
    this.xmax = opt.xmax === undefined ? 10 : opt.xmax;
    this.ymin = opt.ymin === undefined ? -8 : opt.ymin;
    this.ymax = opt.ymax === undefined ? 8 : opt.ymax;
    this.step = opt.step === undefined ? 1 : opt.step;
    this.stepX = opt.stepX === undefined ? this.step : opt.stepX;
    this.stepY = opt.stepY === undefined ? this.step : opt.stepY;
    this.labX = opt.labelStepX === undefined ? this.stepX : opt.labelStepX;
    this.labY = opt.labelStepY === undefined ? this.stepY : opt.labelStepY;
    this.w = opt.w === undefined ? 640 : opt.w;
    this.h = opt.h === undefined ? 440 : opt.h;
    this.pad = opt.pad === undefined ? 34 : opt.pad;
    this.showLabels = opt.labels !== false;
    this.noAxisLabels = !!opt.noAxisLabels;
    svg.setAttribute("viewBox", "0 0 " + this.w + " " + this.h);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  Plot.prototype.X = function (x) { return this.pad + (x - this.xmin) / (this.xmax - this.xmin) * (this.w - 2 * this.pad); };
  Plot.prototype.Y = function (y) { return this.h - this.pad - (y - this.ymin) / (this.ymax - this.ymin) * (this.h - 2 * this.pad); };
  Plot.prototype.invX = function (px) { return this.xmin + (px - this.pad) / (this.w - 2 * this.pad) * (this.xmax - this.xmin); };
  Plot.prototype.invY = function (py) { return this.ymin + (this.h - this.pad - py) / (this.h - 2 * this.pad) * (this.ymax - this.ymin); };

  // maths coords from a mouse/touch event
  Plot.prototype.fromEvent = function (e) {
    var r = this.svg.getBoundingClientRect();
    var cx = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) - r.left;
    var cy = (e.touches && e.touches[0] ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: this.invX(cx / r.width * this.w), y: this.invY(cy / r.height * this.h) };
  };

  Plot.prototype.reset = function () { this.svg.innerHTML = ""; this.grid(); return this; };

  Plot.prototype.grid = function () {
    var g = el("g", {}, this.svg), i;
    var n = 200;
    for (i = -n; i <= n; i++) {
      var x = i * this.stepX;
      if (x < this.xmin - 1e-9 || x > this.xmax + 1e-9) continue;
      if (Math.abs(x) < 1e-9) continue;
      el("line", { x1: this.X(x), y1: this.Y(this.ymin), x2: this.X(x), y2: this.Y(this.ymax), stroke: "var(--grid)", "stroke-width": 1 }, g);
    }
    for (i = -n; i <= n; i++) {
      var y = i * this.stepY;
      if (y < this.ymin - 1e-9 || y > this.ymax + 1e-9) continue;
      if (Math.abs(y) < 1e-9) continue;
      el("line", { x1: this.X(this.xmin), y1: this.Y(y), x2: this.X(this.xmax), y2: this.Y(y), stroke: "var(--grid)", "stroke-width": 1 }, g);
    }
    // axes
    var y0 = (this.ymin <= 0 && this.ymax >= 0) ? this.Y(0) : this.Y(this.ymin);
    var x0 = (this.xmin <= 0 && this.xmax >= 0) ? this.X(0) : this.X(this.xmin);
    el("line", { x1: this.X(this.xmin), y1: y0, x2: this.X(this.xmax), y2: y0, stroke: "var(--axis)", "stroke-width": 1.6 }, g);
    el("line", { x1: x0, y1: this.Y(this.ymin), x2: x0, y2: this.Y(this.ymax), stroke: "var(--axis)", "stroke-width": 1.6 }, g);

    if (this.showLabels) {
      for (i = -n; i <= n; i++) {
        var lx = i * this.labX;
        if (lx === 0 || lx < this.xmin - 1e-9 || lx > this.xmax + 1e-9) continue;
        if (this.noAxisLabels) break;
        el("text", { x: this.X(lx), y: y0 + 15, "text-anchor": "middle", "font-size": 10.5, fill: "var(--ink-3)" }, g).textContent = r2(lx, 2);
      }
      if (!this.noAxisLabels) {
        for (i = -n; i <= n; i++) {
          var ly = i * this.labY;
          if (ly === 0 || ly < this.ymin - 1e-9 || ly > this.ymax + 1e-9) continue;
          el("text", { x: x0 - 7, y: this.Y(ly) + 3.6, "text-anchor": "end", "font-size": 10.5, fill: "var(--ink-3)" }, g).textContent = r2(ly, 2);
        }
        el("text", { x: x0 - 9, y: y0 + 15, "text-anchor": "end", "font-size": 10.5, fill: "var(--ink-3)" }, g).textContent = "O";
      }
    }
    // arrow heads
    el("polygon", { points: this.X(this.xmax) + "," + y0 + " " + (this.X(this.xmax) - 8) + "," + (y0 - 4.5) + " " + (this.X(this.xmax) - 8) + "," + (y0 + 4.5), fill: "var(--axis)" }, g);
    el("polygon", { points: x0 + "," + this.Y(this.ymax) + " " + (x0 - 4.5) + "," + (this.Y(this.ymax) + 8) + " " + (x0 + 4.5) + "," + (this.Y(this.ymax) + 8), fill: "var(--axis)" }, g);
    el("text", { x: this.X(this.xmax) - 4, y: y0 - 10, "text-anchor": "end", "font-size": 12, fill: "var(--axis)", "font-style": "italic" }, g).textContent = "x";
    el("text", { x: x0 + 9, y: this.Y(this.ymax) + 12, "font-size": 12, fill: "var(--axis)", "font-style": "italic" }, g).textContent = "y";
    this.g = g;
    return g;
  };

  // a fresh overlay layer you can clear independently (e.g. a draggable point)
  Plot.prototype.layer = function (cls) {
    var g = el("g", { "class": cls || "layer" }, this.svg);
    this.lastLayer = g;
    return g;
  };

  // clip a line y = mx + c to the viewport and draw it
  Plot.prototype.line = function (m, c, o) {
    o = o || {};
    var col = o.color || "var(--brand)", wdt = o.width || 3, pts = [], x, y;
    for (var i = 0; i < 2; i++) {
      x = i === 0 ? this.xmin : this.xmax; y = m * x + c;
      if (y >= this.ymin - 1e-9 && y <= this.ymax + 1e-9) pts.push([x, y]);
    }
    if (Math.abs(m) > 1e-12) {
      for (var j = 0; j < 2; j++) {
        y = j === 0 ? this.ymin : this.ymax; x = (y - c) / m;
        if (x >= this.xmin - 1e-9 && x <= this.xmax + 1e-9) pts.push([x, y]);
      }
    }
    if (pts.length < 2) return null;
    var a = pts[0], b = pts[1], best = -1;
    for (var p = 0; p < pts.length; p++) for (var q = p + 1; q < pts.length; q++) {
      var d = Math.hypot(pts[p][0] - pts[q][0], pts[p][1] - pts[q][1]);
      if (d > best) { best = d; a = pts[p]; b = pts[q]; }
    }
    var ln = el("line", { x1: this.X(a[0]), y1: this.Y(a[1]), x2: this.X(b[0]), y2: this.Y(b[1]), stroke: col, "stroke-width": wdt, "stroke-linecap": "round" }, o.parent || this.svg);
    if (o.dash) ln.setAttribute("stroke-dasharray", o.dash);
    if (o.label) {
      var t = el("text", { x: this.X(b[0]) - 6, y: this.Y(b[1]) + 16, "text-anchor": "end", "font-size": 13, "font-weight": 700, fill: col }, o.parent || this.svg);
      t.textContent = o.label;
    }
    return ln;
  };

  Plot.prototype.vline = function (x, o) {
    o = o || {};
    var col = o.color || "var(--accent)";
    var ln = el("line", { x1: this.X(x), y1: this.Y(o.y1 === undefined ? this.ymin : o.y1), x2: this.X(x), y2: this.Y(o.y2 === undefined ? this.ymax : o.y2), stroke: col, "stroke-width": o.width || 3, "stroke-linecap": "round" }, o.parent || this.svg);
    if (o.dash) ln.setAttribute("stroke-dasharray", o.dash);
    if (o.label) el("text", { x: this.X(x) + 7, y: this.Y(this.ymax) + 16, "font-size": 13, "font-weight": 700, fill: col }, o.parent || this.svg).textContent = o.label;
    return ln;
  };

  Plot.prototype.hline = function (y, o) {
    o = o || {};
    var col = o.color || "var(--good)";
    var ln = el("line", { x1: this.X(o.x1 === undefined ? this.xmin : o.x1), y1: this.Y(y), x2: this.X(o.x2 === undefined ? this.xmax : o.x2), y2: this.Y(y), stroke: col, "stroke-width": o.width || 3, "stroke-linecap": "round" }, o.parent || this.svg);
    if (o.dash) ln.setAttribute("stroke-dasharray", o.dash);
    if (o.label) el("text", { x: this.X(this.xmax) - 6, y: this.Y(y) - 9, "text-anchor": "end", "font-size": 13, "font-weight": 700, fill: col }, o.parent || this.svg).textContent = o.label;
    return ln;
  };

  Plot.prototype.point = function (x, y, o) {
    o = o || {};
    var col = o.color || "var(--accent)";
    var c = el("circle", { cx: this.X(x), cy: this.Y(y), r: o.r || 6, fill: col, stroke: "var(--surface)", "stroke-width": 2.2 }, o.parent || this.svg);
    if (o.ring) { c.setAttribute("fill", "var(--surface)"); c.setAttribute("stroke", col); c.setAttribute("stroke-width", 3); }
    if (o.label) {
      var dy = o.labelDy === undefined ? -9 : o.labelDy;
      var dx = o.labelDx === undefined ? 11 : o.labelDx;
      var anchor = o.anchor || "start";
      el("text", { x: this.X(x) + dx, y: this.Y(y) + dy, "text-anchor": anchor, "font-size": o.labelSize || 13, "font-weight": 700, fill: o.labelColor || col }, o.parent || this.svg).textContent = o.label;
    }
    return c;
  };

  Plot.prototype.dotted = function (x1, y1, x2, y2, o) {
    o = o || {};
    var ln = el("line", { x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2), stroke: o.color || "var(--ink-3)", "stroke-width": o.width || 1.6, "stroke-dasharray": o.dash || "4 4" }, o.parent || this.svg);
    return ln;
  };

  Plot.prototype.seg = function (x1, y1, x2, y2, o) {
    o = o || {};
    return el("line", { x1: this.X(x1), y1: this.Y(y1), x2: this.X(x2), y2: this.Y(y2), stroke: o.color || "var(--good)", "stroke-width": o.width || 3, "stroke-linecap": "round" }, o.parent || this.svg);
  };

  // shaded rectangle between two maths points (rise / run box)
  Plot.prototype.box = function (x1, y1, x2, y2, o) {
    o = o || {};
    var r = el("rect", {
      x: Math.min(this.X(x1), this.X(x2)), y: Math.min(this.Y(y1), this.Y(y2)),
      width: Math.abs(this.X(x2) - this.X(x1)), height: Math.abs(this.Y(y2) - this.Y(y1)),
      fill: o.fill || "color-mix(in srgb, var(--brand) 12%, transparent)",
      stroke: o.color || "var(--brand)", "stroke-width": o.width || 1.4
    }, o.parent || this.svg);
    if (o.dash) r.setAttribute("stroke-dasharray", o.dash);
    return r;
  };

  Plot.prototype.poly = function (pts, o) {
    o = o || {};
    var s = pts.map(function (p) { return this.X(p[0]) + "," + this.Y(p[1]); }, this).join(" ");
    return el("polygon", { points: s, fill: o.fill || "none", stroke: o.color || "var(--brand)", "stroke-width": o.width || 2 }, o.parent || this.svg);
  };

  // free text at a maths coordinate
  Plot.prototype.text = function (x, y, str, o) {
    o = o || {};
    var t = el("text", {
      x: this.X(x), y: this.Y(y), "text-anchor": o.anchor || "middle", "font-size": o.size || 13,
      "font-weight": o.weight || 700, fill: o.color || "var(--ink-2)"
    }, o.parent || this.svg);
    t.textContent = str;
    return t;
  };

  // arc from angle a1 to a2 (degrees, x-axis = 0, CCW positive)
  Plot.prototype.arc = function (cx, cy, r, a1, a2, o) {
    o = o || {};
    var x1 = cx + r * Math.cos(a1 * Math.PI / 180), y1 = cy + r * Math.sin(a1 * Math.PI / 180);
    var x2 = cx + r * Math.cos(a2 * Math.PI / 180), y2 = cy + r * Math.sin(a2 * Math.PI / 180);
    var large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    var sweep = a2 > a1 ? 0 : 1; // svg y is flipped
    var p = el("path", {
      d: "M " + this.X(x1) + " " + this.Y(y1) + " A " + (r / (this.xmax - this.xmin) * (this.w - 2 * this.pad)) + " " +
        (r / (this.ymax - this.ymin) * (this.h - 2 * this.pad)) + " 0 " + large + " " + sweep + " " + this.X(x2) + " " + this.Y(y2),
      fill: "none", stroke: o.color || "var(--accent)", "stroke-width": o.width || 1.8
    }, o.parent || this.svg);
    if (o.dash) p.setAttribute("stroke-dasharray", o.dash);
    return p;
  };

  /* ---------- export ---------- */
  global.Plot = Plot;
  global.PlotNS = NS;
  global.PlotEl = el;
  global.nf = nf;
  global.r2 = r2;
  global.rat = rat;
  global.fracHTML = fracHTML;
  global.slopeCoeff = slopeCoeff;
  global.constTerm = constTerm;
  global.eqLine = eqLine;
  global.eqGeneral = eqGeneral;
  global.setRangeFill = setRangeFill;
})(window);
