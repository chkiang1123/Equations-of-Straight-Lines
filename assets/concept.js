/* ============================================================
   concept.js — See / Think / Wonder concept checks + exit tickets
   ------------------------------------------------------------
   Replaces the old free-writing boxes. Students no longer type
   paragraphs; instead each See / Think / Wonder column becomes a
   short True / False concept check, and the exit ticket becomes
   marked maths questions.

   Every wrong option is built around a real misconception, so a
   wrong click is worth more than a right one: it names the exact
   wrong idea and fixes it.

   The engine is adaptive in three small, honest ways:
     1. statements are shuffled per student and reshuffled on retry;
     2. a retry serves only the statements that student missed;
     3. the summary names the misconception families they fell for.

   All state is localStorage only. Nothing leaves the device.

   Authoring: put "$...$" round any maths inside a string.
   ============================================================ */
(function () {
  "use strict";

  var PAGE = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "");
  var BANK = window.WB_BANK || {};
  var DATA = BANK[PAGE] || null;

  /* ---------------------------------------------------------- storage */
  var Store = (function () {
    var ok = true, mem = {};
    try { localStorage.setItem("__cc_t", "1"); localStorage.removeItem("__cc_t"); }
    catch (e) { ok = false; }
    return {
      json: function (k, d) {
        try {
          var s = ok ? localStorage.getItem(k) : mem[k];
          return s ? JSON.parse(s) : d;
        } catch (e) { return d; }
      },
      set: function (k, v) {
        try { var s = JSON.stringify(v); if (ok) localStorage.setItem(k, s); else mem[k] = s; }
        catch (e) {}
      },
      del: function (k) { try { if (ok) localStorage.removeItem(k); else delete mem[k]; } catch (e) {} }
    };
  })();

  var KEY = { tf: "wb.cc." + PAGE + ".", ex: "wb.ex." + PAGE };

  /* ---------------------------------------------------------- helpers */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* "$y = mx + c$" -> the maths is handed to KaTeX, the words stay text */
  function typeset(src) {
    var parts = String(src).split("$"), out = "";
    for (var i = 0; i < parts.length; i++) {
      out += (i % 2 === 1)
        ? '<span class="m tex">' + esc(parts[i]) + "</span>"
        : esc(parts[i]);
    }
    return out;
  }

  function render(host) {
    if (window.WB && window.WB.tex) window.WB.tex.render(host || document);
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ------------------------------------------------- True / False block */
  function mountTF(host, stage, items) {
    if (!host || !items || !items.length) return;
    var keyOrd = KEY.tf + stage + ".ord";
    var keyAns = KEY.tf + stage + ".ans";
    var keyFilt = KEY.tf + stage + ".filt";

    /* a retry serves only the items the student missed */
    var filtered = Store.json(keyFilt, null);
    var pool = filtered && filtered.length ? filtered : items.map(function (_, i) { return i; });

    var ord = Store.json(keyOrd, null);
    if (!ord || ord.length !== pool.length || ord.indexOf(-1) !== -1) {
      ord = shuffle(pool);
      Store.set(keyOrd, ord);
    }
    var ans = Store.json(keyAns, {});

    function paint() {
      host.innerHTML = "";
      var wrap = document.createElement("div");
      wrap.className = "cc";

      var nRight = 0, nDone = 0, hit = [];

      ord.forEach(function (orig, pos) {
        var it = items[orig];
        if (!it) return;
        var picked = ans[orig];
        var done = picked === true || picked === false;
        if (done) {
          nDone++;
          if (picked === it.a) nRight++;
          else if (it.tag) hit.push({ tag: it.tag, s: it.s });
        }

        var d = document.createElement("div");
        d.className = "cc-item" + (done ? (picked === it.a ? " right" : " wrong") : "");
        d.innerHTML =
          '<div class="cc-q"><span class="cc-n">' + (pos + 1) + "</span>" +
          '<span class="cc-s">' + typeset(it.s) + "</span></div>" +
          '<div class="cc-btns">' +
          '<button type="button" class="tfbtn" data-v="1">True</button>' +
          '<button type="button" class="tfbtn" data-v="0">False</button>' +
          "</div>" +
          '<div class="cc-fb"></div>';
        wrap.appendChild(d);

        if (done) mark(d, it, picked, orig);
      });

      /* summary + adaptive controls */
      var sum = document.createElement("div");
      sum.className = "cc-sum";
      if (nDone === ord.length && ord.length) {
        var perfect = nRight === ord.length;
        var h = '<div class="cc-score">' + (perfect ? "All " + nRight + " correct." :
          nRight + " of " + ord.length + " correct.") + "</div>";
        if (!perfect && hit.length) {
          h += '<div class="cc-diag"><b>What tripped you up</b><ul>';
          hit.forEach(function (x) { h += "<li>" + typeset(x.s) + "</li>"; });
          h += "</ul><p class=\"small muted\">Re-read the explanation under each one before you retry.</p></div>";
        }
        h += '<div class="cc-acts">' +
          (perfect
            ? '<button type="button" class="btn small" data-act="all">Shuffle and redo all</button>'
            : '<button type="button" class="btn small primary" data-act="missed">Retry the ones I missed (' + hit.length + ')</button>' +
              '<button type="button" class="btn small" data-act="all">Redo all</button>') +
          "</div>";
        sum.innerHTML = h;
      } else {
        sum.innerHTML = '<div class="small muted">' + nDone + " of " + ord.length + " answered.</div>";
      }
      wrap.appendChild(sum);
      host.appendChild(wrap);

      Array.prototype.forEach.call(host.querySelectorAll(".tfbtn"), function (b) {
        b.addEventListener("click", function () {
          var item = b.closest(".cc-item");
          var idx = Array.prototype.indexOf.call(host.querySelectorAll(".cc-item"), item);
          var orig = ord[idx];
          if (orig === undefined) return;
          if (ans[orig] === true || ans[orig] === false) return;
          var it = items[orig];
          ans[orig] = (b.getAttribute("data-v") === "1");
          Store.set(keyAns, ans);
          mark(item, it, ans[orig], orig);
          paint();
        });
      });

      Array.prototype.forEach.call(host.querySelectorAll("[data-act]"), function (b) {
        b.addEventListener("click", function () {
          var act = b.getAttribute("data-act");
          var missed = [];
          Object.keys(ans).forEach(function (k) {
            var i = +k;
            if (items[i] && ans[i] !== items[i].a) missed.push(i);
          });
          if (act === "missed" && missed.length) {
            Store.set(keyFilt, missed);
          } else {
            Store.del(keyFilt);
          }
          Store.del(keyAns);
          Store.del(keyOrd);
          ans = {};
          var f = Store.json(keyFilt, null);
          pool = (f && f.length) ? f : items.map(function (_, i) { return i; });
          ord = shuffle(pool);
          Store.set(keyOrd, ord);
          paint();
        });
      });

      render(host);
    }

    function mark(el, it, picked, orig) {
      el.classList.add(picked === it.a ? "right" : "wrong");
      Array.prototype.forEach.call(el.querySelectorAll(".tfbtn"), function (b) {
        var v = b.getAttribute("data-v") === "1";
        b.classList.add("locked");
        if (v === it.a) b.classList.add("correct");
        else if (v === picked) b.classList.add("wrong");
        b.disabled = true;
      });
      var fb = el.querySelector(".cc-fb");
      if (!fb) return;
      var right = picked === it.a;
      var body = right ? it.ok : it.no;
      fb.innerHTML =
        '<div class="cc-verd ' + (right ? "ok" : "no") + '">' +
        (right ? "Correct" : "Not quite — this one is " + (it.a ? "True" : "False")) +
        "</div><div class=\"cc-why\">" + typeset(body || "") + "</div>";
      fb.classList.add("show");
    }

    paint();
  }

  /* ------------------------------------------------------- exit ticket */
  function mountExit(host, items) {
    if (!host || !items || !items.length) return;
    var keyOrd = KEY.ex + ".ord";
    var keyAns = KEY.ex + ".ans";

    var ord = Store.json(keyOrd, null);
    if (!ord || ord.length !== items.length) {
      ord = items.map(function (q) { return shuffle(q.opts.map(function (_, i) { return i; })); });
      Store.set(keyOrd, ord);
    }
    var ans = Store.json(keyAns, []);

    var KEYMAP = "ABCDEFGH";

    function paint() {
      host.innerHTML = "";
      var wrap = document.createElement("div");
      wrap.className = "ex";

      items.forEach(function (item, qi) {
        var picked = ans[qi];
        var done = picked !== undefined && picked !== -1;
        var d = document.createElement("div");
        d.className = "q" + (done ? " locked" : "");
        var opts = "";
        ord[qi].forEach(function (orig, pos) {
          opts += '<div class="opt" data-q="' + qi + '" data-o="' + orig + '">' +
            '<span class="k">' + KEYMAP[pos] + '</span><span class="m">' +
            typeset(item.opts[orig]) + "</span></div>";
        });
        d.innerHTML =
          '<div class="qhead"><span class="qnum">' + (qi + 1) + '</span><span class="qq">' +
          typeset(item.q) + "</span></div>" +
          '<div class="opts">' + opts + "</div>" +
          '<div class="qexp"><b>How:</b> ' + typeset(item.e) + "</div>";
        wrap.appendChild(d);
        if (done) markQ(d, qi, picked);
      });

      var correct = 0, done = 0;
      items.forEach(function (it, i) {
        if (ans[i] !== undefined && ans[i] !== -1) { done++; if (ans[i] === it.a) correct++; }
      });

      var foot = document.createElement("div");
      foot.className = "ex-foot";
      foot.innerHTML = '<div class="ex-score">' + correct + " / " + items.length + " correct</div>" +
        '<button type="button" class="btn small" data-act="reset">Reset</button>';
      wrap.appendChild(foot);
      host.appendChild(wrap);

      Array.prototype.forEach.call(host.querySelectorAll(".opt"), function (o) {
        o.addEventListener("click", function () {
          var qi = +o.getAttribute("data-q");
          if (ans[qi] !== undefined && ans[qi] !== -1) return;
          ans[qi] = +o.getAttribute("data-o");
          Store.set(keyAns, ans);
          markQ(o.closest(".q"), qi, ans[qi]);
          paint();
        });
      });

      var rb = host.querySelector("[data-act=reset]");
      if (rb) rb.addEventListener("click", function () {
        ans = [];
        ord = items.map(function (q) { return shuffle(q.opts.map(function (_, i) { return i; })); });
        Store.set(keyAns, ans);
        Store.set(keyOrd, ord);
        paint();
      });

      render(host);
    }

    function markQ(el, qi, picked) {
      var right = items[qi].a;
      Array.prototype.forEach.call(el.querySelectorAll(".opt"), function (o) {
        o.classList.add("locked");
        var orig = +o.getAttribute("data-o");
        if (orig === right) o.classList.add("correct");
        else if (orig === picked) o.classList.add("wrong");
      });
      var exp = el.querySelector(".qexp");
      if (exp) exp.classList.add("show");
    }

    paint();
  }

  /* ------------------------------------------------------------- boot */
  function boot() {
    if (!DATA) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-concept]"), function (h) {
      mountTF(h, h.getAttribute("data-concept"), DATA[h.getAttribute("data-concept")]);
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-exit]"), function (h) {
      mountExit(h, DATA.exit);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.WBConcept = { mountTF: mountTF, mountExit: mountExit, typeset: typeset };
})();
