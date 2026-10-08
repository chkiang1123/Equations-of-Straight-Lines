# Equations of Straight Lines — Step by Step

An interactive study site that teaches **Chapter 3: Equations of Straight Lines** from first principles, one step at a time.

Built for students who want to actually *see* why the formulas work — not just memorise them.

> **Live site:** https://straight-line-equation.app.workbuddy.host/

## What's inside

| Step | Topic | What you get |
|------|-------|--------------|
| 0 | Warm-up | Distance, slope, mid-point, parallel/perpendicular |
| ★ | The big idea | Click any point on the grid and see whether it satisfies `y = 2x + 1` |
| 1 | Point-slope form | `y − y₁ = m(x − x₁)` — derivation + live sliders |
| 2 | Two-point form | Type two points, watch the line re-fit itself |
| 3 | Intercept form | `x/a + y/b = 1` with draggable intercepts |
| 4 | Slope-intercept form | `y = mx + c` playground with a rise-over-run triangle |
| 5 | Special lines | Horizontal `y = k` and vertical `x = h` |
| 6 | General form | `Ax + By + C = 0`, slope −A/B, intercepts −C/A and −C/B, inclination `slope = tan θ` |
| 7 | Intersections | The 3-case table + an interactive solver for two lines |
| ✓ | Practice | 10 multiple-choice questions, randomised options, instant feedback and full working |
| Σ | Cheat sheet | All five forms on one page |

## Features

- **Interactive graphs** — every line is drawn from real maths, with live equations.
- **No dependencies** — a single self-contained `index.html`. No build step, no CDN, works offline.
- **Light & dark themes** — follows your system preference; toggle in the top-right.
- **Responsive** — works on phones, tablets and desktops.
- **Textbook-aligned** — every worked example and answer follows the chapter's own examples and exercises.

## Run it locally

Just open the file:

```bash
open index.html          # macOS
# or serve it
python3 -m http.server 8000
```

## Deploy

Because it is a single static HTML file, any static host works. For GitHub Pages:

1. Push this repository.
2. **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.
3. Your site appears at `https://<username>.github.io/<repo-name>/`.

## Topics covered

- Distance between two points · slope of a line
- Parallel and perpendicular lines
- Equations of straight lines: point-slope, two-point, intercept, slope-intercept, general form
- Horizontal and vertical lines · lines through the origin
- Slope and inclination
- Intersections of two straight lines (0, 1, or infinitely many points)

---

*Made as an interactive study guide. Redraw, drag and re-test as many times as you like — that is the point.*
