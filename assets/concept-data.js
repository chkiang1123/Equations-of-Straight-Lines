/* ============================================================
   concept-data.js — the See / Think / Wonder concept checks and
   the exit-ticket questions for every page.
   ------------------------------------------------------------
   Shape of one page entry:

     "<page-id>": {
       see:    [ { s, a, tag, ok, no }, ... ],   // True / False
       think:  [ ... ],
       wonder: [ ... ],
       exit:   [ { q, opts:[4], a, e }, ... ]    // marked maths
     }

   s / q / opts / ok / no / e may mix words and maths; wrap maths
   in $...$ and concept.js hands it to KaTeX.

   `a`  = the correct answer (true/false, or index into opts)
   `tag`= the misconception family, used for the end-of-block diagnosis
   `ok` = feedback shown when the student gets it right
   `no` = feedback shown when they get it wrong — this is where the
          misconception is named and repaired.

   NOTE ON see / think / wonder
   ------------------------------------------------------------
   Those three arrays are RETIRED. The See-Think-Wonder columns were
   removed from the pages, so nothing mounts them — concept.js only
   renders a bank if the page contains a matching host:

       <div data-concept="see"></div>

   Drop those three hosts back into a page and the True/False checks
   come straight back with no other change. The `exit` array is live.
   ============================================================ */
