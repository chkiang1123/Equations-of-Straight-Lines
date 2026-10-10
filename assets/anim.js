/* ============================================================
   anim.js — animated canvas lesson boards  (v2: vivid / motion-rich)
   Fully offline. Canvas 2D, HiDPI aware, theme aware.

   A lesson is DATA. Each step has draw(g, t, P) where t runs
   0 -> 1 over step.dur. Use seg()/E() to give every element its
   own reveal window. After the intro finishes the board keeps
   running an ambient loop, so pulses and tracers stay alive —
   read g.now (ms since this step started) inside those helpers.

     Anim.mount(element, lesson)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- small maths ---------- */
  var PI = Math.PI;
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 2.2); }
  function easeInOut(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeBack(t) {
    var c1 = 1.9, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  function seg(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function E(t, a, b) { return ease(seg(t, a, b)); }
  function EB(t, a, b) { return easeBack(seg(t, a, b)); }
  function rad(d) { return d * PI / 180; }
  function count(a, b, p) { return lerp(a, b, clamp(p, 0, 1)); }

  /* pretty numbers for canvas text (no HTML here) */
  function nf(v, d) {
    if (v === null || v === undefined || !isFinite(v)) return "\u2014";
    var k = Math.pow(10, (d === undefined ? 2 : d));
    var r = Math.round(v * k) / k;
    if (Object.is(r, -0)) r = 0;
    var s = String(Math.abs(r));
    return (r < 0 ? "\u2212" : "") + s;
  }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function fr(a, b) {
    if (!isFinite(a) || !isFinite(b) || b === 0) return "\u2014";
    var s = (a / b < 0) ? "\u2212" : "";
    var A = Math.abs(a), B = Math.abs(b), k = gcd(A, B);
    A = Math.round(A / k); B = Math.round(B / k);
    if (A === 0) return "0";
    if (B === 1) return s + A;
    return s + A + "/" + B;
  }
  function coeff(m) {
    if (!isFinite(m)) return "";
    if (Math.abs(m - 1) < 1e-9) return "";
    if (Math.abs(m + 1) < 1e-9) return "\u2212";
    return nf(m, 2);
  }
  function term(c) {
    if (Math.abs(c) < 1e-9) return "";
    return (c > 0 ? " + " : " \u2212 ") + nf(Math.abs(c), 2);
  }
  function eqMC(m, c) { return "y = " + coeff(m) + "x" + term(c); }

  var A = {
    clamp: clamp, lerp: lerp, ease: ease, easeOut: easeOut, easeInOut: easeInOut,
    easeBack: easeBack, seg: seg, E: E, EB: EB, rad: rad, count: count,
    nf: nf, fr: fr, coeff: coeff, term: term, eqMC: eqMC
  };

  /* ---------- theme tokens ---------- */
  var TK = {};
  var TKEYS = ["sheet", "paper", "grid", "grid2", "axis", "ink", "muted",
    "c1", "c2", "c3", "c4", "c5", "c6", "hl", "body", "mono"];
  function readTokens(doc) {
    var w = (doc || document).defaultView;
    if (!w) return;
    var cs = w.getComputedStyle((doc || document).documentElement);
    if (!cs) return;
    TKEYS.forEach(function (k) {
      var v = cs.getPropertyValue("--cv-" + k);
      TK[k] = (v || "").trim() || (k === "body" || k === "mono" ? "sans-serif" : "#888");
    });
  }

  /* colour resolver: accepts a palette name ("c1","muted") or a literal colour */
  function col(v, def) {
    if (v === undefined || v === null || v === "") return def;
    if (Object.prototype.hasOwnProperty.call(TK, v) && TK[v]) return TK[v];
    return v;
  }
  function txt(v, now) { return (typeof v === "function") ? v(now) : v; }

  /* ---------- drawing surface ---------- */
  function makeG(ctx, W, H, view, now) {
    var narrow = W < 520;
    var pad = { l: narrow ? 30 : 40, r: narrow ? 18 : 26, t: 22, b: narrow ? 30 : 34 };
    var x0 = view.x[0], x1 = view.x[1], y0 = view.y[0], y1 = view.y[1];
    var pw = Math.max(10, W - pad.l - pad.r), ph = Math.max(10, H - pad.t - pad.b);
    function sx(x) { return pad.l + (x - x0) / (x1 - x0) * pw; }
    function sy(y) { return pad.t + (y1 - y) / (y1 - y0) * ph; }
    function invX(px) { return x0 + (px - pad.l) / pw * (x1 - x0); }
    function invY(py) { return y1 - (py - pad.t) / ph * (y1 - y0); }

    var g = {
      view: view, sx: sx, sy: sy, invX: invX, invY: invY,
      pad: pad, pw: pw, ph: ph, narrow: narrow, W: W, H: H, now: now || 0
    };

    g.clip = function (fn) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad.l - 2, pad.t - 4, pw + 6, ph + 8);
      ctx.clip();
      fn();
      ctx.restore();
    };

    /* soft radial glow, used by emphasis dots and tracers */
    function glow(X, Y, r, color, alpha) {
      if (alpha <= 0 || r <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      var gr = ctx.createRadialGradient(X, Y, 0, X, Y, r * 3.2);
      gr.addColorStop(0, color);
      gr.addColorStop(.45, color);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(X, Y, r * 3.2, 0, 2 * PI);
      ctx.fill();
      ctx.restore();
    }

    function stroke(pts, o) {
      o = o || {};
      if (o.alpha === 0 || pts.length < 2) return;
      ctx.save();
      ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
      var base = col(o.color, TK.c1);
      if (o.grad) {
        var gs = Array.isArray(o.grad) ? o.grad : [base, TK.c4];
        var gr = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[pts.length - 1][0], pts[pts.length - 1][1]);
        gr.addColorStop(0, col(gs[0], base));
        gr.addColorStop(1, col(gs[1], TK.c4));
        ctx.strokeStyle = gr;
      } else {
        ctx.strokeStyle = base;
      }
      ctx.lineWidth = o.w || 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash(o.dash || []);
      ctx.beginPath();
      var started = false;
      for (var i = 0; i < pts.length; i++) {
        if (!isFinite(pts[i][0]) || !isFinite(pts[i][1])) continue;
        if (!started) { ctx.moveTo(pts[i][0], pts[i][1]); started = true; }
        else ctx.lineTo(pts[i][0], pts[i][1]);
      }
      ctx.stroke();
      ctx.restore();
    }

    /* glowing nib at the pen tip while a line is still growing */
    function penHead(X, Y, o) {
      if (!o.head) return;
      glow(X, Y, o.w || 2.5, col(o.color, TK.c1), .38);
      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = .9;
      ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, 2 * PI); ctx.fill();
      ctx.restore();
    }

    /* grid + axes + tick labels */
    g.grid = function (o) {
      o = o || {};
      var xs = view.xs || 1, ys = view.ys || 1;
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = TK.grid;
      ctx.beginPath();
      var i;
      for (i = Math.ceil(x0 / xs); i * xs <= x1 + 1e-9; i++) {
        var X = Math.round(sx(i * xs)) + .5;
        ctx.moveTo(X, pad.t); ctx.lineTo(X, pad.t + ph);
      }
      for (i = Math.ceil(y0 / ys); i * ys <= y1 + 1e-9; i++) {
        var Y = Math.round(sy(i * ys)) + .5;
        ctx.moveTo(pad.l, Y); ctx.lineTo(pad.l + pw, Y);
      }
      ctx.stroke();

      ctx.strokeStyle = TK.axis;
      ctx.fillStyle = TK.axis;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (y0 < 0 && y1 > 0) { var ay = Math.round(sy(0)) + .5; ctx.moveTo(pad.l - 6, ay); ctx.lineTo(pad.l + pw + 8, ay); }
      if (x0 < 0 && x1 > 0) { var ax = Math.round(sx(0)) + .5; ctx.moveTo(ax, pad.t - 4); ctx.lineTo(ax, pad.t + ph + 6); }
      ctx.stroke();

      ctx.font = "11px " + TK.mono;
      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      var step = view.labelX || xs * (narrow ? 2 : 1);
      for (i = Math.ceil(x0 / step); i * step <= x1 + 1e-9; i++) {
        if (Math.abs(i * step) < 1e-9 && !(y0 < 0 && y1 > 0)) continue;
        var vx = i * step;
        ctx.fillText(String(Math.round(vx * 100) / 100), sx(vx), Math.min(pad.t + ph + 6, H - 14));
      }
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      var stepy = view.labelY || ys * (narrow ? 2 : 1);
      for (i = Math.ceil(y0 / stepy); i * stepy <= y1 + 1e-9; i++) {
        if (Math.abs(i * stepy) < 1e-9 && !(x0 < 0 && x1 > 0)) continue;
        ctx.fillText(String(Math.round(i * stepy * 100) / 100), pad.l - 7, sy(i * stepy));
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.restore();
    };

    /* generic curve with optional progressive reveal */
    g.plot = function (fn, o) {
      o = o || {};
      var a = o.from === undefined ? x0 : o.from;
      var b = o.to === undefined ? x1 : o.to;
      var n = o.n || 400;
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      var last = Math.max(1, Math.round(n * clamp(t, 0, 1)));
      var pts = [], k, lastX, lastY;
      for (k = 0; k <= last; k++) {
        var x = a + (b - a) * k / n;
        pts.push([sx(x), sy(fn(x))]);
      }
      lastX = pts[pts.length - 1][0]; lastY = pts[pts.length - 1][1];
      g.clip(function () { stroke(pts, o); penHead(lastX, lastY, o); });
    };

    /* straight line y = m x + c, clipped to the view */
    g.line = function (m, c, o) {
      o = o || {};
      var a = o.from === undefined ? x0 : o.from;
      var b = o.to === undefined ? x1 : o.to;
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      var xa = a, xb = lerp(a, b, clamp(t, 0, 1));
      g.clip(function () {
        stroke([[sx(xa), sy(m * xa + c)], [sx(xb), sy(m * xb + c)]], o);
        penHead(sx(xb), sy(m * xb + c), o);
      });
    };
    /* line through two points (works for vertical lines too) */
    g.lineAB = function (ax, ay, bx, by, o) {
      o = o || {};
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      var dx = bx - ax, dy = by - ay;
      if (Math.abs(dx) < 1e-9) {
        var big = (view.y[1] - view.y[0]) * 2;
        var nn = Math.abs(dy) < 1e-9 ? 1 : dy / Math.abs(dy);
        g.clip(function () {
          stroke([[sx(ax), sy(ay - nn * big * t)], [sx(ax), sy(ay + nn * big * t)]], o);
        });
        return;
      }
      var m = dy / dx, c = ay - m * ax;
      g.line(m, c, { color: o.color, w: o.w, alpha: o.alpha, dash: o.dash, grad: o.grad, t: t, head: o.head, from: view.x[0], to: view.x[1] });
    };

    /* segment between two points (progressive) */
    g.seg = function (x1_, y1_, x2_, y2_, o) {
      o = o || {};
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      var ex = lerp(x1_, x2_, clamp(t, 0, 1)), ey = lerp(y1_, y2_, clamp(t, 0, 1));
      g.clip(function () {
        stroke([[sx(x1_), sy(y1_)], [sx(ex), sy(ey)]], o);
        penHead(sx(ex), sy(ey), o);
      });
    };

    g.vl = function (x, o) {
      o = o || {};
      var f = o.from === undefined ? y0 : o.from, t2 = o.to === undefined ? y1 : o.to;
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      g.clip(function () {
        stroke([[sx(x), sy(f)], [sx(x), sy(lerp(f, t2, clamp(t, 0, 1)))]], o);
        penHead(sx(x), sy(lerp(f, t2, clamp(t, 0, 1))), o);
      });
    };
    g.hl = function (y, o) {
      o = o || {};
      var f = o.from === undefined ? x0 : o.from, t2 = o.to === undefined ? x1 : o.to;
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      g.clip(function () {
        stroke([[sx(f), sy(y)], [sx(lerp(f, t2, clamp(t, 0, 1))), sy(y)]], o);
        penHead(sx(lerp(f, t2, clamp(t, 0, 1))), sy(y), o);
      });
    };

    /* dot: o.p drives a pop-in, o.glow adds a soft halo, o.pulse a breathing ring */
    g.dot = function (x, y, o) {
      o = o || {};
      var p = o.p === undefined ? 1 : clamp(o.p, 0, 1);
      var al = (o.alpha === undefined ? 1 : o.alpha) * p;
      if (al <= 0) return;
      var X = sx(x), Y = sy(y);
      if (X < pad.l - 40 || X > pad.l + pw + 40 || Y < pad.t - 40 || Y > pad.t + ph + 40) return;
      var r = (o.r || 5) * (o.pop === false ? 1 : Math.max(.2, easeBack(p)));
      var cc = col(o.color, TK.c1);
      /* o.halo is the v1 name for the same soft halo — kept for compatibility */
      if (o.glow || o.halo) glow(X, Y, r, cc, al * .5);
      if (o.pulse) {
        var per = o.period || 1900;
        var ph2 = (((g.now % per) + per) % per) / per;
        ctx.save();
        ctx.globalAlpha = (1 - ph2) * al * (o.pulseAlpha === undefined ? .55 : o.pulseAlpha);
        ctx.strokeStyle = cc;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(X, Y, r + 4 + ph2 * (o.pulseGrow === undefined ? 13 : o.pulseGrow), 0, 2 * PI);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = cc;
      ctx.beginPath(); ctx.arc(X, Y, r, 0, 2 * PI); ctx.fill();
      if (o.ring) {
        ctx.strokeStyle = TK.sheet; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(X, Y, Math.max(1, r - 1.5), 0, 2 * PI); ctx.stroke();
      }
      ctx.restore();
      if (o.label) {
        g.lab(o.label, x, y, {
          dx: o.dx === undefined ? 9 : o.dx, dy: o.dy === undefined ? -12 : o.dy,
          color: o.labelColor || o.color || TK.ink, alpha: al,
          bold: true, size: o.size || 12.5,
          slide: o.labelSlide, p: p, mono: o.mono
        });
      }
    };

    /* ambient travelling spark, used to show motion along a line */
    g.tracer = function (xa, ya, xb, yb, o) {
      o = o || {};
      if (o.alpha === 0) return;
      var per = o.period || 2600;
      var ph = (((g.now % per) + per) % per) / per;
      var s = o.pingpong === false ? ph : (ph < .5 ? ph * 2 : (1 - ph) * 2);
      var cc = col(o.color, TK.c3);
      var al = o.alpha === undefined ? 1 : o.alpha;
      var x = lerp(xa, xb, s), y = lerp(ya, yb, s);
      if (o.tail !== false) {
        var s0 = Math.max(0, s - (o.tailLen === undefined ? .12 : o.tailLen));
        ctx.save();
        ctx.globalAlpha = al * .35;
        ctx.strokeStyle = cc;
        ctx.lineWidth = (o.w || 3) + 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx(lerp(xa, xb, s0)), sy(lerp(ya, yb, s0)));
        ctx.lineTo(sx(x), sy(y));
        ctx.stroke();
        ctx.restore();
      }
      g.clip(function () { glow(sx(x), sy(y), o.w || 3, cc, al * .5); });
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = cc;
      ctx.beginPath(); ctx.arc(sx(x), sy(y), o.w || 3, 0, 2 * PI); ctx.fill();
      ctx.restore();
      if (o.label) {
        var lt = txt(o.label, g.now);
        if (lt) g.lab(lt, x, y, { dx: o.dx === undefined ? 0 : o.dx, dy: o.dy === undefined ? -18 : o.dy, align: "center", color: cc, bold: true, size: o.size || 12 });
      }
    };
    /* tracer travelling along y = m x + c between two x values */
    g.tracerLine = function (m, c, o) {
      o = o || {};
      var a = o.from === undefined ? x0 : o.from;
      var b = o.to === undefined ? x1 : o.to;
      g.tracer(a, m * a + c, b, m * b + c, o);
    };

    /* text pill. o.p + o.slide make it glide into place. */
    g.lab = function (text, x, y, o) {
      o = o || {};
      text = txt(text, g.now);
      var p = o.p === undefined ? 1 : clamp(o.p, 0, 1);
      var al = (o.alpha === undefined ? 1 : o.alpha) * (p <= 0 ? 0 : Math.min(1, p * 1.6));
      if (al <= 0 || !text) return;
      var sl = o.slide || [0, 0];
      var size = o.size || 12.5;
      var X = sx(x) + (o.dx || 0) + (1 - p) * sl[0], Y = sy(y) + (o.dy || 0) + (1 - p) * sl[1];
      ctx.save();
      ctx.font = (o.bold ? "700 " : "") + size + "px " + (o.mono ? TK.mono : TK.body);
      var w = ctx.measureText(text).width;
      if (o.align === "right") X -= w; else if (o.align === "center") X -= w / 2;
      X = clamp(X, 6, W - w - 6);
      Y = clamp(Y, size, H - 6);
      var h = size + 9;
      if (o.bg !== false) {
        ctx.globalAlpha = al * (o.bgAlpha === undefined ? .94 : o.bgAlpha);
        ctx.fillStyle = col(o.bgColor, TK.sheet);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(X - 5, Y - h / 2, w + 10, h, 6);
        else ctx.rect(X - 5, Y - h / 2, w + 10, h);
        ctx.fill();
        if (o.border || o.dotcol) {
          ctx.globalAlpha = al;
          ctx.strokeStyle = col(o.color, TK.grid2); ctx.lineWidth = 1.2; ctx.stroke();
        }
      }
      ctx.globalAlpha = al;
      ctx.fillStyle = col(o.color, TK.ink);
      ctx.textBaseline = "middle";
      ctx.fillText(text, X, Y + 1);
      ctx.restore();
    };

    /* label in pixel space */
    g.tag = function (text, px, py, o) {
      o = o || {};
      text = txt(text, g.now);
      var p = o.p === undefined ? 1 : clamp(o.p, 0, 1);
      var al = (o.alpha === undefined ? 1 : o.alpha) * Math.min(1, p * 1.6);
      if (al <= 0 || !text) return;
      var size = o.size || 12;
      ctx.save();
      ctx.font = (o.bold ? "700 " : "") + size + "px " + (o.mono ? TK.mono : TK.body);
      var w = ctx.measureText(text).width;
      var X = px, Y = py;
      if (o.align === "right") X -= w; else if (o.align === "center") X -= w / 2;
      X = clamp(X, 6, W - w - 6);
      ctx.globalAlpha = al * .93;
      ctx.fillStyle = col(o.bgColor, TK.sheet);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(X - 5, Y - (size + 9) / 2, w + 10, size + 9, 6);
      else ctx.rect(X - 5, Y - (size + 9) / 2, w + 10, size + 9);
      ctx.fill();
      ctx.globalAlpha = al;
      ctx.fillStyle = col(o.color, TK.muted);
      ctx.textBaseline = "middle";
      ctx.fillText(text, X, Y + 1);
      ctx.restore();
    };

    g.corner = function (text, o) {
      if (!text) return;
      o = o || {};
      g.tag(text, pad.l + 6, pad.t + 14, {
        align: "left", mono: true, size: o.size || 12.5,
        color: o.color || TK.ink, bold: true,
        alpha: o.alpha, p: o.p === undefined ? 1 : o.p
      });
    };

    g.band = function (xa, xb, o) {
      o = o || {};
      var al = o.alpha === undefined ? .08 : o.alpha;
      if (al <= 0) return;
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = col(o.color, TK.c2);
      g.clip(function () {
        ctx.fillRect(sx(Math.min(xa, xb)), pad.t, Math.abs(sx(xb) - sx(xa)), ph);
      });
      ctx.restore();
    };
    g.bandY = function (ya, yb, o) {
      o = o || {};
      var al = o.alpha === undefined ? .08 : o.alpha;
      if (al <= 0) return;
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = col(o.color, TK.c2);
      g.clip(function () {
        ctx.fillRect(pad.l, sy(Math.max(ya, yb)), pw, Math.abs(sy(yb) - sy(ya)));
      });
      ctx.restore();
    };

    g.poly = function (pts, o) {
      o = o || {};
      var al = o.alpha === undefined ? .14 : o.alpha;
      if (al <= 0 || pts.length < 2) return;
      ctx.save();
      ctx.globalAlpha = al;
      ctx.fillStyle = col(o.color, TK.c3);
      g.clip(function () {
        ctx.beginPath();
        pts.forEach(function (q, i) {
          if (i === 0) ctx.moveTo(sx(q[0]), sy(q[1])); else ctx.lineTo(sx(q[0]), sy(q[1]));
        });
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    };

    g.rightAngle = function (x, y, dx, dy, o) {
      o = o || {};
      var s = o.s || 12;
      var ux = dx > 0 ? 1 : -1, uy = dy > 0 ? -1 : 1;
      var X = sx(x), Y = sy(y);
      ctx.save();
      ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
      ctx.strokeStyle = col(o.color, TK.muted);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(X + ux * s, Y); ctx.lineTo(X + ux * s, Y + uy * s); ctx.lineTo(X, Y + uy * s);
      ctx.stroke();
      ctx.restore();
    };

    g.arrow = function (xa, ya, xb, yb, o) {
      o = o || {};
      var al = o.alpha === undefined ? 1 : o.alpha;
      if (al <= 0) return;
      var X1 = sx(xa), Y1 = sy(ya), X2 = sx(xb), Y2 = sy(yb);
      var t = o.t === undefined ? 1 : o.t;
      if (t <= 0) return;
      var ex = lerp(X1, X2, clamp(t, 0, 1)), ey = lerp(Y1, Y2, clamp(t, 0, 1));
      var cc = col(o.color, TK.c3);
      ctx.save();
      ctx.globalAlpha = al;
      ctx.strokeStyle = cc;
      ctx.fillStyle = cc;
      ctx.lineWidth = o.w || 2;
      ctx.lineCap = "round";
      ctx.setLineDash(o.dash || []);
      ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.setLineDash([]);
      if (t > .98) {
        var ang = Math.atan2(Y2 - Y1, X2 - X1), hs = o.head || 8;
        ctx.beginPath();
        ctx.moveTo(X2, Y2);
        ctx.lineTo(X2 - hs * Math.cos(ang - .42), Y2 - hs * Math.sin(ang - .42));
        ctx.lineTo(X2 - hs * Math.cos(ang + .42), Y2 - hs * Math.sin(ang + .42));
        ctx.closePath();
        ctx.fill();
        if (o.glow) glow(X2, Y2, 3, cc, al * .4);
      }
      ctx.restore();
    };

    g.arc = function (cx, cy, r, a1, a2, o) {
      o = o || {};
      var al = o.alpha === undefined ? 1 : o.alpha;
      if (al <= 0) return;
      var t = o.t === undefined ? 1 : o.t;
      var A2 = lerp(a1, a2, clamp(t, 0, 1));
      ctx.save();
      ctx.globalAlpha = al;
      ctx.strokeStyle = col(o.color, TK.c3);
      ctx.lineWidth = o.w || 1.8;
      ctx.setLineDash(o.dash || []);
      ctx.beginPath();
      ctx.arc(sx(cx), sy(cy), r, -rad(a1), -rad(A2), true);
      ctx.stroke();
      ctx.restore();
    };

    /* a labelled wedge for angles: arc + optional filled sector */
    g.wedge = function (cx, cy, r, a1, a2, o) {
      o = o || {};
      if (o.fill) {
        ctx.save();
        ctx.globalAlpha = o.fillAlpha === undefined ? .16 : o.fillAlpha;
        ctx.fillStyle = col(o.color, TK.c3);
        ctx.beginPath();
        ctx.moveTo(sx(cx), sy(cy));
        ctx.arc(sx(cx), sy(cy), r, -rad(a1), -rad(a2), true);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      g.arc(cx, cy, r, a1, a2, o);
    };

    return g;
  }

  /* ---------- the board ---------- */
  function mount(host, lesson) {
    if (!host || !lesson || !lesson.steps || !lesson.steps.length) return null;
    var doc = host.ownerDocument || document;
    var win = doc.defaultView || window;

    host.innerHTML = "";
    host.className = (host.className || "") + " board";

    var head = doc.createElement("div"); head.className = "board-head";
    head.innerHTML =
      '<div class="bh-l"><span class="bh-no"></span><span class="bh-title"></span></div>' +
      '<div class="bh-r"><span class="bh-step"></span></div>';

    var stage = doc.createElement("div"); stage.className = "stage";
    var cv = doc.createElement("canvas");
    cv.setAttribute("role", "img");
    stage.appendChild(cv);

    var bar = doc.createElement("div"); bar.className = "board-bar";
    bar.innerHTML =
      '<div class="dots"></div>' +
      '<div class="bbtns">' +
      '<button type="button" class="bbtn" data-a="prev">\u2190 Back</button>' +
      '<button type="button" class="bbtn pri" data-a="next">Next \u2192</button>' +
      '<button type="button" class="bbtn" data-a="replay">Replay</button>' +
      '<button type="button" class="bbtn" data-a="auto" aria-pressed="false">Autoplay</button>' +
      '</div>';

    var narr = doc.createElement("div"); narr.className = "board-narr";
    var narrL = doc.createElement("div");
    var nh = doc.createElement("h4"); nh.className = "narr-h";
    var nb = doc.createElement("div"); nb.className = "narr-body";
    var ro = doc.createElement("div"); ro.className = "readout";
    narrL.appendChild(nh); narrL.appendChild(nb); narrL.appendChild(ro);

    var ctrls = doc.createElement("div"); ctrls.className = "ctrls";
    narr.appendChild(narrL); narr.appendChild(ctrls);

    host.appendChild(head); host.appendChild(stage);
    host.appendChild(bar); host.appendChild(narr);

    var ctx = null;
    try { ctx = cv.getContext("2d"); } catch (e) { ctx = null; }

    var W = 0, H = 0, dpr = 1;
    var reduce = false;
    try { reduce = win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { reduce = false; }

    var si = 0, T = 1, t0 = null, raf = 0, auto = false, autoTimer = 0;
    var introDone = false, lastPaint = 0, visible = true, now0 = 0;
    var freeze = false, freezeNow = 5200;
    var P = {};
    (lesson.controls || []).forEach(function (c) { P[c.k] = c.value; });

    var el = {
      no: head.querySelector(".bh-no"),
      title: head.querySelector(".bh-title"),
      step: head.querySelector(".bh-step"),
      dots: bar.querySelector(".dots"),
      h: nh, b: nb, r: ro
    };
    el.no.textContent = lesson.no || "";
    el.title.textContent = lesson.name || "";

    function resize() {
      var r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : null;
      var w = (r && r.width) || 640, h = (r && r.height) || 360;
      if (!w || !h) return;
      dpr = Math.min(win.devicePixelRatio || 1, 2.5);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = w; H = h;
      render(now0);
    }

    function render(now) {
      if (!ctx || !W) return;
      readTokens(doc);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = TK.sheet || "#fff";
      ctx.fillRect(0, 0, W, H);
      var st = lesson.steps[si];
      if (!st) return;
      var v = st.view || lesson.view || { x: [-6, 6], y: [-6, 6] };
      var clock = freeze ? freezeNow : ((now || 0) - now0);
      var g = makeG(ctx, W, H, typeof v === "function" ? v(P) : v, clock);
      g.grid();
      try { st.draw(g, T, P); } catch (e) {
        if (!A.__drawErr && win.console && win.console.error) {
          A.__drawErr = true;
          win.console.error("board draw error: " + (e && e.message ? e.message : e));
        }
      }
    }

    function onIntroDone() {
      if (!auto) return;
      win.clearTimeout(autoTimer);
      autoTimer = win.setTimeout(function () {
        if (si < lesson.steps.length - 1) go(si + 1);
        else setAuto(false);
      }, 2600);
    }

    /* one continuous loop: the intro ramps T 0->1, then ambient effects keep running */
    function frame(now) {
      raf = win.requestAnimationFrame(frame);
      if (!visible) return;
      now0 = now0 || now;
      if (t0 === null) { t0 = now; introDone = false; }
      var st = lesson.steps[si];
      var dur = (st && st.dur) || 2000;
      T = reduce ? 1 : clamp((now - t0) / dur, 0, 1);
      if (T >= 1 && now - lastPaint < 32) return;   // ~30fps once settled
      lastPaint = now;
      render(now);
      if (T >= 1 && !introDone) { introDone = true; onIntroDone(); }
    }

    function start() {
      if (!win.requestAnimationFrame) { T = 1; render(0); introDone = true; return; }
      win.cancelAnimationFrame(raf);
      win.clearTimeout(autoTimer);
      t0 = null; introDone = false;
      raf = win.requestAnimationFrame(frame);
    }

    function restart() { win.clearTimeout(autoTimer); t0 = null; introDone = false; }

    function updReadout() {
      var st = lesson.steps[si];
      el.r.innerHTML = (st && st.explore && st.readout) ? st.readout(P) : "";
    }

    function updPanel() {
      var st = lesson.steps[si], n = lesson.steps.length;
      el.step.textContent = "Step " + (si + 1) + " of " + n;
      el.h.textContent = st.title || "";
      el.b.innerHTML = st.body || "";
      cv.setAttribute("aria-label", (lesson.name || "") + ": " + (st.title || ""));
      updReadout();
      buildControlsFor(st);
      el.dots.innerHTML = lesson.steps.map(function (s, i) {
        return '<button type="button" class="dot' + (i === si ? " on" : (i < si ? " done" : "")) +
          '" data-i="' + i + '" aria-label="Step ' + (i + 1) + ': ' + String(s.title || "").replace(/"/g, "") + '"></button>';
      }).join("");
      Array.prototype.forEach.call(el.dots.querySelectorAll(".dot"), function (b) {
        b.onclick = function () { setAuto(false); go(+b.dataset.i); };
      });
      bar.querySelector('[data-a="prev"]').disabled = si === 0;
      bar.querySelector('[data-a="next"]').disabled = si === n - 1;
    }

    function buildControlsFor(st) {
      var use = st.explore && lesson.controls && lesson.controls.length;
      ctrls.className = "ctrls" + (use ? " on" : "");
      narr.className = "board-narr" + (use ? " two" : "");
      if (!use) { ctrls.innerHTML = ""; return; }
      if (ctrls.dataset.built === "1") { syncOut(); return; }
      ctrls.dataset.built = "1";
      ctrls.innerHTML = lesson.controls.map(function (c) {
        var id = "c-" + (lesson.id || "l") + "-" + c.k;
        if (c.type === "seg") {
          return '<div class="ctl"><div class="ctl-head"><span>' + c.label + '</span></div>' +
            '<div class="seg">' + c.options.map(function (o) {
              return '<button type="button" id="' + id + "-" + String(o.v).replace(/[^a-z0-9]/gi, "") +
                '" data-v="' + o.v + '" aria-pressed="' + (P[c.k] === o.v) + '">' + o.t + '</button>';
            }).join("") + '</div></div>';
        }
        return '<div class="ctl"><div class="ctl-head"><span>' + c.label +
          '</span><output id="' + id + '-out">' + nf(P[c.k], 2) + '</output></div>' +
          '<input type="range" id="' + id + '" min="' + c.min + '" max="' + c.max +
          '" step="' + c.step + '" value="' + P[c.k] + '"></div>';
      }).join("");

      lesson.controls.forEach(function (c) {
        var id = "c-" + (lesson.id || "l") + "-" + c.k;
        if (c.type === "seg") {
          var btns = ctrls.querySelectorAll('[id^="' + id + '-"]');
          Array.prototype.forEach.call(btns, function (b) {
            b.onclick = function () {
              P[c.k] = b.dataset.v;
              Array.prototype.forEach.call(btns, function (x) { x.setAttribute("aria-pressed", x === b); });
              updReadout(); restart(); start();
            };
          });
        } else {
          var inp = ctrls.querySelector("#" + id);
          if (!inp) return;
          inp.oninput = function () {
            var v = Math.round(parseFloat(inp.value) * 100) / 100;
            P[c.k] = v;
            var out = ctrls.querySelector("#" + id + "-out");
            if (out) out.textContent = nf(v, 2);
            updReadout();
            T = 1; introDone = true;
            render(now0);
          };
        }
      });
    }

    function syncOut() {
      (lesson.controls || []).forEach(function (c) {
        var id = "c-" + (lesson.id || "l") + "-" + c.k;
        var out = ctrls.querySelector("#" + id + "-out");
        if (out) out.textContent = nf(P[c.k], 2);
        var inp = ctrls.querySelector("#" + id);
        if (inp && inp.value != P[c.k]) inp.value = P[c.k];
      });
    }

    function go(i) { si = clamp(i, 0, lesson.steps.length - 1); updPanel(); restart(); start(); }

    function setAuto(on) {
      auto = !!on;
      var b = bar.querySelector('[data-a="auto"]');
      b.setAttribute("aria-pressed", auto);
      b.textContent = auto ? "Pause" : "Autoplay";
      if (!auto) win.clearTimeout(autoTimer);
      else if (T >= 1) onIntroDone();
    }

    bar.querySelector('[data-a="prev"]').onclick = function () { setAuto(false); go(si - 1); };
    bar.querySelector('[data-a="next"]').onclick = function () { setAuto(false); go(si + 1); };
    bar.querySelector('[data-a="replay"]').onclick = function () { setAuto(false); restart(); start(); };
    bar.querySelector('[data-a="auto"]').onclick = function () { setAuto(!auto); };

    host.tabIndex = 0;
    host.addEventListener("keydown", function (e) {
      if (e.target && e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") { e.stopPropagation(); setAuto(false); go(si + 1); }
      else if (e.key === "ArrowLeft") { e.stopPropagation(); setAuto(false); go(si - 1); }
    });

    if (win.ResizeObserver) new win.ResizeObserver(resize).observe(cv);
    else if (win.addEventListener) win.addEventListener("resize", resize);

    /* don't burn cycles when the board is scrolled out of view */
    try {
      if (win.IntersectionObserver) {
        new win.IntersectionObserver(function (es) {
          visible = es[0] ? es[0].isIntersecting : true;
        }, { threshold: 0 }).observe(host);
      }
    } catch (e) { }

    try {
      if (win.matchMedia) {
        var mq = win.matchMedia("(prefers-color-scheme: dark)");
        if (mq.addEventListener) mq.addEventListener("change", function () { render(now0); });
      }
    } catch (e) { }
    try {
      if (win.MutationObserver) new win.MutationObserver(function () { render(now0); })
        .observe(doc.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    } catch (e) { }
    try { if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { render(now0); }); } catch (e) { }

    readTokens(doc);

    /* deep link to a finished step:  page.html?step=3  (also #step-3)
       ?freeze=1 renders one deterministic final frame — used for QA
       screenshots, and handy for printing. ?now=N picks the ambient frame. */
    var jump = -1;
    try {
      var q = String((win.location && win.location.search) || "");
      var m = /[?&]step=(\d+)/.exec(q) || /^#step-(\d+)$/.exec(String((win.location && win.location.hash) || ""));
      if (m) jump = parseInt(m[1], 10) - 1;
      freeze = /[?&]freeze=1\b/.test(q);
      var mn = /[?&]now=(\d+)/.exec(q);
      if (mn) freezeNow = parseInt(mn[1], 10);
    } catch (e) { jump = -1; }

    updPanel();
    resize();
    if (freeze) {
      si = clamp(jump >= 0 ? jump : si, 0, lesson.steps.length - 1);
      updPanel();
      now0 = 0;
      T = 1; introDone = true;
      resize();
      render(freezeNow);
    } else if (jump >= 0) {
      si = clamp(jump, 0, lesson.steps.length - 1); updPanel(); T = 1; introDone = true; t0 = null; resize(); start();
    } else start();

    var api = { go: go, render: function () { render(now0); }, state: function () { return { i: si, T: T, P: P }; } };
    try { if (win) (win.__boards = win.__boards || []).push(api); } catch (e) { }
    return api;
  }

  A.mount = mount;
  A.makeG = makeG;
  A.readTokens = readTokens;
  window.Anim = A;
})();
