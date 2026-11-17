/* Extra topics: total cost curves stacked above per-unit cost curves (Block 5), and the
   Bertrand and Stackelberg oligopoly models (Blocks 6–8). Loads after linked.js and inserts
   each topic into the course order. */
(function () {
  const { R, f, money, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
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
        { id: 'q', label: 'Output (Q)', min: 0.5, max: 10, step: 0.1, value: 6 },
        { id: 'F', label: 'Fixed cost (F)', min: 2, max: 20, step: 0.5, value: 8 },
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
        { id: 'ca', label: 'Marginal cost of A', min: 0, max: 6, step: 0.1, value: 3 },
        { id: 'cb', label: 'Marginal cost of B', min: 0, max: 6, step: 0.1, value: 3 },
        { id: 'd', label: 'Substitutability d (differentiated only)', min: 0, max: 0.9, step: 0.05, value: 0.5 },
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
        { id: 'cl', label: 'Leader marginal cost (c_L)', min: 0, max: 6, step: 0.1, value: 3 },
        { id: 'cf', label: 'Follower marginal cost (c_F)', min: 0, max: 6, step: 0.1, value: 3 },
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
      { name: 'Total output ranking', tex: R`Q_{mon} < Q_{Cournot} = \tfrac{2(a-c)}{3b} < Q_{Stackelberg} = \tfrac{3(a-c)}{4b} < Q_{comp}`, note: 'Stackelberg is closer to competition than Cournot.' },
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
        { id: 'c', label: 'Marginal cost (MC)', min: 0, max: 4, step: 0.1, value: 2 },
      ],
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
      params: [{ id: 'c', label: 'Marginal cost (MC)', min: 0, max: 8, step: 0.1, value: 4, hint: 'The MR gap runs from 2 to 6' }],
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

  /* ── Install in course order ── */
  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  insertAfter('isoquant', costCurves, MICRO, 'Block 5');
  insertAfter('cournot', bertrandTopic, MICRO, 'Blocks 6–8');
  insertAfter('bertrand', stackelbergTopic, MICRO, 'Blocks 6–8');
  insertAfter('stackelberg', kinkedDemand, MICRO, 'Blocks 6–8');
  insertAfter('monopoly', priceDiscrimination, MICRO, 'Blocks 6–8');
})();
