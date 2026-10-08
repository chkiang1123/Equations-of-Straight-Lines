# Equations of Straight Lines — Step by Step

An interactive, **offline**, self-study course on Chapter 3, *Equations of Straight Lines*.

Twelve short pages. Each one opens with a real situation you have to **look at before you calculate**, then builds the
mathematics out of what you noticed. Built for students working on their own: no login, no server, no tracking,
and it works with the internet switched off.

> **Live site:** https://straight-line-equation.app.workbuddy.host/
> **GitHub Pages:** https://chkiang1123.github.io/Equations-of-Straight-Lines/

---

## What makes this different

Most resources hand you a formula and ask you to use it. This one does the opposite:

- **See · Think · Wonder** case study on every content page — you observe, interpret and question *first*, then compare
  with a model response, and only then read the mathematics.
- **Writing boxes** on every page. Your observations and reflections are saved in your browser as you type.
- **Interactive graphs** driven by real maths: drag points, move sliders, click the grid to test whether a point lies
  on a line, and watch the equation change alongside the picture.
- **Self-learning scaffolding**: tickable learning goals, a confidence rating, an exit ticket, and a progress bar
  that remembers which pages you have opened. Notes can be downloaded as a text file.

## The pages

| # | Page | Topic | Case study |
|---|------|-------|-----------|
| — | `index.html` | Course map, how to learn with this site, progress | — |
| 0 | `01-prerequisites.html` | Distance, midpoint, slope, parallel & perpendicular | The mountain rescue trail |
| 1 | `02-what-is-an-equation.html` | A line as a set of points satisfying a rule | The taut wire |
| 2 | `03-point-slope.html` | `y − y₁ = m(x − x₁)` | The draining water tank |
| 3 | `04-two-point.html` | Two points determine a line; collinearity | Two readings from one journey |
| 4 | `05-intercept-form.html` | `x/a + y/b = 1` | The budget line |
| 5 | `06-slope-intercept.html` | `y = mx + c` and rise-over-run | The taxi fare |
| 6 | `07-horizontal-vertical.html` | `y = k` and `x = h` | Two fences on a site plan |
| 7 | `08-general-form.html` | `Ax + By + C = 0`, slope `−A/B`, intercepts | The machined-edge spec sheet |
| 8 | `09-slope-and-inclination.html` | `m = tan θ` | The surveyor's two roads |
| 9 | `10-intersection.html` | Solving two line equations; three cases | Two proposed roads |
| 10 | `11-practice.html` | 10 mixed questions with full working | The delivery drone |
| Σ | `12-cheatsheet.html` | Every form on one page + self-assessment | Five equations, one line |

## Run it

No build step, no dependencies, no network.

```bash
open index.html          # macOS — just double-click the file
# or serve it if you prefer
python3 -m http.server 8000
```

Keyboard: <kbd>→</kbd> and <kbd>←</kbd> move between pages.

## Structure

```
index.html                    course map, study guide, progress
01 … 11                       the twelve pages
12-cheatsheet.html            summary + self-assessment
assets/style.css              design system (light + dark)
assets/plot.js                SVG plotting engine + algebra formatting
assets/app.js                 nav, prev/next, progress, note saving, quiz engine
```

Everything is vanilla HTML, CSS and JavaScript. `assets/app.js` holds the single course map that drives the
navigation, the progress bar and the prev/next buttons on every page, so adding a page is a one-line change.

## Deploy

Any static host works. For GitHub Pages:

1. Push this repository.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
3. The site appears at `https://<username>.github.io/<repo-name>/`.

`.nojekyll` is included so Jekyll does not interfere with the asset folders.

## Privacy

Notes, ticks, confidence ratings and quiz scores are stored in `localStorage` in your own browser. Nothing is
uploaded anywhere, and there are no analytics, no cookies and no external requests. If the browser blocks local
storage (as some do for `file://` pages) the site detects it, warns once, and keeps working — it just will not
remember your work between visits.

## Topics covered

- Distance between two points · midpoint · slope of a segment
- Parallel and perpendicular lines
- Point-slope, two-point, intercept, slope-intercept and general form
- Horizontal and vertical lines · lines through the origin
- Slope and inclination · `m = tan θ`
- Converting between any two forms
- Intersections of two straight lines: none, one, or infinitely many

---

*Made as an interactive study guide. Drag, re-test and re-write as many times as you like — that is the point.*
