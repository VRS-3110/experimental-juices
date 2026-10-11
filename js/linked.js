/* Linked multi-panel graphs: two diagrams driven by the same sliders,
   drawn side by side (layout 'row') or stacked on a shared horizontal
   axis (layout 'column'). Loads after markets.js; replaces the graph on
   existing topics and inserts the new linked topics in course order. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MICRO = 'Microeconomics', MACRO = 'Macroeconomics';

  /* ── Perfect competition: firm beside industry ── */
  const lr = (s) => {
    const k = [0, 0.08, -0.04][s.type];
    const q1 = 2 * (s.a + 2), p1 = s.a - 0.25 * q1;
    const q2 = (s.a - 4 + 24 * k) / (0.25 + k), p2 = s.a - 0.25 * q2;
    const moved = Math.abs(s.a - 10) > 1e-6;
    return { k, q1, p1, q2, p2, moved, costShift: moved && Math.abs(p2 - 4) > 1e-6 };
  };
  // Typical firm: ATC = c(q + 4/q), MC = 2cq, so min ATC = 4c at q = 2. c scales with input prices.
  const atc = (c) => (q) => c * (q + 4 / q);
  const mc = (c) => (q) => 2 * c * q;

  const lrIndustry = {
    model: 'Firm: ATC = q + 4/q and MC = 2q, so min ATC = $4 at q = 2. Industry: demand P = a − 0.25Q, starting at Q = 24 with 12 firms. Both panels share the price axis.',
    graph: {
      layout: 'row',
      params: [
        { id: 'type', label: 'Industry type', options: [{ v: 0, label: 'Constant cost' }, { v: 1, label: 'Increasing cost' }, { v: 2, label: 'Decreasing cost' }], value: 0 },
        { id: 'a', label: 'Market demand (a)', min: 6, max: 14, step: 0.1, value: 12, hint: 'Start is a = 10. Raise for growth and entry, lower for decline and exit.' },
      ],
      panels: [
        {
          title: 'Typical firm',
          x: { range: [0, 6], label: 'Firm output (q)' },
          y: { range: [0, 12], label: 'Price and cost ($)' },
          draw(s) {
            const z = lr(s), c1 = z.p2 / 4, qsr = z.p1 / 2, a0 = atc(1)(qsr), gap = z.p1 - a0;
            return [
              z.moved && Math.abs(gap) > 0.01 ? A([[0, z.p1], [qsr, z.p1], [qsr, a0], [0, a0]], gap > 0 ? 'g' : 'r', Math.abs(gap) > 0.6 ? (gap > 0 ? 'Profit' : 'Loss') : '') : null,
              C(atc(1), z.costShift ? 'ghost' : 'd', z.costShift ? 'ATC₀' : 'ATC', { from: 0.4, labelAt: 5.3 }),
              C(mc(1), z.costShift ? 'ghost' : 's', z.costShift ? 'MC₀' : 'MC', z.costShift ? { labelAt: 4.2 } : {}),
              z.costShift ? C(atc(c1), 'd', 'ATC₁', { from: 0.4, labelAt: 4.6 }) : null,
              z.costShift ? C(mc(c1), 's', 'MC₁') : null,
              z.moved ? Hl(z.p1, 'o', 'P_SR', { dash: true, labelLeft: true }) : null,
              Hl(z.p2, 'g', z.moved ? 'P_LR' : 'P = MR = min ATC'),
              z.moved ? G(qsr, z.p1, 'q_SR', null, 'o') : null,
              z.moved ? P(qsr, z.p1, '', 'o') : null,
              G(2, z.p2, 'q*', null, 'g'),
              P(2, z.p2, '', 'g'),
            ];
          },
        },
        {
          title: 'Industry',
          x: { range: [0, 48], label: 'Industry output (Q)' },
          y: { range: [0, 12], label: 'Price ($)' },
          draw(s) {
            const z = lr(s);
            return [
              z.moved ? C((Q) => 10 - 0.25 * Q, 'ghost', 'D₀') : null,
              C((Q) => s.a - 0.25 * Q, 'd', 'D'),
              C((Q) => 4 + 0.25 * (Q - 24), 's', 'S₀'),
              z.moved ? C((Q) => z.p2 + 0.25 * (Q - z.q2), 's', 'S₁', { dash: true }) : null,
              C((Q) => 4 + z.k * (Q - 24), 'g', 'LRS', { labelAt: 44 }),
              z.moved ? Hl(z.p1, 'o', '', { dash: true }) : null,
              P(24, 4, 'E₀', 'n', { dx: -9, dy: 18 }),
              z.moved ? P(z.q1, z.p1, 'SR', 'o', { dx: -9 }) : null,
              z.moved ? G(z.q2, z.p2, 'Q_LR', null, 'g') : null,
              z.moved ? P(z.q2, z.p2, 'LR', 'g', { dy: 18 }) : null,
            ];
          },
        },
      ],
      readout(s) {
        const z = lr(s), qsr = z.p1 / 2, piSr = (z.p1 - atc(1)(qsr)) * qsr;
        const types = [
          'Constant-cost industry: entry does not change input prices, so firms’ costs stay put and LRS is flat. Price returns to $4.00.',
          'Increasing-cost industry: expansion bids up input prices, shifting every firm’s ATC up (ATC₁). LRS slopes up and price settles above $4.00.',
          'Decreasing-cost industry: expansion lowers input costs (external economies), shifting every firm’s ATC down. LRS slopes down.',
        ];
        return {
          rows: [
            ['Short-run price', money(z.p1)],
            ['Firm’s short-run output (P = MC)', f(qsr)],
            ['Firm’s short-run profit', money(piSr)],
            ['Long-run price = min ATC', money(z.p2)],
            ['Firm’s long-run output', f(2)],
            ['Number of firms: start → long run', `12 → ${f(z.q2 / 2, 1)}`],
          ],
          status: (z.moved ? (z.p1 > 4 ? 'Short run: price rises, firms earn supernormal profit, new firms enter. ' : 'Short run: price falls, firms make losses, some exit. ') : 'Move the demand slider to start an adjustment. ') + types[s.type],
        };
      },
    },
  };

  /* ── Labour market beside one firm ── */
  const labour = (s) => {
    const Ls = (w) => Math.max(0, (w - s.s0) / 0.15), Ld = (w) => Math.max(0, 100 - (10 * w) / s.p);
    const L0 = (10 * s.p - s.s0) / (0.1 * s.p + 0.15), w0 = s.s0 + 0.15 * L0;
    const binding = s.mw > w0 + 1e-9, w = binding ? s.mw : w0;
    return { w0, L0, w, binding, employed: binding ? Ld(w) : L0, supplied: binding ? Ls(w) : L0, firm: Math.max(0, 10 - w / s.p) };
  };
  const labourMarket = {
    model: 'Ten identical firms, each with MP_L = 10 − l. Market labour demand is the horizontal sum of their MRP curves, w = P(10 − L/10). Labour supply: w = s₀ + 0.15L. Both panels share the wage axis.',
    graph: {
      layout: 'row',
      params: [
        { id: 'p', label: 'Output price (P)', min: 1, max: 3, step: 0.05, value: 2 },
        { id: 's0', label: 'Labour supply shifter (s₀)', min: 0, max: 10, step: 0.1, value: 2, hint: 'Raise to shift labour supply left' },
        { id: 'mw', label: 'Minimum wage (0 = none)', min: 0, max: 25, step: 0.5, value: 0 },
      ],
      panels: [
        {
          title: 'Labour market',
          x: { range: [0, 100], label: 'Workers in the market (L)' },
          y: { range: [0, 30], label: 'Wage (w)', ticks: range(0, 30, 5) },
          draw(s) {
            const z = labour(s);
            return [
              C((L) => s.p * (10 - L / 10), 'd', 'D_L = ΣMRP_L', { to: 100 }),
              C((L) => s.s0 + 0.15 * L, 's', 'S_L'),
              z.binding ? Hl(s.mw, 'o', 'Minimum wage', { dash: true }) : null,
              z.binding ? S(z.employed, s.mw, z.supplied, s.mw, 'r', 'Unemployed', { bold: true, below: true }) : null,
              z.binding ? G(z.employed, s.mw, 'L_d', null, 'd') : null,
              z.binding ? G(z.supplied, s.mw, 'L_s', null, 's') : null,
              z.binding ? P(z.L0, z.w0, '', 'n', { small: true }) : G(z.L0, z.w0, 'L*', 'w*'),
              z.binding ? null : P(z.L0, z.w0, 'E'),
            ];
          },
        },
        {
          title: 'One firm',
          x: { range: [0, 10], label: 'Workers at the firm (l)' },
          y: { range: [0, 30], label: 'Wage and MRP ($)', ticks: range(0, 30, 5) },
          draw(s) {
            const z = labour(s);
            return [
              C((l) => s.p * (10 - l), 'd', 'MRP_L = d_L', { to: 10 }),
              Hl(z.w, 's', 'w = MFC'),
              z.firm > 0 ? G(z.firm, z.w, 'l*', null) : null,
              z.firm > 0 ? P(z.firm, z.w, 'MRP = w') : null,
            ];
          },
        },
      ],
      readout(s) {
        const z = labour(s);
        return {
          rows: [
            ['Market wage', money(z.w)],
            ['Market employment', f(z.employed, 1)],
            ['Each firm hires', f(z.firm, 2)],
            ['Unemployment', f(z.supplied - z.employed, 1)],
          ],
          status: z.binding
            ? `The minimum wage is above the market wage (${money(z.w0)}). Each firm moves up its MRP curve and hires fewer workers; ${f(z.supplied - z.employed, 1)} workers want jobs but cannot find them.`
            : 'The market sets the wage; each firm is a wage taker and hires until MRP_L = w. A minimum wage below the market wage has no effect.',
          tone: z.binding ? 'warn' : 'info',
        };
      },
    },
  };

  /* ── Monopolistic competition: short run beside long run ── */
  const LR_A = 2 + Math.sqrt(8);
  const mcPanel = (title, aOf) => ({
    title,
    x: { range: [0, 10], label: 'Quantity (Q)' },
    y: { range: [0, 10], label: 'Price ($)' },
    draw(s) {
      const a = aOf(s), q = a - 2, p = a - 0.5 * q, ac = 2 + 4 / q, gap = p - ac;
      return [
        gap > 0.02 ? A([[0, p], [q, p], [q, ac], [0, ac]], 'g', gap > 0.5 ? 'Profit' : '') : null,
        C((Q) => 2 + 4 / Q, 'n', 'AC', { from: 0.45, labelAt: 7.5 }),
        Hl(2, 's', 'MC'),
        C((Q) => a - 0.5 * Q, 'd', "DD'"),
        C((Q) => a - Q, 'g', 'MR', { to: a, labelAt: Math.min(a - 0.6, 6) }),
        G(q, p, 'Q*', 'P*'),
        P(q, 2, '', 'g', { small: true }),
        P(q, p, gap > 0.02 ? '' : 'Tangency'),
      ];
    },
  });
  const monopolisticCompetition = {
    model: 'Firm demand P = a − 0.5Q, MR = a − Q, MC = 2, AC = 2 + 4/Q. Long run: entry lowers a until DD′ is tangent to AC (a ≈ 4.83).',
    graph: {
      layout: 'row',
      params: [{ id: 'a', label: 'Short-run demand per firm (a)', min: 5, max: 9, step: 0.05, value: 7 }],
      panels: [mcPanel('Short run (before entry)', (s) => s.a), mcPanel('Long run (after entry)', () => LR_A)],
      readout(s) {
        const sr = { q: s.a - 2 }, lrq = LR_A - 2;
        sr.p = s.a - 0.5 * sr.q; sr.pi = (sr.p - 2 - 4 / sr.q) * sr.q;
        return {
          rows: [['Short-run Q*', f(sr.q)], ['Short-run price', money(sr.p)], ['Short-run profit', money(sr.pi)], ['Long-run Q*', f(lrq)], ['Long-run price = AC', money(LR_A - 0.5 * lrq)], ['Long-run profit', money(0)]],
          status: 'Short-run profit attracts entry. Each firm’s demand shifts left until it just touches AC: zero profit, P > MC, and AC still falling (excess capacity).',
        };
      },
    },
  };

  /* ── Keynesian cross stacked above injections and leakages ── */
  const il = (s) => { const lr = 1 - s.c * (1 - s.t) + s.z; return { lr, y: (0.5 + s.J) / lr }; };
  const injectionsLeakages = {
    model: 'AD = 0.5 + (I + G + X) + [c(1 − t) − z]Y. Leakages S + NT + Z = −0.5 + [1 − c(1 − t) + z]Y. The two panels share the income axis, so both show the same Y*.',
    graph: {
      layout: 'column',
      params: [
        { id: 'J', label: 'Injections I + G + X', min: 1, max: 4, step: 0.1, value: 2 },
        { id: 'c', label: 'MPC (c)', min: 0.5, max: 0.95, step: 0.01, value: 0.8 },
        { id: 't', label: 'Tax rate (t)', min: 0, max: 0.4, step: 0.01, value: 0.2 },
        { id: 'z', label: 'Marginal propensity to import (z)', min: 0, max: 0.3, step: 0.01, value: 0.14 },
      ],
      panels: [
        {
          title: 'Keynesian cross',
          x: { range: [0, 12], label: 'National income (Y)' },
          y: { range: [0, 12], label: 'Aggregate demand (AD)' },
          draw(s) {
            const z = il(s);
            return [
              C((Y) => Y, 'n', '45°', { labelAt: 10.6 }),
              C((Y) => 0.5 + s.J + (1 - z.lr) * Y, 'd', 'AD'),
              G(z.y, z.y, 'Y*', null),
              P(z.y, z.y, 'E'),
            ];
          },
        },
        {
          title: 'Leakages and injections',
          x: { range: [0, 12], label: 'National income (Y)' },
          y: { range: [-1, 6], label: 'Leakages, injections', ticks: range(-1, 6, 1) },
          draw(s) {
            const z = il(s);
            return [
              Hl(0, 'ghost', ''),
              Hl(s.J, 'g', 'I + G + X'),
              C((Y) => -0.5 + z.lr * Y, 's', 'S + NT + Z'),
              G(z.y, s.J, 'Y*', null),
              P(z.y, s.J, 'E'),
            ];
          },
        },
      ],
      readout(s) {
        const z = il(s);
        return { rows: [['Equilibrium Y*', f(z.y)], ['Marginal leakage rate', f(z.lr)], ['Multiplier K', f(1 / z.lr)]], status: 'Where AD crosses the 45° line, leakages equal injections. A steeper leakages line (higher t, z or s) means a flatter AD line and a smaller multiplier.' };
      },
    },
  };

  /* ── New: AD–AS beside the Phillips curve ── */
  const ap = (s) => {
    const gap = (2 + s.d - s.pe - s.v) / 1.1;
    return { gap, y: 100 + gap, pi: s.pe + 0.5 * gap + s.v, u: 5 - 0.5 * gap };
  };
  const PI_AXIS = { range: [-2, 12], label: 'Inflation π (%)', ticks: range(-2, 12, 2) };
  const adasPhillips = {
    id: 'adas-phillips',
    title: 'AD–AS and the Phillips curve together',
    summary: 'The same shock seen twice. Moving along SRAS raises output and inflation; through Okun’s law, higher output means lower unemployment, which is a move along the short-run Phillips curve. Both panels share the inflation axis.',
    model: 'AD: π = 2 + d − 0.6(Y − 100). SRAS: π = πᵉ + 0.5(Y − 100) + v. Okun: u = 5 − 0.5(Y − 100). Together they give SRPC: π = πᵉ + v − (u − 5).',
    graph: {
      layout: 'row',
      params: [
        { id: 'd', label: 'Demand shock (d)', min: -4, max: 4, step: 0.1, value: 2 },
        { id: 'pe', label: 'Expected inflation (πᵉ)', min: 0, max: 8, step: 0.1, value: 2 },
        { id: 'v', label: 'Supply shock (v)', min: -2, max: 3, step: 0.1, value: 0, hint: 'An oil price spike is v > 0' },
      ],
      actions: [{ label: 'Expectations catch up', run: (s) => { s.pe = Math.min(8, Math.max(0, ap(s).pi)); } }],
      panels: [
        {
          title: 'AD–AS (inflation and output)',
          x: { range: [90, 110], label: 'Output Y (potential = 100)', ticks: [90, 95, 100, 105, 110] },
          y: PI_AXIS,
          draw(s) {
            const z = ap(s);
            return [
              Hl(0, 'ghost', ''),
              V(100, 'g', 'LRAS'),
              C((Y) => 2 + s.d - 0.6 * (Y - 100), 'd', 'AD'),
              C((Y) => s.pe + 0.5 * (Y - 100) + s.v, 's', 'SRAS'),
              Hl(z.pi, 'o', '', { dash: true }),
              G(z.y, z.pi, 'Y', null),
              P(z.y, z.pi, 'A'),
            ];
          },
        },
        {
          title: 'Phillips curve (inflation and unemployment)',
          x: { range: [0, 10], label: 'Unemployment u (%)', ticks: range(0, 10, 2) },
          y: PI_AXIS,
          draw(s) {
            const z = ap(s);
            return [
              Hl(0, 'ghost', ''),
              V(5, 'g', 'LRPC'),
              C((u) => s.pe + s.v - (u - 5), 's', 'SRPC'),
              Hl(z.pi, 'o', '', { dash: true }),
              G(z.u, z.pi, 'u', null),
              P(z.u, z.pi, 'A'),
            ];
          },
        },
      ],
      readout(s) {
        const z = ap(s);
        return {
          rows: [['Output Y', f(z.y, 1)], ['Output gap', pct(z.gap)], ['Unemployment u', pct(z.u)], ['Inflation π', pct(z.pi)], ['Expected inflation πᵉ', pct(s.pe)]],
          status: Math.abs(z.gap) < 0.05
            ? 'Long-run equilibrium: output at potential, unemployment at u* = 5%, inflation equals expectations.'
            : z.gap > 0
              ? 'Output above potential and unemployment below u*, so inflation exceeds expectations. Press “Expectations catch up”: SRAS and SRPC both shift up together.'
              : 'Output below potential and unemployment above u*, so inflation is below expectations. As expectations fall, SRAS and SRPC both shift down.',
          tone: Math.abs(z.gap) < 0.05 ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Aggregate demand (from the Taylor rule)', tex: R`\pi = \pi_0 + d - \phi\,(Y - Y^*)`, note: 'Higher inflation makes the central bank raise r, lowering spending.' },
      { name: 'Short-run aggregate supply', tex: R`\pi = \pi^e + \gamma\,(Y - Y^*) + v`, note: 'Firms raise prices faster when output is above potential.' },
      { name: 'Okun’s law', tex: R`u - u^* = -\beta\,\frac{Y - Y^*}{Y^*}`, note: 'Links the output gap to cyclical unemployment.' },
      { name: 'Short-run Phillips curve', tex: R`\pi = \pi^e - \frac{\gamma}{\beta}\,(u - u^*) + v`, note: 'SRAS rewritten in unemployment using Okun’s law.' },
      { name: 'Long run', tex: R`\pi = \pi^e \;\Rightarrow\; Y = Y^*,\; u = u^*`, note: 'Vertical LRAS and LRPC.' },
    ],
    points: [
      'A demand shock is a move along SRAS and, at the same time, a move along SRPC.',
      'A supply shock or a change in expectations shifts SRAS and SRPC up together.',
      'Holding output above potential forces expectations up each period: accelerating inflation.',
    ],
    tip: 'Draw the two diagrams next to each other with one shared inflation axis, and use the same point label (A, B, C) in both.',
  };

  /* ── New: deriving the demand curve ── */
  const M = 40, PY = 4, GHOST_PX = [2.5, 8];
  const demandDerivation = {
    id: 'demand-derivation',
    title: 'Deriving the demand curve',
    summary: 'Change the price of X and record the optimal bundle each time. The optima trace the price–consumption curve (top). Plotting each price against the quantity of X chosen gives the individual demand curve (bottom).',
    model: 'U = √(XY), income M = 40, PY = 4. The panels share the X axis, so each optimum drops straight down to a point on the demand curve.',
    graph: {
      layout: 'column',
      params: [{ id: 'px', label: 'Price of X (PX)', min: 2, max: 8, step: 0.1, value: 4 }],
      panels: [
        {
          title: 'Indifference curves and the price–consumption curve',
          x: { range: [0, 12], label: 'Good X' },
          y: { range: [0, 12], label: 'Good Y' },
          draw(s) {
            const x = M / (2 * s.px), y = M / (2 * PY);
            return [
              ...GHOST_PX.map((p) => C((X) => (M - p * X) / PY, 'ghost', '', { to: M / p })),
              ...GHOST_PX.map((p) => P(M / (2 * p), y, '', 'n', { small: true })),
              C((X) => y, 'g', 'PCC', { from: 2, labelAt: 10.5 }),
              C((X) => (M - s.px * X) / PY, 'd', 'Budget', { to: M / s.px, labelAt: Math.min(11, M / s.px) * 0.2 }),
              C((X) => (x * y) / X, 's', 'U', { from: 0.3 }),
              G(x, y, 'X*', null),
              P(x, y, 'E'),
            ];
          },
        },
        {
          title: 'Individual demand curve',
          x: { range: [0, 12], label: 'Good X' },
          y: { range: [0, 10], label: 'Price of X', ticks: range(0, 10, 2) },
          draw(s) {
            const x = M / (2 * s.px);
            return [
              C((X) => M / (2 * X), 'd', 'd_X', { from: 1.7 }),
              ...GHOST_PX.map((p) => P(M / (2 * p), p, '', 'n', { small: true })),
              G(x, s.px, 'X*', 'PX'),
              P(x, s.px, 'E'),
            ];
          },
        },
      ],
      readout(s) {
        const x = M / (2 * s.px);
        return { rows: [['Optimal X*', f(x)], ['Optimal Y*', f(M / (2 * PY))], ['Spending on X', money(s.px * x)], ['Price elasticity of demand', '−1.00']], status: 'With these preferences spending on X stays at half of income at every price, so the PCC is flat and demand is unit elastic. Other preferences give a rising or falling PCC.' };
      },
    },
    equations: [
      { name: 'Optimum at each price', tex: R`\frac{MU_X}{P_X} = \frac{MU_Y}{P_Y},\quad P_X X + P_Y Y = M`, note: 'Solve at each PX to get one point on the demand curve.' },
      { name: 'Demand from Cobb–Douglas', tex: R`X^* = \frac{\alpha M}{P_X}`, note: 'Here α = 0.5, so X* = 20/PX.' },
      { name: 'Price–consumption curve', tex: R`\{(X^*(P_X),\, Y^*(P_X))\}`, note: 'The path of optima as PX changes, holding M and PY fixed.' },
      { name: 'PCC slope and elasticity', tex: R`\text{PCC flat} \iff |PED| = 1`, note: 'Rising PCC: inelastic. Falling PCC: elastic.' },
    ],
    points: [
      'Only PX changes; income and PY stay fixed along one demand curve.',
      'A change in income or PY shifts the whole demand curve instead.',
      'The income-consumption curve (changing M) gives the Engel curve in the same way.',
    ],
    tip: 'Line the two diagrams up vertically with the same X scale and drop dashed lines from each optimum to the demand curve.',
  };

  /* ── Install ── */
  const replace = { 'lr-industry': lrIndustry, 'labour-market': labourMarket, 'monopolistic-competition': monopolisticCompetition, 'injections-leakages': injectionsLeakages };
  for (const t of window.TOPICS) {
    const r = replace[t.id];
    if (r) { t.graph = r.graph; t.model = r.model; }
  }
  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  insertAfter('market-demand', demandDerivation, MICRO, 'Block 4');
  insertAfter('phillips', adasPhillips, MACRO, 'Blocks 16–18');
})();
