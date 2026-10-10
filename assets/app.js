/* ============================================================
   app.js — shared behaviour for every page of the course
   Offline only: no network calls, no external storage.
   Progress and student notes are kept in localStorage; if that is
   unavailable (some browsers block it on file://) everything still
   works, it just will not persist between visits.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. COURSE MAP — single source of truth for nav + prev/next
     --------------------------------------------------------- */
  var COURSE = [
    { f: "index.html", label: "Start", t: "Course map", d: "What this site is, how to learn with it, and your progress" },
    { f: "01-prerequisites.html", label: "0 \u00b7 Basics", t: "Prerequisites", d: "Distance, slope, midpoint, parallel and perpendicular lines" },
    { f: "02-what-is-an-equation.html", label: "1 \u00b7 The idea", t: "What an equation of a line means", d: "A line is a set of points that all obey one rule" },
    { f: "03-point-slope.html", label: "2 \u00b7 Point-slope", t: "The point-slope form", d: "y \u2212 y\u2081 = m(x \u2212 x\u2081) \u2014 build a line from one point and a slope" },
    { f: "04-two-point.html", label: "3 \u00b7 Two points", t: "The two-point form", d: "Two points are always enough to pin down a line" },
    { f: "05-intercept-form.html", label: "4 \u00b7 Intercepts", t: "The intercept form", d: "x/a + y/b = 1 \u2014 describing a line by where it cuts the axes" },
    { f: "06-slope-intercept.html", label: "5 \u00b7 Slope-intercept", t: "The slope-intercept form", d: "y = mx + c \u2014 the form you will use most often" },
    { f: "07-horizontal-vertical.html", label: "6 \u00b7 Special lines", t: "Horizontal and vertical lines", d: "y = k and x = h \u2014 the two cases where slope misbehaves" },
    { f: "08-general-form.html", label: "7 \u00b7 General form", t: "The general form", d: "Ax + By + C = 0 \u2014 one form that covers every line" },
    { f: "09-slope-and-inclination.html", label: "8 \u00b7 Inclination", t: "Slope and inclination", d: "Slope = tan \u03b8, and what that means geometrically" },
    { f: "10-intersection.html", label: "9 \u00b7 Intersections", t: "Where two lines meet", d: "Solving two equations together: none, one, or infinitely many" },
    { f: "11-practice.html", label: "10 \u00b7 Practice", t: "Practice and self-test", d: "Mixed questions with feedback and full working" },
    { f: "12-cheatsheet.html", label: "Summary", t: "Cheat sheet and self-assessment", d: "Every form on one page, plus a checklist of what you can do" }
  ];

  var FILENAME = (location.pathname.split("/").pop() || "index.html");
  if (FILENAME === "" || FILENAME === "/") FILENAME = "index.html";
  var PAGE = FILENAME.replace(/\.html$/, "") || "index";
  var HERE = 0;
  for (var i = 0; i < COURSE.length; i++) if (COURSE[i].f === FILENAME) HERE = i;

  /* ---------------------------------------------------------
     2. STORAGE — guarded, never throws
     --------------------------------------------------------- */
  var Store = (function () {
    var ok = true, mem = {};
    try {
      window.localStorage.setItem("__wb_t", "1");
      window.localStorage.removeItem("__wb_t");
    } catch (e) { ok = false; }
    function get(k) { try { return ok ? localStorage.getItem(k) : (mem[k] === undefined ? null : mem[k]); } catch (e) { return mem[k] === undefined ? null : mem[k]; } }
    function set(k, v) { try { if (ok) localStorage.setItem(k, v); else mem[k] = v; } catch (e) { mem[k] = v; } }
    return {
      available: ok,
      get: get,
      set: set,
      json: function (k, d) { try { var s = get(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } },
      setJSON: function (k, v) { try { set(k, JSON.stringify(v)); } catch (e) {} },
      del: function (k) { try { if (ok) localStorage.removeItem(k); else delete mem[k]; } catch (e) { delete mem[k]; } }
    };
  })();

  var KEY = {
    visited: "wb.visited",
    notes: "wb.notes",
    goals: "wb.goals",
    conf: "wb.confidence",
    quiz: "wb.quiz"
  };

  function visited() { return Store.json(KEY.visited, []); }
  function markVisited() {
    var v = visited();
    if (v.indexOf(PAGE) === -1) { v.push(PAGE); Store.setJSON(KEY.visited, v); }
  }
  function notesObj() { return Store.json(KEY.notes, {}); }
  function saveNote(sub, text) {
    var n = notesObj();
    if (text) n[PAGE + "|" + sub] = text; else delete n[PAGE + "|" + sub];
    Store.setJSON(KEY.notes, n);
  }

  /* ---------------------------------------------------------
     3. TOAST
     --------------------------------------------------------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.id = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1900);
  }

  /* ---------------------------------------------------------
     4. THEME
     --------------------------------------------------------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    var b = document.getElementById("themeBtn");
    if (b) b.textContent = t === "dark" ? "\u2600" : "\u263e";
  }
  function initTheme() {
    var saved = Store.get("wb.theme");
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    }
    /* ?theme=light|dark forces a theme for a single visit (also handy for sharing a link) */
    var forced = /[?&]theme=(light|dark)\b/.exec(String(location.search || ""));
    if (forced) saved = forced[1];
    applyTheme(saved);
    var b = document.getElementById("themeBtn");
    if (b) b.addEventListener("click", function () {
      var now = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      Store.set("wb.theme", now);
      applyTheme(now);
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  }

  /* ---------------------------------------------------------
     5. NAVIGATION + PREV / NEXT
     --------------------------------------------------------- */
  function navHTML() {
    var v = visited();
    var h = '<div class="nav-in">';
    h += '<a class="logo" href="index.html"><span class="dot">y</span><span>= mx + c</span></a>';
    h += '<nav class="pills">';
    for (var i = 0; i < COURSE.length; i++) {
      var c = COURSE[i];
      var cls = "pill" + (i === HERE ? " active" : "") + (v.indexOf(c.f.replace(/\.html$/, "")) !== -1 && i !== HERE ? " done" : "");
      h += '<a class="' + cls + '" href="' + c.f + '"' + (i === HERE ? ' aria-current="page"' : "") + ">" + c.label + "</a>";
    }
    h += "</nav>";
    h += '<div class="navtools">';
    h += '<span class="pcount" id="pcount"></span>';
    h += '<button class="tbtn" id="themeBtn" title="Switch light / dark theme" aria-label="Switch theme">\u263e</button>';
    h += "</div></div>";
    return h;
  }

  function pnavHTML() {
    if (HERE === 0) {
      return '<a class="next" href="' + COURSE[1].f + '"><span class="dir">Begin \u2192</span><span class="ttl">' + COURSE[1].t + "</span></a>";
    }
    var prev = COURSE[HERE - 1], next = COURSE[HERE + 1];
    var h = "";
    h += '<a href="' + prev.f + '"><span class="dir">\u2190 Previous</span><span class="ttl">' + prev.t + "</span></a>";
    h += next
      ? '<a class="next" href="' + next.f + '"><span class="dir">Next \u2192</span><span class="ttl">' + next.t + "</span></a>"
      : '<a class="next" href="11-practice.html"><span class="dir">Keep going \u2192</span><span class="ttl">Practice and self-test</span></a>';
    return h;
  }

  function updateProgressUI() {
    var v = visited(), n = 0;
    for (var i = 0; i < COURSE.length; i++) if (v.indexOf(COURSE[i].f.replace(/\.html$/, "")) !== -1) n++;
    var pct = Math.round(n / COURSE.length * 100);
    var bar = document.getElementById("bar");
    if (bar) bar.style.width = pct + "%";
    var pc = document.getElementById("pcount");
    if (pc) pc.textContent = n + " / " + COURSE.length + " pages";
    var pb = document.getElementById("progFill");
    if (pb) pb.style.width = pct + "%";
    var pt = document.getElementById("progText");
    if (pt) pt.textContent = pct + "%";
    var pt2 = document.getElementById("progCount");
    if (pt2) pt2.textContent = n + " of " + COURSE.length + " pages visited";
  }

  /* ---------------------------------------------------------
     6. NOTES (writing boxes)
     --------------------------------------------------------- */
  function initNotes() {
    // expand declarative placeholders: <div data-write="see" data-ph="..." data-rows="4"></div>
    Array.prototype.forEach.call(document.querySelectorAll("[data-write]"), function (h) {
      h.innerHTML = writeBox(
        h.getAttribute("data-write"),
        (h.getAttribute("data-ph") || "").replace(/"/g, "&quot;"),
        h.getAttribute("data-rows") ? +h.getAttribute("data-rows") : 4
      );
      h.removeAttribute("data-write");
      h.removeAttribute("data-ph");
      h.removeAttribute("data-rows");
    });
    var all = notesObj();
    var areas = document.querySelectorAll("textarea[data-note]");
    Array.prototype.forEach.call(areas, function (ta) {
      var sub = ta.getAttribute("data-note");
      var saved = all[PAGE + "|" + sub];
      if (saved) ta.value = saved;
      var wrap = ta.closest(".write-wrap");
      var dot = wrap ? wrap.querySelector(".saved-dot") : null;
      var chars = wrap ? wrap.querySelector(".charcount") : null;
      function paint() {
        if (chars) chars.textContent = ta.value.trim().length + " characters";
      }
      function flag(on) { if (dot) dot.classList[on ? "add" : "remove"]("on"); }
      flag(!!saved);
      paint();
      var t = null;
      ta.addEventListener("input", function () {
        paint();
        clearTimeout(t);
        t = setTimeout(function () { saveNote(sub, ta.value.trim()); flag(ta.value.trim().length > 0); }, 500);
      });
      ta.addEventListener("blur", function () { saveNote(sub, ta.value.trim()); flag(ta.value.trim().length > 0); });
    });
  }

  // markup helper used by pages: a writing box + saved indicator
  function writeBox(sub, placeholder, rows) {
    return '<div class="write-wrap">' +
      '<textarea class="write" data-note="' + sub + '" rows="' + (rows || 4) + '" placeholder="' + placeholder + '"></textarea>' +
      '<div class="write-meta"><span class="saved-dot"><i></i>saved on this device</span>' +
      '<span class="charcount">0 characters</span></div></div>';
  }
  window.writeBox = writeBox;

  /* ---------------------------------------------------------
     7. GOAL CHECKBOXES
     --------------------------------------------------------- */
  function initGoals() {
    var g = Store.json(KEY.goals, {});
    Array.prototype.forEach.call(document.querySelectorAll("input[data-goal]"), function (cb) {
      var k = PAGE + "|" + cb.getAttribute("data-goal");
      if (g[k]) cb.checked = true;
      cb.addEventListener("change", function () {
        g[k] = cb.checked;
        Store.setJSON(KEY.goals, g);
        var li = cb.closest("li");
        if (li) li.classList[cb.checked ? "add" : "remove"]("checked");
      });
      var li = cb.closest("li");
      if (li && cb.checked) li.classList.add("checked");
    });
  }

  /* ---------------------------------------------------------
     8. CONFIDENCE RATING
     --------------------------------------------------------- */
  var CONF_LABELS = ["Just starting", "Getting it", "Could teach it"];
  function initConfidence() {
    var all = Store.json(KEY.conf, {});
    Array.prototype.forEach.call(document.querySelectorAll("[data-conf]"), function (box) {
      var html = '<span class="lab">How confident do you feel?</span>';
      for (var i = 0; i < 3; i++) {
        html += '<button type="button" data-v="' + (i + 1) + '">' + CONF_LABELS[i] + "</button>";
      }
      box.innerHTML = html;
      var btns = box.querySelectorAll("button");
      function paint() {
        var v = all[PAGE] || 0;
        Array.prototype.forEach.call(btns, function (b) {
          b.classList[+b.getAttribute("data-v") === v ? "add" : "remove"]("on");
        });
      }
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener("click", function () {
          var v = +b.getAttribute("data-v");
          all[PAGE] = (all[PAGE] === v) ? 0 : v;
          Store.setJSON(KEY.conf, all);
          paint();
          toast(all[PAGE] ? "Saved: " + CONF_LABELS[all[PAGE] - 1] : "Rating cleared");
        });
      });
      paint();
    });
  }

  /* ---------------------------------------------------------
     9. QUIZ ENGINE
     --------------------------------------------------------- */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  var KEYMAP = "ABCDEFGH";

  function mountQuiz(host, questions) {
    if (!host) return;
    var blank = [];
    for (var z = 0; z < questions.length; z++) blank.push(false);
    var answered = Store.json(KEY.quiz + "." + PAGE + ".done", blank.slice());
    var chosen = Store.json(KEY.quiz + "." + PAGE + ".pick", blank.map(function () { return -1; }));
    if (answered.length !== questions.length) {
      answered = blank.slice();
      chosen = blank.map(function () { return -1; });
    }
    // keep a stable per-question option order across reloads
    var orders = Store.json(KEY.quiz + "." + PAGE + ".ord", null);
    if (!orders || orders.length !== questions.length) {
      orders = questions.map(function (q) {
        var idx = [];
        for (var i = 0; i < q.opts.length; i++) idx.push(i);
        return shuffle(idx);
      });
      Store.setJSON(KEY.quiz + "." + PAGE + ".ord", orders);
    }

    function render() {
      host.innerHTML = "";
      questions.forEach(function (item, qi) {
        var d = document.createElement("div");
        d.className = "q";
        var optsHTML = "";
        orders[qi].forEach(function (orig, pos) {
          optsHTML += '<div class="opt" data-q="' + qi + '" data-o="' + orig + '">' +
            '<span class="k">' + KEYMAP[pos] + "</span><span class=\"m\">" + item.opts[orig] + "</span></div>";
        });
        d.innerHTML = '<div class="qhead"><span class="qnum">' + (qi + 1) + "</span><span>" + item.q + "</span></div>" +
          '<div class="opts">' + optsHTML + "</div>" +
          '<div class="qexp"><b>Why:</b> ' + item.e + "</div>";
        host.appendChild(d);
        if (answered[qi]) paintQuestion(d, qi, chosen[qi]);
      });
      Array.prototype.forEach.call(host.querySelectorAll(".opt"), function (o) {
        o.addEventListener("click", function () {
          var qi = +o.getAttribute("data-q"), orig = +o.getAttribute("data-o");
          if (answered[qi]) return;
          answered[qi] = true;
          chosen[qi] = orig;
          Store.setJSON(KEY.quiz + "." + PAGE + ".done", answered);
          Store.setJSON(KEY.quiz + "." + PAGE + ".pick", chosen);
          paintQuestion(o.closest(".q"), qi, orig);
          update();
        });
      });
    }

    function paintQuestion(qEl, qi, picked) {
      var right = questions[qi].a;
      Array.prototype.forEach.call(qEl.querySelectorAll(".opt"), function (o) {
        o.classList.add("locked");
        var orig = +o.getAttribute("data-o");
        if (orig === right) o.classList.add("correct");
        else if (orig === picked) o.classList.add("wrong");
      });
      var exp = qEl.querySelector(".qexp");
      if (exp) exp.classList.add("show");
    }

    var scoreEl = document.getElementById("quizScore");
    function update() {
      var correct = 0, done = 0;
      for (var i = 0; i < questions.length; i++) {
        if (answered[i]) { done++; if (chosen[i] === questions[i].a) correct++; }
      }
      var best = Math.max(correct, Store.json(KEY.quiz + "." + PAGE + ".best", 0));
      Store.setJSON(KEY.quiz + "." + PAGE + ".best", best);
      if (scoreEl) {
        scoreEl.innerHTML = '<span class="big">' + correct + " / " + questions.length + "</span>" +
          "<span>answered <b>" + done + "</b> of " + questions.length + " \u00b7 correct <b>" + correct + "</b>" +
          (done === questions.length
            ? (correct === questions.length ? " \u2014 perfect score." : " \u2014 review the ones you missed, then try again.")
            : " \u2014 keep going.") +
          "</span><span class=\"small muted\">Best so far: " + best + " / " + questions.length + "</span>";
      }
    }

    var rb = document.getElementById("quizReset");
    if (rb) rb.addEventListener("click", function () {
      answered = questions.map(function () { return false; });
      chosen = questions.map(function () { return -1; });
      orders = questions.map(function (q) {
        var idx = [];
        for (var i = 0; i < q.opts.length; i++) idx.push(i);
        return shuffle(idx);
      });
      Store.setJSON(KEY.quiz + "." + PAGE + ".done", answered);
      Store.setJSON(KEY.quiz + "." + PAGE + ".pick", chosen);
      Store.setJSON(KEY.quiz + "." + PAGE + ".ord", orders);
      render();
      update();
      toast("Quiz reset");
    });

    render();
    update();
  }
  window.mountQuiz = mountQuiz;

  /* ---------------------------------------------------------
     10. EXPORT / CLEAR SAVED WORK (used on the index page)
     --------------------------------------------------------- */
  function buildNotesText() {
    var n = notesObj(), g = Store.json(KEY.goals, {}), c = Store.json(KEY.conf, {}), v = visited();
    var out = ["Equations of Straight Lines — my notes", "Saved from this device. " + new Date().toLocaleString(), ""];
    var any = false;
    COURSE.forEach(function (c2) {
      var id = c2.f.replace(/\.html$/, "");
      var lines = [];
      Object.keys(n).forEach(function (k) {
        var parts = k.split("|");
        if (parts[0] === id && n[k]) lines.push("  [" + parts[1] + "] " + n[k].replace(/\n/g, "\n      "));
      });
      var goals = Object.keys(g).filter(function (k) { return k.indexOf(id + "|") === 0 && g[k]; });
      var conf = c[id] || 0;
      if (lines.length || goals.length || conf) {
        any = true;
        out.push("=== " + c2.t + "  (" + c2.f + ")");
        if (v.indexOf(id) !== -1) out.push("  visited");
        if (conf) out.push("  confidence: " + CONF_LABELS[conf - 1]);
        if (goals.length) out.push("  goals ticked: " + goals.length);
        lines.forEach(function (l) { out.push(l); });
        out.push("");
      }
    });
    if (!any) out.push("(nothing written yet)");
    return out.join("\n");
  }

  function initExport() {
    var b = document.querySelector("[data-export]");
    if (b) b.addEventListener("click", function () {
      var txt = buildNotesText();
      try {
        var blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "straight-line-notes.txt";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        toast("Notes downloaded");
      } catch (e) {
        window.open("data:text/plain;charset=utf-8," + encodeURIComponent(txt), "_blank");
      }
    });
    var p = document.querySelector("[data-print]");
    if (p) p.addEventListener("click", function () { window.print(); });
    var c = document.querySelector("[data-clear]");
    if (c) c.addEventListener("click", function () {
      if (!window.confirm("Delete all your saved notes, goals, ratings and quiz results on this device? This cannot be undone.")) return;
      [KEY.visited, KEY.notes, KEY.goals, KEY.conf].forEach(Store.del);
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(KEY.quiz) === 0) Store.del(k);
      });
      toast("All saved work cleared");
      setTimeout(function () { location.reload(); }, 700);
    });
    var pv = document.getElementById("progList");
    if (pv) renderProgList(pv);
  }

  function renderProgList(host) {
    var v = visited(), c = Store.json(KEY.conf, {}), g = Store.json(KEY.goals, {}), n = notesObj();
    var h = "";
    COURSE.forEach(function (c2) {
      var id = c2.f.replace(/\.html$/, "");
      var seen = v.indexOf(id) !== -1;
      var nNotes = Object.keys(n).filter(function (k) { return k.split("|")[0] === id && n[k]; }).length;
      var nGoals = Object.keys(g).filter(function (k) { return k.indexOf(id + "|") === 0 && g[k]; }).length;
      var bits = [];
      if (nGoals) bits.push(nGoals + " goal" + (nGoals > 1 ? "s" : ""));
      if (nNotes) bits.push(nNotes + " note" + (nNotes > 1 ? "s" : ""));
      if (c[id]) bits.push(CONF_LABELS[c[id] - 1]);
      h += '<div class="progrow"><div><a href="' + c2.f + '" style="color:inherit;text-decoration:none;font-weight:600">' + c2.t + "</a>" +
        (bits.length ? '<div class="small muted">' + bits.join(" \u00b7 ") + "</div>" : "") + "</div>" +
        '<div class="st">' + (seen ? '<span style="color:var(--good)">\u2713 visited</span>' : "not yet") + "</div></div>";
    });
    host.innerHTML = h;
  }

  /* ---------------------------------------------------------
     11. KEYBOARD NAVIGATION
     --------------------------------------------------------- */
  function initKeys() {
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" && COURSE[HERE + 1]) location.href = COURSE[HERE + 1].f;
      if (e.key === "ArrowLeft" && HERE > 0) location.href = COURSE[HERE - 1].f;
    });
  }

  /* ---------------------------------------------------------
     12. BOOT
     --------------------------------------------------------- */
  function init() {
    markVisited();
    initTheme();
    Array.prototype.forEach.call(document.querySelectorAll("[data-nav]"), function (h) { h.innerHTML = navHTML(); });
    // theme button lives inside the freshly injected nav
    var b = document.getElementById("themeBtn");
    if (b) b.addEventListener("click", function () {
      var now = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      Store.set("wb.theme", now);
      applyTheme(now);
    });
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    Array.prototype.forEach.call(document.querySelectorAll("[data-pnav]"), function (h) { h.innerHTML = pnavHTML(); });
    initNotes();
    initGoals();
    initConfidence();
    initExport();
    initKeys();
    updateProgressUI();
    if (!Store.available) {
      var w = document.getElementById("storeWarn");
      if (w) w.style.display = "block";
    }
    document.addEventListener("wb:refresh", updateProgressUI);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.WB = {
    COURSE: COURSE,
    page: PAGE,
    index: HERE,
    toast: toast,
    store: Store,
    progress: function () { updateProgressUI(); }
  };
})();
