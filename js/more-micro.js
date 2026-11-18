/* More microeconomics: elasticity of supply, cross-price elasticity, subsidies, special preferences,
   intertemporal choice, labour–leisure choice, positive externalities, public goods, the commons,
   the market for lemons and import quotas. Loads after unemployment.js. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MICRO = 'Microeconomics';
  const blockOf = (id, fb) => (window.TOPICS.find((t) => t.id === id) || {}).block || fb;
  const unitOf = (id, fb) => (window.TOPICS.find((t) => t.id === id) || {}).unit || fb;
  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  // A curve given as a list of points, drawn as joined segments (for curves that are not functions of x).
  const poly = (pts, k, o = {}) => pts.slice(1).map((p, i) => S(pts[i][0], pts[i][1], p[0], p[1], k, '', o));

  /* ── Price elasticity of supply ── */
  // Three supply lines through A (Q = 20, P = 10): Q = 20 + 2E(P − 10). E > 1 cuts the price axis,
  // E = 1 passes through the origin, E < 1 cuts the quantity axis.
  const pesQ = (E) => (Pp) => 20 + 2 * E * (Pp - 10);
  const pesP = (E) => (Q) => 10 + (Q - 20) / (2 * E);
  const pesTopic = {
    id: 'pes',
    title: 'Price elasticity of supply',
    summary: 'Price elasticity of supply (PES) measures how much quantity supplied responds to price. Supply is elastic when firms can raise output easily (spare capacity, stocks, mobile inputs, a long time to adjust) and inelastic when they cannot. A useful trick: any straight-line supply curve through the origin has PES = 1; one that cuts the price axis is elastic; one that cuts the quantity axis is inelastic.',
    model: 'Three straight supply lines pass through A (P = 10, Q = 20), each with the chosen elasticity at A: Q = 20 + 2E(P − 10). Move the price and compare the quantity response. The “perfect” switch shows the extremes: horizontal (PES = ∞) and vertical (PES = 0).',
    graph: {
      x: { range: [0, 40], label: 'Quantity supplied (Q)', ticks: range(0, 40, 5) },
      y: { range: [0, 20], label: 'Price ($)', ticks: range(0, 20, 4) },
      params: [
        { id: 'mode', label: 'Curves', options: [{ v: 0, label: 'Elastic, unit and inelastic' }, { v: 1, label: 'Perfectly elastic and inelastic' }], value: 0 },
        { id: 'dP', label: 'Change in price (ΔP)', min: -9.5, max: 9.5, step: 0.1, value: 2 },
        { id: 'Ee', label: 'Elastic supply: PES at A', min: 1.05, max: 10, step: 0.1, value: 2.5 },
        { id: 'Ei', label: 'Inelastic supply: PES at A', min: 0.05, max: 0.95, step: 0.05, value: 0.4 },
      ],
      valid(s) {
        if (s.mode === 0 && pesQ(s.Ee)(10 + s.dP) < 0.05) return 'At this price firms on the elastic supply curve would supply nothing.';
        return true;
      },
      draw(s) {
        const P1 = 10 + s.dP, out = [];
        if (s.mode === 1) {
          out.push(Hl(10, 'd', 'Perfectly elastic (PES = ∞)', { bold: true }), V(20, 's', 'Perfectly inelastic (PES = 0)', { bold: true }));
          if (Math.abs(s.dP) > 0.01) out.push(Hl(P1, 'ghost', 'P₁'), P(20, P1, 'B', 's'));
        } else {
          const lines = [[s.Ee, 'd', 'Elastic'], [1, 'g', 'Unit elastic (through origin)'], [s.Ei, 's', 'Inelastic']];
          for (const [E, k, name] of lines) {
            const qa = Math.max(0, pesQ(E)(0)), qb = Math.min(40, pesQ(E)(20));
            out.push(C(pesP(E), k, '', { from: qa, to: qb }));
            if (Math.abs(s.dP) > 0.01) out.push(P(pesQ(E)(P1), P1, '', k));
          }
          if (Math.abs(s.dP) > 0.01) out.push(Hl(P1, 'ghost', 'P₁', { labelLeft: true }));
          out.push(T(1, 19, `Elastic: cuts the price axis, PES = ${f(s.Ee, 2)}`, 'd'), T(1, 17.8, 'Unit elastic: through the origin, PES = 1', 'g'), T(1, 16.6, `Inelastic: cuts the quantity axis, PES = ${f(s.Ei, 2)}`, 's'));
        }
        out.push(P(20, 10, 'A', 'n', { small: true, dx: -12, dy: -8 }));
        return out;
      },
      readout(s) {
        const P1 = 10 + s.dP, dp = (100 * s.dP) / 10, q = (E) => pesQ(E)(P1), pc = (x) => pct((100 * (x - 20)) / 20);
        const rows = [['New price (% change)', `${money(P1)} (${pct(dp)})`]];
        if (s.mode === 0) {
          rows.push(['Elastic: quantity (% change)', `${f(q(s.Ee))} (${pc(q(s.Ee))})`], ['Unit elastic: quantity (% change)', `${f(q(1))} (${pc(q(1))})`], ['Inelastic: quantity (% change)', `${f(q(s.Ei))} (${pc(q(s.Ei))})`]);
        } else rows.push(['Perfectly inelastic: quantity', '20.00 (0%)'], ['Perfectly elastic', 'any quantity at P = 10, none below it']);
        return {
          rows,
          status: Math.abs(s.dP) < 0.01 ? 'Move the price: the same price change brings a large response from elastic supply and a small one from inelastic supply.' : s.mode === 1 ? 'Perfectly inelastic supply (a fixed stock, such as land or seats in a stadium) does not respond at all; perfectly elastic supply means firms will supply any amount at one price.' : `A ${pct(Math.abs(dp), 0)} price ${s.dP > 0 ? 'rise' : 'fall'}: quantity on the unit-elastic line changes by exactly ${pct(Math.abs(dp), 0)}, by more on the elastic line and by less on the inelastic line.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Price elasticity of supply', tex: R`PES = \frac{\%\Delta Q_S}{\%\Delta P} = \frac{\Delta Q_S}{\Delta P}\cdot\frac{P}{Q_S}` },
      { name: 'Straight-line supply Q = c + dP', tex: R`PES = \frac{dP}{c + dP}\;\begin{cases} > 1 & c < 0 \text{ (cuts the price axis)} \\ = 1 & c = 0 \text{ (through the origin)} \\ < 1 & c > 0 \text{ (cuts the quantity axis)} \end{cases}` },
    ],
    points: [
      'Supply is more elastic with spare capacity, stocks of finished goods, inputs that are easy to buy or move, and more time to adjust.',
      'In the very short run supply can be perfectly inelastic (a fixed catch of fish at the market); in the long run firms can build capacity and enter, so supply is more elastic.',
      'Agricultural supply is often inelastic in the short run, so demand shocks cause large price swings.',
      'The elasticity of supply decides how much of a tax falls on producers and how much a demand increase raises price rather than output.',
    ],
    tip: 'Draw three supply lines through the same point: one cutting the price axis (elastic), one through the origin (unit elastic) and one cutting the quantity axis (inelastic). Slope alone does not tell you the elasticity.',
  };

  /* ── Cross-price elasticity ── */
  // Good B: demand P = 10 − Q/4, price moves from 5. Good A: demand pivots on P = 10, Q_A = 20(1 + XED·%ΔP_B) at P = 5.
  const crossTopic = {
    id: 'cross-price',
    title: 'Cross-price elasticity: substitutes and complements',
    summary: 'Cross-price elasticity of demand (XED) measures how demand for one good responds to the price of another. For substitutes it is positive: when coffee gets dearer, people buy more tea. For complements it is negative: when printers get dearer, people buy fewer ink cartridges. A change in the other good’s price shifts this good’s demand curve.',
    model: 'Good B starts at a price of 5 on demand P = 10 − Q/4. Good A starts at 20 units at its own price of 5; its demand pivots on P = 10, with Q_A = 20(1 + XED × %ΔP_B) at a price of 5. The left panel is the market for B (a movement along its demand curve); the right panel is the market for A (a shift of its demand curve).',
    graph: {
      layout: 'row',
      params: [
        { id: 'rel', label: 'The goods are', options: [{ v: 0, label: 'Substitutes (coffee B, tea A)' }, { v: 1, label: 'Complements (printers B, ink A)' }], value: 0 },
        { id: 'dpb', label: 'Change in the price of B (%)', min: -90, max: 200, step: 1, value: 20 },
        { id: 'x', label: 'Size of the cross-price elasticity |XED|', min: 0.05, max: 5, step: 0.05, value: 0.8 },
      ],
      valid(s) {
        const xed = s.rel === 0 ? s.x : -s.x, qa = 20 * (1 + (xed * s.dpb) / 100);
        if (qa < 0.25) return 'Demand for A would disappear entirely: no one would buy it.';
        return true;
      },
      panels: [
        {
          title: (s) => (s.rel === 0 ? 'Market for coffee (good B)' : 'Market for printers (good B)'),
          x: { range: [0, 40], label: 'Quantity of B', ticks: range(0, 40, 10) },
          y: { range: [0, 10], label: 'Price of B', ticks: range(0, 10, 2) },
          draw(s) {
            const p1 = 5 * (1 + s.dpb / 100), q1 = 4 * (10 - p1);
            return [C((Q) => 10 - Q / 4, 'n', 'D_B', { to: 40, labelAt: 34 }), P(20, 5, 'A', 'n', { small: true, dx: -12, dy: -8 }), G(q1, p1, 'Q_B', 'P_B'), P(q1, p1, Math.abs(s.dpb) > 0.5 ? 'B' : '')];
          },
        },
        {
          title: (s) => (s.rel === 0 ? 'Market for tea (good A): demand shifts' : 'Market for ink (good A): demand shifts'),
          x: { range: [0, 40], label: 'Quantity of A', ticks: range(0, 40, 10) },
          y: { range: [0, 10], label: 'Price of A', ticks: range(0, 10, 2) },
          draw(s) {
            const xed = s.rel === 0 ? s.x : -s.x, qa = 20 * (1 + (xed * s.dpb) / 100), d = (q) => (Q) => 10 - (5 * Q) / q;
            const out = [C(d(20), 'ghost', '', { to: 40 }), Hl(5, 'ghost', 'P_A = 5', { labelLeft: true })];
            if (Math.abs(qa - 20) > 0.05) out.push(C(d(qa), 'd', qa > 20 ? 'D_A shifts right' : 'D_A shifts left', { to: Math.min(40, 2 * qa), labelAt: Math.min(36, 1.55 * qa) }), G(qa, 5, 'Q_A', null, 'd'), P(qa, 5, '', 'd'));
            out.push(P(20, 5, '', 'n', { small: true }));
            return out;
          },
        },
      ],
      readout(s) {
        const xed = s.rel === 0 ? s.x : -s.x, dqa = xed * s.dpb, p1 = 5 * (1 + s.dpb / 100), q1 = 4 * (10 - p1);
        return {
          rows: [
            ['Price of B (% change)', `${money(p1)} (${pct(s.dpb, 0)})`],
            ['Quantity of B (movement along D_B)', `${f(q1)} (${pct((100 * (q1 - 20)) / 20)})`],
            ['Demand for A at its price of 5 (% change)', `${f(20 * (1 + dqa / 100))} (${pct(dqa)})`],
            ['XED = %ΔQ_A / %ΔP_B', f(xed, 2)],
          ],
          status: Math.abs(s.dpb) < 0.5 ? 'Change the price of B to see the demand for A shift.' : s.rel === 0
            ? `Substitutes (XED > 0): B is ${s.dpb > 0 ? 'dearer, so buyers switch to A and its demand shifts right' : 'cheaper, so buyers switch away from A and its demand shifts left'}.`
            : `Complements (XED < 0): B is ${s.dpb > 0 ? 'dearer, so fewer are bought, and demand for A, used with it, shifts left' : 'cheaper, so more are bought, and demand for A shifts right'}.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Cross-price elasticity', tex: R`XED = \frac{\%\Delta Q_A}{\%\Delta P_B}` },
      { name: 'Signs', tex: R`XED > 0:\ \text{substitutes}\qquad XED < 0:\ \text{complements}\qquad XED \approx 0:\ \text{unrelated}` },
    ],
    points: [
      'The larger |XED|, the closer the relationship: Coke and Pepsi are close substitutes; cars and petrol are strong complements.',
      'Firms use XED to judge rivals’ pricing and to price complementary products (cheap printers, expensive ink).',
      'Competition authorities use high XED between products to define a market: close substitutes belong to the same market.',
      'A change in the price of a related good shifts the demand curve; a change in the good’s own price moves along it.',
    ],
    tip: 'Draw two diagrams: the price change in the related good’s market (a movement along its demand curve), then the shift of the other good’s demand curve. State the sign of XED and what it tells you.',
  };

  /* ── Subsidy incidence ── */
  // Demand P = 10 − b_d(Q − 20), supply P = 10 + b_s(Q − 20). A subsidy s per unit paid to producers.
  const sub = (s) => {
    const Q1 = 20 + s.s / (s.bd + s.bs), Pc = 10 - s.bd * (Q1 - 20), Pp = Pc + s.s;
    return { Q1, Pc, Pp, cost: s.s * Q1, dwl: 0.5 * s.s * (Q1 - 20), cShare: s.s > 0 ? (10 - Pc) / s.s : s.bs / (s.bd + s.bs) };
  };
  const subsidyTopic = {
    id: 'subsidy',
    title: 'Subsidies: who gains and what they cost',
    summary: 'A per-unit subsidy paid to producers shifts supply down by the subsidy. Output rises, the price buyers pay falls and the price sellers receive rises: the subsidy is shared, just like a tax, with the less elastic side getting the larger share. The government pays the subsidy on every unit, and the extra units produced cost more than buyers value them, so there is a deadweight loss (unless the subsidy corrects a positive externality).',
    model: 'Demand P = 10 − b_d(Q − 20) and supply P = 10 + b_s(Q − 20), so without a subsidy the market clears at Q = 20, P = 10. A subsidy s is paid to producers on every unit, so they receive the price paid by buyers plus s.',
    graph: {
      x: { range: [0, 40], label: 'Quantity (Q)', ticks: range(0, 40, 5) },
      y: { range: [0, 20], label: 'Price ($)', ticks: range(0, 20, 4) },
      params: [
        { id: 's', label: 'Subsidy per unit (s)', min: 0, max: 20, step: 0.1, value: 3 },
        { id: 'bd', label: 'Slope of demand (steeper = less elastic)', min: 0.05, max: 5, step: 0.05, value: 0.5 },
        { id: 'bs', label: 'Slope of supply (steeper = less elastic)', min: 0.05, max: 5, step: 0.05, value: 0.5 },
      ],
      draw(s) {
        const z = sub(s), D = (Q) => 10 - s.bd * (Q - 20), Sp = (Q) => 10 + s.bs * (Q - 20), out = [];
        if (s.s > 0.01) {
          out.push(A([[0, z.Pc], [z.Q1, z.Pc], [z.Q1, z.Pp], [0, z.Pp]], 'o', z.Q1 > 10 ? 'Cost to government' : ''));
          out.push(A([[20, 10], [z.Q1, z.Pp], [z.Q1, z.Pc]], 'r', ''));
        }
        out.push(C(D, 'd', 'D', { to: 40, labelAt: 36 }), C(Sp, 'g', 'S', { to: 40, labelAt: 36 }));
        if (s.s > 0.01) {
          out.push(C((Q) => Sp(Q) - s.s, 'g', '', { to: 40, dash: true }), T(31, Sp(31) - s.s - 1.6, 'S − subsidy', 'g'));
          out.push(G(z.Q1, z.Pp, 'Q₁', 'P_p'), P(z.Q1, z.Pp, 'Sellers get', 'g', { small: true, dx: 9, dy: -8 }), G(z.Q1, z.Pc, null, 'P_c'), P(z.Q1, z.Pc, 'Buyers pay', 'd', { small: true, dx: 9, dy: 14 }));
        }
        out.push(P(20, 10, s.s > 0.01 ? '' : 'Equilibrium', 'n', { small: true }));
        return out;
      },
      readout(s) {
        const z = sub(s);
        return {
          rows: [
            ['Quantity (was 20)', f(z.Q1)],
            ['Price buyers pay / sellers receive (was 10)', `${money(z.Pc)} / ${money(z.Pp)}`],
            ['Share of the subsidy going to buyers / sellers', `${pct(100 * z.cShare)} / ${pct(100 * (1 - z.cShare))}`],
            ['Cost to the government (s × Q₁)', money(z.cost)],
            ['Deadweight loss', money(z.dwl)],
          ],
          status: s.s < 0.01 ? 'No subsidy: the market clears at 20 units and a price of 10.' : `The subsidy raises output to ${f(z.Q1)}. Buyers get ${pct(100 * z.cShare, 0)} of it through a lower price and sellers ${pct(100 * (1 - z.cShare), 0)} through a higher price: the less elastic side gains more. It costs ${money(z.cost)}, more than the gain to buyers and sellers by the deadweight loss of ${money(z.dwl)}.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Subsidy wedge', tex: R`P_p = P_c + s` },
      { name: 'Who gains', tex: R`\frac{\text{buyers’ share}}{\text{sellers’ share}} = \frac{\varepsilon_S}{\varepsilon_D}`, note: 'The less elastic side gets more of the subsidy.' },
      { name: 'Cost and deadweight loss', tex: R`\text{cost} = s\,Q_1,\qquad DWL = \tfrac{1}{2}\,s\,(Q_1 - Q_0)` },
    ],
    points: [
      'Uses: lower prices of merit goods (public transport, childcare), support producers (farming), correct positive externalities (renewable energy, vaccination), keep essential services running.',
      'A subsidy that corrects a positive externality raises welfare; otherwise it creates a deadweight loss, because the extra units cost more to make than buyers value them.',
      'Costs: the opportunity cost of public money, the risk that firms become dependent or inefficient, and the difficulty of removing subsidies once in place.',
      'Incidence does not depend on whether the subsidy is paid to buyers or sellers.',
    ],
    tip: 'Shift supply down by the subsidy, find the new quantity, then read buyers’ price off demand and sellers’ price off the original supply. Shade the government’s cost rectangle (between the two prices) and the deadweight-loss triangle beyond the old equilibrium.',
  };

  /* ── Special preferences: perfect substitutes and complements ── */
  const SP_I = 24;
  const spOpt = (s) => {
    if (s.type === 0) {
      const r = s.px / s.py;
      if (s.a > r + 1e-9) return { x: SP_I / s.px, y: 0, u: s.a * SP_I / s.px, corner: 'X' };
      if (s.a < r - 1e-9) return { x: 0, y: SP_I / s.py, u: SP_I / s.py, corner: 'Y' };
      return { x: SP_I / (2 * s.px), y: SP_I / (2 * s.py), u: SP_I / s.py, corner: 'any' };
    }
    if (s.type === 1) { const x = SP_I / (s.px + s.a * s.py); return { x, y: s.a * x, u: x }; }
    return { x: SP_I / (2 * s.px), y: SP_I / (2 * s.py), u: Math.sqrt((SP_I / (2 * s.px)) * (SP_I / (2 * s.py))) };
  };
  const specialPrefs = {
    id: 'special-preferences',
    title: 'Perfect substitutes and perfect complements',
    summary: 'Indifference curves are not always smooth and bowed in. If two goods are perfect substitutes (the consumer only cares about the total, such as two brands of bottled water), indifference curves are straight lines and the consumer buys only the cheaper good per unit of satisfaction: a corner solution. If they are perfect complements (always used in fixed proportions, such as left and right shoes), indifference curves are L-shaped and the consumer buys them in that ratio whatever the prices.',
    model: 'Income 24. Perfect substitutes: U = aX + Y, so the MRS is constant at a. Perfect complements: U = min(X, Y/a), so the consumer wants a units of Y for each unit of X. Cobb–Douglas U = √(XY) is shown for comparison.',
    graph: {
      x: { range: [0, 24], label: 'Good X', ticks: range(0, 24, 4) },
      y: { range: [0, 24], label: 'Good Y', ticks: range(0, 24, 4) },
      params: [
        { id: 'type', label: 'Preferences', options: [{ v: 0, label: 'Perfect substitutes' }, { v: 1, label: 'Perfect complements' }, { v: 2, label: 'Cobb–Douglas (smooth)' }], value: 0 },
        { id: 'px', label: 'Price of X (P_X)', min: 0.3, max: 25, step: 0.1, value: 2 },
        { id: 'py', label: 'Price of Y (P_Y)', min: 0.3, max: 25, step: 0.1, value: 3 },
        { id: 'a', label: 'Substitutes: MRS a · Complements: units of Y per X', min: 0.1, max: 8, step: 0.05, value: 1 },
      ],
      draw(s) {
        const z = spOpt(s), out = [];
        out.push(C((X) => (SP_I - s.px * X) / s.py, 'd', 'Budget', { to: SP_I / s.px, labelAt: Math.min(20, SP_I / s.px) * 0.15 }));
        if (s.type === 0) {
          for (const m of [0.6, 1, 1.4]) { const u = z.u * m; out.push(C((X) => u - s.a * X, m === 1 ? 's' : 'ghost', m === 1 ? 'U (straight line)' : '', { to: Math.min(24, u / s.a), labelAt: Math.min(22, u / s.a) * 0.55 })); }
        } else if (s.type === 1) {
          for (const m of [0.6, 1, 1.4]) { const x = z.x * m, y = s.a * x, k = m === 1 ? 's' : 'ghost'; out.push(S(x, y, x, 24, k, ''), S(x, y, 24, y, k, '')); }
          out.push(C((X) => s.a * X, 'g', `Y = ${f(s.a, 2)}X`, { to: 24 / s.a, dash: true, labelAt: Math.min(20, 20 / s.a) }));
        } else {
          for (const m of [0.6, 1, 1.4]) { const u = z.u * m; out.push(C((X) => (u * u) / X, m === 1 ? 's' : 'ghost', m === 1 ? 'U' : '', { from: (u * u) / 24, to: 24, labelAt: 21 })); }
        }
        out.push(G(z.x, z.y, z.x > 0.3 ? 'X*' : null, z.y > 0.3 ? 'Y*' : null), P(z.x, z.y, 'E'));
        return out;
      },
      readout(s) {
        const z = spOpt(s), r = s.px / s.py;
        const rows = [['Optimal X* / Y*', `${f(z.x)} / ${f(z.y)}`], ['Price ratio P_X / P_Y', f(r, 2)]];
        let status;
        if (s.type === 0) {
          rows.push(['MRS (constant)', f(s.a, 2)]);
          status = z.corner === 'X' ? 'MRS > P_X/P_Y: X gives more satisfaction per pound, so the consumer spends everything on X (a corner solution).' : z.corner === 'Y' ? 'MRS < P_X/P_Y: Y gives more satisfaction per pound, so the consumer buys only Y (a corner solution).' : 'MRS = P_X/P_Y: every bundle on the budget line is equally good.';
        } else if (s.type === 1) {
          rows.push(['Demand for X', `24/(P_X + ${f(s.a, 2)}P_Y)`]);
          status = 'The consumer always buys the goods in the fixed ratio, at the corner of an L-shaped indifference curve. A price change has no substitution effect, only an income effect.';
        } else {
          rows.push(['MRS at E', f(z.y / z.x, 2)]);
          status = 'Smooth preferences: the optimum is a tangency where MRS = P_X/P_Y, and the consumer buys some of both goods.';
        }
        return { rows, status, tone: 'info' };
      },
    },
    equations: [
      { name: 'Perfect substitutes', tex: R`U = aX + Y,\quad MRS = a;\qquad X^* = \frac{I}{P_X} \text{ if } a > \frac{P_X}{P_Y},\quad Y^* = \frac{I}{P_Y} \text{ if } a < \frac{P_X}{P_Y}` },
      { name: 'Perfect complements', tex: R`U = \min\Big(X, \frac{Y}{a}\Big) \;\Rightarrow\; Y = aX,\qquad X^* = \frac{I}{P_X + aP_Y}` },
      { name: 'Smooth (Cobb–Douglas)', tex: R`MRS = \frac{P_X}{P_Y} \text{ at a tangency}` },
    ],
    points: [
      'With perfect substitutes the demand for X jumps from zero to everything when its relative price falls below the MRS: demand is perfectly elastic at that price.',
      'With perfect complements there is no substitution effect: a price change only changes how many “pairs” the consumer can afford.',
      'Real goods lie in between; the more curved the indifference curves, the weaker the substitution effect.',
      'The tangency rule MRS = price ratio needs smooth, convex indifference curves and an interior solution.',
    ],
    tip: 'For substitutes, compare the MRS with the price ratio to find the corner. For complements, put the optimum at the kink on the ray Y = aX and solve with the budget constraint.',
  };

  /* ── Intertemporal choice ── */
  // Two periods. Utility ln c₁ + β ln c₂. Budget c₁ + c₂/(1 + r) = y₁ + y₂/(1 + r) = W.
  const inter = (s) => {
    const r = s.r / 100, W = s.y1 + s.y2 / (1 + r), c1 = W / (1 + s.beta), c2 = (s.beta * (1 + r) * W) / (1 + s.beta);
    return { r, W, c1, c2, save: s.y1 - c1, U: Math.log(c1) + s.beta * Math.log(c2) };
  };
  const intertemporal = {
    id: 'intertemporal',
    title: 'Intertemporal choice: saving and borrowing',
    summary: 'Choosing between consumption now and consumption later works like choosing between two goods. The budget line links the two periods: saving £1 today gives £(1 + r) tomorrow, so the interest rate is the price of consuming now. The consumer picks the point where their rate of time preference (the MRS) equals 1 + r. Whether they save or borrow depends on when their income arrives and how patient they are.',
    model: 'Income y₁ now and y₂ later; interest rate r for both saving and borrowing. Budget c₁ + c₂/(1 + r) = y₁ + y₂/(1 + r). Utility ln c₁ + β ln c₂, where β < 1 means the consumer is impatient. The endowment point (y₁, y₂) always lies on the budget line.',
    graph: {
      x: (s) => { const z = inter(s), top = 20 * Math.ceil((z.W * 1.08) / 20); return { range: [0, top], label: 'Consumption now (c₁)', ticks: range(0, top, top / 5) }; },
      y: (s) => { const z = inter(s), top = 20 * Math.ceil(((1 + z.r) * z.W * 1.08) / 20); return { range: [0, top], label: 'Consumption later (c₂)', ticks: range(0, top, top / 5) }; },
      params: [
        { id: 'y1', label: 'Income now (y₁)', min: 0, max: 400, step: 1, value: 80 },
        { id: 'y2', label: 'Income later (y₂)', min: 0, max: 400, step: 1, value: 40 },
        { id: 'r', label: 'Interest rate (r, %)', min: 0, max: 100, step: 0.5, value: 5 },
        { id: 'beta', label: 'Patience (β)', min: 0.05, max: 4, step: 0.01, value: 0.9 },
      ],
      draw(s) {
        const z = inter(s), out = [];
        out.push(C((c1) => (1 + z.r) * (z.W - c1), 'd', 'Budget: slope −(1 + r)', { to: z.W, labelAt: z.W * 0.08 }));
        out.push(C((c1) => Math.exp((z.U - Math.log(c1)) / s.beta), 's', 'U', { from: z.c1 * 0.35, to: z.W * 1.05, labelAt: z.W * 0.98 }));
        out.push(P(s.y1, s.y2, 'Endowment', 'n', { small: true, dx: 9, dy: -8 }));
        if (Math.abs(z.save) > 0.3) out.push(S(Math.min(s.y1, z.c1), 2, Math.max(s.y1, z.c1), 2, z.save > 0 ? 'g' : 'r', '', { bold: true }), T((s.y1 + z.c1) / 2, 5, z.save > 0 ? 'saving' : 'borrowing', z.save > 0 ? 'g' : 'r', { anchor: 'middle' }));
        out.push(G(z.c1, z.c2, 'c₁*', 'c₂*'), P(z.c1, z.c2, 'E', 'o', { dx: -14, dy: 16 }));
        return out;
      },
      readout(s) {
        const z = inter(s);
        return {
          rows: [
            ['Present value of income W', f(z.W)],
            ['Consumption now / later', `${f(z.c1)} / ${f(z.c2)}`],
            [z.save >= 0 ? 'Saving now' : 'Borrowing now', f(Math.abs(z.save))],
            ['Slope of the budget line −(1 + r)', f(-(1 + z.r), 3)],
          ],
          status: Math.abs(z.save) < 0.3 ? 'The consumer neither saves nor borrows: their preferred timing matches their income.' : z.save > 0
            ? `A saver: income now is high relative to later, so they consume less than y₁ and lend ${f(z.save)}. A higher interest rate makes saving more rewarding (substitution effect) but also makes them richer (income effect), so saving can rise or fall.`
            : `A borrower: income comes later, so they borrow ${f(-z.save)} now. A higher interest rate makes borrowing dearer and makes them poorer, so borrowing falls.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Intertemporal budget constraint', tex: R`c_1 + \frac{c_2}{1 + r} = y_1 + \frac{y_2}{1 + r}` },
      { name: 'Optimum', tex: R`MRS = \frac{MU_{c_1}}{MU_{c_2}} = 1 + r` },
      { name: 'This model', tex: R`c_1^* = \frac{W}{1 + \beta},\qquad c_2^* = \frac{\beta(1 + r)W}{1 + \beta}` },
    ],
    points: [
      'The interest rate is the relative price of consumption today: a higher r makes current consumption dearer.',
      'For a saver the income and substitution effects of a higher r pull in opposite directions; for a borrower both reduce current consumption.',
      'Consumption smoothing: people use saving and borrowing to keep consumption steadier than income (the life-cycle and permanent-income ideas).',
      'Borrowing constraints (a higher interest rate for borrowing than for saving, or no borrowing at all) put a kink in the budget line at the endowment.',
    ],
    tip: 'Draw the budget line through the endowment point with slope −(1 + r). The tangency shows whether the consumer saves (optimum left of the endowment) or borrows (to the right).',
  };

  /* ── Labour–leisure choice and backward-bending labour supply ── */
  // 16 hours a day. Utility U = −(a/C + (1 − a)/ℓ) with a/(1 − a) = 16 (elasticity of substitution ½).
  // Budget C = w(16 − ℓ) + V. Tangency gives C/ℓ = √(16w), so ℓ = (16w + V)/(w + √(16w)).
  const LT = 16, LK = 16, LA = 16 / 17;
  // Capped at 16 hours: below the reservation wage the worker chooses not to work at all (a corner).
  const leis = (w, Vv) => Math.min(LT, (LT * w + Vv) / (w + Math.sqrt(LK * w)));
  const util = (Cc, l) => -(LA / Cc + (1 - LA) / l);
  const LW0 = 8;
  const llOut = (s) => {
    const l = leis(s.w, s.V), h = LT - l, Cc = s.w * h + s.V, U = util(Cc, l);
    const l0 = leis(LW0, s.V), U0 = util(LW0 * (LT - l0) + s.V, l0);
    const lc = Math.min(LT, -(LA / Math.sqrt(LK * s.w) + 1 - LA) / U0); // compensated leisure at the new wage, original utility
    return { l, h, Cc, U, h0: LT - l0, hc: LT - lc };
  };
  const labourLeisure = {
    id: 'labour-leisure',
    title: 'Labour–leisure choice and backward-bending labour supply',
    summary: 'Each hour not spent working is an hour of leisure, so the wage is the price of leisure. A higher wage has two effects: leisure becomes dearer, so people work more (substitution effect), but they are also richer and want more leisure (income effect, since leisure is a normal good). At low wages the substitution effect usually wins and labour supply slopes up; at high wages the income effect can win and labour supply bends backward.',
    model: 'The worker has 16 hours a day and non-labour income V. Budget: C = w(16 − ℓ) + V, where ℓ is leisure. Preferences U = −(a/C + (1 − a)/ℓ) with a constant elasticity of substitution of ½. Effects of a wage change are measured from w₀ = 8.',
    graph: {
      layout: 'row',
      params: [
        { id: 'w', label: 'Hourly wage (w)', min: 0.5, max: 120, step: 0.5, value: 16 },
        { id: 'V', label: 'Non-labour income (V)', min: 0, max: 320, step: 1, value: 60 },
      ],
      panels: [
        {
          title: 'Choice of leisure and consumption',
          x: { range: [0, 16], label: 'Leisure (hours a day)', ticks: range(0, 16, 2) },
          y: (s) => { const top = 100 * Math.ceil((s.w * LT + s.V) / 100 + 0.05); return { range: [0, top], label: 'Consumption (C, $)', ticks: range(0, top, top / 5) }; },
          draw(s) {
            const z = llOut(s);
            return [
              C((l) => s.w * (LT - l) + s.V, 'd', 'Budget: slope −w', { to: LT, labelAt: 1 }),
              S(LT, 0, LT, s.V, 'd', ''),
              C((l) => { const d = -z.U - (1 - LA) / l; return d > 0 ? LA / d : NaN; }, 's', 'U', { from: 2, to: 16, labelAt: 15 }),
              S(z.l, 0.04 * (s.w * LT + s.V), LT, 0.04 * (s.w * LT + s.V), 'o', '', { bold: true }),
              T((z.l + LT) / 2, 0.08 * (s.w * LT + s.V), `work ${f(z.h, 1)} h`, 'o', { anchor: 'middle' }),
              G(z.l, z.Cc, 'ℓ*', 'C*'),
              P(z.l, z.Cc, 'E'),
            ];
          },
        },
        {
          title: 'Labour supply: hours worked at each wage',
          x: { range: [0, 10], label: 'Hours worked (h)', ticks: range(0, 10, 2) },
          y: { range: [0, 30], label: 'Wage (w)', ticks: range(0, 30, 5) },
          draw(s) {
            const z = llOut(s), pts = [];
            for (let w = 1; w <= 30.001; w += 0.25) pts.push([LT - leis(w, s.V), w]);
            let peak = pts[0]; for (const p of pts) if (p[0] > peak[0]) peak = p;
            return [
              ...poly(pts, 'g', { bold: true }),
              T(peak[0] + 0.25, peak[1], 'backward-bending S_L', 'g'),
              Hl(peak[1], 'ghost', ''),
              P(LT - leis(LW0, s.V), LW0, 'w₀', 'n', { small: true, dx: -20, dy: 4 }),
              G(z.h, s.w, 'h*', 'w'),
              P(z.h, s.w, ''),
            ];
          },
        },
      ],
      readout(s) {
        const z = llOut(s), dh = z.h - z.h0, se = z.hc - z.h0, ie = z.h - z.hc;
        const rows = [
          ['Hours worked / leisure', `${f(z.h, 2)} / ${f(z.l, 2)}`],
          ['Consumption C = w·h + V', money(z.Cc)],
          [`Change in hours from w₀ = ${LW0}`, `${dh >= 0 ? '+' : '−'}${f(Math.abs(dh), 2)}`],
          ['… substitution effect (always ≥ 0 for a wage rise)', `${se >= 0 ? '+' : '−'}${f(Math.abs(se), 2)}`],
          ['… income effect', `${ie >= 0 ? '+' : '−'}${f(Math.abs(ie), 2)}`],
        ];
        const slope = (LT - leis(s.w + 0.25, s.V)) - (LT - leis(s.w, s.V));
        return {
          rows,
          status: z.h < 1e-6
            ? 'The wage is below this person’s reservation wage: the extra consumption from working is not worth the leisure given up, so they do not work at all (a corner solution).'
            : slope > 0
            ? 'At this wage labour supply slopes up: a higher wage makes leisure dearer, and the substitution effect outweighs the income effect.'
            : 'At this wage labour supply bends backward: the worker is rich enough that the income effect (buying more leisure) outweighs the substitution effect, so a higher wage means fewer hours.',
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Budget constraint', tex: R`C = w\,(T - \ell) + V`, note: 'T: total hours; ℓ: leisure; V: non-labour income. The slope −w is the price of an hour of leisure.' },
      { name: 'Optimum', tex: R`MRS_{\ell C} = \frac{MU_\ell}{MU_C} = w` },
      { name: 'Effects of a wage rise', tex: R`\Delta h = \underbrace{\Delta h^{SE}}_{>\,0} + \underbrace{\Delta h^{IE}}_{<\,0 \text{ if leisure is normal}}`, note: 'Labour supply slopes up if the substitution effect is larger, and bends back if the income effect is larger.' },
    ],
    points: [
      'Leisure is usually a normal good, so the income effect of a wage rise works against the substitution effect.',
      'Non-labour income (benefits, inheritance, a partner’s earnings) shifts the budget line up and reduces hours through the income effect alone.',
      'Market labour supply usually slopes up even if some individuals’ curves bend back, because higher wages also draw new workers in (the participation margin).',
      'Tax and benefit policy: a cut in income tax raises the net wage, so its effect on hours depends on which effect dominates; in-work benefits mainly raise participation.',
    ],
    tip: 'Draw the budget line from 16 hours of leisure (with any non-labour income as a vertical step) up to the consumption axis, and the tangency. For a wage rise, pivot the budget line about the endowment and split the change into substitution and income effects.',
  };

  /* ── Positive externalities ── */
  // MPB: P = 20 − 0.5Q, MSB = MPB + e, MC (private = social): P = 4 + 0.5Q.
  const posExt = (s) => ({ Qm: 16, Pm: 12, Qs: 16 + s.e, Ps: 12 + 0.5 * s.e, dwl: 0.5 * s.e * s.e });
  const positiveExternality = {
    id: 'positive-externality',
    title: 'Positive externalities and corrective subsidies',
    summary: 'Some goods benefit people other than the buyer: vaccination protects others, education makes a more productive society, a well-kept garden pleases the neighbours. Buyers only weigh their own benefit, so the market produces too little. The gap between marginal social benefit and marginal private benefit is the marginal external benefit; a subsidy equal to it can raise output to the social optimum.',
    model: 'Marginal private benefit (demand) MPB: P = 20 − 0.5Q. Marginal social benefit MSB = MPB + e, where e is the marginal external benefit. Marginal cost (supply, with no external cost) P = 4 + 0.5Q.',
    graph: {
      x: { range: [0, 40], label: 'Quantity (Q)', ticks: range(0, 40, 5) },
      y: { range: [0, 28], label: 'Price, benefit and cost ($)', ticks: range(0, 28, 4) },
      params: [
        { id: 'e', label: 'Marginal external benefit (e)', min: 0, max: 39, step: 0.1, value: 4 },
        { id: 'fix', label: 'Policy', options: [{ v: 0, label: 'Free market' }, { v: 1, label: 'Subsidy = MEB' }], value: 0 },
      ],
      draw(s) {
        const z = posExt(s), out = [];
        if (s.e > 0.05 && s.fix === 0) out.push(A([[z.Qm, z.Pm + s.e], [z.Qs, z.Ps], [z.Qm, z.Pm]], 'r', s.e > 2.5 ? 'DWL' : ''));
        if (s.e > 0.05 && s.fix === 1) out.push(A([[0, 20 - 0.5 * z.Qs], [z.Qs, 20 - 0.5 * z.Qs], [z.Qs, z.Ps], [0, z.Ps]], 'o', 'Subsidy cost'));
        out.push(C((Q) => 20 - 0.5 * Q, 'd', 'MPB = D', { to: 40, labelAt: 2 }), C((Q) => 4 + 0.5 * Q, 'g', 'MC = S', { to: 40, labelAt: 36 }));
        if (s.e > 0.05) out.push(C((Q) => 20 + s.e - 0.5 * Q, 'd', 'MSB = MPB + MEB', { to: 40, dash: true, labelAt: 3 }));
        out.push(G(z.Qm, z.Pm, 'Q_m', null, 'n'), P(z.Qm, z.Pm, s.fix === 1 ? '' : 'Market', 'n', { small: true, dx: -12, dy: 16 }));
        if (s.e > 0.05) out.push(G(z.Qs, z.Ps, 'Q*', null), P(z.Qs, z.Ps, s.fix === 1 ? 'With subsidy' : 'Social optimum', 'o', { dx: 9, dy: 16 }));
        return out;
      },
      readout(s) {
        const z = posExt(s);
        const rows = [['Market output / price', `${f(z.Qm)} / ${money(z.Pm)}`], ['Socially optimal output', f(z.Qs)], ['Under-consumption', f(z.Qs - z.Qm)], ['Deadweight loss in the free market', money(z.dwl)]];
        if (s.fix === 1) rows.push(['Subsidy per unit / total cost', `${money(s.e)} / ${money(s.e * z.Qs)}`], ['Buyers pay / sellers receive', `${money(20 - 0.5 * z.Qs)} / ${money(z.Ps)}`]);
        return {
          rows,
          status: s.e < 0.05 ? 'No external benefit: the market outcome is efficient.' : s.fix === 0 ? `Buyers ignore the benefit to others, so the market stops at ${f(z.Qm)} units where MPB = MC, ${f(z.Qs - z.Qm)} short of the optimum where MSB = MC.` : `A subsidy of ${money(s.e)} per unit (the MEB) shifts effective demand up to MSB, so output rises to the optimum ${f(z.Qs)} and the deadweight loss disappears, at a cost of ${money(s.e * z.Qs)} to taxpayers.`,
          tone: s.fix === 0 && s.e > 0.05 ? 'warn' : 'good',
        };
      },
    },
    equations: [
      { name: 'Marginal social benefit', tex: R`MSB = MPB + MEB` },
      { name: 'Market and social optimum', tex: R`\text{market: } MPB = MC \qquad \text{optimum: } MSB = MC` },
      { name: 'Corrective (Pigouvian) subsidy', tex: R`s = MEB(Q^*)` },
      { name: 'This model', tex: R`Q_m = 16,\qquad Q^* = 16 + e,\qquad DWL = \tfrac{1}{2}e^2` },
    ],
    points: [
      'Merit goods (education, healthcare, vaccination) are under-consumed partly because of external benefits and partly because people underestimate their own benefit (information failure).',
      'Remedies: subsidies, direct state provision, regulation (compulsory schooling), and information campaigns.',
      'Positive production externalities also exist: research spills over to other firms, and bees from a honey farm pollinate nearby orchards.',
      'Problems: the external benefit is hard to measure, subsidies cost public money that has an opportunity cost, and they can go to people who would have bought anyway.',
    ],
    tip: 'Draw MSB above demand (MPB), mark the market quantity where MPB = MC and the optimum where MSB = MC, and shade the deadweight-loss triangle between MSB and MC over the missing units. Then show the subsidy closing the gap.',
  };

  /* ── Public goods ── */
  // Two consumers’ marginal benefits: MB_A = 10 − Q, MB_B = 6 − 0.5Q. Constant marginal cost c.
  const mbA = (Q) => Math.max(0, 10 - Q), mbB = (Q) => Math.max(0, 6 - 0.5 * Q), msb = (Q) => mbA(Q) + mbB(Q);
  const pub = (s) => {
    let Qs = 0; if (msb(0) > s.c) { let lo = 0, hi = 12; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (msb(m) > s.c) lo = m; else hi = m; } Qs = lo; }
    const QA = Math.max(0, 10 - s.c), QB = Math.max(0, 12 - 2 * s.c), Qp = Math.max(QA, QB);
    return { Qs, QA, QB, Qp, priceA: mbA(Qs), priceB: mbB(Qs), lost: (() => { let v = 0; for (let q = Qp; q < Qs; q += 0.001) v += (msb(q) - s.c) * 0.001; return v; })() };
  };
  const publicGoods = {
    id: 'public-goods',
    title: 'Public goods and free riding',
    summary: 'A public good is non-rival (one person’s use does not reduce another’s) and non-excludable (people cannot be stopped from benefiting). Street lighting, national defence and flood barriers are examples. Because everyone consumes the same quantity, the social benefit of each unit is the sum of everyone’s marginal benefits: market demand is the vertical sum. And because no one can be excluded, each person is tempted to free ride on others, so the market provides too little or none at all.',
    model: 'Two residents value street lights: marginal benefit MB_A = 10 − Q and MB_B = 6 − 0.5Q. Marginal social benefit is the vertical sum MSB = MB_A + MB_B. Each light costs c to provide. Left to the market, the keener resident buys up to where their own MB = c and the other free rides.',
    graph: {
      x: { range: [0, 14], label: 'Quantity of the public good (Q)', ticks: range(0, 14, 2) },
      y: { range: [0, 18], label: 'Marginal benefit and cost ($)', ticks: range(0, 18, 2) },
      params: [{ id: 'c', label: 'Marginal cost per unit (c)', min: 0.1, max: 15.9, step: 0.1, value: 7 }],
      draw(s) {
        const z = pub(s), out = [];
        if (z.Qs - z.Qp > 0.1) {
          const pts = []; for (let q = z.Qp; q <= z.Qs + 1e-9; q += (z.Qs - z.Qp) / 20) pts.push([q, msb(q)]);
          out.push(A([...pts, [z.Qs, s.c], [z.Qp, s.c]], 'r', z.Qs - z.Qp > 1.5 ? 'DWL' : ''));
        }
        out.push(
          C(mbA, 'n', 'MB_A', { to: 10, labelAt: 1 }),
          C(mbB, 'n', 'MB_B', { to: 12, labelAt: 11 }),
          C(msb, 'd', 'MSB = MB_A + MB_B (vertical sum)', { to: 12, labelAt: 2 }),
          Hl(s.c, 's', 'MC', { labelLeft: true }),
        );
        if (z.Qs > 0.05) out.push(G(z.Qs, s.c, 'Q*', null), P(z.Qs, s.c, 'Efficient', 'o', { dx: 9, dy: -8 }));
        if (z.Qp > 0.05 && Math.abs(z.Qp - z.Qs) > 0.05) out.push(G(z.Qp, s.c, 'Q_p', null, 'n'), P(z.Qp, s.c, 'Private', 'n', { small: true, dx: -9, dy: 16 }));
        return out;
      },
      readout(s) {
        const z = pub(s);
        return {
          rows: [
            ['Efficient quantity (ΣMB = MC)', f(z.Qs)],
            ['Provided privately (free riding)', f(z.Qp)],
            ['Lindahl prices at Q*: A / B', `${money(z.priceA)} / ${money(z.priceB)}`],
            ['Welfare lost to free riding', money(z.lost)],
          ],
          status: z.Qs < 0.05 ? 'The cost is above everyone’s combined marginal benefit: providing none is efficient.' : z.Qp < 0.05 ? 'Neither resident values a light at more than its cost on their own, so the market provides none, although together they value it at more than it costs: a complete market failure.' : `Privately, only ${f(z.Qp)} would be provided while the other resident free rides; the efficient quantity is ${f(z.Qs)}, where the sum of marginal benefits equals the cost. Charging each their marginal benefit at Q* (Lindahl prices) would cover the cost.`,
          tone: z.Qs - z.Qp > 0.05 ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Samuelson condition', tex: R`\sum_i MB_i(Q^*) = MC`, note: 'Add marginal benefits vertically, because everyone consumes the same quantity.' },
      { name: 'Private goods, for comparison', tex: R`\text{market demand} = \sum_i q_i(P) \text{ (horizontal sum)}` },
      { name: 'Lindahl prices', tex: R`p_i = MB_i(Q^*),\qquad \sum_i p_i = MC` },
    ],
    points: [
      'Non-rival: the marginal cost of an extra user is zero, so excluding anyone would be inefficient even if possible.',
      'Non-excludable: people can benefit without paying, so private firms cannot charge for the good: the free-rider problem.',
      'Remedies: provision funded by taxation, compulsory contributions, or making the good excludable (club goods such as subscription TV).',
      'The government still needs to know people’s valuations, and people have an incentive to understate them.',
      'Quasi-public goods (roads, beaches) are non-rival only until they get congested.',
    ],
    tip: 'Add the marginal benefit curves vertically, not horizontally. Mark the efficient quantity where the vertical sum meets MC, then show that each person alone would buy less (or none) and free ride on the other.',
  };

  /* ── The commons ── */
  // A fishing ground: catch value per boat (average product) AP = 20 − 0.5N, so total value 20N − 0.5N² and MP = 20 − N.
  // Each boat costs c. Open access: boats enter until AP = c. Efficient: MP = c.
  const commons = {
    id: 'commons',
    title: 'Common resources and the tragedy of the commons',
    summary: 'A common resource is rival (fish caught by one boat cannot be caught by another) but non-excludable (anyone can fish). Each fisher compares their own catch with the cost of a boat and ignores the fact that an extra boat reduces everyone else’s catch. So boats keep entering until all the profit (the resource rent) is gone: the resource is overused. Limiting access with licences, quotas or a tax per boat brings use back to the efficient level.',
    model: 'Catch value per boat (average product) AP = 20 − 0.5N, so the total catch is 20N − 0.5N² and the extra catch from one more boat (marginal product) is MP = 20 − N. Each boat costs c to run. With open access boats enter until AP = c; efficiency needs MP = c.',
    graph: {
      x: { range: [0, 40], label: 'Number of boats (N)', ticks: range(0, 40, 5) },
      y: { range: [0, 22], label: 'Value of catch per boat ($)', ticks: range(0, 22, 4) },
      params: [
        { id: 'c', label: 'Cost per boat (c)', min: 0.5, max: 19.9, step: 0.1, value: 8 },
        { id: 'pol', label: 'Access', options: [{ v: 0, label: 'Open access' }, { v: 1, label: 'Licences or a tax per boat' }], value: 0 },
      ],
      draw(s) {
        const No = 2 * (20 - s.c), Ns = 20 - s.c, out = [];
        if (s.pol === 0) out.push(A([[Ns, s.c], [No, s.c], [No, 2 * s.c - 20]], 'r', No - Ns > 5 ? 'Lost rent' : ''));
        else out.push(A([[0, 20 - 0.5 * Ns], [Ns, 20 - 0.5 * Ns], [Ns, s.c], [0, s.c]], 'g', 'Resource rent'));
        out.push(C((N) => 20 - 0.5 * N, 'd', 'AP (catch per boat)', { to: 40, labelAt: 4 }), C((N) => 20 - N, 's', 'MP (extra catch)', { to: 22, labelAt: 8 }), Hl(s.c, 'n', 'Cost per boat'));
        out.push(G(Ns, s.c, 'N*', null), P(Ns, s.c, 'Efficient', 'o', { dx: -9, dy: 16 }));
        out.push(G(No, s.c, 'N_open', null, 'n'), P(No, s.c, s.pol === 0 ? 'Open access' : '', 'n', { small: true, dx: 9, dy: -8 }));
        return out;
      },
      readout(s) {
        const No = 2 * (20 - s.c), Ns = 20 - s.c, rent = 0.5 * Ns * Ns, tax = 0.5 * (20 - s.c);
        return {
          rows: [
            ['Boats with open access', f(No)],
            ['Efficient number of boats', f(Ns)],
            ['Total catch value: open / efficient', `${money(20 * No - 0.5 * No * No)} / ${money(20 * Ns - 0.5 * Ns * Ns)}`],
            ['Resource rent: open / efficient', `${money(0)} / ${money(rent)}`],
            ['Tax per boat that gives N*', money(tax)],
          ],
          status: s.pol === 0
            ? `Each boat earns the average catch, so boats enter until AP equals the cost: ${f(No)} boats, twice the efficient ${f(Ns)}. The last boats add less to the total catch than they cost, and the whole rent of ${money(rent)} is dissipated.`
            : `Limiting access to ${f(Ns)} boats (licences, quotas) or a tax of ${money(tax)} per boat makes each fisher face the true cost of entry: the rent of ${money(rent)} is kept and fish stocks are protected.`,
          tone: s.pol === 0 ? 'warn' : 'good',
        };
      },
    },
    equations: [
      { name: 'Open access', tex: R`AP(N) = c \;\Rightarrow\; \text{zero rent}` },
      { name: 'Efficient use', tex: R`MP(N^*) = c` },
      { name: 'Correcting tax per user', tex: R`t = AP(N^*) - c`, note: 'The external cost each entrant imposes on the others.' },
    ],
    points: [
      'Examples: ocean fisheries, groundwater, grazing land, the atmosphere as a carbon sink, congested roads.',
      'The externality is a cost entrants impose on existing users, which no one counts.',
      'Remedies: tradable quotas (individual transferable quotas in fisheries), licences, taxes, property rights, and community management (Ostrom).',
      'Over time overuse can also destroy the stock itself, as in the collapse of the Grand Banks cod fishery.',
    ],
    tip: 'Draw AP and MP for the resource with a horizontal cost line. Open access settles where AP = cost (zero profit), efficiency where MP = cost; the gap between them is overuse.',
  };

  /* ── The market for lemons ── */
  // Car quality q is uniform on [0, 10]. Sellers value a car at q, buyers at k·q. Buyers cannot see quality.
  // At price p, cars with q ≤ p are offered, average quality min(p, 10)/2, so buyers will pay k·min(p, 10)/2.
  const lemons = {
    id: 'lemons',
    title: 'Asymmetric information: the market for lemons',
    summary: 'When sellers know more than buyers about quality, bad products drive out good ones (Akerlof). Buyers cannot tell good used cars from “lemons”, so they will only pay for average quality. Owners of good cars then refuse to sell at that price, average quality falls, buyers lower their offers, and the market can unravel until only lemons, or nothing, is traded, even though every trade would benefit both sides.',
    model: 'Car quality q (in $ thousand) is spread evenly from 0 to 10. A seller values their car at q and a buyer at k × q, with k > 1, so every sale would create a gain. Buyers cannot see quality. At price p, only cars worth at most p to their owners are offered, so their average quality is min(p, 10)/2 and buyers will pay k × min(p, 10)/2.',
    graph: {
      x: { range: [0, 16], label: 'Price offered (p, $ thousand)', ticks: range(0, 16, 2) },
      y: { range: [0, 16], label: 'Value to buyers ($ thousand)', ticks: range(0, 16, 2) },
      params: [
        { id: 'k', label: 'Buyers’ valuation multiple (k)', min: 1, max: 10, step: 0.05, value: 1.5 },
        { id: 'info', label: 'Information', options: [{ v: 0, label: 'Quality hidden' }, { v: 1, label: 'Quality revealed (inspection, warranty)' }], value: 0 },
      ],
      draw(s) {
        const wtp = (p) => (s.k * Math.min(p, 10)) / 2, out = [];
        out.push(C((p) => p, 'ghost', 'Price = value', { to: 16, labelAt: 13.5 }), C(wtp, 'd', 'Buyers’ willingness to pay', { to: 16, labelAt: 12 }));
        if (s.info === 0) {
          const pts = []; let p = 10;
          for (let i = 0; i < 12 && p > 0.05; i++) { const q = wtp(p); pts.push([p, p], [p, q]); p = q; }
          for (let i = 1; i < pts.length; i++) out.push(S(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 'o', '', { dash: true }));
          out.push(P(10, 10, 'Start: all cars', 'o', { small: true, dx: 9, dy: -8 }));
          if (s.k >= 2) out.push(P(5 * s.k, 5 * s.k, 'Market works', 'g', { dx: 9, dy: 16 }));
          else out.push(P(0, 0, 'Unravels', 'r', { dx: 9, dy: -10 }));
        } else out.push(T(1, 14.5, 'Each car sells for between q and k·q: all cars trade', 'g'));
        return out;
      },
      readout(s) {
        const works = s.k >= 2 || s.info === 1, gain = (s.k - 1) * 5;
        return {
          rows: [
            ['Equilibrium price', s.info === 1 ? 'depends on each car’s quality' : works ? money(5 * s.k) + 'k' : '$0 (no trade)'],
            ['Share of cars traded', works ? '100%' : '0%'],
            ['Average gain per car if all trade', money(gain) + 'k'],
            ['Gains from trade achieved', works ? '100%' : '0%'],
          ],
          status: s.info === 1 ? 'With quality revealed, every car can trade at a price between what it is worth to the seller and to the buyer, so all gains from trade are achieved.' : works ? `Buyers value cars at least twice as highly as sellers (k = ${f(s.k, 2)}), so even the average-quality price keeps every seller in the market.` : `Each round, buyers offer only the value of the average car still on sale; owners of better cars withdraw, average quality falls and the price falls again. With k = ${f(s.k, 2)} the market unravels completely, although every car is worth more to a buyer than to its owner.`,
          tone: works ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Adverse selection', tex: R`p = k\,E[q \mid q \le p]`, note: 'The price buyers pay depends on the average quality of what is still offered at that price.' },
      { name: 'This model', tex: R`E[q \mid q \le p] = \frac{p}{2} \;\Rightarrow\; p = \frac{k\,p}{2} \;\Rightarrow\; \text{trade needs } k \ge 2` },
    ],
    points: [
      'Adverse selection: hidden information before a trade means the worst types are the most eager to trade (used cars, insurance buyers, loan applicants).',
      'Moral hazard is different: hidden action after a trade (drivers take more risks once insured).',
      'Market solutions: warranties, inspections, reputation and brands, dealer guarantees, signalling (education as a signal of ability) and screening.',
      'Policy solutions: compulsory insurance (so the healthy cannot opt out), disclosure rules, licensing and consumer protection law.',
    ],
    tip: 'Explain the unravelling step by step: buyers pay for average quality, the best sellers leave, average quality falls, and so on. Then name a solution that reveals quality.',
  };

  /* ── Import quotas ── */
  // Domestic demand P = 20 − Q/4 (Q_d = 80 − 4P), supply P = 2 + Q/4 (Q_s = 4P − 8). World price p_w.
  // A quota Q̄ limits imports, so the domestic price rises until Q_d − Q_s = Q̄: P = (88 − Q̄)/8.
  const quotaOut = (s) => {
    const pq = Math.max(s.pw, (88 - s.q) / 8), bind = pq > s.pw + 1e-9;
    const qs0 = 4 * s.pw - 8, qd0 = 80 - 4 * s.pw, qs = 4 * pq - 8, qd = 80 - 4 * pq;
    return { pq, bind, qs0, qd0, qs, qd, imports: qd - qs, rent: (pq - s.pw) * (qd - qs), dwl: 0.5 * (pq - s.pw) * (qs - qs0) + 0.5 * (pq - s.pw) * (qd0 - qd), cs: (qd0 + qd) / 2 * (pq - s.pw), ps: (qs0 + qs) / 2 * (pq - s.pw) };
  };
  const importQuota = {
    id: 'import-quota',
    title: 'Import quotas',
    summary: 'An import quota limits the quantity that can be imported. With less supply from abroad the domestic price rises above the world price, just as with a tariff: domestic producers gain, consumers lose more, and there are deadweight losses from too much costly domestic production and too little consumption. The difference is who gets the rectangle between the world and domestic prices: with a tariff it is tax revenue, with a quota it is a quota rent that goes to whoever holds the import licences.',
    model: 'Domestic demand Q_d = 80 − 4P and supply Q_s = 4P − 8. The country is small, so it can import any amount at the world price p_w. A quota Q̄ caps imports, so the domestic price rises until Q_d − Q_s = Q̄, that is P = (88 − Q̄)/8.',
    graph: {
      x: { range: [0, 80], label: 'Quantity (Q)', ticks: range(0, 80, 10) },
      y: { range: [0, 20], label: 'Price ($)', ticks: range(0, 20, 4) },
      params: [
        { id: 'pw', label: 'World price (p_w)', min: 0.1, max: 19.9, step: 0.1, value: 5 },
        { id: 'q', label: 'Import quota (Q̄)', min: 0, max: 300, step: 1, value: 24 },
        { id: 'who', label: 'Quota rent goes to', options: [{ v: 0, label: 'Government (licences auctioned)' }, { v: 1, label: 'Domestic importers' }, { v: 2, label: 'Foreign exporters (VER)' }], value: 0 },
      ],
      draw(s) {
        const z = quotaOut(s), out = [];
        if (z.bind) {
          out.push(A([[z.qs, s.pw], [z.qd, s.pw], [z.qd, z.pq], [z.qs, z.pq]], 'o', z.imports > 8 ? 'Quota rent' : ''));
          out.push(A([[z.qs0, s.pw], [z.qs, s.pw], [z.qs, z.pq]], 'r', ''), A([[z.qd, s.pw], [z.qd0, s.pw], [z.qd, z.pq]], 'r', ''));
        }
        out.push(C((Q) => 20 - Q / 4, 'd', 'D', { to: 80, labelAt: 72 }), C((Q) => 2 + Q / 4, 'g', 'S (domestic)', { to: 72, labelAt: 66 }), Hl(s.pw, 'n', 'World price', { labelLeft: true }));
        if (z.bind) {
          out.push(Hl(z.pq, 'o', 'Price with quota', { dash: true, labelLeft: true }));
          out.push(S(z.qs, z.pq + 0.6, z.qd, z.pq + 0.6, 'o', '', { bold: true }), T((z.qs + z.qd) / 2, z.pq + 1.1, `imports = ${f(z.imports, 0)}`, 'o', { anchor: 'middle' }));
          out.push(G(z.qs, z.pq, 'Q_s', null, 'g'), G(z.qd, z.pq, 'Q_d', null, 'd'));
        } else out.push(G(z.qs0, s.pw, 'Q_s', null, 'g'), G(z.qd0, s.pw, 'Q_d', null, 'd'));
        return out;
      },
      readout(s) {
        const z = quotaOut(s), names = ['the government', 'domestic importers', 'foreign exporters'];
        const rows = [
          ['Free-trade imports', f(z.qd0 - z.qs0, 0)],
          ['Domestic price with quota', money(z.pq)],
          ['Equivalent tariff (same imports)', money(z.pq - s.pw)],
          ['Consumer surplus lost / producer surplus gained', `${money(z.cs)} / ${money(z.ps)}`],
          [`Quota rent (to ${names[s.who]})`, money(z.rent)],
          ['Deadweight loss (two triangles)', money(z.dwl)],
        ];
        return {
          rows,
          status: !z.bind
            ? 'The quota is larger than free-trade imports, so it does not bind and the domestic price stays at the world price.'
            : s.who === 2
              ? `A voluntary export restraint hands the quota rent of ${money(z.rent)} to foreign firms, so the country’s total loss is the deadweight loss plus the rent: ${money(z.dwl + z.rent)}.`
              : `The quota raises the domestic price to ${money(z.pq)}, the same as a tariff of ${money(z.pq - s.pw)}. The rent of ${money(z.rent)} stays at home (with ${names[s.who]}), so the national loss is the deadweight loss of ${money(z.dwl)}.`,
          tone: z.bind ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Domestic price with a binding quota', tex: R`Q_d(P) - Q_s(P) = \bar{Q}` },
      { name: 'Quota rent', tex: R`(P - p_w)\,\bar{Q}`, note: 'The same rectangle that would be tariff revenue under the equivalent tariff.' },
      { name: 'Deadweight loss', tex: R`DWL = \tfrac{1}{2}(P - p_w)(\Delta Q_s) + \tfrac{1}{2}(P - p_w)(\Delta Q_d)` },
    ],
    points: [
      'A quota and a tariff that allow the same imports have the same price, output and deadweight-loss effects; they differ in who gets the rectangle.',
      'If demand grows, a quota keeps imports fixed and the domestic price rises further, while a tariff keeps the price gap fixed and lets imports rise.',
      'Voluntary export restraints (VERs) give the rent to foreign exporters, making them costlier for the importing country than a tariff.',
      'Quotas invite lobbying and corruption over who gets licences (rent seeking).',
    ],
    tip: 'Draw domestic demand and supply with the world price line. Show the quota as a fixed gap between Q_s and Q_d at the higher domestic price, and label the rent rectangle and the two deadweight-loss triangles.',
  };

  // Install.
  insertAfter('income-elasticity', pesTopic, MICRO, blockOf('elasticity', 'Block 3'));
  insertAfter('pes', crossTopic, MICRO, blockOf('elasticity', 'Block 3'));
  insertAfter('tax-incidence', subsidyTopic, MICRO, blockOf('tax-incidence', 'Block 3'));
  insertAfter('consumer-choice', specialPrefs, MICRO, blockOf('consumer-choice', 'Block 4'));
  insertAfter('engel-derivation', intertemporal, MICRO, blockOf('demand-derivation', 'Block 4'));
  insertAfter('mvp-demand', labourLeisure, MICRO, blockOf('labour-market', 'Block 9'));
  insertAfter('externalities', positiveExternality, MICRO, blockOf('externalities', 'Block 10'));
  insertAfter('positive-externality', publicGoods, MICRO, blockOf('externalities', 'Block 10'));
  insertAfter('public-goods', commons, MICRO, blockOf('externalities', 'Block 10'));
  insertAfter('commons', lemons, MICRO, blockOf('externalities', 'Block 10'));
  insertAfter('tariff', importQuota, unitOf('tariff', 'International'), blockOf('tariff', null));
})();
