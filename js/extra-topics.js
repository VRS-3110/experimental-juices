/* Extra topics: total cost curves stacked above per-unit cost curves (Block 5), and the
   Bertrand and Stackelberg oligopoly models (Blocks 6–8). Loads after linked.js and inserts
   each topic into the course order. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MICRO = 'Microeconomics';

  /* ── Total and per-unit cost curves ── */
  // Same cost function as the short-run costs topic: VC = 6Q − 1.5Q² + 0.15Q³, TC = F + VC.
  const vc = (q) => 6 * q - 1.5 * q * q + 0.15 * q ** 3;
  const mc = (q) => 6 - 3 * q + 0.45 * q * q;
  const avc = (q) => 6 - 1.5 * q + 0.15 * q * q;
  const Q_INFLECT = 10 / 3, Q_MIN_AVC = 5, MIN_AVC = avc(5);
  const minAtc = (F) => { // where SMC = SATC on the rising part of SMC
    let lo = 5, hi = 40;
    for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (mc(m) < avc(m) + F / m) lo = m; else hi = m; }
    return { q: lo, c: avc(lo) + F / lo };
  };
  const costCurves = {
    id: 'cost-curves',
    title: 'Total and per-unit cost curves',
    summary: 'The per-unit curves are read off the total curves. The slope of TC at any output is marginal cost; the slope of a ray from the origin to TC is average total cost. Where TC turns from concave to convex, MC is at its minimum; where a ray from the origin just touches TC, ATC is at its minimum.',
    model: 'VC = 6Q − 1.5Q² + 0.15Q³, TC = F + VC. The two panels share the output axis: the dashed line at Q links the same output in both.',
    graph: {
      layout: 'column',
      params: [
        { id: 'q', label: 'Output (Q)', min: 0.2, max: 13, step: 0.1, value: 6 },
        { id: 'F', label: 'Fixed cost (F)', min: 0, max: 90, step: 0.5, value: 8 },
      ],
      panels: [
        {
          title: 'Total cost curves',
          x: { range: [0, 10], label: 'Output (Q)' },
          y: { range: [0, 90], label: 'Total cost ($)', ticks: range(0, 90, 15) },
          draw(s) {
            const tc = (q) => s.F + vc(q), m = minAtc(s.F), here = tc(s.q), slope = mc(s.q);
            return [
              Hl(s.F, 'n', 'TFC', { dash: true }),
              C(vc, 'g', 'TVC'),
              C(tc, 'd', 'TC'),
              C((x) => m.c * x, 'ghost', 'ray: min ATC', { to: 9.5, labelAt: 8.2 }),
              C((x) => MIN_AVC * x, 'ghost', 'ray: min AVC', { to: 9.5, labelAt: 9.4 }),
              S(0, 0, s.q, here, 'o', '', { dash: true }),
              S(s.q - 1.2, here - 1.2 * slope, s.q + 1.2, here + 1.2 * slope, 's', 'slope = MC', { below: true }),
              P(Q_INFLECT, tc(Q_INFLECT), 'Inflection', 'n', { small: true, dx: -9 }),
              P(Q_MIN_AVC, vc(Q_MIN_AVC), '', 'g', { small: true }),
              P(m.q, tc(m.q), '', 'd', { small: true }),
              G(s.q, here, 'Q', null, 'o'),
              P(s.q, here, 'A'),
            ];
          },
        },
        {
          title: 'Per-unit cost curves',
          x: { range: [0, 10], label: 'Output (Q)' },
          y: { range: [0, 12], label: 'Cost per unit ($)', ticks: range(0, 12, 2) },
          draw(s) {
            const atc = (q) => avc(q) + s.F / q, m = minAtc(s.F);
            return [
              C((q) => s.F / q, 'n', 'AFC', { from: 0.3, dash: true, labelAt: 9.4 }),
              C(avc, 'g', 'AVC', { labelAt: 9.4 }),
              C(atc, 'd', 'ATC', { from: 0.3, labelAt: 7.4 }),
              C(mc, 's', 'MC'),
              P(Q_INFLECT, mc(Q_INFLECT), 'min MC', 'n', { small: true, dy: 16 }),
              P(Q_MIN_AVC, MIN_AVC, 'min AVC', 'g', { small: true, dy: 16 }),
              P(m.q, m.c, 'min ATC', 'd', { small: true, dx: 9, dy: -9 }),
              G(s.q, Math.max(mc(s.q), atc(s.q)), 'Q', null, 'o'),
              P(s.q, mc(s.q), '', 's', { small: true }),
              P(s.q, atc(s.q), '', 'd', { small: true }),
              P(s.q, avc(s.q), '', 'g', { small: true }),
            ];
          },
        },
      ],
      readout(s) {
        const m = minAtc(s.F), atc = avc(s.q) + s.F / s.q, M = mc(s.q);
        const rows = [
          ['TC at Q', money(s.F + vc(s.q))], ['TVC', money(vc(s.q))], ['TFC', money(s.F)],
          ['MC (slope of TC)', money(M)], ['ATC (slope of the ray)', money(atc)], ['AVC', money(avc(s.q))],
        ];
        const zone = s.q < Q_INFLECT
          ? 'Before Q = 3.33 TC is concave: each extra unit costs less, so MC is falling (increasing marginal returns).'
          : s.q < Q_MIN_AVC
            ? 'Past Q = 3.33 diminishing returns set in and MC rises, but MC is still below AVC and ATC, so both keep falling.'
            : s.q < m.q
              ? `MC is above AVC (so AVC rises) but still below ATC (so ATC falls until Q = ${f(m.q)}).`
              : `MC is above ATC, so ATC is rising: the ray from the origin to TC is now steeper than at its minimum (Q = ${f(m.q)}).`;
        return { rows, status: zone };
      },
    },
    equations: [
      { name: 'Total cost', tex: R`TC = TFC + TVC`, note: 'TC is TVC shifted up by the fixed cost, so the two are parallel.' },
      { name: 'Marginal cost is the slope of TC (and of TVC)', tex: R`MC = \frac{d\,TC}{dQ} = \frac{d\,TVC}{dQ}`, note: 'Fixed cost does not change with Q, so it does not affect MC.' },
      { name: 'Average cost is the slope of a ray', tex: R`ATC = \frac{TC}{Q},\qquad AVC = \frac{TVC}{Q},\qquad AFC = \frac{TFC}{Q}`, note: 'Each average is the slope of a line from the origin to the matching total curve.' },
      { name: 'Minimum ATC', tex: R`\frac{d}{dQ}\left(\frac{TC}{Q}\right) = 0 \;\Rightarrow\; MC = ATC`, note: 'Where the ray from the origin is tangent to TC.' },
      { name: 'Inflection point', tex: R`\frac{d^2\,TC}{dQ^2} = 0 \;\Rightarrow\; MC \text{ is at its minimum}`, note: 'Diminishing marginal returns begin here.' },
    ],
    points: [
      'TC and TVC have the same shape and slope at every output; they differ only by the fixed cost.',
      'TC is concave while MC falls and convex once MC rises (diminishing marginal returns).',
      'Minimum AVC is where a ray from the origin touches TVC; minimum ATC is where a ray touches TC, at a larger output.',
      'AFC falls continuously, so the gap between ATC and AVC narrows as output rises.',
      'Raising the fixed cost shifts TC up, moves minimum ATC to a higher output, and leaves MC and AVC unchanged.',
    ],
    tip: 'Line the two diagrams up vertically with the same Q scale. Mark the inflection point above min MC, and the ray tangency above min ATC.',
  };

  /* ── Bertrand ── */
  // Identical goods: market demand Q = 12 − P. Differentiated: q_i = 10 − p_i + d·p_j.
  const bertrand = (s) => {
    if (s.mode === 0) {
      const lowA = s.ca <= s.cb, cLow = Math.min(s.ca, s.cb), cHigh = Math.max(s.ca, s.cb), pm = (12 + cLow) / 2;
      const tie = Math.abs(s.ca - s.cb) < 1e-9, p = tie ? s.ca : Math.min(cHigh, pm), Q = 12 - p;
      const piWin = (p - cLow) * Q;
      return { p, Q, tie, lowA, piA: tie ? 0 : lowA ? piWin : 0, piB: tie ? 0 : lowA ? 0 : piWin, qA: tie ? Q / 2 : lowA ? Q : 0, qB: tie ? Q / 2 : lowA ? 0 : Q, pA: p, pB: p, drastic: !tie && pm < cHigh };
    }
    const d = s.d, pA = (2 * (10 + s.ca) + d * (10 + s.cb)) / (4 - d * d), pB = (2 * (10 + s.cb) + d * (10 + s.ca)) / (4 - d * d);
    const qA = 10 - pA + d * pB, qB = 10 - pB + d * pA;
    return { pA, pB, qA, qB, piA: (pA - s.ca) * qA, piB: (pB - s.cb) * qB };
  };
  const bertrandTopic = {
    id: 'bertrand',
    title: 'Bertrand price competition',
    summary: 'In Bertrand competition firms set prices, not quantities. With identical goods and equal costs, each firm undercuts the other until price equals marginal cost, so two firms are enough for the competitive outcome (the Bertrand paradox). With differentiated goods each firm keeps some customers when it charges more, so prices settle above marginal cost.',
    model: 'Identical goods: market demand Q = 12 − P, the cheaper firm takes the whole market, ties split it. Differentiated goods: q_A = 10 − p_A + d·p_B (and symmetrically for B), where d measures how close substitutes the goods are.',
    graph: {
      x: { range: [0, 16], label: 'Price of firm B (p_B)' },
      y: { range: [0, 16], label: 'Price of firm A (p_A)' },
      params: [
        { id: 'mode', label: 'Goods', options: [{ v: 0, label: 'Identical' }, { v: 1, label: 'Differentiated' }], value: 0 },
        { id: 'ca', label: 'Marginal cost of A', min: 0, max: 30, step: 0.1, value: 3 },
        { id: 'cb', label: 'Marginal cost of B', min: 0, max: 30, step: 0.1, value: 3 },
        { id: 'd', label: 'Substitutability d (differentiated only)', min: 0, max: 0.99, step: 0.05, value: 0.5 },
      ],
      draw(s) {
        const z = bertrand(s);
        if (s.mode === 0) {
          // Best responses with identical goods: undercut the rival by a hair, never below your own MC,
          // never above your monopoly price. The hair is drawn as a small visible gap.
          const e = 0.15, pmA = (12 + s.ca) / 2, pmB = (12 + s.cb) / 2;
          return [
            C((x) => x, 'ghost', 'p_A = p_B', { labelAt: 14.5 }),
            S(0, s.ca, s.ca, s.ca, 'd', ''),
            S(s.ca, s.ca, pmA, pmA - e, 'd', ''),
            S(pmA, pmA, 16, pmA, 'd', 'BR_A'),
            S(s.cb, 0, s.cb, s.cb, 's', ''),
            S(s.cb, s.cb, pmB - e, pmB, 's', ''),
            S(pmB, pmB, pmB, 16, 's', ''),
            T(pmB + 0.2, 15.2, 'BR_B', 's'),
            G(z.pB, z.pA, 'p_B*', 'p_A*'),
            P(z.pB, z.pA, 'Nash'),
          ];
        }
        const brA = (x) => (10 + s.ca + s.d * x) / 2;
        return [
          C((x) => x, 'ghost', 'p_A = p_B', { labelAt: 14.5 }),
          C(brA, 'd', 'BR_A'),
          s.d > 0.001 ? C((x) => (2 * x - 10 - s.cb) / s.d, 's', 'BR_B') : V((10 + s.cb) / 2, 's', 'BR_B'),
          G(z.pB, z.pA, 'p_B*', 'p_A*'),
          P(z.pB, z.pA, 'Nash'),
        ];
      },
      readout(s) {
        const z = bertrand(s);
        if (s.mode === 0) {
          const status = z.tie
            ? `Bertrand paradox: with identical goods and equal costs, each firm undercuts until price equals marginal cost (${money(z.p)}). Both make zero profit, as under perfect competition.`
            : z.drastic
              ? `Drastic cost advantage: the low-cost firm’s own monopoly price (${money(z.p)}) is already below its rival’s cost, so it simply charges that.`
              : `The low-cost firm prices just below its rival’s marginal cost (${money(z.p)}) and takes the whole market. The rival cannot match without making a loss.`;
          return { rows: [['Market price', money(z.p)], ['Market quantity', f(z.Q)], ['Output of A', f(z.qA)], ['Output of B', f(z.qB)], ['Profit of A', money(z.piA)], ['Profit of B', money(z.piB)]], status };
        }
        return {
          rows: [['Price of A', money(z.pA)], ['Price of B', money(z.pB)], ['Output of A', f(z.qA)], ['Output of B', f(z.qB)], ['Profit of A', money(z.piA)], ['Profit of B', money(z.piB)]],
          status: 'With differentiated goods the reaction functions slope up (prices are strategic complements): if the rival raises its price, you raise yours too. Closer substitutes (higher d) make competition fiercer relative to each firm’s own demand.',
        };
      },
    },
    equations: [
      { name: 'Identical goods: demand facing firm A', tex: R`q_A = \begin{cases} D(p_A) & p_A < p_B \\ \tfrac12 D(p_A) & p_A = p_B \\ 0 & p_A > p_B \end{cases}`, note: 'The cheaper firm takes the whole market.' },
      { name: 'Bertrand–Nash equilibrium (identical goods, equal costs)', tex: R`p_A = p_B = MC,\qquad \pi_A = \pi_B = 0`, note: 'Any higher price would be undercut.' },
      { name: 'Unequal costs', tex: R`c_A < c_B \;\Rightarrow\; p = \min\big(c_B,\; p^{m}_A\big),\; \text{A serves the market}`, note: 'A prices a hair below B’s cost, unless its own monopoly price is lower still.' },
      { name: 'Differentiated demand', tex: R`q_A = a - b\,p_A + d\,p_B`, note: 'd > 0: the goods are substitutes, so a higher rival price raises A’s demand.' },
      { name: 'Price reaction function', tex: R`p_A = \frac{a + b\,c_A + d\,p_B}{2b}`, note: 'From maximising (p_A − c_A)q_A. It slopes up: strategic complements.' },
      { name: 'Symmetric equilibrium price', tex: R`p^* = \frac{a + b\,c}{2b - d} > c`, note: 'Product differentiation keeps price above marginal cost.' },
    ],
    points: [
      'Cournot firms choose quantities and the market sets the price; Bertrand firms choose prices and sell whatever is demanded at them.',
      'The Bertrand paradox: with identical goods and equal costs, two firms give the perfectly competitive outcome.',
      'The paradox goes away with differentiated products, capacity constraints (a firm cannot serve the whole market when it undercuts), or repeated interaction that supports tacit collusion.',
      'In quantity competition reaction functions slope down (strategic substitutes); in price competition with differentiated goods they slope up (strategic complements).',
    ],
    tip: 'Say which variable firms choose. Then, for identical goods, argue by undercutting: any price above MC invites a rival to cut it slightly and take the whole market.',
  };

  /* ── Stackelberg ── */
  // Market demand P = 12 − (q_L + q_F); leader moves first, follower responds.
  const stack = (s) => {
    const qL = (12 - 2 * s.cl + s.cf) / 2, qF = (12 - 3 * s.cf + 2 * s.cl) / 4, p = 12 - qL - qF;
    const qLc = (12 - 2 * s.cl + s.cf) / 3, qFc = (12 - 2 * s.cf + s.cl) / 3, pc = 12 - qLc - qFc;
    return { qL, qF, p, piL: (p - s.cl) * qL, piF: (p - s.cf) * qF, qLc, qFc, pc, piLc: (pc - s.cl) * qLc, piFc: (pc - s.cf) * qFc };
  };
  const stackelbergTopic = {
    id: 'stackelberg',
    title: 'Stackelberg leader and follower',
    summary: 'In the Stackelberg model one firm commits to its output first and the other follows. The leader knows the follower will respond along its reaction function, so it picks the point on that function that maximises its own profit. The leader produces more and earns more than in Cournot; the follower produces less and earns less.',
    model: 'Market demand P = 12 − (q_L + q_F). Follower’s reaction function: q_F = (12 − c_F − q_L)/2. The leader chooses q_L to maximise its profit given that response. The leader’s Cournot reaction function and the Cournot point are shown for comparison.',
    graph: {
      x: { range: [0, 12], label: 'Leader output (q_L)' },
      y: { range: [0, 12], label: 'Follower output (q_F)' },
      params: [
        { id: 'cl', label: 'Leader marginal cost (c_L)', min: 0, max: 12, step: 0.1, value: 3 },
        { id: 'cf', label: 'Follower marginal cost (c_F)', min: 0, max: 12, step: 0.1, value: 3 },
      ],
      valid(s) {
        const z = stack(s);
        if (z.qF <= 0.05) return 'Past this point the follower would produce nothing: the leader’s output leaves no profitable room, so the follower stays out.';
        if (z.qL <= 0.05) return 'Past this point the leader’s cost is so far above the follower’s that leading with any output would not pay.';
        return true;
      },
      draw(s) {
        const z = stack(s);
        const iso = (pi) => (x) => 12 - s.cl - x - pi / x; // leader isoprofit: π_L = (12 − q_L − q_F − c_L)q_L
        return [
          C((x) => 12 - s.cl - 2 * x, 'ghost', 'R_L (Cournot)', { labelAt: 1.1 }),
          C((x) => (12 - s.cf - x) / 2, 's', 'R_F'),
          C(iso(z.piL), 'd', 'Leader isoprofit', { from: 0.5, labelAt: z.qL * 0.38 }),
          P(z.qLc, z.qFc, 'Cournot', 'n', { small: true, dx: -9 }),
          G(z.qL, z.qF, 'q_L*', 'q_F*'),
          P(z.qL, z.qF, 'Stackelberg'),
        ];
      },
      readout(s) {
        const z = stack(s);
        return {
          rows: [
            ['Leader output', `${f(z.qL)} (Cournot ${f(z.qLc)})`],
            ['Follower output', `${f(z.qF)} (Cournot ${f(z.qFc)})`],
            ['Market price', `${money(z.p)} (Cournot ${money(z.pc)})`],
            ['Leader profit', `${money(z.piL)} (Cournot ${money(z.piLc)})`],
            ['Follower profit', `${money(z.piF)} (Cournot ${money(z.piFc)})`],
            ['First-mover advantage', money(z.piL - z.piLc)],
          ],
          status: 'The leader’s isoprofit curve just touches the follower’s reaction function at the Stackelberg point. Committing to a large output first forces the follower to cut back; total output is higher and price lower than in Cournot.',
        };
      },
    },
    equations: [
      { name: 'Follower’s reaction function', tex: R`q_F = \frac{a - c_F - b\,q_L}{2b}`, note: 'Same as a Cournot reaction function.' },
      { name: 'Leader’s problem', tex: R`\max_{q_L}\; \big(a - b\,q_L - b\,q_F(q_L) - c_L\big)\,q_L`, note: 'The leader substitutes the follower’s reaction into its own profit.' },
      { name: 'Equal costs: outputs', tex: R`q_L = \frac{a - c}{2b},\qquad q_F = \frac{a - c}{4b}`, note: 'The leader produces the monopoly output; the follower half of that.' },
      { name: 'Equal costs: profits', tex: R`\pi_L = \frac{(a - c)^2}{8b} > \pi^{Cournot} = \frac{(a - c)^2}{9b} > \pi_F = \frac{(a - c)^2}{16b}`, note: 'First-mover advantage.' },
      { name: 'Total output: how the models rank', tex: R`\begin{aligned} Q_{mon} &= \frac{1}{2}\cdot\frac{a-c}{b} \\[4pt] Q_{Cournot} &= \frac{2}{3}\cdot\frac{a-c}{b} \\[4pt] Q_{Stackelberg} &= \frac{3}{4}\cdot\frac{a-c}{b} \\[4pt] Q_{comp} &= \frac{a-c}{b} \end{aligned}`, note: 'Each model produces a fixed share of the competitive output (a − c)/b: monopoly ½, Cournot ⅔, Stackelberg ¾, competition all of it. So output ranks monopoly < Cournot < Stackelberg < competition, and price ranks the other way: the Stackelberg leader’s commitment brings the market closer to the competitive outcome than Cournot. Example: P = 24 − Q and c = 4 give outputs of 10, 13.3, 15 and 20.' },
    ],
    points: [
      'Leadership needs commitment: the leader’s output must be fixed before the follower chooses (for example, capacity already built).',
      'The Stackelberg point is the tangency of the leader’s isoprofit curve with the follower’s reaction function, not the intersection of two reaction functions.',
      'Being first is an advantage with quantity competition. With price competition and differentiated goods, moving second can be better.',
      'If the leader is efficient enough, its output can leave no room for the follower: entry deterrence.',
    ],
    tip: 'Draw both reaction functions, mark Cournot at their intersection, then move along the follower’s function to the leader’s isoprofit tangency and label it Stackelberg.',
  };

  /* ── Price discrimination ── */
  // Single market: P = 12 − Q. Third degree: market 1 P = 12 − Q (less elastic), market 2 P = 6 − 0.5Q (more elastic).
  const PD_MARKETS = [{ a: 12, b: 1 }, { a: 6, b: 0.5 }];
  const pd = (s) => {
    const c = s.c, m = PD_MARKETS.map(({ a, b }) => {
      const q = (a - c) / (2 * b), p = (a + c) / 2;
      return { a, b, q, p, e: p / (b * q), profit: (p - c) * q, cs: 0.5 * (a - p) * q };
    });
    // Best single price: either serve both markets (combined demand Q = 24 − 3P, valid while P ≤ 6)
    // or serve only market 1 at its own monopoly price. The firm picks whichever earns more;
    // above MC ≈ 2.54 that is market 1 alone, so a single price leaves market 2 unserved.
    const pBoth = 4 + c / 2, profBoth = (pBoth - c) * (24 - 3 * pBoth);
    const pOne = (12 + c) / 2, profOne = (pOne - c) * (12 - pOne);
    const both = profBoth >= profOne, pu = both ? pBoth : pOne;
    return { c, m, pu, both, qu1: 12 - pu, qu2: both ? 12 - 2 * pu : 0, profitU: Math.max(profBoth, profOne), qm: (12 - c) / 2, pm: (12 + c) / 2, qc: 12 - c };
  };
  const pdPanel = (k) => ({
    title: (s) => (s.mode === 0 ? ['Single-price monopoly', 'Perfect (first-degree) price discrimination'][k] : ['Market 1: less elastic demand', 'Market 2: more elastic demand'][k]),
    x: { range: [0, 14], label: 'Quantity (Q)' },
    y: { range: [0, 13], label: 'Price ($)' },
    draw(s) {
      const z = pd(s), c = s.c;
      if (s.mode === 0) {
        if (k === 0) {
          return [
            A([[0, 12], [0, z.pm], [z.qm, z.pm]], 'd', 'CS'),
            A([[0, z.pm], [z.qm, z.pm], [z.qm, c], [0, c]], 'g', 'Profit'),
            A([[z.qm, z.pm], [z.qm, c], [z.qc, c]], 'o', 'DWL'),
            C((q) => 12 - q, 'd', 'D', { to: 12 }),
            C((q) => 12 - 2 * q, 'g', 'MR', { to: 6, labelAt: 4.6 }),
            Hl(c, 's', 'MC', { labelLeft: true }),
            G(z.qm, z.pm, 'Q_m', 'P_m'),
            P(z.qm, z.pm, ''),
          ];
        }
        return [
          A([[0, 12], [0, c], [z.qc, c]], 'g', 'Profit = all surplus'),
          C((q) => 12 - q, 'd', 'D = MR', { to: 12 }),
          Hl(c, 's', 'MC', { labelLeft: true }),
          G(z.qc, c, 'Q = Q_c', null),
          P(z.qc, c, 'Last unit at MC', 'o', { dx: -9 }),
        ];
      }
      const mk = z.m[k], a = mk.a, b = mk.b;
      return [
        A([[0, a], [0, mk.p], [mk.q, mk.p]], 'd', 'CS'),
        A([[0, mk.p], [mk.q, mk.p], [mk.q, c], [0, c]], 'g', 'Profit'),
        C((q) => a - b * q, 'd', `D_${k + 1}`, { to: a / b }),
        C((q) => a - 2 * b * q, 'g', `MR_${k + 1}`, { to: a / (2 * b), labelAt: (a / (2 * b)) * 0.75 }),
        Hl(c, 's', 'MC', { labelLeft: true }),
        Hl(z.pu, 'ghost', k === 1 && !z.both ? 'uniform price: not served' : 'uniform price'),
        G(mk.q, mk.p, `Q_${k + 1}`, `P_${k + 1}`),
        P(mk.q, c, '', 'g', { small: true }),
        P(mk.q, mk.p, ''),
      ];
    },
  });
  const priceDiscrimination = {
    id: 'price-discrimination',
    title: 'Price discrimination',
    summary: 'Price discrimination is charging different prices for the same good when the difference is not explained by cost. A firm can do it only if it has market power, can tell buyers (or groups) apart, and can stop resale. It turns consumer surplus into profit, and it can raise output compared with a single price.',
    model: 'Perfect: demand P = 12 − Q, constant MC. Third degree: market 1 has P = 12 − Q (less elastic at the optimum), market 2 has P = 6 − 0.5Q (more elastic), same MC. The dashed line in each market is the price a non-discriminating monopolist would charge across both.',
    graph: {
      layout: 'row',
      params: [
        { id: 'mode', label: 'Type of discrimination', options: [{ v: 0, label: 'Perfect (1st degree)' }, { v: 1, label: 'Third degree' }], value: 1 },
        { id: 'c', label: 'Marginal cost (MC)', min: 0, max: (s) => (s.mode === 1 ? 5.9 : 11.9), step: 0.1, value: 2 },
      ],
      valid(s) {
        if (s.mode === 1 && s.c >= 5.95) return 'Market 2 buyers pay at most $6, so at this cost market 2 would not exist and there would be nothing to discriminate between.';
        if (s.c >= 11.95) return 'No buyer will pay more than $12, so at this cost the market would not exist.';
        return true;
      },
      panels: [pdPanel(0), pdPanel(1)],
      readout(s) {
        const z = pd(s);
        if (s.mode === 0) {
          const single = (z.pm - s.c) * z.qm, perfect = 0.5 * (12 - s.c) * z.qc;
          return {
            rows: [['Single price: P, Q', `${money(z.pm)}, ${f(z.qm)}`], ['Single price: profit', money(single)], ['Single price: CS', money(0.5 * (12 - z.pm) * z.qm)], ['Single price: DWL', money(0.5 * (z.pm - s.c) * (z.qc - z.qm))], ['Perfect: output', f(z.qc)], ['Perfect: profit (CS = 0, DWL = 0)', money(perfect)]],
            status: 'Perfect discrimination charges every buyer their maximum willingness to pay. Output rises to the competitive level, so there is no deadweight loss, but the firm takes all the surplus.',
          };
        }
        const [m1, m2] = z.m, disc = m1.profit + m2.profit;
        return {
          rows: [
            ['Market 1: P, Q', `${money(m1.p)}, ${f(m1.q)}`], ['Market 1: |PED| at optimum', f(m1.e)],
            ['Market 2: P, Q', `${money(m2.p)}, ${f(m2.q)}`], ['Market 2: |PED| at optimum', f(m2.e)],
            ['Profit with discrimination', money(disc)], ['Profit with one uniform price', `${money(z.profitU)} at P = ${money(z.pu)}`],
          ],
          status: `Each market sets MR = MC. The less elastic market (|PED| ${f(m1.e)}) pays the higher price; the more elastic one (|PED| ${f(m2.e)}) pays less. Discrimination earns ${money(disc - z.profitU)} more than a single price.`
            + (z.both ? '' : ' At this cost the best single price serves market 1 only, so discrimination also brings market 2 into the market: a case where it raises total welfare.'),
        };
      },
    },
    equations: [
      { name: 'Third degree: profit maximisation', tex: R`MR_1 = MR_2 = MC`, note: 'If MR differed, moving a unit to the market with the higher MR would raise revenue.' },
      { name: 'Inverse elasticity rule in each market', tex: R`\frac{P_i - MC}{P_i} = \frac{1}{|E_i|} \;\Rightarrow\; P_i = \frac{MC}{1 - 1/|E_i|}`, note: 'The less elastic market gets the higher markup.' },
      { name: 'Perfect (first-degree) discrimination', tex: R`P = WTP \text{ for each unit},\quad MR = D,\quad Q = Q_c,\quad CS = 0,\ DWL = 0`, note: 'Every unit is sold at its buyer’s reservation price.' },
      { name: 'Second-degree discrimination', tex: R`\text{price depends on the quantity or version bought}`, note: 'Quantity discounts, block pricing, versioning: buyers sort themselves.' },
      { name: 'Two-part tariff', tex: R`T(q) = F + p\,q`, note: 'A fixed fee F captures surplus while the unit price p can be set at MC.' },
    ],
    points: [
      'Conditions: market power, a way to separate buyers into groups with different elasticities, and no resale (arbitrage) between them.',
      'First degree: one price per buyer (or unit). Second degree: prices depend on quantity or version, and buyers choose. Third degree: different prices for identifiable groups, such as student, peak and off-peak, or domestic and export prices.',
      'Welfare: perfect discrimination removes deadweight loss but gives all surplus to the firm. Third-degree discrimination can raise or lower total welfare; it raises it if it lets a market be served that a single price would leave out.',
      'Examples: airline fares, student discounts, cinema tickets, software versions, bulk discounts, utility tariffs.',
    ],
    tip: 'Draw the two markets side by side with the same MC line. Show MR₁ = MR₂ = MC, then read each price off its own demand curve, and say which market is less elastic.',
  };

  /* ── Kinked demand (Sweezy) ── */
  // Demand kinks at Q = 6, P = 8: above, rivals ignore rises (P = 10 − Q/3, elastic);
  // below, rivals match cuts (P = 14 − Q, inelastic). MR jumps from 6 down to 2 at the kink.
  const kink = (c) => {
    if (c > 6) { const q = 1.5 * (10 - c); return { q, p: 10 - q / 3, zone: 'above' }; }
    if (c < 2) { const q = (14 - c) / 2; return { q, p: 14 - q, zone: 'below' }; }
    return { q: 6, p: 8, zone: 'gap' };
  };
  const kinkedDemand = {
    id: 'kinked-demand',
    title: 'Kinked demand curve',
    summary: 'The kinked demand model explains why prices in oligopoly can be sticky. Each firm expects rivals to ignore a price rise (so it loses many customers) but to match a price cut (so it gains few). Demand is elastic above the current price and inelastic below it, which opens a vertical gap in marginal revenue. Marginal cost can move anywhere within that gap without changing the profit-maximising price.',
    model: 'Above the kink (rivals do not follow a rise): P = 10 − Q/3. Below the kink (rivals match a cut): P = 14 − Q. The kink is at Q = 6, P = 8. MR jumps from 6 to 2 at the kink. MC is constant.',
    graph: {
      x: { range: [0, 14], label: 'Quantity (Q)' },
      y: { range: [0, 14], label: 'Price and cost ($)' },
      params: [{ id: 'c', label: 'Marginal cost (MC)', min: 0, max: 9.9, step: 0.1, value: 4, hint: 'The MR gap runs from 2 to 6' }],
      draw(s) {
        const z = kink(s.c);
        return [
          C((q) => 10 - q / 3, 'ghost', 'if rivals ignored cuts', { from: 6, to: 14, labelAt: 11.5 }),
          C((q) => 14 - q, 'ghost', '', { to: 6 }),
          C((q) => 10 - q / 3, 'd', 'D (elastic)', { to: 6, labelAt: 1 }),
          C((q) => 14 - q, 'd', 'D (inelastic)', { from: 6, to: 14, labelAt: 9.5 }),
          C((q) => 10 - (2 * q) / 3, 'g', 'MR', { to: 6, labelAt: 3.6 }),
          S(6, 6, 6, 2, 'g', '', { dash: true }),
          C((q) => 14 - 2 * q, 'g', '', { from: 6, to: 7 }),
          T(6.25, 5.4, 'MR gap', 'g'),
          Hl(s.c, 's', 'MC', { labelLeft: true }),
          G(z.q, z.p, 'Q*', 'P*'),
          P(6, 8, 'Kink', 'n', { small: true, dx: 9, dy: -9 }),
          P(z.q, z.p, ''),
        ];
      },
      readout(s) {
        const z = kink(s.c);
        return {
          rows: [['Price', money(z.p)], ['Output', f(z.q)], ['MR just left of the kink', money(6)], ['MR just right of the kink', money(2)], ['MC', money(s.c)]],
          status: z.zone === 'gap'
            ? 'MC lies inside the MR gap, so the profit-maximising output stays at the kink and the price stays at $8.00. Cost changes in this range do not change the price: sticky prices.'
            : z.zone === 'above'
              ? 'MC is above the top of the gap, so MC now cuts the upper MR. Output falls and price rises above the kink.'
              : 'MC is below the bottom of the gap, so MC cuts the lower MR. Output rises and price falls below the kink.',
          tone: z.zone === 'gap' ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Two demand segments', tex: R`P = \begin{cases} a_1 - b_1 Q & Q \le Q^* \;(\text{rivals ignore rises}) \\ a_2 - b_2 Q & Q > Q^* \;(\text{rivals match cuts}) \end{cases},\quad b_1 < b_2`, note: 'Flatter (more elastic) above the kink, steeper below.' },
      { name: 'Marginal revenue', tex: R`MR = a_1 - 2b_1 Q \;\;(Q < Q^*),\qquad MR = a_2 - 2b_2 Q \;\;(Q > Q^*)`, note: 'Each segment has its own MR line.' },
      { name: 'MR gap at the kink', tex: R`MR^{-} = a_1 - 2b_1Q^* \;>\; MR^{+} = a_2 - 2b_2Q^*`, note: 'Here MR⁻ = 6 and MR⁺ = 2.' },
      { name: 'Price rigidity condition', tex: R`MR^{+} \le MC \le MR^{-} \;\Rightarrow\; Q = Q^*,\; P = P^*`, note: 'Any MC within the gap gives the same output and price.' },
    ],
    points: [
      'Assumption: rivals match price cuts (to protect their share) but ignore price rises (to win customers).',
      'Prediction: prices are stable even when costs change moderately, which fits observed price stickiness in some oligopolies.',
      'Weakness: the model explains why price stays at the kink but not how that price was reached in the first place.',
      'Weakness: evidence suggests firms often follow price rises too (for example after common cost shocks), which removes the kink.',
      'Non-price competition (advertising, branding, quality) is common in such markets because price changes are unattractive.',
    ],
    tip: 'Draw both demand segments meeting at the kink, then both MR segments with a vertical dashed gap below the kink. Show two MC curves inside the gap giving the same P and Q.',
  };

  /* ── Entry barriers and limit pricing ── */
  // Market demand P = 12 − 0.5Q, MC = 2 for both firms. The entrant must sink a fixed entry cost F,
  // so its AC = 2 + F/q. Sylos-Labini: the entrant expects the incumbent to keep its output q_I,
  // so it faces the residual demand P = (12 − 0.5q_I) − 0.5q_E.
  const EB_C = 2;
  const eb = (s) => {
    const aRes = 12 - 0.5 * s.qi, qe = Math.max(0, (aRes - EB_C) / (2 * 0.5));
    const pe = aRes - 0.5 * qe, profitE = (pe - EB_C) * qe - s.F;
    const pL = EB_C + Math.sqrt(2 * s.F), qL = 2 * (12 - pL); // limit output: entrant's best profit = 0
    const qm = 10, pm = 7;                                     // monopoly: MR = 12 − Q = 2
    const blockaded = qL <= qm;
    return { aRes, qe, pe, profitE, pL, qL, qm, pm, blockaded, pNoEntry: 12 - 0.5 * s.qi, entry: profitE > 1e-9 };
  };
  const entryBarriers = {
    id: 'entry-barriers',
    title: 'Barriers to entry and limit pricing',
    summary: 'Barriers to entry let firms keep supernormal profit in the long run. Some are structural (economies of scale, sunk costs), some legal (patents, licences) and some strategic: an incumbent can set a limit price low enough, and an output high enough, that a would-be entrant could not cover its costs on the demand that is left.',
    model: 'Market demand P = 12 − 0.5Q; both firms have MC = 2. The entrant must sink an entry cost F, so its average cost is 2 + F/q. It expects the incumbent to keep its output q_I (the Sylos-Labini assumption) and so faces the residual demand P = (12 − 0.5q_I) − 0.5q_E. Both panels share the price axis.',
    graph: {
      layout: 'row',
      params: [
        { id: 'qi', label: 'Incumbent output (q_I)', min: 0, max: 24, step: 0.1, value: 12 },
        { id: 'F', label: 'Entrant’s sunk entry cost (F)', min: 0, max: 90, step: 0.5, value: 8 },
      ],
      panels: [
        {
          title: 'Market: incumbent’s output and price',
          x: { range: [0, 24], label: 'Market output (Q)' },
          y: { range: [0, 12], label: 'Price ($)', ticks: range(0, 12, 2) },
          draw(s) {
            const z = eb(s);
            return [
              C((q) => 12 - 0.5 * q, 'd', 'Market demand', { to: 24, labelAt: 4 }),
              Hl(EB_C, 's', 'MC', { labelLeft: true }),
              Hl(z.pm, 'ghost', 'Monopoly price'),
              Hl(z.pL, 'o', 'Limit price', { dash: true }),
              C((q) => (q >= s.qi ? 12 - 0.5 * q : NaN), 'g', 'Residual demand', { from: s.qi, to: 24, dash: true, labelAt: Math.min(22, s.qi + 7) }),
              G(s.qi, z.pNoEntry, 'q_I', null, 'o'),
              P(s.qi, z.pNoEntry, 'Incumbent'),
            ];
          },
        },
        {
          title: 'Entrant: residual demand and costs',
          x: { range: [0, 16], label: 'Entrant output (q_E)' },
          y: { range: [0, 12], label: 'Price and cost ($)', ticks: range(0, 12, 2) },
          draw(s) {
            const z = eb(s), acE = (q) => EB_C + s.F / q;
            const out = [];
            if (z.qe > 0.05 && Math.abs(z.profitE) > 0.02) out.push(A([[0, z.pe], [z.qe, z.pe], [z.qe, acE(z.qe)], [0, acE(z.qe)]], z.profitE > 0 ? 'g' : 'r', Math.abs(z.pe - acE(z.qe)) > 0.6 ? (z.profitE > 0 ? 'Profit' : 'Loss') : ''));
            out.push(
              C((q) => z.aRes - 0.5 * q, 'd', 'Residual demand', { to: z.aRes / 0.5, labelAt: 10 }),
              C((q) => z.aRes - q, 'g', 'MR', { to: z.aRes, labelAt: Math.min(z.aRes * 0.7, 6) }),
              C(acE, 'n', 'Entrant AC', { from: 0.3, labelAt: 14 }),
              Hl(EB_C, 's', 'MC', { labelLeft: true }),
            );
            if (z.qe > 0.05) out.push(G(z.qe, z.pe, 'q_E*', null), P(z.qe, z.pe, z.entry ? 'Enters' : 'Stays out', z.entry ? 'g' : 'r'));
            return out;
          },
        },
      ],
      readout(s) {
        const z = eb(s);
        const rows = [
          ['Price if the entrant stays out', money(z.pNoEntry)],
          ['Entrant’s best output on residual demand', f(z.qe)],
          ['Entrant’s best profit (after sunk cost)', money(z.profitE)],
          ['Limit output / limit price', `${f(z.qL)} / ${money(z.pL)}`],
          ['Monopoly output / price', `${f(z.qm)} / ${money(z.pm)}`],
        ];
        let status, tone;
        if (z.blockaded) {
          status = `Entry is blockaded: even the monopoly output (${f(z.qm)}) leaves the entrant unable to cover its sunk cost, so the incumbent can charge the monopoly price with no threat.`;
          tone = 'good';
          if (s.qi < z.qm - 0.05 && z.entry) { status = 'The incumbent is producing below even the monopoly output, so entry would pay. At the monopoly output entry is blockaded.'; tone = 'warn'; }
        } else if (z.entry) {
          status = `Entry pays: the incumbent’s output (${f(s.qi)}) is below the limit output (${f(z.qL)}), so the residual demand reaches above the entrant’s AC.`;
          tone = 'warn';
        } else {
          status = `Entry is deterred by limit pricing: at q_I ≥ ${f(z.qL)} the price is no more than ${money(z.pL)}, and the residual demand never rises above the entrant’s AC. The incumbent gives up some monopoly profit to keep the market.`;
          tone = 'good';
        }
        return { rows, status, tone };
      },
    },
    equations: [
      { name: 'Residual demand facing the entrant', tex: R`P = \big(a - b\,q_I\big) - b\,q_E`, note: 'Market demand minus the incumbent’s output, which the entrant expects to stay fixed.' },
      { name: 'Entrant’s best profit', tex: R`\pi_E = \frac{(a - b\,q_I - c)^2}{4b} - F`, note: 'From MR = MC on the residual demand, minus the sunk entry cost.' },
      { name: 'Limit output and limit price', tex: R`\pi_E = 0 \;\Rightarrow\; q_L = \frac{a - c - 2\sqrt{bF}}{b},\qquad P_L = c + 2\sqrt{bF}`, note: 'Any output at or above q_L keeps the entrant out.' },
      { name: 'Blockaded entry', tex: R`q_L \le q_m \;\Rightarrow\; \text{monopoly output already deters entry}`, note: 'Large sunk costs relative to the market make entry unattractive without any strategic action.' },
    ],
    points: [
      'Structural barriers: economies of scale (an entrant must come in large), sunk costs, absolute cost advantages, control of key inputs or outlets, network effects.',
      'Legal barriers: patents, copyrights, licences and franchises, regulation.',
      'Strategic barriers: limit pricing, building excess capacity, predatory pricing, brand proliferation, heavy advertising, long-term contracts with customers.',
      'Limit pricing only works if the threat is credible: the entrant must believe the incumbent will keep its output high after entry. Sunk investment in capacity is one way to commit.',
      'The incumbent sacrifices some monopoly profit today to protect its profits over time.',
    ],
    tip: 'Draw the market and the entrant side by side with the same price axis. Show the residual demand just touching the entrant’s AC curve at the limit output, and say why the incumbent’s output must be credible.',
  };

  /* ── Contestable markets ── */
  // Natural monopoly: demand P = 12 − 0.5Q, MC = 2, fixed cost 32, so AC = 2 + 32/Q.
  // Teaching rule: the incumbent can keep profit up to the sunk cost an entrant would have to lose,
  // so the sustainable price rises from P = AC (no sunk cost) to the monopoly price.
  const contest = (S) => {
    const pm = 7, qm = 10, piM = 18; // monopoly
    if (S >= piM) return { q: qm, p: pm, profit: piM, capped: true };
    const q = 10 + Math.sqrt(36 - 2 * S); // (P − AC)·Q = S on the high-output branch
    return { q, p: 12 - 0.5 * q, profit: S, capped: false };
  };
  const contestableMarkets = {
    id: 'contestable-markets',
    title: 'Contestable markets',
    summary: 'A market is contestable when firms can enter and leave freely, without sunk costs. Then even a monopolist must behave competitively: if it made supernormal profit, an entrant could come in, undercut it, take the profit and leave before the incumbent reacted (hit-and-run entry). What matters for performance is the threat of entry, not the number of firms.',
    model: 'Natural monopoly: demand P = 12 − 0.5Q, MC = 2, fixed cost 32 (AC = 2 + 32/Q). Teaching rule: the incumbent can earn supernormal profit up to the sunk cost an entrant would lose, so the price it can sustain rises from P = AC (perfectly contestable) to the monopoly price as sunk costs grow.',
    graph: {
      x: { range: [0, 24], label: 'Quantity (Q)' },
      y: { range: [0, 12], label: 'Price and cost ($)', ticks: range(0, 12, 2) },
      params: [{ id: 'S', label: 'Sunk cost an entrant would lose (S)', min: 0, max: 120, step: 0.5, value: 0, hint: '0 = perfectly contestable' }],
      draw(s) {
        const z = contest(s.S), ac = (q) => 2 + 32 / q;
        return [
          z.profit > 0.05 ? A([[0, z.p], [z.q, z.p], [z.q, ac(z.q)], [0, ac(z.q)]], 'g', z.profit > 4 ? 'Profit' : '') : null,
          C((q) => 12 - 0.5 * q, 'd', 'D', { to: 24 }),
          C((q) => 12 - q, 'g', 'MR', { to: 12, labelAt: 9 }),
          C(ac, 'n', 'AC', { from: 2.7, labelAt: 22.5 }),
          Hl(2, 's', 'MC', { labelLeft: true }),
          P(16, 4, 'P = AC (contestable)', 'n', { small: true, dx: 9, dy: -6 }),
          P(10, 7, 'Monopoly', 'n', { small: true, dx: 9 }),
          G(z.q, z.p, 'Q', 'P'),
          P(z.q, z.p, ''),
        ];
      },
      readout(s) {
        const z = contest(s.S), dwl = 0.5 * (z.p - 2) * (20 - z.q);
        return {
          rows: [['Sustainable price', money(z.p)], ['Output', f(z.q)], ['Supernormal profit', money(z.profit)], ['Deadweight loss (against P = MC)', money(dwl)]],
          status: s.S < 0.01
            ? 'Perfectly contestable: any profit would invite hit-and-run entry, so the incumbent prices at average cost and earns only normal profit, although it is the only firm.'
            : z.capped
              ? 'Sunk costs are so high that the threat of entry no longer binds: the incumbent charges the full monopoly price.'
              : `Sunk costs give partial protection: an entrant would lose up to ${money(s.S)} if it had to leave, so the incumbent can earn that much supernormal profit without inviting entry.`,
          tone: s.S < 0.01 ? 'good' : z.capped ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Perfect contestability', tex: R`\text{no sunk costs} \;\Rightarrow\; P = AC,\quad \pi = 0`, note: 'Any supernormal profit would be competed away by hit-and-run entry.' },
      { name: 'Sustainable price in this teaching model', tex: R`(P - AC)\,Q = S,\qquad 0 \le S \le \pi_m`, note: 'Profit can rise to the sunk cost an entrant would lose, up to the monopoly profit.' },
      { name: 'Efficiency in a contestable market', tex: R`P = AC = \min\text{ feasible cost},\quad \text{no X-inefficiency}`, note: 'An inefficient incumbent would be replaced by a lower-cost entrant.' },
    ],
    points: [
      'Conditions for perfect contestability: no sunk costs (exit is costless), entrants have the same technology and costs as the incumbent, and the incumbent cannot cut price before an entrant has made its profit.',
      'Fixed costs need not be sunk: an aircraft can be moved to another route, but a railway track cannot. Only sunk costs block contestability.',
      'Predictions: normal profit only, productive efficiency, no cross-subsidy between products, even with very few firms.',
      'Policy lesson: rather than breaking up large firms, lower sunk costs and barriers, for example access to airport slots, networks and infrastructure.',
      'Criticism: few markets are perfectly contestable; incumbents can usually respond quickly, and advertising and R&D create sunk costs.',
    ],
    tip: 'Contrast contestable markets with monopoly theory: market structure (number of firms) matters less than the threat of entry. Name the condition that fails in practice, usually sunk costs.',
  };

  /* ── Elastic and inelastic demand compared ── */
  // Both curves pass through P = 10, Q = 20. Linear demand through that point with point elasticity |E|:
  // Q = 20 − 2|E|(P − 10). Perfect mode: horizontal at P = 10 (perfectly elastic), vertical at Q = 20.
  const P0 = 10, Q0 = 20;
  const dq = (E) => (P) => Q0 - 2 * E * (P - P0);
  const pdq = (E) => (Q) => P0 - (Q - Q0) / (2 * E);
  const side = (s, which) => {
    const P1 = P0 + s.dP;
    if (s.mode === 1) {
      const Q1 = which === 'e' ? (s.dP > 0 ? 0 : Q0) : Q0;
      return { P1, Q1, E: which === 'e' ? Infinity : 0 };
    }
    const E = which === 'e' ? s.Ee : s.Ei;
    return { P1, Q1: dq(E)(P1), E };
  };
  const arc = (q0, q1, p0, p1) => (Math.abs(p1 - p0) < 1e-9 ? NaN : ((q1 - q0) / ((q0 + q1) / 2)) / ((p1 - p0) / ((p0 + p1) / 2)));
  const elasticPanel = (which) => ({
    title: which === 'e' ? 'Elastic demand: quantity responds a lot' : 'Inelastic demand: quantity responds a little',
    x: { range: [0, 40], label: 'Quantity (Q)', ticks: range(0, 40, 5) },
    y: { range: [0, 20], label: 'Price ($)', ticks: range(0, 20, 4) },
    draw(s) {
      const z = side(s, which), out = [], k = which === 'e' ? 'd' : 's';
      const up = s.dP > 0, lo = Math.min(P0, z.P1), hi = Math.max(P0, z.P1), qa = Math.min(Q0, z.Q1), qb = Math.max(Q0, z.Q1);
      if (Math.abs(s.dP) > 0.01) {
        // Revenue gained on the units still sold at the higher price, and lost on the units no longer sold (price rise),
        // or the reverse for a price cut.
        out.push(A([[0, lo], [qa, lo], [qa, hi], [0, hi]], up ? 'g' : 'r', qa > 6 && hi - lo > 1.2 ? (up ? '+ gain' : '− loss') : ''));
        if (qb - qa > 0.05) out.push(A([[qa, 0], [qb, 0], [qb, lo], [qa, lo]], up ? 'r' : 'g', qb - qa > 4 ? (up ? '− loss' : '+ gain') : ''));
      }
      if (s.mode === 1) {
        out.push(which === 'e' ? Hl(P0, k, 'D: perfectly elastic', { bold: true }) : V(Q0, k, 'D: perfectly inelastic', { bold: true }));
      } else {
        const E = which === 'e' ? s.Ee : s.Ei;
        out.push(C(pdq(E), k, `D (|E| = ${f(E, 2)} at A)`, { from: Math.max(0, Q0 - 20 * E), to: Math.min(40, Q0 + 20 * E), labelAt: which === 'e' ? 1.5 : Math.min(39, Q0 + 12 * E) }));
      }
      out.push(G(Q0, P0, 'Q₀', 'P₀', 'n'), P(Q0, P0, 'A', 'n', { small: true, dx: -12, dy: -8 }));
      if (Math.abs(s.dP) > 0.01 && !(s.mode === 1 && which === 'e' && up)) out.push(G(z.Q1, z.P1, Math.abs(z.Q1 - Q0) > 2.5 ? 'Q₁' : '', 'P₁'), P(z.Q1, z.P1, 'B'));
      if (s.mode === 1 && which === 'e' && up) out.push(T(1, P0 + s.dP + 0.6, 'At any higher price, sales fall to zero', 'r'));
      return out;
    },
  });
  const elasticInelastic = {
    id: 'elastic-inelastic',
    title: 'Elastic and inelastic demand compared',
    summary: 'Elastic demand is flat-looking: a small change in price brings a large change in quantity, so a price rise loses revenue. Inelastic demand is steep-looking: quantity barely responds, so a price rise brings in more revenue. Both curves here pass through the same point A, so the only difference is how strongly buyers respond.',
    model: 'Both demand curves pass through A (P = 10, Q = 20). Each is a straight line with the chosen point elasticity at A: Q = 20 − 2|E|(P − 10). Move the price from 10 to P₁ and compare the change in quantity and in total revenue. The green rectangle is revenue gained, the red one revenue lost. The “perfect” switch shows the two extremes: horizontal (|E| = ∞) and vertical (|E| = 0).',
    graph: {
      layout: 'row',
      params: [
        { id: 'mode', label: 'Curves', options: [{ v: 0, label: 'Relatively elastic vs inelastic' }, { v: 1, label: 'Perfectly elastic vs perfectly inelastic' }], value: 0 },
        { id: 'dP', label: 'Change in price (ΔP)', min: -9.5, max: 9.5, step: 0.1, value: 2 },
        { id: 'Ee', label: 'Elastic curve: |E| at A', min: 1.05, max: 10, step: 0.1, value: 3 },
        { id: 'Ei', label: 'Inelastic curve: |E| at A', min: 0.05, max: 0.95, step: 0.05, value: 0.3 },
      ],
      valid(s) {
        if (s.mode === 1 && s.dP < -0.001) return 'With perfectly elastic demand a price cut would sell an unlimited quantity; try a price rise instead.';
        if (s.mode === 0 && side(s, 'e').Q1 < 0.5) return 'The elastic curve would reach zero quantity: buyers would stop buying entirely.';
        return true;
      },
      panels: [elasticPanel('e'), elasticPanel('i')],
      readout(s) {
        const e = side(s, 'e'), i = side(s, 'i'), tr0 = P0 * Q0;
        const pq = (z) => (Math.abs(s.dP) < 0.01 ? '—' : `${f(z.Q1)} (${pct((100 * (z.Q1 - Q0)) / Q0)})`);
        const el = (z) => (s.mode === 1 ? (z.E === 0 ? '0' : '∞') : Math.abs(s.dP) < 0.01 ? f(z.E, 2) : f(Math.abs(arc(Q0, z.Q1, P0, z.P1)), 2));
        const rows = [
          ['New price P₁ (% change)', `${money(P0 + s.dP)} (${pct((100 * s.dP) / P0)})`],
          ['Elastic: new quantity (% change)', pq(e)],
          ['Inelastic: new quantity (% change)', pq(i)],
          ['|E| (arc, between A and B): elastic / inelastic', `${el(e)} / ${el(i)}`],
          ['Total revenue (was $200): elastic / inelastic', `${money(e.P1 * e.Q1)} / ${money(i.P1 * i.Q1)}`],
        ];
        let status;
        if (Math.abs(s.dP) < 0.01) status = 'Move the price slider: the same price change gives a big quantity response on the elastic curve and a small one on the inelastic curve.';
        else if (s.dP > 0) status = `A ${pct((100 * s.dP) / P0, 0)} price rise: on the elastic curve quantity falls by more than ${pct((100 * s.dP) / P0, 0)}, so revenue falls (red loss beats green gain); on the inelastic curve quantity falls by less, so revenue rises.`;
        else status = `A ${pct((100 * -s.dP) / P0, 0)} price cut: on the elastic curve the extra units sold outweigh the lower price, so revenue rises; on the inelastic curve buyers hardly respond, so revenue falls.`;
        return { rows, status, tone: 'info' };
      },
    },
    equations: [
      { name: 'Price elasticity of demand', tex: R`|E| = \left|\frac{\%\Delta Q}{\%\Delta P}\right|`, note: 'Elastic: |E| > 1. Inelastic: |E| < 1. Unit elastic: |E| = 1.' },
      { name: 'Arc (midpoint) elasticity', tex: R`|E| = \left|\frac{(Q_1 - Q_0)/\bar{Q}}{(P_1 - P_0)/\bar{P}}\right|` },
      { name: 'Total revenue and elasticity', tex: R`\frac{\Delta TR}{\Delta P} = Q\,(1 + PED) = Q\,(1 - |E|)`, note: 'The guide’s form. A price rise raises revenue when demand is inelastic (−1 < PED < 0) and lowers it when demand is elastic (PED < −1).' },
      { name: 'The extremes', tex: R`\text{horizontal } D: |E| = \infty \qquad \text{vertical } D: |E| = 0` },
    ],
    points: [
      'Through the same point, the flatter curve is the more elastic one. But slope is not elasticity: along a single straight line, elasticity changes from point to point (see the price elasticity topic).',
      'Elastic demand: close substitutes, luxuries, a large share of the budget, a long time to adjust, a narrowly defined good (one brand of coffee).',
      'Inelastic demand: few substitutes, necessities, habit-forming goods, a small share of the budget, the short run, a broadly defined good (food).',
      'Firms facing inelastic demand can raise revenue by raising price; with elastic demand, cutting price raises revenue.',
      'Governments tax goods with inelastic demand (fuel, tobacco, alcohol) because sales fall little and revenue is reliable, and buyers bear most of the tax.',
      'Perfectly elastic demand is what a firm in perfect competition faces: it can sell any amount at the market price and nothing above it.',
    ],
    tip: 'Draw both curves through the same starting point, one flat and one steep. Mark the same price rise on both, show the much smaller quantity change on the steep curve, and shade the revenue gained and lost: on the elastic curve the loss rectangle is bigger, on the inelastic curve the gain rectangle is bigger.',
  };

  /* ── Income elasticity: normal and inferior goods ── */
  // Constant-elasticity Engel curves through M = 50, Q = 20: Q(M) = 20(M/50)^η.
  // Demand at income M: Q = Q(M)(10 − P)/5, so at P = 5 the quantity equals the Engel-curve quantity.
  const M0 = 50, EQ = 20;
  const engelQ = (eta) => (M) => EQ * (M / M0) ** eta;
  const engelM = (eta) => (q) => M0 * (q / EQ) ** (1 / eta);       // income as a function of quantity
  const incomeRange = (eta, top = 110) => { const a = engelQ(eta)(Math.min(10, top * 0.04)), b = engelQ(eta)(top); return [Math.min(a, b), Math.max(a, b)]; };
  const ied = (s) => {
    const n0 = engelQ(s.en)(M0), n1 = engelQ(s.en)(s.M1), i0 = engelQ(s.ei)(M0), i1 = engelQ(s.ei)(s.M1);
    const arcI = (q0, q1) => (Math.abs(s.M1 - M0) < 1e-9 ? NaN : ((q1 - q0) / ((q0 + q1) / 2)) / ((s.M1 - M0) / ((s.M1 + M0) / 2)));
    return { n0, n1, i0, i1, arcN: arcI(n0, n1), arcI: arcI(i0, i1) };
  };
  const kind = (e) => (e > 1 ? 'luxury' : e > 0 ? 'necessity' : 'inferior');
  const incomeElasticity = {
    id: 'income-elasticity',
    title: 'Income elasticity: normal and inferior goods',
    summary: 'Income elasticity of demand (IED) measures how demand responds to income. For a normal good it is positive: people buy more as they get richer (a necessity if IED is between 0 and 1, a luxury if it is above 1). For an inferior good it is negative: people buy less as income rises, switching to better alternatives. The Engel curve plots quantity against income; a change in income shifts the demand curve right for a normal good and left for an inferior good.',
    model: 'Both goods start at 20 units when income is M₀ = 50. Engel curves have constant income elasticity: Q = 20(M/50)^η, with η > 0 for the normal good and η < 0 for the inferior good. Demand at any income is Q = Q(M)(10 − P)/5, so at the price of 5 the quantity bought is the Engel-curve quantity. The two panels share the quantity axis.',
    graph: {
      layout: 'column',
      params: [
        { id: 'M1', label: 'New income (M₁)', min: 5, max: 200, step: 1, value: 75 },
        { id: 'en', label: 'Normal good: income elasticity η', min: 0.05, max: 3, step: 0.05, value: 0.5, hint: 'above 1 = luxury' },
        { id: 'ei', label: 'Inferior good: income elasticity η', min: -3, max: -0.05, step: 0.05, value: -0.8 },
      ],
      valid(s) {
        const z = ied(s);
        return true;
      },
      panels: [
        {
          title: 'Engel curves: quantity bought at each income',
          x: { range: [0, 60], label: 'Quantity (Q)', ticks: range(0, 60, 10) },
          y: { range: [0, 110], label: 'Income (M)', ticks: range(0, 110, 20) },
          draw(s) {
            const xm = s._x ? s._x[1] : 60, ym = s._y ? s._y[1] : 110;
            const z = ied(s), [na, nb] = incomeRange(s.en, ym), [ia, ib] = incomeRange(s.ei, ym), out = [];
            out.push(
              C(engelM(s.en), 'd', `Normal (${kind(s.en)}, η = ${f(s.en, 2)})`, { from: na, to: Math.min(xm, nb), labelAt: Math.min(xm * 0.92, Math.max(na + 2, engelQ(s.en)(ym * 0.62))) * 0.92 }),
              C(engelM(s.ei), 's', `Inferior (η = ${f(s.ei, 2)})`, { from: ia, to: Math.min(xm, ib), labelAt: Math.min(xm * 0.93, engelQ(s.ei)(22)) }),
              Hl(M0, 'ghost', 'M₀ = 50'),
            );
            if (Math.abs(s.M1 - M0) > 0.5) {
              out.push(Hl(s.M1, 'o', `M₁ = ${f(s.M1, 0)}`, { dash: true }));
              out.push(S(z.n0, M0, z.n1, s.M1, 'd', '', { dash: true }), S(z.i0, M0, z.i1, s.M1, 's', '', { dash: true }));
              out.push(P(z.n1, s.M1, '', 'd'), P(z.i1, s.M1, '', 's'));
            }
            out.push(P(EQ, M0, '', 'n', { small: true }));
            return out;
          },
        },
        {
          title: 'Demand curves: income shifts them',
          x: { range: [0, 60], label: 'Quantity (Q)', ticks: range(0, 60, 10) },
          y: { range: [0, 10], label: 'Price (P)', ticks: range(0, 10, 2) },
          draw(s) {
            const z = ied(s), d = (q) => (Q) => 10 - (5 * Q) / q, out = [], lx = (s._x ? s._x[1] : 60) * 0.983;
            const moved = Math.abs(s.M1 - M0) > 0.5;
            out.push(C(d(EQ), 'ghost', '', { to: 2 * EQ }), T(lx, 7.4, 'grey dashed: D at M₀ (both goods)', 'n', { anchor: 'end' }));
            if (moved) {
              out.push(C(d(z.n1), 'd', '', { to: 2 * z.n1 }), T(lx, 9.2, 'blue: D for the normal good at M₁', 'd', { anchor: 'end' }));
              out.push(C(d(z.i1), 's', '', { to: 2 * z.i1 }), T(lx, 8.3, 'red: D for the inferior good at M₁', 's', { anchor: 'end' }));
              out.push(P(z.n1, 5, '', 'd'), P(z.i1, 5, '', 's'), G(z.n1, 5, 'Q_N', null, 'd'), G(z.i1, 5, 'Q_I', null, 's'));
            }
            out.push(Hl(5, 'ghost', 'P = 5', { labelLeft: true }), P(EQ, 5, '', 'n', { small: true }));
            return out;
          },
        },
      ],
      readout(s) {
        const z = ied(s), dm = (100 * (s.M1 - M0)) / M0, pc = (a, b) => pct((100 * (b - a)) / a);
        return {
          rows: [
            ['Income change', `50 → ${f(s.M1, 0)} (${pct(dm)})`],
            ['Normal good: quantity (% change)', `${f(z.n0)} → ${f(z.n1)} (${pc(z.n0, z.n1)})`],
            ['Inferior good: quantity (% change)', `${f(z.i0)} → ${f(z.i1)} (${pc(z.i0, z.i1)})`],
            ['Arc IED: normal / inferior', Number.isFinite(z.arcN) ? `${f(z.arcN, 2)} / ${f(z.arcI, 2)}` : `${f(s.en, 2)} / ${f(s.ei, 2)} (point)`],
            ['Normal good is a', kind(s.en) === 'luxury' ? 'luxury (IED > 1)' : 'necessity (0 < IED < 1)'],
          ],
          status: Math.abs(s.M1 - M0) < 0.5
            ? 'Move the income slider: a normal good moves the same way as income, an inferior good the opposite way.'
            : s.M1 > M0
              ? `Income rises ${pct(dm, 0)}: demand for the normal good shifts right (+${pc(z.n0, z.n1).replace('-', '')}), demand for the inferior good shifts left (${pc(z.i0, z.i1)}). ${s.en > 1 ? 'The normal good is a luxury: its quantity rises faster than income, so its share of spending grows.' : 'The normal good is a necessity: its quantity rises more slowly than income, so its share of spending falls.'}`
              : `Income falls ${pct(-dm, 0)}: demand for the normal good shifts left, and demand for the inferior good shifts right as people trade down.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Income elasticity of demand', tex: R`IED = \frac{\%\Delta Q}{\%\Delta M} = \frac{\Delta Q}{\Delta M}\cdot\frac{M}{Q}` },
      { name: 'Arc (midpoint) version', tex: R`IED = \frac{(Q_1 - Q_0)/\bar{Q}}{(M_1 - M_0)/\bar{M}}` },
      { name: 'Classification', tex: R`\begin{aligned} IED &> 1 && \text{luxury (normal)} \\ 0 < IED &< 1 && \text{necessity (normal)} \\ IED &< 0 && \text{inferior} \end{aligned}` },
      { name: 'Constant-elasticity Engel curve', tex: R`Q = k\,M^{\eta}`, note: 'η is the income elasticity at every income.' },
    ],
    points: [
      'A change in income shifts the demand curve; a change in the good’s own price moves along it.',
      'Examples. Inferior: bus travel, value-range food, second-hand clothes. Necessities: food, energy, basic clothing. Luxuries: foreign holidays, eating out, sports cars.',
      'Engel’s law: as income rises, the share of income spent on food falls, because food is a necessity.',
      'A good can be normal at low incomes and inferior at high incomes: its Engel curve bends backward.',
      'Firms selling luxuries face demand that swings strongly over the business cycle; sellers of inferior goods may do well in recessions.',
      'In the indifference-curve model an inferior good has a negative income effect; if that effect outweighs the substitution effect the good is a Giffen good (see income and substitution effects).',
    ],
    tip: 'Draw the Engel curve with income on the vertical axis: upward sloping for a normal good, downward for an inferior good. Show the matching shift of the demand curve, and classify by the sign and size of IED: below 0 inferior, between 0 and 1 necessity, above 1 luxury.',
  };

  /* ── Deriving the Engel curve from the income–consumption curve ── */
  // Prices PX = PY = 1, so the budget line is X + Y = M.
  // Normal (a necessity): Stone–Geary U = ln(X − 2) + ln Y, so X* = 1 + M/2, Y* = M/2 − 1; ICC Y = X − 2; Engel M = 2X − 2.
  // Inferior: U = 16 ln X + Y²/2, so the tangency XY = 16 gives X* = (M − √(M² − 64))/2; ICC Y = 16/X; Engel M = X + 16/X.
  const ENG_GHOSTS = [9.5, 12.5];
  // Below M ≈ 8.87 the inferior-good consumer would rather spend everything on X, so income starts at 9.
  const engOpt = (type, M) => {
    if (type === 0) return { x: 1 + M / 2, y: M / 2 - 1, ied: (M / 2) / (1 + M / 2) };
    const r = Math.sqrt(M * M - 64), x = (M - r) / 2;
    return { x, y: M - x, ied: ((1 - M / r) / 2) * (M / x) };
  };
  const engIC = (type, o) => (type === 0
    ? (X) => (X > 2 ? ((o.x - 2) * o.y) / (X - 2) : NaN)
    : (X) => { const g = 2 * (16 * Math.log(o.x) + (o.y * o.y) / 2 - 16 * Math.log(X)); return g > 0 ? Math.sqrt(g) : NaN; });
  const engelDerivation = {
    id: 'engel-derivation',
    title: 'Deriving the Engel curve: normal and inferior goods',
    summary: 'Hold prices fixed and change income. Each budget line shifts out parallel, and the best bundle moves along the income–consumption curve (ICC). Plotting each income against the quantity of X chosen gives the Engel curve. If the ICC moves right as income rises, X is a normal good and the Engel curve slopes up; if it bends back to the left, X is an inferior good and the Engel curve slopes down.',
    model: 'Prices PX = PY = 1, so the budget line is X + Y = M. Normal good: U = ln(X − 2) + ln Y (X is a necessity: X* = 1 + M/2). Inferior good: U = 16 ln X + Y²/2, where the tangency condition XY = 16 makes X* fall as income rises. The panels share the X axis, so each optimum drops straight down to a point on the Engel curve.',
    graph: {
      layout: 'column',
      params: [
        { id: 'type', label: 'Good X is', options: [{ v: 0, label: 'Normal' }, { v: 1, label: 'Inferior' }], value: 0 },
        { id: 'M', label: 'Income (M)', min: (s) => (s.type === 1 ? 9 : 2.5), max: 34, step: 0.1, value: 10 },
      ],
      panels: [
        {
          title: 'Budget lines, indifference curves and the income–consumption curve',
          x: { range: [0, 14], label: 'Good X', ticks: range(0, 14, 2) },
          y: { range: [0, 14], label: 'Good Y', ticks: range(0, 14, 2) },
          draw(s) {
            const o = engOpt(s.type, s.M), out = [];
            for (const g of ENG_GHOSTS) { const og = engOpt(s.type, g); out.push(C((X) => g - X, 'ghost', '', { to: g }), P(og.x, og.y, '', 'n', { small: true })); }
            out.push(s.type === 0
              ? C((X) => X - 2, 'g', 'ICC', { from: engOpt(0, 9).x, to: engOpt(0, 14).x, labelAt: engOpt(0, 14).x - 0.4 })
              : C((X) => 16 / X, 'g', 'ICC (bends back)', { from: engOpt(1, 14).x, to: engOpt(1, 9).x, labelAt: engOpt(1, 14).x + 0.05 }));
            out.push(
              C((X) => s.M - X, 'd', `M = ${f(s.M, 1)}`, { to: s.M, labelAt: 0.4 }),
              C(engIC(s.type, o), 's', 'U', { from: s.type === 0 ? 2.15 : 0.6, to: 14, labelAt: 13 }),
              G(o.x, o.y, 'X*', null),
              P(o.x, o.y, 'E'),
            );
            return out;
          },
        },
        {
          title: 'Engel curve: quantity of X at each income',
          x: { range: [0, 14], label: 'Good X', ticks: range(0, 14, 2) },
          y: { range: [0, 16], label: 'Income (M)', ticks: range(0, 16, 4) },
          draw(s) {
            const o = engOpt(s.type, s.M), out = [];
            out.push(s.type === 0
              ? C((X) => 2 * X - 2, 'd', 'Engel curve (normal)', { from: engOpt(0, 9).x, to: engOpt(0, 14).x, labelAt: engOpt(0, 13).x })
              : C((X) => X + 16 / X, 'd', 'Engel curve (inferior)', { from: engOpt(1, 14).x, to: engOpt(1, 9).x, labelAt: engOpt(1, 13).x }));
            for (const g of ENG_GHOSTS) out.push(P(engOpt(s.type, g).x, g, '', 'n', { small: true }));
            out.push(G(o.x, s.M, 'X*', 'M'), P(o.x, s.M, 'E'));
            return out;
          },
        },
      ],
      readout(s) {
        const o = engOpt(s.type, s.M);
        return {
          rows: [
            ['Income M', f(s.M, 1)],
            ['Optimal X* / Y*', `${f(o.x)} / ${f(o.y)}`],
            ['Income elasticity of X (at this point)', f(o.ied, 2)],
            ['X is', s.type === 0 ? 'normal: a necessity (0 < IED < 1)' : 'inferior (IED < 0)'],
            ['Share of income spent on X', pct((100 * o.x) / s.M)],
          ],
          status: s.type === 0
            ? 'As income rises the budget line shifts out and the optimum moves up and to the right along the ICC: more X is bought, so the Engel curve slopes up. X rises less than proportionally (IED < 1), so its share of income falls: a necessity.'
            : 'As income rises the optimum moves up and to the left: the consumer buys more Y but less X. The ICC bends back and the Engel curve slopes down, so X is inferior (IED < 0).',
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Optimum at each income', tex: R`\frac{MU_X}{MU_Y} = \frac{P_X}{P_Y},\qquad P_X X + P_Y Y = M` },
      { name: 'Engel curve', tex: R`X^* = X^*(M) \quad (\text{prices held fixed})` },
      { name: 'Normal (Stone–Geary) example', tex: R`U = \ln(X - 2) + \ln Y \;\Rightarrow\; X^* = 1 + \frac{M}{2},\qquad IED = \frac{M/2}{1 + M/2} < 1` },
      { name: 'Inferior example', tex: R`U = 16\ln X + \tfrac{1}{2}Y^2 \;\Rightarrow\; XY = 16,\qquad X^* = \frac{M - \sqrt{M^2 - 64}}{2}` },
    ],
    points: [
      'Price-consumption curve (change P_X) gives the demand curve; income-consumption curve (change M) gives the Engel curve.',
      'Normal good: the ICC moves right as income rises and the Engel curve slopes up. Inferior good: the ICC bends back to the left and the Engel curve slopes down.',
      'With Cobb–Douglas preferences the ICC is a straight line from the origin and IED = 1 for both goods.',
      'The income effect of a price change has the same sign as this income response: negative for an inferior good, which is why an inferior good can (rarely) be a Giffen good.',
      'Both goods cannot be inferior: if income rises, spending on at least one good must rise.',
    ],
    tip: 'Draw two or three parallel budget lines, the tangency on each, and join the optima for the ICC. Drop each optimum down to the Engel curve panel against its income. State the classification from the slope: up for normal, down for inferior.',
  };

  /* ── Install in course order ── */
  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  insertAfter('isoquant', costCurves, MICRO, 'Block 5');
  insertAfter('elasticity', elasticInelastic, MICRO, (window.TOPICS.find((t) => t.id === 'elasticity') || {}).block || 'Block 3');
  insertAfter('elastic-inelastic', incomeElasticity, MICRO, (window.TOPICS.find((t) => t.id === 'elasticity') || {}).block || 'Block 3');
  insertAfter('demand-derivation', engelDerivation, MICRO, (window.TOPICS.find((t) => t.id === 'demand-derivation') || {}).block || 'Block 4');
  insertAfter('cournot', bertrandTopic, MICRO, 'Blocks 6–8');
  insertAfter('bertrand', stackelbergTopic, MICRO, 'Blocks 6–8');
  insertAfter('stackelberg', kinkedDemand, MICRO, 'Blocks 6–8');
  insertAfter('monopoly', priceDiscrimination, MICRO, 'Blocks 6–8');
  insertAfter('natural-monopoly', entryBarriers, MICRO, 'Blocks 6–8');
  insertAfter('entry-barriers', contestableMarkets, MICRO, 'Blocks 6–8');
})();
