/* EC1002 syllabus layer: adds the remaining graphs from the subject guide,
   rewrites topics whose notation differs from the guide, then puts every
   topic in course order with its study block. Loads after topics.js. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, ghost, changed, range, XQ, YP } = window.TOPIC_KIT;

  const added = [
    /* ───────────── Block 1 ───────────── */
    {
      id: 'ppf',
      title: 'Production possibility frontier',
      summary: 'The PPF shows every efficient combination of two goods an economy can make with its resources. Its slope is minus the opportunity cost. A linear PPF has constant opportunity cost; a concave one has rising opportunity cost.',
      model: 'Linear: 2C + T = r. Concave: 4C² + T² = r². Both meet the axes at C = r/2 and T = r.',
      graph: {
        x: { range: [0, 6], label: 'Good C' },
        y: { range: [0, 12], label: 'Good T' },
        params: [
          { id: 'shape', label: 'Frontier shape', options: [{ v: 0, label: 'Linear' }, { v: 1, label: 'Concave' }], value: 1 },
          { id: 'r', label: 'Resources and technology (r)', min: 6, max: 11, step: 0.1, value: 10, hint: 'Raise to show economic growth' },
          { id: 'c', label: 'Output of C chosen', min: 0.2, max: 5.4, step: 0.05, value: 3 },
        ],
        draw(s) {
          const lin = s.shape === 0;
          const front = lin ? (c) => s.r - 2 * c : (c) => Math.sqrt(Math.max(0, s.r * s.r - 4 * c * c));
          const c = Math.min(s.c, s.r / 2 - 0.05), t = front(c), m = lin ? 2 : (4 * c) / t;
          return [
            ghost(changed(s.r, 10), lin ? (x) => 10 - 2 * x : (x) => Math.sqrt(Math.max(0, 100 - 4 * x * x)), 'PPF₀', { to: 5 }),
            C(front, 'd', 'PPF', { to: s.r / 2, labelAt: s.r * 0.3 }),
            S(c - 0.7, t + 0.7 * m, c + 0.7, t - 0.7 * m, 'o', null, { dash: true }),
            P(1.5, 3, 'Inefficient', 'n', { small: true }),
            P(5.2, 10.5, 'Unattainable', 'n', { small: true, dx: -9 }),
            G(c, t, 'C', 'T'),
            P(c, t, 'A'),
          ];
        },
        readout(s) {
          const lin = s.shape === 0;
          const c = Math.min(s.c, s.r / 2 - 0.05), t = lin ? s.r - 2 * c : Math.sqrt(s.r * s.r - 4 * c * c);
          const oc = lin ? 2 : (4 * c) / t;
          return {
            rows: [['Good C', f(c)], ['Good T', f(t)], ['Slope ΔT/ΔC', f(-oc)], ['Opportunity cost of 1 more C', f(oc) + ' T']],
            status: lin ? 'Linear PPF: the opportunity cost of C is constant at 2 units of T.' : 'Concave PPF: the opportunity cost of C rises as more C is produced.',
          };
        },
      },
      equations: [
        { name: 'Linear PPF', tex: R`2C + T = 10 \;\Rightarrow\; T = 10 - 2C`, note: 'Write T as a function of C to plot it: T = f(C).' },
        { name: 'Slope and opportunity cost', tex: R`\text{Slope} = \frac{\Delta T}{\Delta C} = -\,\text{OC of } C`, note: 'The opportunity cost of T is the reciprocal, 1/OC of C.' },
        { name: 'Comparative advantage', tex: R`OC^{A}_C < OC^{B}_C \Rightarrow A \text{ specialises in } C`, note: 'Lowest opportunity cost decides specialisation, not highest output.' },
        { name: 'Terms of trade for mutual gain', tex: R`OC^{A}_C < \text{price of } C \text{ in } T < OC^{B}_C`, note: 'Both gain when the trade price lies between their opportunity costs.' },
      ],
      points: [
        'Points on the frontier are efficient; inside means idle or wasted resources; outside is unattainable.',
        'Concave (bowed out) because resources are not equally suited to both goods.',
        'Specialisation and trade let each economy consume outside its own PPF.',
        'Growth in resources or technology shifts the frontier outward.',
      ],
      tip: 'For trade questions, build a 2×2 table of opportunity costs before deciding who specialises in what.',
    },

    /* ───────────── Block 4 ───────────── */
    {
      id: 'income-substitution',
      title: 'Income and substitution effects',
      summary: 'A price change has two parts. The substitution effect is the move along the original indifference curve to the new relative prices. The income effect is the move from there to the new budget line.',
      model: 'U = √(XY), income M = 40, PY = 4, PX starts at 4. The compensated budget line (Hicks) keeps utility at U₀.',
      graph: {
        x: { range: [0, 12], label: 'Good X' },
        y: { range: [0, 12], label: 'Good Y' },
        params: [{ id: 'px', label: 'New price of X (PX₁)', min: 2, max: 8, step: 0.1, value: 8, hint: 'Starting price is 4' }],
        draw(s) {
          const M = 40, py = 4, u0 = 5;
          const x2 = M / (2 * s.px), y2 = M / (2 * py);
          const xc = u0 * Math.sqrt(py / s.px), yc = u0 * Math.sqrt(s.px / py), mc = 2 * u0 * Math.sqrt(s.px * py);
          const u1 = x2 * y2;
          return [
            C((X) => (M - 4 * X) / py, 'n', 'BL₀', { to: 10, labelAt: 1.2 }),
            C((X) => (M - s.px * X) / py, 'd', 'BL₁', { to: M / s.px }),
            changed(s.px, 4) ? C((X) => (mc - s.px * X) / py, 'g', 'Compensated', { dash: true, to: mc / s.px }) : null,
            C((X) => 25 / X, 's', 'U₀', { from: 0.3 }),
            changed(s.px, 4) ? C((X) => u1 / X, 's', 'U₁', { from: 0.3, dash: true }) : null,
            changed(s.px, 4) ? S(5, 0.7, xc, 0.7, 'g', 'SE', { bold: true, below: true }) : null,
            changed(s.px, 4) ? S(xc, 1.6, x2, 1.6, 'd', 'IE', { bold: true, below: true }) : null,
            G(5, 5, 'X₀', null, 'n'),
            changed(s.px, 4) ? G(xc, yc, "X'", null, 'g') : null,
            changed(s.px, 4) ? G(x2, y2, 'X₁', null, 'd') : null,
            P(5, 5, 'E₀', 'n'),
            changed(s.px, 4) ? P(xc, yc, "E'", 'g') : null,
            changed(s.px, 4) ? P(x2, y2, 'E₁', 'o', { dx: -9, dy: -9 }) : null,
          ];
        },
        readout(s) {
          const xc = 5 * Math.sqrt(4 / s.px), x2 = 20 / s.px;
          return {
            rows: [['X before (E₀)', f(5)], ['X compensated (E′)', f(xc)], ['X after (E₁)', f(x2)], ['Substitution effect', f(xc - 5)], ['Income effect', f(x2 - xc)], ['Total effect', f(x2 - 5)]],
            status: s.px > 4 ? 'Price rise: both effects reduce X, so X is a normal good here.' : s.px < 4 ? 'Price fall: both effects raise X, so X is a normal good here.' : 'Move the slider to change the price of X.',
          };
        },
      },
      equations: [
        { name: 'Decomposition', tex: R`\Delta X = \underbrace{(X' - X_0)}_{\text{substitution}} + \underbrace{(X_1 - X')}_{\text{income}}`, note: 'E′ sits on the original indifference curve at the new price ratio.' },
        { name: 'Compensated budget line', tex: R`P_{X_1} X + P_Y Y = M'`, note: 'Parallel to the new budget line, tangent to the old indifference curve.' },
        { name: 'Sign of the substitution effect', tex: R`\frac{\partial X^{c}}{\partial P_X} \le 0`, note: 'Always opposite to the price change.' },
      ],
      points: [
        'Normal good: income effect reinforces the substitution effect.',
        'Inferior good: income effect opposes the substitution effect but is smaller.',
        'Giffen good: an inferior good whose income effect outweighs the substitution effect, so demand slopes up.',
        'Joining the optimum at each price traces the price-consumption curve; plotting X against PX gives the demand curve.',
      ],
      tip: 'Draw the compensated line parallel to the new budget line. Label E₀, E′ and E₁, then mark SE and IE along the X axis.',
    },
    {
      id: 'market-demand',
      title: 'Market demand by horizontal summation',
      summary: 'Market demand adds up the quantities every consumer buys at each price. Sum horizontally (quantities), never vertically (prices). A kink appears at the price where a second buyer enters.',
      model: 'Consumer A: Q_A = 12 − P. Consumer B: Q_B = 12 − 2P (buys only below P = 6).',
      graph: {
        x: { range: [0, 24], label: 'Quantity (Q)' },
        y: { range: [0, 12], label: 'Price (P)', ticks: range(0, 12, 2) },
        params: [{ id: 'p', label: 'Price', min: 0.5, max: 11.5, step: 0.1, value: 4 }],
        draw(s) {
          const qa = Math.max(0, 12 - s.p), qb = Math.max(0, 12 - 2 * s.p);
          return [
            C((Q) => 12 - Q, 'd', 'd_A', { to: 12, labelAt: 10.5 }),
            C((Q) => 6 - Q / 2, 'g', 'd_B', { to: 12, labelAt: 11 }),
            C((Q) => (Q <= 6 ? 12 - Q : (24 - Q) / 3), 's', 'Market D', { to: 24, labelAt: 19 }),
            Hl(s.p, 'o', '', { dash: true }),
            P(6, 6, 'Kink', 'n', { small: true }),
            G(qa, s.p, 'Q_A', null, 'd'),
            qb > 0 ? G(qb, s.p, 'Q_B', null, 'g') : null,
            G(qa + qb, s.p, 'Q', 'P'),
            P(qa, s.p, '', 'd', { small: true }),
            qb > 0 ? P(qb, s.p, '', 'g', { small: true }) : null,
            P(qa + qb, s.p, ''),
          ];
        },
        readout(s) {
          const qa = Math.max(0, 12 - s.p), qb = Math.max(0, 12 - 2 * s.p);
          return { rows: [['Q_A', f(qa)], ['Q_B', f(qb)], ['Market Q = Q_A + Q_B', f(qa + qb)]], status: s.p >= 6 ? 'Above P = 6 only consumer A buys, so market demand equals d_A.' : 'Below P = 6 both consumers buy; the market curve is flatter.' };
        },
      },
      equations: [
        { name: 'Horizontal summation', tex: R`Q_D(P) = \sum_{i} q_i(P)`, note: 'Add quantities at a given price.' },
        { name: 'Example', tex: R`Q_D = \begin{cases} 12 - P & 6 \le P \le 12 \\ 24 - 3P & 0 \le P < 6 \end{cases}`, note: 'Piecewise because B only buys below 6.' },
        { name: 'Add in direct form', tex: R`\text{Sum } Q = f(P), \text{ then invert to plot}`, note: 'Adding inverse demand curves (prices) gives the wrong answer.' },
      ],
      points: [
        'Always write each demand as Q = f(P) before adding.',
        'Check each individual curve’s range: no negative quantities.',
        'Market demand is flatter (more elastic at a given price) than any individual curve.',
      ],
      tip: 'Mark the kink and state its coordinates. Examiners check the piecewise ranges.',
    },

    /* ───────────── Block 5 ───────────── */
    {
      id: 'isoquant',
      title: 'Isoquants and isocosts',
      summary: 'An isoquant shows input combinations that produce the same output. The firm minimises cost where the lowest isocost line just touches the isoquant.',
      model: 'Q = √(LK); isocost C = wL + rK.',
      graph: {
        x: { range: [0, 12], label: 'Labour (L)' },
        y: { range: [0, 12], label: 'Capital (K)' },
        params: [
          { id: 'q', label: 'Target output (Q)', min: 2, max: 8, step: 0.1, value: 5 },
          { id: 'w', label: 'Wage (w)', min: 1, max: 8, step: 0.1, value: 4 },
          { id: 'r', label: 'Rental rate of capital (r)', min: 1, max: 8, step: 0.1, value: 4 },
        ],
        draw(s) {
          const L = s.q * Math.sqrt(s.r / s.w), K = s.q * Math.sqrt(s.w / s.r), c = s.w * L + s.r * K;
          const iso = (cc) => (x) => cc / s.r - (s.w / s.r) * x;
          return [
            C(iso(c * 0.7), 'ghost', '', { to: (c * 0.7) / s.w }),
            C(iso(c * 1.35), 'ghost', '', { to: (c * 1.35) / s.w }),
            C(iso(c), 'd', 'Isocost', { to: c / s.w, labelAt: Math.min(11, c / s.w) * 0.15 }),
            C((x) => (s.q * s.q) / x, 's', `Q = ${s.q.toFixed(1)}`, { from: 0.3 }),
            G(L, K, 'L*', 'K*'),
            P(L, K, 'E'),
          ];
        },
        readout(s) {
          const L = s.q * Math.sqrt(s.r / s.w), K = s.q * Math.sqrt(s.w / s.r);
          return { rows: [['Labour L*', f(L)], ['Capital K*', f(K)], ['Minimum cost', money(s.w * L + s.r * K)], ['MRTS at E', f(-s.w / s.r)]], status: 'A higher wage rotates the isocost steeper, and the firm substitutes capital for labour.' };
        },
      },
      equations: [
        { name: 'Isocost line', tex: R`C = wL + rK \;\Rightarrow\; K = \frac{C}{r} - \frac{w}{r}L`, note: 'Slope −w/r.' },
        { name: 'Marginal rate of technical substitution', tex: R`MRTS = -\frac{MP_L}{MP_K}`, note: 'Slope of the isoquant.' },
        { name: 'Least-cost tangency', tex: R`MRTS = -\frac{w}{r} \;\Rightarrow\; \frac{MP_L}{w} = \frac{MP_K}{r}`, note: 'The last pound spent on each input adds the same output.' },
        { name: 'Returns to scale', tex: R`F(\lambda L, \lambda K) \gtreqless \lambda F(L, K)`, note: 'Increasing, constant or decreasing returns to scale.' },
      ],
      points: [
        'Isoquants slope down, do not cross, and are convex (diminishing MRTS).',
        'Joining cost-minimising points as output rises gives the expansion path, and from it the long-run cost curve.',
        'Diminishing marginal product is a short-run idea; returns to scale is a long-run idea.',
      ],
      tip: 'State the tangency condition in words and symbols, then solve it with the isocost or isoquant equation.',
    },
    {
      id: 'lac-envelope',
      title: 'Long-run average cost envelope',
      summary: 'Each plant size has its own short-run average cost curve. The long-run average cost curve is the lower envelope of all of them, falling with economies of scale and rising with diseconomies.',
      model: 'LAC = 3 + 0.08(Q − 6)². Each SAC is tangent to LAC at its plant size and lies above it elsewhere.',
      graph: {
        x: { range: [0, 12], label: 'Output (Q)' },
        y: { range: [0, 10], label: 'Average cost ($)' },
        params: [{ id: 'k', label: 'Plant size (tangency output)', min: 1.5, max: 11, step: 0.1, value: 3 }],
        draw(s) {
          const lac = (q) => 3 + 0.08 * (q - 6) ** 2, dlac = (q) => 0.16 * (q - 6);
          const sac = (k) => (q) => lac(k) + dlac(k) * (q - k) + 0.35 * (q - k) ** 2;
          return [
            C(sac(2.5), 'ghost', ''), C(sac(6), 'ghost', ''), C(sac(9.5), 'ghost', ''),
            C(lac, 'g', 'LAC', { labelAt: 11.3 }),
            C(sac(s.k), 'd', 'SAC'),
            T(1.2, 1.2, 'Economies of scale', 'n'),
            T(8.6, 1.2, 'Diseconomies', 'n'),
            V(6, 'ghost', 'MES'),
            G(s.k, lac(s.k), 'Q₁', null),
            P(s.k, lac(s.k), 'Tangency'),
          ];
        },
        readout(s) {
          const lac = 3 + 0.08 * (s.k - 6) ** 2, qmin = s.k - (0.16 * (s.k - 6)) / 0.7;
          const sacMin = 3 + 0.08 * (s.k - 6) ** 2 + 0.16 * (s.k - 6) * (qmin - s.k) + 0.35 * (qmin - s.k) ** 2;
          return {
            rows: [['LAC at tangency', money(lac)], ['Output where this SAC is lowest', f(qmin)], ['Minimum of this SAC', money(sacMin)], ['Minimum efficient scale', f(6)]],
            status: s.k < 5.95 ? 'Economies of scale: the tangency is on the falling part of LAC, left of the SAC minimum.' : s.k > 6.05 ? 'Diseconomies of scale: the tangency is on the rising part of LAC, right of the SAC minimum.' : 'At minimum efficient scale: SAC and LAC share the same minimum.',
          };
        },
      },
      equations: [
        { name: 'Long-run average cost', tex: R`LAC = \frac{LTC}{Q}`, note: 'Every input is variable in the long run.' },
        { name: 'Long-run marginal cost', tex: R`LMC = \frac{d(LTC)}{dQ}`, note: 'LMC cuts LAC at its minimum.' },
        { name: 'Envelope property', tex: R`LAC(Q) = \min_{k}\; SAC_k(Q)`, note: 'The cheapest plant for each output level.' },
        { name: 'Economies of scale', tex: R`\frac{d\,LAC}{dQ} < 0`, note: 'Constant returns where LAC is flat; diseconomies where it rises.' },
      ],
      points: [
        'Tangency is at the minimum of SAC only at minimum efficient scale.',
        'Sources of economies: specialisation, indivisibilities, bulk buying, cheaper finance.',
        'Sources of diseconomies: management and coordination problems.',
      ],
      tip: 'Draw at least three SAC curves: one on each side of the LAC minimum and one at it.',
    },

    /* ───────────── Blocks 6–8 ───────────── */
    {
      id: 'monopolistic-competition',
      title: 'Monopolistic competition',
      summary: 'Each firm faces its own downward-sloping demand curve. Short-run profits attract entry, which shifts each firm’s demand left until it is tangent to average cost and profit is zero.',
      model: 'Firm demand P = a − 0.5Q, MR = a − Q, MC = 2, AC = 2 + 4/Q.',
      graph: {
        x: XQ, y: YP,
        params: [{ id: 'a', label: 'Demand per firm (falls as firms enter)', min: 4.83, max: 9, step: 0.01, value: 7 }],
        actions: [{ label: 'Let firms enter (long run)', run: (s) => { s.a = 4.83; } }],
        draw(s) {
          const q = s.a - 2, p = s.a - 0.5 * q, ac = 2 + 4 / q;
          return [
            A([[0, p], [q, p], [q, ac], [0, ac]], p - ac > 0.02 ? 'g' : 'n', p - ac > 0.05 ? 'Profit' : ''),
            C((Q) => 2 + 4 / Q, 'n', 'AC', { from: 0.45, labelAt: 7.5 }),
            Hl(2, 's', 'MC'),
            C((Q) => s.a - 0.5 * Q, 'd', "DD'"),
            C((Q) => s.a - Q, 'g', 'MR', { to: s.a, labelAt: Math.min(s.a - 0.6, 6) }),
            G(q, p, 'Q*', 'P*'),
            P(q, 2, '', 'g', { small: true }),
            P(q, p, ''),
          ];
        },
        readout(s) {
          const q = s.a - 2, p = s.a - 0.5 * q, ac = 2 + 4 / q, pi = (p - ac) * q;
          return {
            rows: [['Output Q*', f(q)], ['Price P*', money(p)], ['AC at Q*', money(ac)], ['Profit', money(pi)]],
            status: pi > 0.05 ? 'Short run: positive profit attracts new firms, shifting DD′ left.' : 'Long run: DD′ is tangent to AC, so P = AC and profit is zero. AC is still falling at Q*, so the firm has excess capacity.',
            tone: pi > 0.05 ? 'info' : 'good',
          };
        },
      },
      equations: [
        { name: 'Profit maximisation', tex: R`MR = MC`, note: 'Same rule as monopoly; price comes from the firm’s demand curve.' },
        { name: 'Long-run tangency', tex: R`P = AC,\quad \text{slope of } DD' = \text{slope of } AC`, note: 'Zero economic profit.' },
        { name: 'Excess capacity', tex: R`\left.\frac{dAC}{dQ}\right|_{Q_{LR}} < 0`, note: 'AC is still falling at the long-run output: firms produce below minimum efficient scale.' },
        { name: 'Markup over marginal cost', tex: R`P > MC`, note: 'So the outcome is not allocatively efficient.' },
      ],
      points: [
        'Many firms, differentiated products, free entry and exit.',
        'Short run looks like monopoly; long run has zero profit like perfect competition.',
        'The cost of variety is excess capacity and P > MC.',
      ],
      tip: 'Draw the long-run diagram with DD′ just touching AC, and MR = MC directly below the tangency.',
    },
    {
      id: 'cournot',
      title: 'Cournot duopoly',
      summary: 'Two firms choose quantities at the same time. Each firm’s reaction function gives its best output for any output of its rival. The Nash equilibrium is where the two reaction functions cross.',
      model: 'Market demand P = 12 − (Q_A + Q_B); marginal costs MC_A and MC_B are constant.',
      graph: {
        x: { range: [0, 12], label: 'Output of firm A (Q_A)' },
        y: { range: [0, 12], label: 'Output of firm B (Q_B)' },
        params: [
          { id: 'ca', label: 'Marginal cost of A', min: 0, max: 6, step: 0.1, value: 3 },
          { id: 'cb', label: 'Marginal cost of B', min: 0, max: 6, step: 0.1, value: 3 },
        ],
        draw(s) {
          const qa = Math.max(0, (12 - 2 * s.ca + s.cb) / 3), qb = Math.max(0, (12 - 2 * s.cb + s.ca) / 3);
          return [
            C((x) => 12 - s.ca - 2 * x, 'd', 'R_A'),
            C((x) => (12 - s.cb - x) / 2, 's', 'R_B'),
            G(qa, qb, 'Q_A*', 'Q_B*'),
            P(qa, qb, 'Nash'),
          ];
        },
        readout(s) {
          const qa = Math.max(0, (12 - 2 * s.ca + s.cb) / 3), qb = Math.max(0, (12 - 2 * s.cb + s.ca) / 3), p = 12 - qa - qb;
          return { rows: [['Q_A*', f(qa)], ['Q_B*', f(qb)], ['Market price', money(p)], ['Profit A', money((p - s.ca) * qa)], ['Profit B', money((p - s.cb) * qb)]], status: 'Lower marginal cost shifts a firm’s reaction function out, raising its equilibrium share.' };
        },
      },
      equations: [
        { name: 'Firm A’s marginal revenue', tex: R`MR_A = a - 2bQ_A - bQ_B`, note: 'Holding Q_B constant.' },
        { name: 'Reaction function', tex: R`MR_A = MC_A \Rightarrow Q_A = \frac{a - MC_A - bQ_B}{2b}`, note: 'Best response of A to each Q_B.' },
        { name: 'Symmetric Nash equilibrium', tex: R`Q_A = Q_B = \frac{a - c}{3b}`, note: 'Total output 2(a − c)/3b lies between monopoly and competition.' },
        { name: 'Output ranking', tex: R`Q_{mon} = \tfrac{a-c}{2b} < Q_{Cournot} = \tfrac{2(a-c)}{3b} < Q_{comp} = \tfrac{a-c}{b}`, note: 'Useful check on your algebra.' },
      ],
      points: [
        'Nash equilibrium: neither firm can gain by changing output given the other’s output.',
        'Collusion (acting as a joint monopoly) earns more but each firm has an incentive to cheat.',
        'With more firms, Cournot output approaches the competitive level.',
      ],
      tip: 'Put Q_A on one axis and Q_B on the other, and check the intercepts of each reaction function.',
    },

    /* ───────────── Block 9 ───────────── */
    {
      id: 'labour-market',
      title: 'Labour demand and MRP',
      summary: 'A firm hires workers until the revenue from the last worker equals the wage. Under perfect competition in the output market, labour demand is the marginal value product curve.',
      model: 'MP_L = 10 − L; output price P; wage w set in a competitive labour market.',
      graph: {
        x: { range: [0, 10], label: 'Workers (L)' },
        y: { range: [0, 30], label: '$ per worker', ticks: range(0, 30, 5) },
        params: [
          { id: 'p', label: 'Output price (P)', min: 1, max: 3, step: 0.05, value: 2 },
          { id: 'w', label: 'Wage (w)', min: 2, max: 20, step: 0.5, value: 8 },
        ],
        draw(s) {
          const L = Math.max(0, 10 - s.w / s.p);
          return [
            ghost(changed(s.p, 2), (l) => 2 * (10 - l), 'MRP₀'),
            C((l) => s.p * (10 - l), 'd', 'MRP_L = D_L', { to: 10 }),
            Hl(s.w, 's', 'w = supply of labour to the firm'),
            G(L, s.w, 'L*', 'w'),
            P(L, s.w, 'E'),
          ];
        },
        readout(s) {
          const L = Math.max(0, 10 - s.w / s.p);
          return { rows: [['Workers hired L*', f(L)], ['MP_L at L*', f(10 - L)], ['MRP_L at L*', money(s.p * (10 - L))], ['Wage bill', money(s.w * L)]], status: 'A higher output price raises MRP and shifts labour demand right.' };
        },
      },
      equations: [
        { name: 'Marginal revenue product', tex: R`MRP_L = MP_L \times MR`, note: 'Extra revenue from one more worker.' },
        { name: 'Value of marginal product', tex: R`MVP_L = MP_L \times P`, note: 'Equals MRP_L when the output market is perfectly competitive.' },
        { name: 'Hiring rule', tex: R`MRP_L = w`, note: 'With a competitive labour market; a monopsonist sets MRP_L = MFC instead.' },
        { name: 'Marginal factor cost (monopsony)', tex: R`MFC = \frac{\Delta(wL)}{\Delta L} > w`, note: 'A monopsonist hires fewer workers at a lower wage.' },
      ],
      points: [
        'Labour demand shifts with output price, productivity and the price of other inputs.',
        'Labour demand is derived demand: it comes from demand for the output.',
        'A minimum wage above the competitive wage cuts employment; under monopsony it can raise it.',
      ],
      tip: 'Label the vertical axis in money per worker and name the curve MRP_L = D_L.',
    },

    /* ───────────── Block 10 ───────────── */
    {
      id: 'edgeworth',
      title: 'Edgeworth box and Pareto efficiency',
      summary: 'The box shows every way to divide fixed totals of two goods between two consumers. Allocations where their indifference curves are tangent are Pareto efficient and form the contract curve.',
      model: 'Totals: 10 of X and 10 of Y. Both have U = √(XY). A measures from bottom left, B from top right.',
      graph: {
        x: { range: [0, 10], label: 'Good X: A from the left, B from the right' },
        y: { range: [0, 10], label: 'Good Y: A from the bottom, B from the top' },
        params: [
          { id: 'ex', label: 'A’s endowment of X', min: 1, max: 9, step: 0.1, value: 8 },
          { id: 'ey', label: 'A’s endowment of Y', min: 1, max: 9, step: 0.1, value: 2 },
        ],
        draw(s) {
          const ua = s.ex * s.ey, ub = (10 - s.ex) * (10 - s.ey);
          const icA = (x) => ua / x, icB = (x) => 10 - ub / (10 - x);
          const up = [], lo = [];
          for (let x = 0.05; x < 9.95; x += 0.05) { if (icB(x) > icA(x)) { up.push([x, icB(x)]); lo.unshift([x, icA(x)]); } }
          const xe = (s.ex + s.ey) / 2;
          return [
            up.length > 2 ? A([...up, ...lo], 'o', '') : null,
            C((x) => x, 'g', 'Contract curve', { labelAt: 7.2 }),
            C(icA, 'd', 'A’s IC', { from: 0.3 }),
            C(icB, 's', 'B’s IC', { to: 9.7, labelAt: 4.5 }),
            C((x) => s.ex + s.ey - x, 'n', 'Price line', { dash: true, labelAt: Math.max(0.4, s.ex + s.ey - 8.6) }),
            T(0.15, 0.3, 'Origin A', 'd'),
            T(9.85, 9.5, 'Origin B', 's', { anchor: 'end' }),
            P(s.ex, s.ey, 'Endowment', 'n'),
            P(xe, xe, 'Equilibrium', 'o', { dx: -9 }),
          ];
        },
        readout(s) {
          const mrsA = s.ey / s.ex, mrsB = (10 - s.ey) / (10 - s.ex), xe = (s.ex + s.ey) / 2;
          const onCC = Math.abs(s.ex - s.ey) < 0.05;
          return {
            rows: [['|MRS_A| at endowment', f(mrsA)], ['|MRS_B| at endowment', f(mrsB)], ['Equilibrium price PX/PY', f(1)], ['A’s final bundle', `${f(xe, 1)} X, ${f(xe, 1)} Y`], ['B’s final bundle', `${f(10 - xe, 1)} X, ${f(10 - xe, 1)} Y`]],
            status: onCC ? 'The endowment is on the contract curve: already Pareto efficient, no mutually beneficial trade.' : 'MRS differs, so both can gain by trading into the shaded lens. Competitive trade ends on the contract curve.',
            tone: onCC ? 'good' : 'info',
          };
        },
      },
      equations: [
        { name: 'Pareto efficiency in exchange', tex: R`MRS_A = MRS_B`, note: 'Indifference curves are tangent; no one can gain without someone losing.' },
        { name: 'Competitive equilibrium', tex: R`MRS_A = MRS_B = -\frac{P_X}{P_Y}`, note: 'First welfare theorem: competitive markets reach a Pareto-efficient point.' },
        { name: 'Pareto efficiency in production', tex: R`MRTS_X = MRTS_Y`, note: 'Inputs allocated so neither output can rise without the other falling.' },
        { name: 'Overall efficiency', tex: R`MRS = MRT`, note: 'Consumers’ trade-off equals the PPF’s trade-off.' },
      ],
      points: [
        'The lens between the two indifference curves through the endowment holds every mutually beneficial trade.',
        'The contract curve is every Pareto-efficient allocation; efficiency says nothing about fairness.',
        'Second welfare theorem: any efficient allocation can be reached by redistributing endowments then letting markets work.',
      ],
      tip: 'Mark both origins clearly and draw B’s indifference curves bowed toward O_B.',
    },

    /* ───────────── Block 11 ───────────── */
    {
      id: 'national-income',
      title: 'National income and the circular flow',
      summary: 'Firms pay incomes to households, and households spend on firms’ output. Saving, net taxes and imports leak out of the flow; investment, government spending and exports are injected back in.',
      model: 'Blue: the core income–spending loop. Red: leakages. Green: injections. In equilibrium, leakages equal injections.',
      diagram: circularFlow(),
      equations: [
        { name: 'GDP (expenditure) identity', tex: R`GDP \equiv Y \equiv C + I + G + (X - Z)`, note: 'Z is imports; X − Z is net exports.' },
        { name: 'Leakages equal injections', tex: R`S + NT + Z \equiv I + G + X`, note: 'NT is net taxes (taxes minus transfers).' },
        { name: 'Disposable income', tex: R`Y_d = Y - NT`, note: 'What households can spend or save.' },
        { name: 'Uses of income', tex: R`Y_d = C + S`, note: 'Every pound of disposable income is spent or saved.' },
        { name: 'Three measures of GDP', tex: R`\text{Output} = \text{Income} = \text{Expenditure}`, note: 'Value added, factor incomes and final spending give the same total.' },
      ],
      points: [
        'Count final goods only (or sum value added) to avoid double counting.',
        'GDP is production within the country; GNP adds net income from abroad.',
        'Real GDP removes price changes; use it for growth comparisons.',
        'Transfers are not part of G because nothing is produced in exchange.',
      ],
      tip: 'Label each flow with its symbol and direction, and group them as leakages and injections.',
    },

    /* ───────────── Block 12 ───────────── */
    {
      id: 'solow',
      title: 'Solow growth model',
      summary: 'Capital per effective worker grows while investment exceeds effective depreciation. The steady state is where they meet. Higher saving raises the level of output per worker, not its long-run growth rate.',
      model: 'y = k^α; investment s·f(k); effective depreciation (n + d + g)k.',
      graph: {
        x: { range: [0, 10], label: 'Capital per effective worker (k)' },
        y: { range: [0, 3], label: 'Output and investment per worker', ticks: range(0, 3, 1) },
        params: [
          { id: 's', label: 'Saving rate (s)', min: 0.1, max: 0.6, step: 0.01, value: 0.3 },
          { id: 'n', label: 'Population growth (n)', min: 0, max: 0.06, step: 0.005, value: 0.02 },
          { id: 'd', label: 'Depreciation (d)', min: 0.02, max: 0.1, step: 0.005, value: 0.05 },
          { id: 'g', label: 'Technological progress (g)', min: 0, max: 0.05, step: 0.005, value: 0.03 },
          { id: 'al', label: 'Capital share (α)', min: 0.25, max: 0.5, step: 0.01, value: 0.33 },
        ],
        draw(s) {
          const b = s.n + s.d + s.g, ks = Math.pow(s.s / b, 1 / (1 - s.al)), kg = Math.pow(s.al / b, 1 / (1 - s.al));
          return [
            C((k) => Math.pow(k, s.al), 'n', 'f(k)'),
            C((k) => s.s * Math.pow(k, s.al), 'd', 's·f(k)'),
            C((k) => b * k, 's', '(n + d + g)k'),
            V(kg, 'ghost', 'k gold'),
            G(ks, b * ks, 'k*', null),
            P(ks, Math.pow(ks, s.al), 'y*', 'n', { small: true }),
            P(ks, b * ks, 'E'),
          ];
        },
        readout(s) {
          const b = s.n + s.d + s.g, ks = Math.pow(s.s / b, 1 / (1 - s.al)), ys = Math.pow(ks, s.al);
          return {
            rows: [['Steady-state k*', f(ks)], ['Steady-state y*', f(ys)], ['Consumption c* = (1 − s)y*', f((1 - s.s) * ys)], ['Output per worker grows at', pct(s.g * 100)], ['Golden-rule saving rate', pct(s.al * 100, 0)]],
            status: Math.abs(s.s - s.al) < 0.01 ? 'Saving rate equals the golden rule: steady-state consumption is maximised.' : s.s < s.al ? 'Below the golden rule: saving more would raise steady-state consumption.' : 'Above the golden rule: saving less would raise steady-state consumption.',
          };
        },
      },
      equations: [
        { name: 'Production per effective worker', tex: R`y = f(k) = k^{\alpha}`, note: 'Diminishing returns to capital.' },
        { name: 'Capital accumulation', tex: R`\Delta k = s f(k) - (n + d + g)k`, note: 'Investment minus effective depreciation.' },
        { name: 'Steady-state condition', tex: R`s f(k^*) = (n + d + g)k^*`, note: 'k stops changing.' },
        { name: 'Steady-state capital', tex: R`k^* = \left(\frac{s}{n + d + g}\right)^{\frac{1}{1-\alpha}}`, note: 'For Cobb–Douglas f(k) = k^α.' },
        { name: 'Golden rule', tex: R`f'(k_{g}) = n + d + g \;\Rightarrow\; s_g = \alpha`, note: 'Maximises steady-state consumption.' },
        { name: 'Growth accounting', tex: R`g_Y = g_A + \alpha g_K + (1 - \alpha) g_L`, note: 'The residual g_A is TFP growth.' },
      ],
      points: [
        'In steady state, output per worker grows at g; total output grows at n + g.',
        'Saving and population growth have level effects only; technology drives sustained growth.',
        'Conditional convergence: economies with similar parameters converge to similar paths.',
      ],
      tip: 'Separate level effects (a new steady state) from growth effects (a permanently higher growth rate).',
    },

    /* ───────────── Block 13 ───────────── */
    {
      id: 'keynesian-cross',
      title: 'Keynesian cross and multipliers',
      summary: 'Equilibrium output is where aggregate demand meets the 45° line. If that falls short of full-employment output there is a deflationary gap; if it overshoots there is an inflationary gap.',
      model: 'AD = Ā + c(1 − t)Y − zY, where Ā is autonomous spending (A + I + G + X). Full-employment output Y_f = 6.',
      graph: {
        x: { range: [0, 12], label: 'National income (Y)' },
        y: { range: [0, 12], label: 'Aggregate demand (AD)' },
        params: [
          { id: 'A', label: 'Autonomous spending (Ā)', min: 1, max: 5, step: 0.1, value: 2.5 },
          { id: 'c', label: 'MPC (c)', min: 0.5, max: 0.95, step: 0.01, value: 0.8 },
          { id: 't', label: 'Tax rate (t)', min: 0, max: 0.4, step: 0.01, value: 0.2 },
          { id: 'z', label: 'Marginal propensity to import (z)', min: 0, max: 0.3, step: 0.01, value: 0.14 },
        ],
        draw(s) {
          const slope = s.c * (1 - s.t) - s.z, y = s.A / (1 - slope), ad = (Y) => s.A + slope * Y, yf = 6;
          const gap = yf - ad(yf);
          return [
            C((Y) => Y, 'n', '45° (AD = Y)', { labelAt: 10.2 }),
            ghost(changed(s.A, 2.5) || changed(s.c, 0.8) || changed(s.t, 0.2) || changed(s.z, 0.14), (Y) => 2.5 + 0.5 * Y, 'AD₀'),
            C(ad, 'd', 'AD'),
            V(yf, 'g', 'Y_f'),
            Math.abs(gap) > 0.05 ? S(yf, ad(yf), yf, yf, 'o', '', { bold: true }) : null,
            Math.abs(gap) > 0.05 ? T(yf + 0.25, (ad(yf) + yf) / 2, gap > 0 ? 'Deflationary gap' : 'Inflationary gap', 'o') : null,
            G(y, y, 'Y*', null),
            P(y, y, 'E'),
          ];
        },
        readout(s) {
          const slope = s.c * (1 - s.t) - s.z, k = 1 / (1 - slope), y = s.A * k, gap = 6 - (s.A + slope * 6);
          return {
            rows: [['Equilibrium Y*', f(y)], ['Multiplier K', f(k)], ['Full-employment Y_f', f(6)], [gap >= 0 ? 'Deflationary gap' : 'Inflationary gap', f(Math.abs(gap))], ['Change in Ā to close it', f(gap)]],
            status: Math.abs(gap) < 0.05 ? 'Equilibrium is at full employment.' : gap > 0 ? `AD is ${f(gap)} too low at Y_f. Raising Ā by that much lifts Y by ${f(gap * k)}.` : `AD is ${f(-gap)} too high at Y_f. Output cannot exceed capacity for long, so prices rise.`,
            tone: Math.abs(gap) < 0.05 ? 'good' : 'warn',
          };
        },
      },
      equations: [
        { name: 'Consumption function', tex: R`C = A + cY_d`, note: 'A: autonomous consumption; c = MPC.' },
        { name: 'Disposable income', tex: R`Y_d = Y - NT = Y(1 - t)`, note: 'With a proportional tax rate t.' },
        { name: 'Propensities', tex: R`MPC + MPS \equiv 1`, note: 'Written c + s = 1.' },
        { name: 'Simple multiplier (2-sector)', tex: R`K = \frac{1}{1 - c} = \frac{1}{s}`, note: 'No government or trade.' },
        { name: 'Open-economy multiplier', tex: R`K = \frac{1}{1 - c(1 - t) + z} = \frac{1}{t + s(1 - t) + z}`, note: 'Taxes and imports are leakages that shrink K.' },
        { name: 'Balanced-budget multiplier', tex: R`K_{BB} = 1`, note: 'Equal rises in G and lump-sum T raise Y by the same amount.' },
      ],
      points: [
        'Deflationary gap: the rise in AD needed at Y_f to reach full employment. It is not Y_f − Y*.',
        'If AD > Y, stocks run down and firms raise output; if AD < Y, stocks build up.',
        'Paradox of thrift: a rise in saving can lower income without raising total saving.',
      ],
      tip: 'Measure the gap vertically at Y_f, and state the multiplier formula you used.',
    },
    {
      id: 'injections-leakages',
      title: 'Injections and leakages',
      summary: 'The same equilibrium as the Keynesian cross, seen another way: output settles where planned leakages (S + NT + Z) equal planned injections (I + G + X).',
      model: 'Leakages S + NT + Z = −A + [1 − c(1 − t) + z]Y with autonomous consumption A = 0.5. Injections I + G + X are fixed.',
      graph: {
        x: { range: [0, 12], label: 'National income (Y)' },
        y: { range: [-1, 6], label: 'Leakages and injections', ticks: range(-1, 6, 1) },
        params: [
          { id: 'J', label: 'Injections I + G + X', min: 1, max: 4, step: 0.1, value: 2 },
          { id: 'c', label: 'MPC (c)', min: 0.5, max: 0.95, step: 0.01, value: 0.8 },
          { id: 't', label: 'Tax rate (t)', min: 0, max: 0.4, step: 0.01, value: 0.2 },
          { id: 'z', label: 'Marginal propensity to import (z)', min: 0, max: 0.3, step: 0.01, value: 0.14 },
        ],
        draw(s) {
          const lr = 1 - s.c * (1 - s.t) + s.z, y = (0.5 + s.J) / lr;
          return [
            Hl(0, 'ghost', ''),
            ghost(changed(s.J, 2), (Y) => 2, 'J₀'),
            Hl(s.J, 'g', 'I + G + X'),
            C((Y) => -0.5 + lr * Y, 's', 'S + NT + Z'),
            G(y, s.J, 'Y*', null),
            P(y, s.J, 'E'),
          ];
        },
        readout(s) {
          const lr = 1 - s.c * (1 - s.t) + s.z;
          return { rows: [['Equilibrium Y*', f((0.5 + s.J) / lr)], ['Marginal leakage rate', f(lr)], ['Multiplier K = 1 / leakage rate', f(1 / lr)]], status: 'A steeper leakages line (higher t, z or s) means a smaller multiplier.' };
        },
      },
      equations: [
        { name: 'Equilibrium condition', tex: R`S + NT + Z = I + G + X`, note: 'Planned withdrawals equal planned injections.' },
        { name: 'Saving function', tex: R`S = -A + s\,Y_d`, note: 'Negative at low income: dissaving.' },
        { name: 'Marginal propensity to withdraw', tex: R`MPW = s(1 - t) + t + z`, note: 'Slope of the leakages line.' },
        { name: 'Multiplier', tex: R`K = \frac{1}{MPW}`, note: 'Same as the open-economy multiplier.' },
      ],
      points: [
        'A rise in any injection shifts the flat line up; output rises by K times the change.',
        'Leakages and injections are always equal ex post; only planned amounts must match in equilibrium.',
      ],
      tip: 'Draw this directly under the 45° diagram with the same Y axis so both show the same Y*.',
    },

    /* ───────────── Block 15 ───────────── */
    {
      id: 'is-mp',
      title: 'IS–MP model',
      summary: 'The IS curve gives the output that clears the goods market at each real interest rate. The MP curve shows the rate the central bank sets. Equilibrium output and interest rate are where they cross.',
      model: 'IS: r = a − 0.8Y. MP: r = r₀ + β(Y − 5). β = 0 is a flat MP schedule; β > 0 means the bank raises r as output rises.',
      graph: {
        x: { range: [0, 10], label: 'Output (Y)' },
        y: { range: [0, 10], label: 'Real interest rate (r)' },
        params: [
          { id: 'a', label: 'Autonomous spending and fiscal policy', min: 6, max: 12, step: 0.1, value: 9, hint: 'Higher G or confidence shifts IS right' },
          { id: 'r0', label: 'Central bank rate at Y = 5 (r₀)', min: 1, max: 8, step: 0.1, value: 5, hint: 'Monetary tightening shifts MP up' },
          { id: 'b', label: 'MP slope (β)', min: 0, max: 1.5, step: 0.05, value: 0 },
        ],
        draw(s) {
          const y = (s.a - s.r0 + 5 * s.b) / (0.8 + s.b), r = s.a - 0.8 * y;
          return [
            ghost(changed(s.a, 9), (Y) => 9 - 0.8 * Y, 'IS₀'),
            ghost(changed(s.r0, 5) || changed(s.b, 0), () => 5, 'MP₀'),
            C((Y) => s.a - 0.8 * Y, 'd', 'IS'),
            C((Y) => s.r0 + s.b * (Y - 5), 's', 'MP'),
            G(y, r, 'Y*', 'r*'),
            P(y, r, 'E'),
          ];
        },
        readout(s) {
          const y = (s.a - s.r0 + 5 * s.b) / (0.8 + s.b), r = s.a - 0.8 * y;
          return { rows: [['Output Y*', f(y)], ['Real interest rate r*', pct(r, 2)]], status: s.b === 0 ? 'Flat MP: a fiscal expansion raises output by the full goods-market effect, no crowding out.' : 'Upward-sloping MP: the bank responds to higher output by raising r, partly offsetting fiscal expansion.' };
        },
      },
      equations: [
        { name: 'IS curve', tex: R`Y = C(Y - T) + I(r) + G + NX`, note: 'Slopes down: a lower r raises investment and output.' },
        { name: 'Linear IS', tex: R`Y = K\,(\bar{A} - b\,r)`, note: 'K is the multiplier; b is the interest sensitivity of investment.' },
        { name: 'MP schedule', tex: R`r = r_0 + \beta\,(Y - Y^*)`, note: 'The central bank sets r; β = 0 is a horizontal MP line.' },
        { name: 'Fisher equation', tex: R`r \approx i - \pi^e`, note: 'The central bank sets i; spending depends on r.' },
      ],
      points: [
        'Fiscal expansion shifts IS right. Monetary tightening shifts MP up.',
        'The IS curve is flatter when investment is more interest-sensitive or the multiplier is larger.',
        'IS–MP replaces the LM curve because modern central banks target interest rates, not the money stock.',
      ],
      tip: 'Say which curve shifts and why before describing the new equilibrium.',
    },

    /* ───────────── Block 16 ───────────── */
    {
      id: 'ad-as',
      title: 'Aggregate demand and aggregate supply',
      summary: 'Short-run output and prices are set where AD meets SRAS. Over time, price expectations adjust and SRAS shifts until output returns to potential, on the vertical LRAS.',
      model: 'AD: P = a − Y. SRAS: P = Pᵉ + γ(Y − Y*) + v. LRAS at Y* = 5.',
      graph: {
        x: { range: [0, 10], label: 'Real output (Y)' },
        y: { range: [0, 10], label: 'Price level (P)' },
        params: [
          { id: 'a', label: 'Aggregate demand (a)', min: 7, max: 13, step: 0.1, value: 10, hint: 'Fiscal stimulus shifts AD right' },
          { id: 'v', label: 'Supply shock (v)', min: -2, max: 3, step: 0.1, value: 0, hint: 'An oil price spike is v > 0' },
          { id: 'pe', label: 'Expected price level (Pᵉ)', min: 0, max: 10, step: 0.1, value: 5 },
          { id: 'gm', label: 'SRAS slope (γ)', min: 0.3, max: 1.5, step: 0.05, value: 0.8 },
        ],
        actions: [{ label: 'Let expectations adjust (long run)', run: (s) => { s.pe = s.a - 5 - s.v; } }],
        draw(s) {
          const y = (s.a - s.pe - s.v + 5 * s.gm) / (1 + s.gm), p = s.a - y;
          return [
            ghost(changed(s.a, 10), (Y) => 10 - Y, 'AD₀'),
            ghost(changed(s.pe, 5) || changed(s.v, 0) || changed(s.gm, 0.8), (Y) => 5 + 0.8 * (Y - 5), 'SRAS₀'),
            V(5, 'g', 'LRAS'),
            C((Y) => s.a - Y, 'd', 'AD'),
            C((Y) => s.pe + s.gm * (Y - 5) + s.v, 's', 'SRAS'),
            G(y, p, 'Y', 'P'),
            T(5, 0.4, 'Y*', 'g', { anchor: 'middle' }),
            P(y, p, 'E'),
          ];
        },
        readout(s) {
          const y = (s.a - s.pe - s.v + 5 * s.gm) / (1 + s.gm), p = s.a - y, gap = ((y - 5) / 5) * 100;
          return {
            rows: [['Output Y', f(y)], ['Price level P', f(p)], ['Output gap', pct(gap)], ['P − Pᵉ (price surprise)', f(p - s.pe)]],
            status: Math.abs(gap) < 0.5 ? 'Long-run equilibrium: output at potential and prices as expected.' : gap < 0 ? 'Recessionary gap. Expectations will fall, shifting SRAS down. Press “Let expectations adjust”.' : 'Inflationary gap. Expectations will rise, shifting SRAS up. Press “Let expectations adjust”.',
            tone: Math.abs(gap) < 0.5 ? 'good' : 'warn',
          };
        },
      },
      equations: [
        { name: 'Aggregate demand', tex: R`AD = C + I + G + NX`, note: 'Slopes down in P–Y space.' },
        { name: 'Long-run aggregate supply', tex: R`Y = Y^*`, note: 'Potential output, independent of the price level.' },
        { name: 'Short-run aggregate supply', tex: R`P = P^e + \gamma\,(Y - Y^*)`, note: 'Output exceeds potential only when prices exceed expectations.' },
        { name: 'Taylor rule', tex: R`r = r^* + \alpha(\pi - \pi^*) + \beta(Y - Y^*)`, note: 'The central bank raises r when inflation or output is above target.' },
        { name: 'Output gap', tex: R`\frac{Y - Y^*}{Y^*}\times 100`, note: 'Negative is recessionary, positive is inflationary.' },
      ],
      points: [
        'Demand shock: short run moves along SRAS; long run returns to Y* at a new price level.',
        'Supply shock (oil): SRAS shifts up, giving stagflation, higher P and lower Y.',
        'Policy can speed adjustment to a demand shock but faces a trade-off after a supply shock.',
      ],
      tip: 'Show short run and long run separately: E₀ → E₁ (short run) → E₂ (long run), with arrows.',
    },

    /* ───────────── Blocks 17–18 ───────────── */
    {
      id: 'phillips',
      title: 'Phillips curve',
      summary: 'In the short run lower unemployment comes with higher inflation. When expectations adjust, the SRPC shifts vertically, so in the long run unemployment returns to u* at any inflation rate.',
      model: 'SRPC: π = πᵉ − γ(u − u*) + v, with u* = 5%.',
      graph: {
        x: { range: [0, 10], label: 'Unemployment rate (%)', ticks: range(0, 10, 2), fmt: (v) => v + '%' },
        y: { range: [-2, 10], label: 'Inflation rate (%)', ticks: range(-2, 10, 2), fmt: (v) => v + '%' },
        params: [
          { id: 'u', label: 'Actual unemployment (u)', min: 2, max: 9, step: 0.1, value: 4 },
          { id: 'pe', label: 'Expected inflation (πᵉ)', min: 0, max: 8, step: 0.1, value: 2 },
          { id: 'gm', label: 'Slope (γ)', min: 0.4, max: 2, step: 0.05, value: 1 },
          { id: 'v', label: 'Supply shock (v)', min: -2, max: 3, step: 0.1, value: 0 },
        ],
        actions: [{ label: 'Expectations catch up', run: (s) => { s.pe = s.pe - s.gm * (s.u - 5) + s.v; } }],
        draw(s) {
          const pi = s.pe - s.gm * (s.u - 5) + s.v;
          return [
            Hl(0, 'ghost', ''),
            ghost(changed(s.pe, 2) || changed(s.v, 0) || changed(s.gm, 1), (u) => 2 - (u - 5), 'SRPC₀'),
            V(5, 'g', 'LRPC'),
            C((u) => s.pe - s.gm * (u - 5) + s.v, 'd', 'SRPC'),
            G(s.u, pi, null, null),
            P(5, s.pe + s.v, 'πᵉ + v', 'n', { small: true }),
            P(s.u, pi, 'A'),
          ];
        },
        readout(s) {
          const pi = s.pe - s.gm * (s.u - 5) + s.v;
          return {
            rows: [['Inflation π', pct(pi)], ['Expected inflation πᵉ', pct(s.pe)], ['Unemployment u', pct(s.u)], ['u − u*', pct(s.u - 5)]],
            status: Math.abs(s.u - 5) < 0.05 ? 'At the natural rate: inflation equals expectations (plus any shock).' : s.u < 5 ? 'Below u*: inflation exceeds expectations. Each time expectations catch up, SRPC shifts up.' : 'Above u*: inflation is below expectations. As expectations fall, SRPC shifts down.',
          };
        },
      },
      equations: [
        { name: 'Expectations-augmented Phillips curve', tex: R`\pi = \pi^e - \gamma\,(u - u^*) + \text{supply shock}`, note: 'Only unexpected inflation lowers unemployment.' },
        { name: 'Natural rate / NAIRU', tex: R`\pi = \pi^e \;\Rightarrow\; u = u^*`, note: 'The long-run Phillips curve is vertical at u*.' },
        { name: 'Adaptive expectations', tex: R`\pi^e_t = \pi_{t-1}`, note: 'Holding u below u* means accelerating inflation.' },
        { name: 'Okun’s law', tex: R`\frac{Y - Y^*}{Y^*} = -2\,(u - u^*)`, note: 'Links the Phillips curve to the output gap.' },
      ],
      points: [
        'A demand expansion is a move up and left along the SRPC.',
        'Rising expectations or an adverse supply shock shift the SRPC up.',
        'Credible inflation targets anchor πᵉ and make disinflation cheaper.',
      ],
      tip: 'Hold u below u* and press “Expectations catch up” a few times to see why inflation accelerates.',
    },

    /* ───────────── Blocks 19–20 ───────────── */
    {
      id: 'forex',
      title: 'Foreign exchange market',
      summary: 'Under a floating regime the exchange rate moves to clear the market. Under a fixed regime the central bank holds the rate and must buy or sell its own currency to cover any gap.',
      model: 'Demand for domestic currency e = a − 0.8Q; supply e = c + 0.6Q; e is foreign currency per unit of domestic.',
      graph: {
        x: { range: [0, 12], label: 'Quantity of domestic currency' },
        y: { range: [0, 10], label: 'Exchange rate e (foreign per domestic)' },
        params: [
          { id: 'reg', label: 'Regime', options: [{ v: 0, label: 'Floating' }, { v: 1, label: 'Fixed' }], value: 0 },
          { id: 'a', label: 'Demand (exports, capital inflows)', min: 6, max: 12, step: 0.1, value: 9 },
          { id: 'c', label: 'Supply shifter (imports, outflows)', min: -1, max: 4, step: 0.1, value: 1, hint: 'Lower means more supplied: curve shifts right' },
          { id: 'fix', label: 'Pegged rate (fixed regime)', min: 2, max: 8, step: 0.01, value: 4.43 },
        ],
        draw(s) {
          const q = (s.a - s.c) / 1.4, e = s.a - 0.8 * q;
          const out = [
            ghost(changed(s.a, 9), (Q) => 9 - 0.8 * Q, 'D₀'),
            ghost(changed(s.c, 1), (Q) => 1 + 0.6 * Q, 'S₀'),
            C((Q) => s.a - 0.8 * Q, 'd', 'D'),
            C((Q) => s.c + 0.6 * Q, 's', 'S'),
          ];
          if (s.reg === 1) {
            const qd = (s.a - s.fix) / 0.8, qs = (s.fix - s.c) / 0.6;
            out.push(Hl(s.fix, 'o', 'Peg', { dash: true }), G(qd, s.fix, 'Qd', null, 'd'), G(qs, s.fix, 'Qs', null, 's'),
              Math.abs(qs - qd) > 0.02 ? S(Math.min(qd, qs), s.fix, Math.max(qd, qs), s.fix, 'o', qs > qd ? 'Bank buys' : 'Bank sells', { bold: true, below: true }) : null,
              P(q, e, '', 'n', { small: true }));
          } else {
            out.push(G(q, e, 'Q*', 'e*'), P(q, e, 'E'));
          }
          return out;
        },
        readout(s) {
          const q = (s.a - s.c) / 1.4, e = s.a - 0.8 * q, e0 = 9 - 0.8 * (8 / 1.4), ch = ((e - e0) / e0) * 100;
          if (s.reg === 1) {
            const gap = (s.fix - s.c) / 0.6 - (s.a - s.fix) / 0.8;
            return {
              rows: [['Pegged rate', f(s.fix, 2)], ['Market-clearing rate', f(e, 2)], [gap > 0 ? 'Excess supply of currency' : 'Excess demand for currency', f(Math.abs(gap))]],
              status: gap > 0.01 ? 'Peg is overvalued: the bank buys its own currency with foreign reserves, which run down.' : gap < -0.01 ? 'Peg is undervalued: the bank sells its own currency and piles up foreign reserves.' : 'Peg equals the market rate: no intervention needed.',
              tone: gap > 0.01 ? 'warn' : 'info',
            };
          }
          return { rows: [['Exchange rate e*', f(e, 3)], ['Change from start', pct(ch)]], status: Math.abs(ch) < 0.05 ? 'At the starting rate.' : ch > 0 ? 'Appreciation: exports dearer abroad, imports cheaper at home.' : 'Depreciation: exports cheaper abroad, imports dearer at home.' };
        },
      },
      equations: [
        { name: 'Real exchange rate', tex: R`RER = \frac{e \cdot P}{P^*}`, note: 'Price of domestic goods in terms of foreign goods.' },
        { name: 'Purchasing power parity', tex: R`e = \frac{P^*}{P} \;\Rightarrow\; RER = 1`, note: 'Long-run benchmark.' },
        { name: 'Relative PPP', tex: R`\%\Delta e \approx \pi^* - \pi`, note: 'Higher domestic inflation means depreciation.' },
        { name: 'Uncovered interest parity', tex: R`i = i^* + \text{expected depreciation of home currency}`, note: 'Capital flows equalise expected returns.' },
        { name: 'Balance of payments', tex: R`\text{Current account} + \text{Financial account} = 0`, note: 'Under a float, net official intervention is zero.' },
        { name: 'Marshall–Lerner condition', tex: R`|PED_X| + |PED_Z| > 1`, note: 'A depreciation improves the trade balance only if this holds.' },
      ],
      points: [
        'Demand for the currency comes from exports and capital inflows; supply from imports and capital outflows.',
        'A fixed rate needs reserves to defend an overvalued peg; running out forces devaluation.',
        'Under a fixed rate with free capital flows, monetary policy is committed to the peg (the impossible trinity).',
      ],
      tip: 'State how the rate is quoted before calling a rise an appreciation.',
    },
  ];

  function circularFlow() {
    const box = (x, y, w, h, label) => `<g class="node"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle">${label}</text></g>`;
    const flow = (d, k) => `<path class="flow k-${k}" d="${d}" marker-end="url(#cf-${k})"/>`;
    const lab = (x, y, t, k, anchor = 'middle') => `<text class="flabel t-${k}" x="${x}" y="${y}" text-anchor="${anchor}">${t}</text>`;
    const marker = (k) => `<marker id="cf-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="p-${k}"/></marker>`;
    return `<svg class="graph diagram" viewBox="0 0 560 380" role="img" aria-label="Circular flow of income with leakages and injections">
      <defs>${marker('d')}${marker('s')}${marker('g')}</defs>
      ${flow('M500 160 V105 H60 V158', 'd')}${lab(280, 98, 'Factor incomes (Y)', 'd')}
      ${flow('M60 220 V278 H500 V222', 'd')}${lab(280, 296, 'Consumption (C)', 'd')}
      ${flow('M140 190 H218', 's')}${lab(179, 182, 'S', 's')}
      ${flow('M340 190 H418', 'g')}${lab(379, 182, 'I', 'g')}
      ${flow('M110 160 V45 H218', 's')}${lab(118, 60, 'NT', 's', 'start')}
      ${flow('M340 45 H460 V158', 'g')}${lab(452, 60, 'G', 'g', 'end')}
      ${flow('M110 220 V335 H218', 's')}${lab(118, 326, 'Z', 's', 'start')}
      ${flow('M340 335 H460 V222', 'g')}${lab(452, 326, 'X', 'g', 'end')}
      ${box(20, 160, 120, 60, 'Households')}
      ${box(420, 160, 120, 60, 'Firms')}
      ${box(220, 20, 120, 50, 'Government')}
      ${box(220, 163, 120, 54, 'Financial sector')}
      ${box(220, 310, 120, 50, 'Rest of world')}
      ${lab(20, 375, 'Leakages: S + NT + Z', 's', 'start')}${lab(540, 375, 'Injections: I + G + X', 'g', 'end')}
    </svg>`;
  }

  /* Course order and block for every topic. */
  const MICRO = 'Microeconomics', MACRO = 'Macroeconomics', MORE = 'Further topics';
  const ORDER = [
    ['ppf', MICRO, 'Block 1'],
    ['supply-demand', MICRO, 'Block 2'],
    ['price-controls', MICRO, 'Block 2'],
    ['elasticity', MICRO, 'Block 3'],
    ['tax-incidence', MICRO, 'Blocks 2–3'],
    ['consumer-choice', MICRO, 'Block 4'],
    ['income-substitution', MICRO, 'Block 4'],
    ['market-demand', MICRO, 'Block 4'],
    ['isoquant', MICRO, 'Block 5'],
    ['costs', MICRO, 'Blocks 5–6'],
    ['lac-envelope', MICRO, 'Block 5'],
    ['monopoly', MICRO, 'Blocks 6–8'],
    ['monopolistic-competition', MICRO, 'Blocks 6–8'],
    ['cournot', MICRO, 'Blocks 6–8'],
    ['labour-market', MICRO, 'Block 9'],
    ['edgeworth', MICRO, 'Block 10'],
    ['externalities', MICRO, 'Block 10'],
    ['national-income', MACRO, 'Block 11'],
    ['solow', MACRO, 'Block 12'],
    ['keynesian-cross', MACRO, 'Block 13'],
    ['injections-leakages', MACRO, 'Block 13'],
    ['is-mp', MACRO, 'Block 15'],
    ['ad-as', MACRO, 'Block 16'],
    ['phillips', MACRO, 'Blocks 17–18'],
    ['forex', MACRO, 'Blocks 19–20'],
    ['growth-measure', MORE, null],
    ['money-market', MORE, null],
    ['loanable-funds', MORE, null],
    ['lorenz', MORE, null],
    ['tariff', MORE, null],
  ];

  const all = Object.fromEntries([...window.TOPICS, ...added].map((t) => [t.id, t]));
  window.TOPICS = ORDER.map(([id, unit, block]) => {
    const t = all[id];
    if (!t) throw new Error('Missing topic ' + id);
    return Object.assign(t, { unit, block });
  });
})();