window.WB_BANK = {

  /* ---------------------------------------------------------- 0. Basics */
  "01-prerequisites": {
    see: [
      { s: "The slope of a straight line is the same whichever two points on it you pick.", a: true, tag: "slope-any-pair",
        ok: "Exactly. Slope belongs to the whole line: any two points give the same rise-over-run because the triangles formed are similar.",
        no: "It is the same for every pair. Picking different points gives similar triangles, so the ratio rise/run never changes. This is why you can check your arithmetic with a second pair." },
      { s: "A line that drops as you move to the right has a negative slope.", a: true, tag: "slope-sign",
        ok: "Correct: moving right, $y$ falls, so the rise is negative while the run is positive — negative over positive is negative.",
        no: "Look again at the direction: as $x$ increases the line falls, so $\\Delta y < 0$ while $\\Delta x > 0$. That ratio is negative. A falling line always has $m < 0$." },
      { s: "The distance between $(1, 2)$ and $(4, 6)$ is $|4-1| + |6-2| = 7$.", a: false, tag: "distance-add-legs",
        ok: "Correct to reject. Adding the legs measures a path along the grid, not the straight line between the points. Pythagoras gives $\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$.",
        no: "That is the classic trap: you added the two legs. $|\\Delta x| + |\\Delta y|$ is how far you walk if you must stay on the grid. The straight-line distance is the hypotenuse, $\\sqrt{3^2+4^2} = 5$, and it is always the shorter one." }
    ],
    think: [
      { s: "The midpoint of $(x_1, y_1)$ and $(x_2, y_2)$ is $\\left(\\frac{x_2-x_1}{2},\\ \\frac{y_2-y_1}{2}\\right)$.", a: false, tag: "midpoint-half-difference",
        ok: "Right to reject it. Halving the *difference* gives half the displacement — a point only a quarter of the way along. The midpoint is the *average*: $\\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)$.",
        no: "You have to add, not subtract. That expression halves the journey from the first point and lands you a quarter of the way along the segment. The midpoint averages the coordinates: $\\left(\\frac{x_1+x_2}{2},\\ \\frac{y_1+y_2}{2}\\right)$. Check it on $(0,0)$ and $(4,6)$: the average $(2,3)$ really is in the middle." },
      { s: "Two lines are parallel exactly when their slopes are equal.", a: true, tag: "parallel-vs-perpendicular",
        ok: "Correct. Equal slope means equal steepness and equal direction, so the lines never meet — that is what parallel means. (Vertical lines are the special case: both have undefined slope and are parallel to each other.)",
        no: "Not quite. Equal slopes is the test for *parallel*. You may be thinking of perpendicular, where the product of the slopes is $-1$. The two tests are easy to swap round." },
      { s: "If a line has slope $2$, a line perpendicular to it has slope $-2$.", a: false, tag: "perpendicular-negation",
        ok: "Correct to reject: flipping the sign is not enough. Perpendicular means the *negative reciprocal*, so the slope is $-\\frac{1}{2}$, and indeed $2 \\times \\left(-\\frac{1}{2}\\right) = -1$.",
        no: "This is the single most common slip in the topic. Perpendicular is not 'the negative', it is the negative reciprocal. The test is $m_1 m_2 = -1$, so for $m = 2$ you need $m_2 = -\\frac{1}{2}$. Note $-2$ fails the test: $2 \\times (-2) = -4 \\neq -1$." }
    ],
    wonder: [
      { s: "A vertical line has slope $0$, because it does not rise or fall gently — it just goes up.", a: false, tag: "vertical-slope-zero",
        ok: "Correct to reject. For a vertical line $\\Delta x = 0$, so the slope would be $\\frac{\\Delta y}{0}$ — undefined, not zero. Zero slope is the *horizontal* line.",
        no: "Careful — 'flat' and 'vertical' pull in opposite directions here. A vertical line has $\\Delta x = 0$, so computing $\\frac{\\Delta y}{\\Delta x}$ means dividing by zero: the slope is undefined. Slope $0$ belongs to the horizontal line, where the rise is zero." },
      { s: "Swapping which point you call 'first' in the slope formula changes the sign of the slope.", a: false, tag: "slope-point-order",
        ok: "Correct: nothing changes. Swapping both points negates $\\Delta y$ and $\\Delta x$ together, and negative over negative is positive — the same slope.",
        no: "No change. If you swap the points, both $\\Delta y$ and $\\Delta x$ flip sign, and $\\frac{-a}{-b} = \\frac{a}{b}$. What *does* flip the sign is swapping the order in only one of the two differences." },
      { s: "Two different lines can share the same slope.", a: true, tag: "same-slope-different-lines",
        ok: "Yes — that is exactly what parallel lines are: same slope, different intercept, so different lines.",
        no: "They can, and they do. Same slope with a different intercept gives a parallel line — a genuinely different line that never meets the first." }
    ],
    exit: [
      { q: "Find the slope of the line through $(-2, 5)$ and $(4, -1)$.",
        opts: ["$-1$", "$1$", "$-3$", "$3$"], a: 0,
        e: "$\\Delta y = -1 - 5 = -6$ and $\\Delta x = 4 - (-2) = 6$, so $m = \\frac{-6}{6} = -1$. Two slips to watch: subtracting a negative must add ($4-(-2) = 6$, not $2$), and the order of subtraction must match in the numerator and denominator." },
      { q: "Find the distance between $(1, 2)$ and $(5, 5)$.",
        opts: ["$5$", "$7$", "$1$", "$\\sqrt{7}$"], a: 0,
        e: "$\\sqrt{(5-1)^2 + (5-2)^2} = \\sqrt{16+9} = \\sqrt{25} = 5$. Adding the legs gives $7$ — that is the grid-walking distance, not the straight line. Squaring first also kills any minus signs, which is why the order of the points does not matter." }
    ]
  },

  /* ------------------------------------------------------- 1. The idea */
  "02-what-is-an-equation": {
    see: [
      { s: "A point lies on a line exactly when its coordinates make the equation true.", a: true, tag: "point-on-line-test",
        ok: "Correct — that is the whole definition. Substitute and check: if the two sides agree, the point is on the line; if not, it is not.",
        no: "This *is* the test. Substitute the $x$ and $y$ of the point into the equation. If both sides come out equal the point is on the line; if they differ, it is off it. There is no other way to decide." },
      { s: "In the equation $y = 2x + 1$, the letters $x$ and $y$ stand for one particular pair of numbers.", a: false, tag: "variables-are-fixed",
        ok: "Correct to reject. $x$ and $y$ are variables: the equation is a *rule* connecting them, and every pair that obeys the rule is a point of the line.",
        no: "Not so — they are variables, not one fixed pair. The equation is a rule, and the line is the complete set of pairs that obey it. $(0,1)$, $(1,3)$, $(2,5)$ all obey it, and there are infinitely many more." },
      { s: "The line $y = 2x + 1$ contains infinitely many points.", a: true, tag: "line-infinite-points",
        ok: "Correct. Every real $x$ produces exactly one $y$, so there is a point for every real number — infinitely many.",
        no: "Yes, infinitely many: choose any $x$ you like and the equation forces exactly one $y$. That is what makes it a line rather than a handful of dots." }
    ],
    think: [
      { s: "The equation of a line and the line itself are the same thing.", a: false, tag: "equation-is-line",
        ok: "Correct to reject. The line is the set of points; the equation is the sentence that describes that set. A description and the thing described are not the same object.",
        no: "Almost, but not quite — and the distinction matters. The line is the *set of points* in the plane; the equation is the *rule* that picks out exactly those points. Keeping them apart is what lets you test whether a given point belongs." },
      { s: "Changing the constant in $y = 2x + c$ slides the line up or down without changing how steep it is.", a: true, tag: "constant-shifts",
        ok: "Correct: the constant moves every point by the same vertical amount, so the line is translated, not rotated. The steepness is set by the coefficient of $x$, which has not changed.",
        no: "It does slide. Adding to $c$ raises every point by the same amount, which translates the line; the slope comes from the coefficient of $x$, and that is untouched." },
      { s: "Every point whose $y$-coordinate is $3$ lies on the line $y = 2x + 1$.", a: false, tag: "single-coordinate-enough",
        ok: "Correct to reject. One coordinate tells you nothing. Substituting $y = 3$ gives $3 = 2x + 1$, so only $x = 1$ works: the single point $(1, 3)$.",
        no: "One coordinate is not enough. Substituting $y = 3$ forces $3 = 2x + 1$, hence $x = 1$. So exactly one of all those points is on the line: $(1, 3)$." }
    ],
    wonder: [
      { s: "Two different equations can describe exactly the same line.", a: true, tag: "same-line-many-equations",
        ok: "Correct. $y = 2x + 1$ and $2y = 4x + 2$ and $2x - y + 1 = 0$ all pick out the same set of points — multiplying or rearranging does not change the solution set.",
        no: "They can. Multiplying the whole equation by a non-zero number, or rearranging it, leaves the solution set untouched. That is why 'the equation of a line' is really 'any equation of the line'." },
      { s: "If a point satisfies the equation, then moving it slightly will usually keep it on the line.", a: false, tag: "nearby-points-on-line",
        ok: "Correct to reject — moving a point off the line almost always takes it off the line, because the rule is exact. Only movement *along* the line keeps it on.",
        no: "The opposite: the rule is exact, so a random small move breaks it. The only moves that keep a point on the line are those along the line's own direction." },
      { s: "A single point is enough to determine a line.", a: false, tag: "one-point-determines-line",
        ok: "Correct to reject — infinitely many lines pass through one point. You need a second piece of information: another point, or the slope.",
        no: "Not enough: infinitely many lines pass through any single point, fanning out like a star. You need one more fact — a second point, or the direction (the slope)." }
    ],
    exit: [
      { q: "Which point lies on the line $y = 2x + 1$?",
        opts: ["$(3, 7)$", "$(2, 4)$", "$(1, 4)$", "$(0, 0)$"], a: 0,
        e: "Substitute each: $2(3)+1 = 7$, so $(3,7)$ works. $(2,4)$ gives $5 \\neq 4$; $(1,4)$ gives $3 \\neq 4$; $(0,0)$ gives $1 \\neq 0$. Substituting is the only test you need." },
      { q: "The line $y = 3x - 2$ passes through $(2, k)$. Find $k$.",
        opts: ["$4$", "$6$", "$-4$", "$2$"], a: 0,
        e: "$k = 3(2) - 2 = 6 - 2 = 4$. The common slips are stopping at $3 \\times 2 = 6$ (forgetting the $-2$) and applying the subtraction before the multiplication." }
    ]
  },

  /* ---------------------------------------------------- 2. Point-slope */
  "03-point-slope": {
    see: [
      { s: "In $y - y_1 = m(x - x_1)$, the pair $(x_1, y_1)$ is a point that the line passes through.", a: true, tag: "ps-point-meaning",
        ok: "Correct. Substituting $x = x_1$ gives $y - y_1 = 0$, so $y = y_1$ — the point $(x_1, y_1)$ really is on the line.",
        no: "It is. Put $x = x_1$ into the equation and the right side becomes $0$, forcing $y = y_1$. So $(x_1, y_1)$ satisfies the equation and lies on the line." },
      { s: "In $y - y_1 = m(x - x_1)$, the letter $m$ is the slope of the line.", a: true, tag: "ps-m-is-slope",
        ok: "Correct. Expanding gives $y = mx + (y_1 - mx_1)$, and the coefficient of $x$ is exactly $m$ — the slope.",
        no: "Yes, $m$ is the slope. Expand the brackets and collect: the coefficient multiplying $x$ is $m$, and that coefficient *is* the slope in slope-intercept form." },
      { s: "The form $y - y_1 = m(x - x_1)$ only works for lines with a positive slope.", a: false, tag: "ps-positive-only",
        ok: "Correct to reject — the form places no restriction on $m$. A negative $m$ simply gives a line that falls to the right.",
        no: "No such restriction: $m$ can be positive, negative or zero. A negative value just means the line falls as you move right, and the formula is unchanged." }
    ],
    think: [
      { s: "Writing $y + 5 = 3(x + 2)$ means the line passes through $(2, 5)$.", a: false, tag: "ps-sign-extraction",
        ok: "Correct to reject. Read the point by matching the pattern $y - y_1$ and $x - x_1$: here $y - (-5)$ and $x - (-2)$, so the point is $(-2, -5)$, not $(2, 5)$.",
        no: "The minus signs in the formula are part of the pattern. $y + 5$ is $y - (-5)$ and $x + 2$ is $x - (-2)$, so the point is $(-2, -5)$. A plus sign in the form always means a negative coordinate." },
      { s: "The line through $(3, 4)$ with slope $2$ can be written $y - 4 = 2(x - 3)$.", a: true, tag: "ps-correct-build",
        ok: "Correct: $x_1 = 3$, $y_1 = 4$, $m = 2$ substituted straight into the pattern.",
        no: "It can — just substitute $x_1 = 3$, $y_1 = 4$, $m = 2$ into $y - y_1 = m(x - x_1)$. You can check it: putting $x = 3$ gives $y = 4$." },
      { s: "Swapping the coordinates and writing $y - 3 = 2(x - 4)$ gives the same line as $y - 4 = 2(x - 3)$.", a: false, tag: "ps-swap-coords",
        ok: "Correct to reject: that swaps the coordinates and describes a line through $(4, 3)$ instead of $(3, 4)$ — a different line.",
        no: "That is a different line. $y - 3 = 2(x - 4)$ passes through $(4, 3)$, not $(3, 4)$. The $x$-coordinate must go with the $x$ in the formula, and the $y$-coordinate with the $y$." }
    ],
    wonder: [
      { s: "Any line that is not vertical can be written in point-slope form.", a: true, tag: "ps-coverage",
        ok: "Correct. You need a slope and a point; every non-vertical line has both, so the form always applies.",
        no: "Yes — every non-vertical line has a slope and contains infinitely many points, so you can always build the form. Vertical lines are the exception because their slope is undefined." },
      { s: "Using a different point on the same line gives a different equation.", a: false, tag: "ps-different-point",
        ok: "Correct to reject: the equation looks different but describes the same line. Both expand to the same slope-intercept form.",
        no: "It looks different but is not. Using $(1,1)$ or $(3,5)$ on the same line gives two equations that both expand to the same $y = mx + c$ — same line, different description." },
      { s: "A vertical line can be written as $y - y_1 = m(x - x_1)$ with a very large value of $m$.", a: false, tag: "ps-vertical-large-m",
        ok: "Correct to reject. No finite $m$ works: a vertical line has $\\Delta x = 0$, so its slope is undefined, not merely large. It is written $x = h$.",
        no: "A very large slope gives a very steep line that still leans over slightly — never a truly vertical one. Vertical means $\\Delta x = 0$, so the slope is undefined and the line is written $x = h$." }
    ],
    exit: [
      { q: "Write the equation of the line with slope $3$ through $(2, 5)$.",
        opts: ["$y - 5 = 3(x - 2)$", "$y + 5 = 3(x + 2)$", "$y - 2 = 3(x - 5)$", "$y - 5 = 3(x + 2)$"], a: 0,
        e: "Substitute $x_1 = 2$, $y_1 = 5$, $m = 3$ into $y - y_1 = m(x - x_1)$. The third option is the classic slip — it puts the $x$-coordinate next to the $y$ and vice versa." },
      { q: "A line has equation $y - 1 = -2(x - 4)$. What is its slope?",
        opts: ["$-2$", "$2$", "$4$", "$1$"], a: 0,
        e: "In $y - y_1 = m(x - x_1)$ the multiplier is the slope, so $m = -2$. The numbers $1$ and $4$ are the coordinates of a point on the line — they are not the slope." }
    ]
  },

  /* ------------------------------------------------------ 3. Two points */
  "04-two-point": {
    see: [
      { s: "Two distinct points always determine exactly one straight line.", a: true, tag: "two-points-unique",
        ok: "Correct — one line passes through both, and only one. That is why two points are enough information.",
        no: "They do: through any two distinct points there passes exactly one straight line. This is the geometric fact the whole formula rests on." },
      { s: "The slope between $(x_1, y_1)$ and $(x_2, y_2)$ is $\\frac{x_2 - x_1}{y_2 - y_1}$.", a: false, tag: "slope-inverted",
        ok: "Correct to reject — that is run over rise, upside down. Slope is $\\frac{y_2 - y_1}{x_2 - x_1}$: rise over run, vertical change over horizontal change.",
        no: "You have inverted it. Slope is rise over run: $\\frac{y_2 - y_1}{x_2 - x_1}$. A useful check — a steep line must have a large slope, and a fraction with a big denominator is small." },
      { s: "If two points have the same $x$-coordinate, the line through them is vertical.", a: true, tag: "same-x-vertical",
        ok: "Correct. Equal $x$ means no horizontal change at all, so the line runs straight up and down — vertical.",
        no: "Yes: no horizontal change between the points means the line is vertical, with equation $x = \\text{that common value}$. This is the one case where the slope formula breaks." }
    ],
    think: [
      { s: "The slope formula $\\frac{y_2 - y_1}{x_2 - x_1}$ still works when $x_1 = x_2$.", a: false, tag: "vertical-division-by-zero",
        ok: "Correct to reject: the denominator becomes $0$, so the expression is undefined. That is the signal that you are looking at a vertical line, written $x = x_1$.",
        no: "It fails, and the failure is informative: the denominator is $0$, so there is no slope. Rather than force the formula, recognise the line as vertical and write $x = x_1$." },
      { s: "Subtracting the coordinates in a different order in the numerator and the denominator gives the wrong sign.", a: true, tag: "inconsistent-subtraction",
        ok: "Correct. You must be consistent: $(y_2 - y_1)/(x_2 - x_1)$ or $(y_1 - y_2)/(x_1 - x_2)$, but mixing them flips exactly one sign and gives the negative of the true slope.",
        no: "It does. Mixing the orders negates only one of the two differences, so you get $-m$. Either order is fine as long as you use the same one on top and bottom." },
      { s: "Once you have the slope from two points, you still need one of the points to fix which line it is.", a: true, tag: "slope-needs-point",
        ok: "Correct. The slope fixes the direction but not the position — many parallel lines share it. One point pins down which of them you mean.",
        no: "You do. A slope alone describes a whole family of parallel lines; substituting one point selects the single member of that family you want." }
    ],
    wonder: [
      { s: "Three points can lie on the same straight line.", a: true, tag: "three-collinear",
        ok: "Correct — that is what collinear means. The test is that the slope between the first two equals the slope between the second and third.",
        no: "They can, and checking is easy: compute the slope for two different pairs. If the slopes match, the three points are collinear." },
      { s: "You need three points to be certain which line you mean.", a: false, tag: "three-points-needed",
        ok: "Correct to reject: two distinct points are already enough. A third point is either on the line (redundant) or off it (then no single line fits all three).",
        no: "Two are enough — that is the whole point of this page. A third point either lies on the same line, adding nothing, or lies off it, in which case no straight line passes through all three." },
      { s: "If the slope between points $A$ and $B$ equals the slope between $B$ and $C$, then $A$, $B$ and $C$ are collinear.", a: true, tag: "equal-slope-collinear",
        ok: "Correct. Two line segments sharing the point $B$ with the same slope must lie along the same straight line.",
        no: "Yes. Sharing a point and a direction forces the two segments onto one line, so all three points are collinear." }
    ],
    exit: [
      { q: "Find the slope of the line through $(1, 2)$ and $(5, 10)$.",
        opts: ["$2$", "$\\frac{1}{2}$", "$8$", "$4$"], a: 0,
        e: "$m = \\frac{10-2}{5-1} = \\frac{8}{4} = 2$. Reporting $8$ means you gave the rise alone, and $\\frac{1}{2}$ means you divided the wrong way round." },
      { q: "Find the equation of the line through $(0, 1)$ and $(2, 5)$.",
        opts: ["$y = 2x + 1$", "$y = 2x + 5$", "$y = \\frac{1}{2}x + 1$", "$y = 4x + 1$"], a: 0,
        e: "$m = \\frac{5-1}{2-0} = 2$, and $(0,1)$ sits on the vertical axis so the intercept is $1$: $y = 2x + 1$. The second option uses the wrong intercept; the third inverts the slope." }
    ]
  },

  /* ----------------------------------------------------- 4. Intercepts */
  "05-intercept-form": {
    see: [
      { s: "In $\\frac{x}{a} + \\frac{y}{b} = 1$, the number $a$ is where the line cuts the $x$-axis.", a: true, tag: "intercept-a-is-x",
        ok: "Correct. Put $y = 0$ and the equation gives $\\frac{x}{a} = 1$, so $x = a$: the $x$-intercept is $(a, 0)$.",
        no: "It is. Setting $y = 0$ leaves $\\frac{x}{a} = 1$, hence $x = a$. So $a$ belongs to the $x$-axis and $b$ to the $y$-axis." },
      { s: "In $\\frac{x}{a} + \\frac{y}{b} = 1$, the number $b$ is the slope of the line.", a: false, tag: "b-is-slope",
        ok: "Correct to reject: $b$ is the $y$-intercept, not the slope. The slope is $-\\frac{b}{a}$ — it depends on both intercepts.",
        no: "No: $b$ is the $y$-intercept. The slope comes from both intercepts, $m = -\\frac{b}{a}$, because the line falls from $(0, b)$ to $(a, 0)$." },
      { s: "The line $\\frac{x}{6} + \\frac{y}{4} = 1$ passes through $(6, 0)$.", a: true, tag: "substitute-intercept",
        ok: "Correct: substituting gives $\\frac{6}{6} + \\frac{0}{4} = 1 + 0 = 1$. That is exactly what 'intercept' means.",
        no: "It does — substitute and check: $\\frac{6}{6} + \\frac{0}{4} = 1$. Any intercept you read from the form can be verified this way." }
    ],
    think: [
      { s: "The slope of $\\frac{x}{a} + \\frac{y}{b} = 1$ is $-\\frac{b}{a}$.", a: true, tag: "intercept-slope-formula",
        ok: "Correct. The line runs from $(0, b)$ down to $(a, 0)$, so the rise is $-b$ over a run of $a$: $m = -\\frac{b}{a}$.",
        no: "It is. Between the intercepts the line falls by $b$ while moving across by $a$, giving $m = \\frac{0 - b}{a - 0} = -\\frac{b}{a}$. The minus sign is essential: cutting both axes positively always gives a downward slope." },
      { s: "Writing $\\frac{x}{a} + \\frac{y}{b} = 0$ describes the same kind of line.", a: false, tag: "rhs-zero",
        ok: "Correct to reject: the right-hand side must be $1$. With $0$ the line is forced through the origin, so it no longer has two non-zero intercepts.",
        no: "The $= 1$ is load-bearing. With $= 0$ the equation becomes the line $bx + ay = 0$, which passes through the origin and so has both intercepts equal to zero." },
      { s: "A line that passes through the origin can be written in intercept form.", a: false, tag: "origin-no-intercept-form",
        ok: "Correct to reject: through the origin both intercepts are $0$, and dividing by $a$ or $b$ would mean dividing by zero. Use $y = mx$ instead.",
        no: "It cannot. Both intercepts are $0$, so the denominators $a$ and $b$ would be zero — the form needs two non-zero intercepts to say anything." }
    ],
    wonder: [
      { s: "If both intercepts are positive, the line must slope downwards.", a: true, tag: "positive-intercepts-down",
        ok: "Correct: it falls from $(0, b)$ on the left to $(a, 0)$ on the right, so $m = -\\frac{b}{a} < 0$.",
        no: "Yes. A line cutting the positive part of both axes must travel down as it moves right, which is exactly a negative slope." },
      { s: "Doubling $a$ while leaving $b$ alone makes the line steeper.", a: false, tag: "doubling-a",
        ok: "Correct to reject: doubling $a$ makes the slope $-\\frac{b}{2a}$, which is *half* as steep. A larger $x$-intercept stretches the line out and flattens it.",
        no: "It flattens it. The slope $-\\frac{b}{a}$ is divided by $2$ when $a$ doubles, so the line becomes less steep, not more." },
      { s: "A horizontal line can be written in intercept form.", a: false, tag: "horizontal-no-intercept-form",
        ok: "Correct to reject: a horizontal line never crosses the $x$-axis, so there is no finite $a$ to put in the denominator. Write it as $y = k$ instead.",
        no: "It cannot: a horizontal line never meets the $x$-axis, so $a$ would have to be infinite. The form only suits lines that cut both axes." }
    ],
    exit: [
      { q: "A line cuts the axes at $(6, 0)$ and $(0, 4)$. Write it in intercept form.",
        opts: ["$\\frac{x}{6} + \\frac{y}{4} = 1$", "$\\frac{x}{4} + \\frac{y}{6} = 1$", "$\\frac{x}{6} + \\frac{y}{4} = 0$", "$6x + 4y = 1$"], a: 0,
        e: "$a = 6$ is the $x$-intercept and $b = 4$ the $y$-intercept, giving $\\frac{x}{6} + \\frac{y}{4} = 1$. The second swaps them; the third loses the $=1$ and falls through the origin." },
      { q: "What is the slope of $\\frac{x}{3} + \\frac{y}{6} = 1$?",
        opts: ["$-2$", "$-\\frac{1}{2}$", "$2$", "$-3$"], a: 0,
        e: "$m = -\\frac{b}{a} = -\\frac{6}{3} = -2$. Forgetting the minus sign, or dividing $a$ by $b$ instead of $b$ by $a$, are the two usual slips." }
    ]
  },

  /* ------------------------------------------------ 5. Slope-intercept */
  "06-slope-intercept": {
    see: [
      { s: "In $y = mx + c$, the number $c$ is where the line crosses the $y$-axis.", a: true, tag: "c-is-y-intercept",
        ok: "Correct. Put $x = 0$ and you get $y = c$, so the line passes through $(0, c)$.",
        no: "It is. Substituting $x = 0$ gives $y = m \\cdot 0 + c = c$, so $(0, c)$ is on the line — $c$ is the $y$-intercept, never the $x$-intercept." },
      { s: "In $y = mx + c$, the number $m$ is the $y$-intercept.", a: false, tag: "m-is-intercept",
        ok: "Correct to reject: $m$ is the slope. The intercept is $c$ — visible by putting $x = 0$.",
        no: "No — $m$ is the slope, the rate at which $y$ changes. The intercept is $c$: with $x = 0$ the equation reads $y = c$." },
      { s: "The line $y = 2x + 3.5$ starts at $3.5$ on the vertical axis.", a: true, tag: "read-intercept-from-equation",
        ok: "Correct: with $x = 0$, $y = 3.5$. That is the intercept, read straight off the equation.",
        no: "It does: $y = 2(0) + 3.5 = 3.5$. This is the practical payoff of the form — the starting value is one of the two numbers written down." }
    ],
    think: [
      { s: "In $y = mx + c$, increasing $m$ makes the line steeper.", a: true, tag: "m-controls-steepness",
        ok: "Correct: $m$ is the rise per unit of run, so a larger $|m|$ means a steeper line.",
        no: "It does. Since $m$ is 'rise over run', a bigger magnitude means more vertical change for the same step across — a steeper line." },
      { s: "The line $y = -2x + 5$ slopes upwards to the right.", a: false, tag: "negative-m-direction",
        ok: "Correct to reject: the slope is $-2$, so the line falls as $x$ increases — downwards to the right.",
        no: "It slopes downwards. A negative slope means $y$ decreases as $x$ increases; the '$+5$' only says where the line starts, not which way it leans." },
      { s: "Changing $c$ in $y = 2x + c$ moves the line without changing its steepness.", a: true, tag: "c-shifts-only",
        ok: "Correct: $c$ translates the line vertically. The steepness is carried by $m$, which has not changed.",
        no: "Right — $c$ shifts the whole line up or down, leaving the slope $m = 2$ untouched. Steepness and position are controlled by different letters." }
    ],
    wonder: [
      { s: "If the flagfall doubles but the rate per kilometre stays the same, the new line is steeper.", a: false, tag: "intercept-change-steepness",
        ok: "Correct to reject: doubling the flagfall changes $c$, not $m$. The line shifts up parallel to itself and keeps its slope.",
        no: "The slope is unchanged — only $c$ moves. The new line is the old one shifted straight up, parallel to it. Steepness is the per-kilometre rate alone." },
      { s: "Every non-vertical line can be written in the form $y = mx + c$.", a: true, tag: "form-covers-all",
        ok: "Correct. Every non-vertical line has a slope and crosses the $y$-axis exactly once, and those two numbers are $m$ and $c$.",
        no: "Yes — a non-vertical line has a well-defined slope and must cross the vertical axis somewhere. Vertical lines are the only exception, written $x = h$." },
      { s: "A line with $m = 0$ slopes gently downwards.", a: false, tag: "zero-slope-means-flat",
        ok: "Correct to reject: $m = 0$ means no rise at all, so the line is perfectly horizontal — $y = c$.",
        no: "No: zero slope means zero rise, so the line is exactly horizontal. 'Gently downwards' would be a small *negative* slope, not zero." }
    ],
    exit: [
      { q: "A line has slope $2$ and $y$-intercept $-3$. Write its equation.",
        opts: ["$y = 2x - 3$", "$y = -3x + 2$", "$y = 2x + 3$", "$y = 3x - 2$"], a: 0,
        e: "$m = 2$ and $c = -3$ go straight into $y = mx + c$, giving $y = 2x - 3$. The second option swaps the two numbers into the wrong positions." },
      { q: "Convert $2x + y - 4 = 0$ into slope-intercept form.",
        opts: ["$y = -2x + 4$", "$y = 2x + 4$", "$y = -2x - 4$", "$y = 2x - 4$"], a: 0,
        e: "Make $y$ the subject: $y = -2x + 4$. The sign of the $2x$ flips when it crosses the equals sign, and the constant flips too." }
    ]
  },

  /* --------------------------------------------- 6. Horizontal/vertical */
  "07-horizontal-vertical": {
    see: [
      { s: "The equation $y = 3$ describes a horizontal line.", a: true, tag: "y-equals-horizontal",
        ok: "Correct: $y$ is fixed at $3$ while $x$ runs free, giving a level line three units up.",
        no: "It does. $y$ is pinned to $3$ and $x$ can be anything, so every point has height $3$ — a horizontal line." },
      { s: "The equation $x = 4$ describes a horizontal line.", a: false, tag: "x-equals-horizontal",
        ok: "Correct to reject: $x$ is fixed at $4$ while $y$ runs free, which is a *vertical* line.",
        no: "It is vertical. $x$ is pinned at $4$ and $y$ can be anything, so the points stack straight up and down." },
      { s: "The line $y = -2$ passes through $(5, -2)$.", a: true, tag: "point-on-horizontal",
        ok: "Correct: the $y$-coordinate is $-2$ and the equation does not restrict $x$ at all.",
        no: "It does — the equation only demands $y = -2$, and $x$ is free, so $(5, -2)$ is on the line just as $(\\text{anything}, -2)$ is." }
    ],
    think: [
      { s: "The slope of the line $y = 7$ is $0$.", a: true, tag: "horizontal-slope-zero",
        ok: "Correct: it is $y = 0x + 7$, so $m = 0$. No rise at all — perfectly level.",
        no: "It is $0$. Written as $y = 0 \\cdot x + 7$, the coefficient of $x$ is zero, so the line has no rise however far you run." },
      { s: "The slope of the line $x = 3$ is $0$.", a: false, tag: "vertical-slope-zero",
        ok: "Correct to reject: the slope is undefined. There is no run at all, so rise-over-run would divide by zero.",
        no: "Undefined, not zero. Between any two points on it $\\Delta x = 0$, so the slope would be $\\frac{\\Delta y}{0}$ — a division by zero. 'Undefined' and 'zero' are completely different here." },
      { s: "A vertical line and a horizontal line are perpendicular to each other.", a: true, tag: "hv-perpendicular",
        ok: "Correct. They meet at right angles; the slope test $m_1 m_2 = -1$ cannot be applied because one slope is undefined, but the geometry is clear.",
        no: "They are — they meet at exactly $90^\\circ$. Note that this is the one perpendicular pair you cannot check with $m_1 m_2 = -1$, since one slope does not exist." }
    ],
    wonder: [
      { s: "A vertical line is a function: each $x$ gives exactly one $y$.", a: false, tag: "vertical-is-function",
        ok: "Correct to reject: one $x$ is paired with infinitely many $y$ values, so it fails the test for a function.",
        no: "It fails: the single value $x = 4$ is paired with every possible $y$. A function must give one output per input, and this gives infinitely many." },
      { s: "The line $y = 0$ is the $x$-axis itself.", a: true, tag: "y-zero-is-x-axis",
        ok: "Correct: every point with height zero, which is exactly the $x$-axis.",
        no: "It is — the set of all points at height $0$ is precisely the horizontal axis." },
      { s: "The two lines $x = 2$ and $x = 5$ intersect somewhere.", a: false, tag: "parallel-verticals-meet",
        ok: "Correct to reject: both are vertical, so they are parallel and never meet. A point cannot have two different $x$-coordinates at once.",
        no: "They never meet. Both are vertical, hence parallel; and a single point cannot have $x = 2$ and $x = 5$ simultaneously." }
    ],
    exit: [
      { q: "Which equation represents a vertical line through $(5, 2)$?",
        opts: ["$x = 5$", "$y = 2$", "$y = 5$", "$x = 2$"], a: 0,
        e: "A vertical line fixes $x$ and leaves $y$ free, so $x = 5$. The third option is the usual slip: taking the wrong coordinate from the point." },
      { q: "What is the slope of the line $y = -4$?",
        opts: ["$0$", "$-4$", "undefined", "$1$"], a: 0,
        e: "It is $y = 0 \\cdot x + (-4)$, so $m = 0$. The $-4$ is the intercept, not the slope; 'undefined' belongs to vertical lines." }
    ]
  },

  /* ------------------------------------------------- 7. General form */
  "08-general-form": {
    see: [
      { s: "In $Ax + By + C = 0$, the numbers $A$, $B$ and $C$ are unique — no other triple gives the same line.", a: false, tag: "abc-unique",
        ok: "Correct to reject: multiplying all three by the same non-zero number gives a different triple describing the identical line. Only the *ratio* $A:B:C$ is fixed.",
        no: "They are not unique. $2x + 3y - 6 = 0$ and $4x + 6y - 12 = 0$ describe exactly the same line. What is fixed is the ratio $A:B:C$, so we usually divide out to make them tidy." },
      { s: "Every straight line, including vertical ones, can be written as $Ax + By + C = 0$.", a: true, tag: "general-covers-vertical",
        ok: "Correct — that is the point of the form. A vertical line is simply the case $B = 0$, giving $Ax + C = 0$.",
        no: "It can, and that is exactly why the form is worth learning. Vertical lines are the case $B = 0$; no other form handles them without a special case." },
      { s: "In $Ax + By + C = 0$, the constant $C$ is the $y$-intercept.", a: false, tag: "C-is-intercept",
        ok: "Correct to reject: $C$ is not the intercept. Putting $x = 0$ gives $By + C = 0$, so the $y$-intercept is $-\\frac{C}{B}$.",
        no: "It is not. Set $x = 0$: then $By + C = 0$, so $y = -\\frac{C}{B}$. The intercept depends on both $C$ and $B$ — which is why $C$ alone tells you very little." }
    ],
    think: [
      { s: "The slope of $Ax + By + C = 0$ is $-\\frac{A}{B}$.", a: true, tag: "general-slope",
        ok: "Correct. Rearranging: $By = -Ax - C$, so $y = -\\frac{A}{B}x - \\frac{C}{B}$ and the coefficient of $x$ is $-\\frac{A}{B}$.",
        no: "It is $-\\frac{A}{B}$. Make $y$ the subject: $By = -Ax - C$, so $y = -\\frac{A}{B}x - \\frac{C}{B}$. Writing $-\\frac{B}{A}$ instead is the classic inversion." },
      { s: "If $A = 0$ in $Ax + By + C = 0$, the line is horizontal.", a: true, tag: "A-zero-horizontal",
        ok: "Correct: the equation becomes $By + C = 0$, so $y$ is constant — a horizontal line.",
        no: "Yes — with $A = 0$ there is no $x$ term at all, so $y$ is pinned to the constant $-\\frac{C}{B}$. That is a horizontal line." },
      { s: "If $B = 0$ in $Ax + By + C = 0$, the line is horizontal.", a: false, tag: "B-zero-horizontal",
        ok: "Correct to reject: $B = 0$ gives $Ax + C = 0$, so $x$ is constant — a vertical line. It is $A = 0$ that gives a horizontal one.",
        no: "The opposite: with $B = 0$ there is no $y$ term, so $x$ is fixed and the line is vertical. Remember it this way — the letter that *vanishes* is the coordinate that becomes free to vary." }
    ],
    wonder: [
      { s: "Two equations that look completely different can describe the same line.", a: true, tag: "same-line-different-abc",
        ok: "Correct. $x + 2y - 5 = 0$ and $2x + 4y - 10 = 0$ are the same line: one is the other multiplied by $2$.",
        no: "They can. Multiplying through by any non-zero constant changes every coefficient but not the set of points that satisfy the equation." },
      { s: "The general form $Ax + By + C = 0$ can describe a line with no $y$-intercept.", a: true, tag: "general-no-intercept",
        ok: "Correct: a vertical line $x = h$ never crosses the $y$-axis, and the general form handles it as $Ax + C = 0$ with $B = 0$.",
        no: "It can — and must, to cover vertical lines. This is a real advantage over $y = mx + c$, which silently excludes them." },
      { s: "Dividing $Ax + By + C = 0$ through by $C$ is always safe.", a: false, tag: "divide-by-C",
        ok: "Correct to reject: if $C = 0$ the line passes through the origin and you would be dividing by zero.",
        no: "Not always: when $C = 0$ the line passes through the origin and that division is by zero. Dividing by $A$ or $B$ carries the same risk when either is zero." }
    ],
    exit: [
      { q: "Write $y = 3x - 7$ in general form.",
        opts: ["$3x - y - 7 = 0$", "$3x + y - 7 = 0$", "$3x - y + 7 = 0$", "$x - 3y - 7 = 0$"], a: 0,
        e: "Bring everything to one side: $3x - y - 7 = 0$. Both signs matter — the $y$ takes a minus when it crosses over, and the $-7$ stays negative." },
      { q: "What is the slope of $2x - 3y + 6 = 0$?",
        opts: ["$\\frac{2}{3}$", "$-\\frac{2}{3}$", "$\\frac{3}{2}$", "$-\\frac{3}{2}$"], a: 0,
        e: "$m = -\\frac{A}{B} = -\\frac{2}{-3} = \\frac{2}{3}$. Watch the signs: $B = -3$ here, so the two minus signs cancel." }
    ]
  },

  /* --------------------------------------------------- 8. Inclination */
  "09-slope-and-inclination": {
    see: [
      { s: "The inclination of a line is measured from the positive $x$-axis, anticlockwise.", a: true, tag: "inclination-definition",
        ok: "Correct — that is the convention: start at the positive $x$-axis and rotate anticlockwise to the line.",
        no: "That is the definition. Measure anticlockwise from the positive direction of the $x$-axis; a horizontal line has inclination $0^\\circ$." },
      { s: "The slope $m$ and the inclination $\\theta$ are related by $m = \\tan \\theta$.", a: true, tag: "m-equals-tan-theta",
        ok: "Correct. Walking one unit along gives a rise of $\\tan \\theta$, which is exactly the rise-over-run definition of slope.",
        no: "They are: move one unit across and the vertical climb is $\\tan \\theta$, so rise over run equals $\\tan \\theta$. This is the bridge between algebra and geometry." },
      { s: "Two lines with the same inclination are the same line.", a: false, tag: "same-inclination-same-line",
        ok: "Correct to reject: equal inclination makes them parallel, not identical. They share a direction but sit in different places, so they never meet.",
        no: "Parallel, not identical. Equal inclination fixes the direction only — where the line sits is set separately by its intercept. Two distinct lines can lean at exactly the same angle." }
    ],
    think: [
      { s: "A line with a negative slope has a negative inclination.", a: false, tag: "negative-slope-negative-angle",
        ok: "Correct to reject. Inclination is measured anticlockwise over $0^\\circ$ to $180^\\circ$, so a line falling to the right has an inclination between $90^\\circ$ and $180^\\circ$ — still positive.",
        no: "Inclination is always between $0^\\circ$ and $180^\\circ$, never negative. A line falling to the right leans back past the vertical, so its inclination is obtuse — for slope $-1$ it is $135^\\circ$, not $-45^\\circ$." },
      { s: "A slope of $1$ corresponds to an inclination of $45^\\circ$.", a: true, tag: "slope-one-45",
        ok: "Correct: $\\tan 45^\\circ = 1$, so $m = 1$ gives $\\theta = 45^\\circ$.",
        no: "It does: $\\tan 45^\\circ = 1$ exactly. This is one of the standard values worth remembering alongside $30^\\circ$ and $60^\\circ$." },
      { s: "The inclination of a line can be any angle from $0^\\circ$ to $360^\\circ$.", a: false, tag: "inclination-range",
        ok: "Correct to reject. Inclination runs from $0^\\circ$ up to (but not including) $180^\\circ$ — beyond that you are describing the same line over again.",
        no: "The range is $0^\\circ \\le \\theta < 180^\\circ$. Past $180^\\circ$ you are measuring the same line again, so the inclination would not be unique." }
    ],
    wonder: [
      { s: "A line with inclination $90^\\circ$ has an undefined slope.", a: true, tag: "ninety-undefined",
        ok: "Correct: $\\tan 90^\\circ$ is undefined, matching the fact that a vertical line has no slope. The two languages agree.",
        no: "Yes — $\\tan 90^\\circ$ is undefined, which is exactly why a vertical line has no slope. The algebraic and geometric descriptions break down together." },
      { s: "As the inclination approaches $90^\\circ$, the slope gets closer and closer to zero.", a: false, tag: "near-90-slope-zero",
        ok: "Correct to reject — the opposite happens. $\\tan \\theta$ grows without bound as $\\theta$ approaches $90^\\circ$, so the line becomes steeper and steeper.",
        no: "The reverse: $\\tan \\theta$ increases towards infinity as $\\theta \\to 90^\\circ$. Near-vertical lines have enormous slopes, not small ones." },
      { s: "Doubling the inclination of a line doubles its slope.", a: false, tag: "double-angle-double-slope",
        ok: "Correct to reject: slope is $\\tan \\theta$, and tangent is not linear. Doubling $30^\\circ$ to $60^\\circ$ takes the slope from $\\frac{1}{\\sqrt{3}}$ to $\\sqrt{3}$ — three times as large, not twice.",
        no: "It does not, because $\\tan$ is not a linear function. From $30^\\circ$ to $60^\\circ$ the slope goes from about $0.577$ to about $1.732$, which is three times bigger, not two." }
    ],
    exit: [
      { q: "A line has slope $1$. What is its inclination?",
        opts: ["$45^\\circ$", "$30^\\circ$", "$60^\\circ$", "$90^\\circ$"], a: 0,
        e: "$\\tan \\theta = 1$ gives $\\theta = 45^\\circ$. These three standard angles are worth knowing: $\\tan 30^\\circ = \\frac{1}{\\sqrt{3}}$, $\\tan 45^\\circ = 1$, $\\tan 60^\\circ = \\sqrt{3}$." },
      { q: "A line has inclination $135^\\circ$. What is its slope?",
        opts: ["$-1$", "$1$", "$0$", "undefined"], a: 0,
        e: "$\\tan 135^\\circ = \\tan(180^\\circ - 45^\\circ) = -\\tan 45^\\circ = -1$. An obtuse inclination always means a negative slope." }
    ]
  },

  /* -------------------------------------------------- 9. Intersections */
  "10-intersection": {
    see: [
      { s: "Two lines that are not parallel always meet in exactly one point.", a: true, tag: "non-parallel-one-point",
        ok: "Correct. Different slopes guarantee a single intersection — if they met twice they would be the same line.",
        no: "They do. Distinct slopes force exactly one meeting point; two shared points would force the lines to coincide entirely." },
      { s: "Parallel lines can meet if you extend them far enough.", a: false, tag: "parallel-eventually-meet",
        ok: "Correct to reject: parallel lines keep a constant separation however far you extend them. That is what parallel means.",
        no: "They never meet, at any distance. Keeping a constant gap is the definition of parallel; extending the lines changes nothing." },
      { s: "Two lines that are actually the same line share infinitely many points.", a: true, tag: "coincident-infinite",
        ok: "Correct: if the equations describe the same set of points, every point on the line is shared — infinitely many solutions.",
        no: "Yes — the same line means the same set of points, so all infinitely many of them are common to both equations." }
    ],
    think: [
      { s: "Solving two line equations together means finding the point that satisfies both at once.", a: true, tag: "solve-simultaneous",
        ok: "Correct: the intersection is precisely the pair $(x, y)$ that makes both equations true simultaneously.",
        no: "Exactly. The intersection point is the one coordinate pair that satisfies both equations at the same time — which is why substituting one into the other works." },
      { s: "If two lines have equations with the same slope but different intercepts, they have infinitely many solutions.", a: false, tag: "parallel-infinite",
        ok: "Correct to reject: same slope with different intercepts means parallel and distinct, so there are *no* solutions. Infinitely many happens only when the equations describe the same line.",
        no: "None, not infinitely many. Same slope and different intercept gives parallel lines that never meet. You get infinitely many solutions only when the two equations are really the same line." },
      { s: "When solving, substituting one equation into the other and getting $0 = 0$ means the lines are identical.", a: true, tag: "zero-equals-zero",
        ok: "Correct: an identity like $0 = 0$ means every $x$ works — the two equations were the same line all along.",
        no: "Yes. A statement that is always true means no restriction on $x$, so every point on the first line is on the second: identical lines." }
    ],
    wonder: [
      { s: "Getting something like $5 = 7$ when solving tells you the lines do not intersect.", a: true, tag: "contradiction-no-solution",
        ok: "Correct: a contradiction means no value of $x$ can work, which is exactly the parallel-lines case.",
        no: "It does. A false statement means no $x$ satisfies both equations — the lines are parallel and distinct." },
      { s: "Three lines can all pass through the same single point.", a: true, tag: "three-concurrent",
        ok: "Correct — that is called concurrent. There is no limit on how many lines can share one point.",
        no: "They can: any number of lines can pass through one point, like spokes on a wheel. Such lines are called concurrent." },
      { s: "Two lines with slopes $2$ and $-\\frac{1}{2}$ are parallel.", a: false, tag: "reciprocal-parallel",
        ok: "Correct to reject: their slopes differ, so they are not parallel. In fact $2 \\times \\left(-\\frac{1}{2}\\right) = -1$, so they are perpendicular.",
        no: "They are perpendicular, not parallel: the product of the slopes is $-1$, which is the perpendicular test. Parallel requires the slopes to be *equal*." }
    ],
    exit: [
      { q: "Solve the pair $y = 2x + 1$ and $y = -x + 7$.",
        opts: ["$(2, 5)$", "$(5, 2)$", "$(3, 7)$", "$(1, 3)$"], a: 0,
        e: "Set them equal: $2x + 1 = -x + 7$, so $3x = 6$ and $x = 2$. Then $y = 2(2) + 1 = 5$. Always find the second coordinate too — $x$ alone is half an answer." },
      { q: "How many solutions do $y = 2x + 1$ and $y = 2x + 5$ have?",
        opts: ["None", "One", "Infinitely many", "Two"], a: 0,
        e: "Same slope, different intercept: the lines are parallel and never meet. Setting them equal would give $1 = 5$, a contradiction — the algebra confirms the geometry." }
    ]
  },

  /* ------------------------------------------------------- 10. Practice */
  "11-practice": {
    see: [
      { s: "Before finding the equation of a line, it helps to decide which form suits the information you were given.", a: true, tag: "choose-form",
        ok: "Correct. Point and slope suit point-slope form; two points suit the two-point method; a slope and intercept suit $y = mx + c$.",
        no: "It does — picking the right form first usually removes a step. Two points suggest the slope formula then point-slope; a slope and an intercept suggest $y = mx + c$ directly." },
      { s: "The slope of a line given in general form has to be found by rearranging into $y = mx + c$.", a: false, tag: "must-rearrange",
        ok: "Correct to reject: rearranging always works, but $m = -\\frac{A}{B}$ reads the slope straight off $Ax + By + C = 0$ with no rearrangement at all.",
        no: "Not necessary. Rearranging is fine, but for $Ax + By + C = 0$ the slope is simply $-\\frac{A}{B}$ — no working required. Both routes must agree, so it is a good check." },
      { s: "Checking that your final equation passes through the original points is worth doing.", a: true, tag: "verify-substitution",
        ok: "Correct. Substituting the given point back in takes seconds and catches sign errors, which are the most common mistake in this topic.",
        no: "It is, and it is the single best habit here: substitute the given point into your answer. If the two sides disagree, you have found a slip before anyone else does." }
    ],
    think: [
      { s: "A line through $(1, 2)$ and $(3, 8)$ has slope $3$.", a: true, tag: "practice-slope",
        ok: "Correct: $\\frac{8-2}{3-1} = \\frac{6}{2} = 3$.",
        no: "It does: $\\frac{8-2}{3-1} = \\frac{6}{2} = 3$. Keep the subtraction order consistent in the numerator and the denominator." },
      { s: "The line through $(1, 2)$ with slope $3$ is $y = 3x - 1$.", a: true, tag: "practice-equation",
        ok: "Correct: $y - 2 = 3(x - 1)$ expands to $y = 3x - 1$. Checking: at $x = 1$ it gives $y = 2$.",
        no: "It is: $y - 2 = 3(x - 1)$ gives $y = 3x - 1$. Substituting $x = 1$ returns $y = 2$, which confirms it." },
      { s: "A line perpendicular to $y = 2x + 3$ has slope $-2$.", a: false, tag: "practice-perpendicular",
        ok: "Correct to reject: perpendicular means the negative reciprocal, $-\\frac{1}{2}$. The test is $2 \\times \\left(-\\frac{1}{2}\\right) = -1$, whereas $2 \\times (-2) = -4$.",
        no: "The slope is $-\\frac{1}{2}$, not $-2$. Perpendicular requires the product of the slopes to be $-1$; merely negating the slope is the most common error in the whole topic." }
    ],
    wonder: [
      { s: "Two points with the same $x$-coordinate mean the answer cannot be written as $y = mx + c$.", a: true, tag: "practice-vertical",
        ok: "Correct: the line is vertical, so it has no slope and no $y = mx + c$ form. Write $x = \\text{that value}$, or $Ax + C = 0$.",
        no: "Right — equal $x$-coordinates give a vertical line, which has no slope to put into $y = mx + c$. Use $x = h$, or general form with $B = 0$." },
      { s: "Getting a slope of $\\frac{0}{5}$ means something has gone wrong.", a: false, tag: "zero-over-number",
        ok: "Correct to reject: $\\frac{0}{5}$ is perfectly fine — it is $0$, a horizontal line. It is $\\frac{5}{0}$, division by zero, that signals a vertical line and no slope.",
        no: "Nothing is wrong: $\\frac{0}{5} = 0$, a perfectly good horizontal line. The problematic one is $\\frac{5}{0}$, which is undefined and means the line is vertical." },
      { s: "The same line can be written correctly in several different-looking ways.", a: true, tag: "many-forms-one-line",
        ok: "Correct. $y = 2x + 1$, $y - 1 = 2x$ and $2x - y + 1 = 0$ are all the same line.",
        no: "Yes. Multiply or rearrange any equation of a line and the set of points satisfying it is unchanged — so 'the equation' is really a family of equivalent descriptions." }
    ],
    exit: [
      { q: "Find the equation of the line through $(1, 2)$ and $(3, 8)$.",
        opts: ["$y = 3x - 1$", "$y = 3x + 1$", "$y = 2x - 1$", "$y = \\frac{1}{3}x - 1$"], a: 0,
        e: "$m = \\frac{8-2}{3-1} = 3$, then $y - 2 = 3(x - 1)$ gives $y = 3x - 1$. Check it: at $x = 1$ this is $y = 2$, and at $x = 3$ it is $y = 8$." },
      { q: "Which line is perpendicular to $y = 2x + 3$?",
        opts: ["$y = -\\frac{1}{2}x + 1$", "$y = -2x + 1$", "$y = \\frac{1}{2}x + 1$", "$y = 2x - 1$"], a: 0,
        e: "The slope must be the negative reciprocal of $2$, which is $-\\frac{1}{2}$. Option two negates without reciprocating; option three reciprocates without negating; option four is parallel." }
    ]
  },

  /* -------------------------------------------------------- Summary */
  "12-cheatsheet": {
    see: [
      { s: "The form $y = mx + c$ can describe every straight line.", a: false, tag: "slope-intercept-covers-all",
        ok: "Correct to reject: vertical lines are excluded, because they have no slope to put into $m$. Only the general form $Ax + By + C = 0$ covers every line.",
        no: "Not every one — vertical lines are left out, since there is no value of $m$ for them. That is precisely why $Ax + By + C = 0$ is worth knowing." },
      { s: "Every straight line can be written as $Ax + By + C = 0$.", a: true, tag: "general-covers-all",
        ok: "Correct. With $B = 0$ you get vertical lines; with $A = 0$ horizontal ones; everything else lies in between.",
        no: "Yes — including vertical lines ($B = 0$) and horizontal ones ($A = 0$). This is its main advantage over the slope-intercept form." },
      { s: "The slope of a horizontal line is $0$.", a: true, tag: "horizontal-zero",
        ok: "Correct: no rise at all, so rise over run is $0$.",
        no: "It is $0$: the rise is zero however far you run. Do not confuse it with a vertical line, whose slope is undefined." }
    ],
    think: [
      { s: "The slope of $Ax + By + C = 0$ is $-\\frac{A}{B}$, the $y$-intercept is $-\\frac{C}{B}$, and the $x$-intercept is $-\\frac{C}{A}$.", a: true, tag: "general-summary",
        ok: "Correct — all three read straight off the general form, which is why it is the most efficient form to summarise with.",
        no: "All three are correct. Rearranging to $y = -\\frac{A}{B}x - \\frac{C}{B}$ gives the first two, and putting $y = 0$ gives $x = -\\frac{C}{A}$." },
      { s: "A line with slope $2$ and a line with slope $-\\frac{1}{2}$ are perpendicular.", a: true, tag: "perpendicular-summary",
        ok: "Correct: $2 \\times \\left(-\\frac{1}{2}\\right) = -1$, which is the perpendicular test.",
        no: "They are: the product of the slopes is $-1$. In words, perpendicular slopes are negative reciprocals of each other." },
      { s: "The $x$-intercept of $Ax + By + C = 0$ is $-\\frac{B}{C}$.", a: false, tag: "x-intercept-formula",
        ok: "Correct to reject. Setting $y = 0$ leaves $Ax + C = 0$, so the $x$-intercept is $-\\frac{C}{A}$.",
        no: "It is $-\\frac{C}{A}$: put $y = 0$ and you get $Ax + C = 0$. The two are easy to muddle — the $y$-intercept uses $B$ ($-\\frac{C}{B}$) and the $x$-intercept uses $A$ ($-\\frac{C}{A}$); the constant $C$ is on top in both." }
    ],
    wonder: [
      { s: "If you know one point and the slope, you have enough to write the equation of the line.", a: true, tag: "point-slope-enough",
        ok: "Correct: that is exactly what $y - y_1 = m(x - x_1)$ is for.",
        no: "You do — substitute straight into $y - y_1 = m(x - x_1)$. A point fixes the position and the slope fixes the direction; together they fix the line." },
      { s: "A line's inclination and its slope always increase together.", a: false, tag: "inclination-monotonic",
        ok: "Correct to reject: as the inclination passes $90^\\circ$ the slope jumps from $+\\infty$ to $-\\infty$. It increases on each side of $90^\\circ$, but not across it.",
        no: "Not across $90^\\circ$: the slope grows towards $+\\infty$, then reappears at $-\\infty$ and climbs again. Tangent is not increasing over the whole range $0^\\circ$ to $180^\\circ$." },
      { s: "Every form of a line's equation can be converted into every other form.", a: true, tag: "forms-convertible",
        ok: "Correct — with the single exception of vertical lines, which $y = mx + c$ cannot represent. Apart from that, rearranging takes you from any form to any other.",
        no: "Essentially yes: expand, collect and rearrange. The one genuine gap is $y = mx + c$, which cannot hold a vertical line." }
    ],
    exit: [
      { q: "A line has slope $-\\frac{3}{4}$ and passes through $(0, 5)$. Write it in general form with integer coefficients.",
        opts: ["$3x + 4y - 20 = 0$", "$3x - 4y + 20 = 0$", "$4x + 3y - 20 = 0$", "$3x + 4y + 20 = 0$"], a: 0,
        e: "Start from $y = -\\frac{3}{4}x + 5$, multiply by $4$: $4y = -3x + 20$, so $3x + 4y - 20 = 0$. Check the slope: $-\\frac{A}{B} = -\\frac{3}{4}$." },
      { q: "Find the midpoint of $(1, 3)$ and $(5, 7)$.",
        opts: ["$(3, 5)$", "$(2, 2)$", "$(6, 10)$", "$(4, 4)$"], a: 0,
        e: "Average the coordinates: $\\left(\\frac{1+5}{2},\\ \\frac{3+7}{2}\\right) = (3, 5)$. Option two halves the difference instead of averaging; option three forgets to halve." }
    ]
  }
};
