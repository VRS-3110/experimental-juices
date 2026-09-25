/* Study content: every topic has an interactive graph, its core equations,
   key points and an exam tip. Graph models are simple linear/power forms
   chosen so the numbers stay readable; each topic's `model` states them. */
window.TOPICS = (function () {
  const R = String.raw;
  const f = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
  const money = (v) => (Number.isFinite(v) ? (v < 0 ? '−$' : '$') + Math.abs(v).toFixed(2) : '—');
  const pct = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) + '%' : '—');

  // Primitive helpers (see engine.js).
  const C = (fn, k, label, o = {}) => ({ t: 'curve', fn, k, label, ...o });
  const V = (x, k, label, o = {}) => ({ t: 'vline', x, k, label, ...o });
  const Hl = (y, k, label, o = {}) => ({ t: 'hline', y, k, label, ...o });
  const P = (x, y, label, k = 'o', o = {}) => ({ t: 'point', x, y, label, k, ...o });
  const G = (x, y, xl, yl, k = 'o') => ({ t: 'guide', x, y, xl, yl, k });
  const A = (pts, k, label) => ({ t: 'area', pts, k, label });
  const S = (x1, y1, x2, y2, k, label, o = {}) => ({ t: 'seg', x1, y1, x2, y2, k, label, ...o });
  const T = (x, y, text, k = 'n', o = {}) => ({ t: 'text', x, y, text, k, ...o });
  const ghost = (on, fn, label, o = {}) => (on ? C(fn, 'ghost', label, o) : null);
  const changed = (a, b) => Math.abs(a - b) > 1e-6;
  const range = (a, b, step) => { const out = []; for (let v = a; v <= b + 1e-9; v += step) out.push(+v.toFixed(6)); return out; };

  const XQ = { range: [0, 10], label: 'Quantity (Q)' };
  const YP = { range: [0, 10], label: 'Price (P)' };

  return [
    /* ───────────── Foundations ───────────── */
    {
      id: 'ppf',
      unit: 'Foundations',
      title: 'Production possibilities frontier',
      summary: 'The PPF shows every efficient combination of two goods an economy can make with its resources and technology. Its slope is the opportunity cost.',
      model: 'PPF: X² + Y² = r², so the frontier bows outward (increasing opportunity cost).',
      graph: {
        x: { range: [0, 10], label: 'Consumer goods (X)' },
        y: { range: [0, 10], label: 'Capital goods (Y)' },
        params: [
          { id: 'r', label: 'Productive capacity (r)', min: 5, max: 9.5, step: 0.1, value: 8 },
          { id: 'x', label: 'Consumer goods chosen (X)', min: 0.5, max: 9, step: 0.1, value: 5 },
        ],
        draw(s) {
          const x = Math.min(s.x, s.r - 0.15), y = Math.sqrt(s.r * s.r - x * x), m = x / y;
          return [
            ghost(changed(s.r, 8), (X) => Math.sqrt(64 - X * X), 'PPF₀', { to: 8 }),
            C((X) => Math.sqrt(s.r * s.r - X * X), 'd', 'PPF', { to: s.r, labelAt: s.r * 0.72 }),
            S(x - 1.3, y + 1.3 * m, x + 1.3, y - 1.3 * m, 'o', null, { dash: true }),
            P(3, 3, 'Inefficient', 'n', { small: true }),
            P(8.6, 8.6, 'Unattainable', 'n', { small: true, dx: -9 }),
            G(x, y, 'X', 'Y'),
            P(x, y, 'A'),
          ];
        },
        readout(s) {
          const x = Math.min(s.x, s.r - 0.15), y = Math.sqrt(s.r * s.r - x * x);
          return {
            rows: [
              ['Consumer goods X', f(x)],
              ['Capital goods Y', f(y)],
              ['Opportunity cost of 1 more X', f(x / y) + ' Y'],
            ],
            status: x / y > 1 ? 'Deep into X: each extra unit costs more than one unit of Y.' : 'Opportunity cost rises as you move down the frontier.',
          };
        },
      },
      equations: [
        { name: 'Opportunity cost', tex: R`OC_X = \frac{\Delta Y \text{ given up}}{\Delta X \text{ gained}}`, note: 'The magnitude of the PPF slope at a point.' },
        { name: 'Comparative advantage', tex: R`OC^{A}_X < OC^{B}_X \Rightarrow A \text{ specialises in } X`, note: 'Lower opportunity cost, not higher output, decides who specialises.' },
        { name: 'Absolute advantage', tex: R`\frac{X_A}{L_A} > \frac{X_B}{L_B}`, note: 'Higher output per unit of input.' },
        { name: 'Terms of trade band', tex: R`OC^{A}_X < \text{price of } X \text{ in } Y < OC^{B}_X`, note: 'Both countries gain if the trade price lies between their opportunity costs.' },
      ],
      points: [
        'Points on the curve are efficient; inside is unemployment or waste; outside is unattainable today.',
        'A bowed-out PPF means increasing opportunity cost because resources are not equally suited to both goods.',
        'Growth (more resources, better technology) shifts the whole frontier outward.',
        'Choosing more capital goods today shifts the future PPF out further.',
      ],
      tip: 'In trade questions, compute each side’s opportunity cost for both goods before deciding who specialises.',
    },

    /* ───────────── Microeconomics ───────────── */
    {
      id: 'supply-demand',
      unit: 'Microeconomics',
      title: 'Supply and demand',
      summary: 'Market price settles where quantity demanded equals quantity supplied. Shifts in either curve move the equilibrium, and surplus measures the gains from trade.',
      model: 'Inverse demand P = a − 0.8Q; inverse supply P = c + 0.6Q.',
      graph: {
        x: XQ, y: YP,
        params: [
          { id: 'a', label: 'Demand level (a)', min: 6, max: 11, step: 0.1, value: 9, hint: 'Raise to shift demand right' },
          { id: 'c', label: 'Production cost (c)', min: -1, max: 4, step: 0.1, value: 1, hint: 'Raise to shift supply left' },
        ],
        draw(s) {
          const q = (s.a - s.c) / 1.4, p = s.a - 0.8 * q;
          return [
            A([[0, s.a], [0, p], [q, p]], 'd', 'CS'),
            A([[0, p], [0, s.c], [q, p]], 's', 'PS'),
            ghost(changed(s.a, 9), (Q) => 9 - 0.8 * Q, 'D₀'),
            ghost(changed(s.c, 1), (Q) => 1 + 0.6 * Q, 'S₀'),
            C((Q) => s.a - 0.8 * Q, 'd', 'D'),
            C((Q) => s.c + 0.6 * Q, 's', 'S'),
            G(q, p, 'Q*', 'P*'),
            P(q, p, 'E'),
          ];
        },
        readout(s) {
          const q = (s.a - s.c) / 1.4, p = s.a - 0.8 * q;
          const cs = 0.5 * (s.a - p) * q, ps = 0.5 * (p - s.c) * q;
          return { rows: [['Equilibrium price P*', money(p)], ['Equilibrium quantity Q*', f(q)], ['Consumer surplus', money(cs)], ['Producer surplus', money(ps)], ['Total surplus', money(cs + ps)]] };
        },
      },
      equations: [
        { name: 'Demand (linear)', tex: R`Q_d = a - bP`, note: 'Law of demand: quantity demanded falls as price rises (b > 0).' },
        { name: 'Supply (linear)', tex: R`Q_s = c + dP`, note: 'Quantity supplied rises with price (d > 0).' },
        { name: 'Equilibrium price', tex: R`Q_d = Q_s \;\Rightarrow\; P^* = \frac{a - c}{b + d}`, note: 'Substitute P* back into either curve to get Q*.' },
        { name: 'Consumer surplus', tex: R`CS = \tfrac{1}{2}\,(P_{\max} - P^*)\,Q^*`, note: 'Area below demand and above the price.' },
        { name: 'Producer surplus', tex: R`PS = \tfrac{1}{2}\,(P^* - P_{\min})\,Q^*`, note: 'Area above supply and below the price.' },
      ],
      points: [
        'A change in price moves along a curve; a change in anything else shifts it.',
        'Demand shifters: income, tastes, prices of substitutes and complements, expectations, number of buyers.',
        'Supply shifters: input costs, technology, taxes and subsidies, expectations, number of sellers.',
        'When both curves shift, one of P* or Q* is ambiguous without knowing the size of each shift.',
      ],
      tip: 'Draw the shift before you reason about it. Label old and new equilibria E₀ and E₁.',
    },
    {
      id: 'elasticity',
      unit: 'Microeconomics',
      title: 'Price elasticity of demand',
      summary: 'Elasticity measures how strongly quantity responds to price. Along a straight-line demand curve, elasticity changes at every point even though the slope does not.',
      model: 'Demand P = 10 − Q, so point elasticity |E| = P / Q.',
      graph: {
        x: XQ, y: YP,
        params: [{ id: 'q', label: 'Quantity at point A', min: 0.5, max: 9.5, step: 0.1, value: 3 }],
        draw(s) {
          const q = s.q, p = 10 - q;
          return [
            A([[0, p], [q, p], [q, 0], [0, 0]], 'g', 'TR'),
            C((Q) => 10 - Q, 'd', 'D'),
            T(3.6, 8.8, 'Elastic |E| > 1', 'd'),
            T(6.2, 1.2, 'Inelastic |E| < 1', 's'),
            P(5, 5, '|E| = 1', 'n', { small: true }),
            G(q, p, 'Q', 'P'),
            P(q, p, 'A'),
          ];
        },
        readout(s) {
          const q = s.q, p = 10 - q, e = p / q;
          const zone = e > 1.005 ? 'Elastic: cutting price raises total revenue.' : e < 0.995 ? 'Inelastic: raising price raises total revenue.' : 'Unit elastic: total revenue is at its maximum.';
          return { rows: [['Price P', money(p)], ['Quantity Q', f(q)], ['Point elasticity |E|', f(e)], ['Total revenue P×Q', money(p * q)]], status: zone };
        },
      },
      equations: [
        { name: 'Price elasticity of demand', tex: R`E_d = \frac{\%\Delta Q_d}{\%\Delta P}`, note: 'Usually negative; compare its absolute value to 1.' },
        { name: 'Midpoint (arc) formula', tex: R`E_d = \frac{(Q_2 - Q_1)/\bar{Q}}{(P_2 - P_1)/\bar{P}}`, note: 'Uses averages so the answer is the same in either direction.' },
        { name: 'Point elasticity', tex: R`E_d = \frac{dQ}{dP}\cdot\frac{P}{Q}`, note: 'For a linear curve the slope term is constant but P/Q is not.' },
        { name: 'Income elasticity', tex: R`E_I = \frac{\%\Delta Q_d}{\%\Delta I}`, note: 'Positive: normal good. Negative: inferior. Above 1: luxury.' },
        { name: 'Cross-price elasticity', tex: R`E_{xy} = \frac{\%\Delta Q_x}{\%\Delta P_y}`, note: 'Positive: substitutes. Negative: complements.' },
        { name: 'Price elasticity of supply', tex: R`E_s = \frac{\%\Delta Q_s}{\%\Delta P}`, note: 'Larger in the long run as firms adjust capacity.' },
      ],
      points: [
        'Total revenue rises with a price cut on the elastic part and falls on the inelastic part.',
        'Revenue peaks at the unit-elastic midpoint of a linear demand curve.',
        'Demand is more elastic with close substitutes, for luxuries, for a larger budget share and over longer time.',
        'A vertical demand curve is perfectly inelastic; a horizontal one is perfectly elastic.',
      ],
      tip: 'Do not confuse slope with elasticity. Always quote elasticity as a pure number with its sign discussed.',
    },
    {
      id: 'price-controls',
      unit: 'Microeconomics',
      title: 'Price ceilings and floors',
      summary: 'A legal maximum below equilibrium creates a shortage; a legal minimum above it creates a surplus. Either way, fewer units trade and surplus is lost.',
      model: 'Demand P = 9 − 0.8Q; supply P = 1 + 0.6Q; equilibrium P* ≈ 4.43.',
      graph: {
        x: { range: [0, 12], label: 'Quantity (Q)' }, y: YP,
        params: [{ id: 'pc', label: 'Controlled price', min: 1.2, max: 8.2, step: 0.1, value: 3, hint: 'Below P* acts as a ceiling, above P* as a floor' }],
        draw(s) {
          const qe = 8 / 1.4, pe = 9 - 0.8 * qe;
          const qd = (9 - s.pc) / 0.8, qs = (s.pc - 1) / 0.6, qt = Math.min(qd, qs);
          const ceiling = s.pc < pe;
          return [
            A([[qt, 9 - 0.8 * qt], [qt, 1 + 0.6 * qt], [qe, pe]], 'o', 'DWL'),
            C((Q) => 9 - 0.8 * Q, 'd', 'D'),
            C((Q) => 1 + 0.6 * Q, 's', 'S'),
            Hl(s.pc, 'o', ceiling ? 'Price ceiling' : 'Price floor', { dash: true }),
            G(qd, s.pc, 'Qd', null, 'd'),
            G(qs, s.pc, 'Qs', null, 's'),
            S(qs, s.pc, qd, s.pc, 'r', ceiling ? 'Shortage' : 'Surplus', { bold: true, below: true }),
            P(qe, pe, 'E', 'n', { small: true }),
          ];
        },
        readout(s) {
          const qe = 8 / 1.4;
          const qd = (9 - s.pc) / 0.8, qs = (s.pc - 1) / 0.6, qt = Math.min(qd, qs);
          const dwl = 0.5 * ((9 - 0.8 * qt) - (1 + 0.6 * qt)) * (qe - qt);
          const ceiling = qd > qs;
          return {
            rows: [['Controlled price', money(s.pc)], ['Quantity demanded', f(qd)], ['Quantity supplied', f(qs)], [ceiling ? 'Shortage' : 'Surplus', f(Math.abs(qd - qs))], ['Deadweight loss', money(dwl)]],
            status: ceiling ? 'Binding ceiling: buyers want more than sellers offer.' : 'Binding floor: sellers offer more than buyers want.',
          };
        },
      },
      equations: [
        { name: 'Shortage under a ceiling', tex: R`\text{Shortage} = Q_d(P_c) - Q_s(P_c)`, note: 'Only when the ceiling is set below P*.' },
        { name: 'Surplus under a floor', tex: R`\text{Surplus} = Q_s(P_f) - Q_d(P_f)`, note: 'Only when the floor is set above P*.' },
        { name: 'Quantity traded', tex: R`Q_{\text{traded}} = \min(Q_d, Q_s)`, note: 'The short side of the market decides how much changes hands.' },
        { name: 'Deadweight loss', tex: R`DWL = \tfrac{1}{2}\,\big(P_D(Q_t) - P_S(Q_t)\big)\,(Q^* - Q_t)`, note: 'Triangle between the curves from the traded quantity to Q*.' },
      ],
      points: [
        'A ceiling above equilibrium, or a floor below it, does not bind and changes nothing.',
        'Rent control and minimum wages are the classic examples.',
        'Shortages bring queues, black markets and falling quality; surpluses bring unsold stock or unemployment.',
      ],
      tip: 'Check whether the control binds before drawing any shortage or surplus.',
    },
    {
      id: 'tax-incidence',
      unit: 'Microeconomics',
      title: 'Tax incidence and deadweight loss',
      summary: 'A per-unit tax drives a wedge between what buyers pay and what sellers keep. The less elastic side of the market bears more of the tax.',
      model: 'Demand P = 9 − 0.8Q; supply P = 1 + 0.6Q; tax t shifts supply up to S + t.',
      graph: {
        x: XQ, y: YP,
        params: [{ id: 't', label: 'Per-unit tax (t)', min: 0, max: 6, step: 0.1, value: 2 }],
        draw(s) {
          const qe = 8 / 1.4, pe = 9 - 0.8 * qe;
          const qt = (8 - s.t) / 1.4, pb = 9 - 0.8 * qt, ps = pb - s.t;
          return [
            A([[0, pb], [qt, pb], [qt, ps], [0, ps]], 'g', 'Tax revenue'),
            A([[qt, pb], [qt, ps], [qe, pe]], 'o', ''),
            C((Q) => 9 - 0.8 * Q, 'd', 'D'),
            C((Q) => 1 + 0.6 * Q, 's', 'S'),
            s.t > 0 ? C((Q) => 1 + s.t + 0.6 * Q, 's', 'S + t', { dash: true }) : null,
            G(qt, pb, 'Qt', 'Pb'),
            G(qt, ps, null, 'Ps', 's'),
            P(qe, pe, 'E₀', 'n', { small: true, dx: 9, dy: 14 }),
            P(qt, pb, '', 'o'),
            P(qt, ps, '', 's', { small: true }),
          ];
        },
        readout(s) {
          const qe = 8 / 1.4, pe = 9 - 0.8 * qe;
          const qt = (8 - s.t) / 1.4, pb = 9 - 0.8 * qt, ps = pb - s.t;
          return {
            rows: [['Buyers pay Pb', money(pb)], ['Sellers keep Ps', money(ps)], ['Buyer share of tax', s.t ? pct(((pb - pe) / s.t) * 100, 0) : '—'], ['Tax revenue', money(s.t * qt)], ['Deadweight loss (shaded)', money(0.5 * s.t * (qe - qt))]],
            status: 'Demand is steeper (less elastic) here, so buyers carry 57% of the tax.',
          };
        },
      },
      equations: [
        { name: 'Tax wedge', tex: R`P_b - P_s = t`, note: 'Buyers’ price minus sellers’ price equals the tax.' },
        { name: 'Tax revenue', tex: R`\text{Revenue} = t \cdot Q_t`, note: 'The rectangle between Pb and Ps.' },
        { name: 'Deadweight loss', tex: R`DWL = \tfrac{1}{2}\, t\, (Q^* - Q_t)`, note: 'Grows with the square of the tax.' },
        { name: 'Buyers’ share of the burden', tex: R`\frac{P_b - P^*}{t} = \frac{E_s}{E_s + |E_d|}`, note: 'The more inelastic side pays more.' },
        { name: 'Subsidy (mirror image)', tex: R`P_s - P_b = s`, note: 'A subsidy also creates deadweight loss by overproducing.' },
      ],
      points: [
        'Who legally pays the tax does not change who bears it; elasticities do.',
        'Doubling a tax roughly quadruples the deadweight loss.',
        'Taxes on inelastic goods raise more revenue with less deadweight loss.',
      ],
      tip: 'Label Pb, Ps and Qt on the axes. Examiners look for the revenue rectangle and the DWL triangle.',
    },
    {
      id: 'consumer-choice',
      unit: 'Microeconomics',
      title: 'Consumer choice',
      summary: 'A consumer picks the affordable bundle on the highest indifference curve. At an interior optimum the budget line is tangent to the indifference curve.',
      model: 'Utility U = √(XY) (Cobb–Douglas, α = 0.5); budget Px·X + Py·Y = I.',
      graph: {
        x: { range: [0, 12], label: 'Good X' },
        y: { range: [0, 12], label: 'Good Y' },
        params: [
          { id: 'I', label: 'Income (I)', min: 20, max: 60, step: 1, value: 40 },
          { id: 'px', label: 'Price of X (Px)', min: 2, max: 8, step: 0.1, value: 4 },
          { id: 'py', label: 'Price of Y (Py)', min: 2, max: 8, step: 0.1, value: 4 },
        ],
        draw(s) {
          const x = s.I / (2 * s.px), y = s.I / (2 * s.py), u2 = x * y;
          return [
            C((X) => (u2 * 0.45) / X, 'ghost', 'U₀', { from: 0.2 }),
            C((X) => (u2 * 1.8) / X, 'ghost', 'U₂', { from: 0.2 }),
            C((X) => (s.I - s.px * X) / s.py, 'd', 'Budget', { to: s.I / s.px, labelAt: Math.min(11, s.I / s.px) * 0.2 }),
            C((X) => u2 / X, 's', 'U*', { from: 0.2 }),
            G(x, y, 'X*', 'Y*'),
            P(x, y, 'E'),
          ];
        },
        readout(s) {
          const x = s.I / (2 * s.px), y = s.I / (2 * s.py);
          return { rows: [['Optimal X*', f(x)], ['Optimal Y*', f(y)], ['Utility U*', f(Math.sqrt(x * y))], ['MRS = Px / Py', f(s.px / s.py)]], status: 'With Cobb–Douglas utility, half of income goes to each good whatever the prices.' };
        },
      },
      equations: [
        { name: 'Budget constraint', tex: R`P_x X + P_y Y = I`, note: 'Slope −Px/Py; intercepts I/Px and I/Py.' },
        { name: 'Marginal rate of substitution', tex: R`MRS_{xy} = \frac{MU_x}{MU_y}`, note: 'Slope of the indifference curve (in absolute value).' },
        { name: 'Optimum (tangency)', tex: R`\frac{MU_x}{MU_y} = \frac{P_x}{P_y} \iff \frac{MU_x}{P_x} = \frac{MU_y}{P_y}`, note: 'Equal marginal utility per dollar in every use.' },
        { name: 'Cobb–Douglas demands', tex: R`U = X^{\alpha}Y^{1-\alpha} \Rightarrow X^* = \frac{\alpha I}{P_x},\; Y^* = \frac{(1-\alpha) I}{P_y}`, note: 'Budget shares are constant at α and 1 − α.' },
        { name: 'Slutsky decomposition', tex: R`\text{Total effect} = \text{Substitution effect} + \text{Income effect}`, note: 'Substitution effect always opposes the price change.' },
      ],
      points: [
        'Indifference curves slope down, never cross, and are convex (diminishing MRS).',
        'An income rise shifts the budget line out in parallel; a price change rotates it.',
        'For a normal good both effects push the same way; for a Giffen good the income effect dominates.',
      ],
      tip: 'Write the tangency condition first, then substitute into the budget line to solve.',
    },
    {
      id: 'costs',
      unit: 'Microeconomics',
      title: 'Costs and perfect competition',
      summary: 'A price-taking firm produces where price equals marginal cost. Comparing price with average total cost tells you whether it earns a profit; comparing with average variable cost tells you whether to stay open.',
      model: 'VC = 6Q − 1.5Q² + 0.15Q³, TC = F + VC. Minimum AVC = $2.25 at Q = 5.',
      graph: {
        x: { range: [0, 10], label: 'Quantity (Q)' },
        y: { range: [0, 12], label: 'Cost and price ($)' },
        params: [
          { id: 'P', label: 'Market price (P = MR)', min: 1, max: 10, step: 0.1, value: 5 },
          { id: 'F', label: 'Fixed cost (F)', min: 2, max: 20, step: 0.5, value: 8 },
        ],
        draw(s) {
          const mc = (Q) => 6 - 3 * Q + 0.45 * Q * Q, avc = (Q) => 6 - 1.5 * Q + 0.15 * Q * Q, atc = (Q) => avc(Q) + s.F / Q;
          const q = s.P >= 2.25 ? (3 + Math.sqrt(9 - 1.8 * (6 - s.P))) / 0.9 : 0;
          const out = [];
          if (q > 0) out.push(A([[0, s.P], [q, s.P], [q, atc(q)], [0, atc(q)]], s.P >= atc(q) ? 'g' : 'r', s.P >= atc(q) ? 'Profit' : 'Loss'));
          out.push(
            C((Q) => s.F / Q, 'ghost', 'AFC', { from: 0.3 }),
            C(avc, 'n', 'AVC', { labelAt: 9.4 }),
            C(atc, 'd', 'ATC', { from: 0.3, labelAt: 9.4 }),
            C(mc, 's', 'MC'),
            Hl(s.P, 'o', 'P = MR = AR', { labelLeft: true }),
          );
          if (q > 0) out.push(G(q, s.P, 'Q*', null), P(q, atc(q), '', 'd', { small: true }), P(q, s.P, ''));
          return out;
        },
        readout(s) {
          const avc = (Q) => 6 - 1.5 * Q + 0.15 * Q * Q, atc = (Q) => avc(Q) + s.F / Q;
          let beQ = 1, be = Infinity;
          for (let Q = 0.5; Q < 30; Q += 0.01) { const v = atc(Q); if (v < be) { be = v; beQ = Q; } }
          if (s.P < 2.25) return { rows: [['Output Q*', '0'], ['Profit', money(-s.F)], ['Break-even price (min ATC)', money(be)], ['Shutdown price (min AVC)', money(2.25)]], status: 'Shut down: price is below minimum AVC, so producing loses more than F.', tone: 'bad' };
          const q = (3 + Math.sqrt(9 - 1.8 * (6 - s.P))) / 0.9, pi = (s.P - atc(q)) * q;
          return {
            rows: [['Output Q* (P = MC)', f(q)], ['ATC at Q*', money(atc(q))], ['Profit (P − ATC) × Q', money(pi)], ['Break-even price (min ATC)', money(be)], ['Shutdown price (min AVC)', money(2.25)]],
            status: pi >= 0 ? 'Economic profit: in the long run, entry pushes price down to min ATC.' : 'Loss, but keep producing: price covers AVC and part of fixed cost.',
            tone: pi >= 0 ? 'good' : 'warn',
          };
        },
      },
      equations: [
        { name: 'Total cost', tex: R`TC = FC + VC`, note: 'Fixed cost does not vary with output in the short run.' },
        { name: 'Marginal cost', tex: R`MC = \frac{\Delta TC}{\Delta Q} = \frac{dTC}{dQ}`, note: 'MC cuts AVC and ATC at their minimum points.' },
        { name: 'Average costs', tex: R`ATC = \frac{TC}{Q} = AFC + AVC`, note: 'AFC = FC/Q falls continuously.' },
        { name: 'Profit maximisation', tex: R`MR = MC`, note: 'For a price taker MR = P, so produce where P = MC on the rising part of MC.' },
        { name: 'Economic profit', tex: R`\pi = TR - TC = (P - ATC)\,Q`, note: 'Includes opportunity costs; zero profit is a normal return.' },
        { name: 'Shutdown rule', tex: R`P < \min AVC \Rightarrow Q = 0`, note: 'The firm’s short-run supply curve is MC above min AVC.' },
        { name: 'Long-run equilibrium', tex: R`P = MC = \min ATC`, note: 'Zero economic profit; productive and allocative efficiency.' },
      ],
      points: [
        'Short run: at least one fixed input. Long run: all inputs variable.',
        'Diminishing marginal returns make MC eventually rise.',
        'Between min AVC and min ATC the firm loses money but still produces.',
      ],
      tip: 'Read profit off the graph as a rectangle: height P − ATC at Q*, width Q*.',
    },
    {
      id: 'monopoly',
      unit: 'Microeconomics',
      title: 'Monopoly',
      summary: 'A monopolist faces the market demand curve, so marginal revenue lies below price. It restricts output to where MR = MC and charges the price demand will bear.',
      model: 'Demand P = 10 − Q, MR = 10 − 2Q, constant MC = c.',
      graph: {
        x: XQ, y: YP,
        params: [{ id: 'c', label: 'Marginal cost (MC)', min: 1, max: 7, step: 0.1, value: 2 }],
        draw(s) {
          const qm = (10 - s.c) / 2, pm = 10 - qm, qc = 10 - s.c;
          return [
            A([[0, 10], [0, pm], [qm, pm]], 'd', 'CS'),
            A([[0, pm], [qm, pm], [qm, s.c], [0, s.c]], 'g', 'Profit'),
            A([[qm, pm], [qm, s.c], [qc, s.c]], 'o', 'DWL'),
            C((Q) => 10 - Q, 'd', 'D = AR'),
            C((Q) => 10 - 2 * Q, 'g', 'MR', { to: 5, labelAt: 4.2 }),
            Hl(s.c, 's', 'MC = ATC'),
            G(qm, pm, 'Qm', 'Pm'),
            G(qc, s.c, 'Qc', null, 'n'),
            P(qm, s.c, '', 'g', { small: true }),
            P(qm, pm, 'M'),
          ];
        },
        readout(s) {
          const qm = (10 - s.c) / 2, pm = 10 - qm, qc = 10 - s.c;
          return { rows: [['Monopoly price Pm', money(pm)], ['Monopoly output Qm', f(qm)], ['Competitive output Qc', f(qc)], ['Profit', money((pm - s.c) * qm)], ['Deadweight loss', money(0.5 * (pm - s.c) * (qc - qm))], ['Lerner index (P − MC)/P', f((pm - s.c) / pm)]] };
        },
      },
      equations: [
        { name: 'Marginal revenue (linear demand)', tex: R`P = a - bQ \Rightarrow MR = a - 2bQ`, note: 'Same intercept, twice the slope.' },
        { name: 'MR and elasticity', tex: R`MR = P\left(1 - \frac{1}{|E_d|}\right)`, note: 'A monopolist never produces on the inelastic part of demand.' },
        { name: 'Profit maximisation', tex: R`MR = MC,\quad P_m = D(Q_m)`, note: 'Find Q from MR = MC, then go up to demand for price.' },
        { name: 'Lerner index', tex: R`L = \frac{P - MC}{P} = \frac{1}{|E_d|}`, note: 'Measures market power; zero under perfect competition.' },
        { name: 'Markup rule', tex: R`P = \frac{MC}{1 - 1/|E_d|}`, note: 'Less elastic demand means a higher markup.' },
        { name: 'Perfect price discrimination', tex: R`P_i = WTP_i,\; Q = Q_c`, note: 'No deadweight loss, but all surplus goes to the firm.' },
      ],
      points: [
        'Compared with competition: higher price, lower output, deadweight loss.',
        'Barriers to entry (legal, scale economies, control of inputs) sustain monopoly profit.',
        'A natural monopoly has falling ATC over the relevant range; regulators may set P = ATC.',
      ],
      tip: 'The most common error is reading price off the MR curve. Go up from Qm to demand.',
    },
    {
      id: 'externalities',
      unit: 'Microeconomics',
      title: 'Externalities',
      summary: 'When production imposes costs on third parties, the market ignores them and overproduces. A Pigouvian tax equal to the marginal external cost restores the efficient quantity.',
      model: 'MSB = D: P = 10 − 0.8Q; MPC: P = 1 + 0.6Q; MSC = MPC + MEC.',
      graph: {
        x: XQ, y: YP,
        params: [{ id: 'e', label: 'Marginal external cost (MEC)', min: 0, max: 5, step: 0.1, value: 2 }],
        draw(s) {
          const qm = 9 / 1.4, pm = 10 - 0.8 * qm, qo = (9 - s.e) / 1.4, po = 10 - 0.8 * qo;
          return [
            A([[qo, po], [qm, 1 + s.e + 0.6 * qm], [qm, pm]], 'o', 'DWL'),
            C((Q) => 10 - 0.8 * Q, 'd', 'D = MPB = MSB'),
            C((Q) => 1 + 0.6 * Q, 's', 'MPC = S'),
            C((Q) => 1 + s.e + 0.6 * Q, 'g', 'MSC'),
            G(qm, pm, 'Qm', null, 'n'),
            G(qo, po, 'Q*', 'P*'),
            P(qm, pm, 'Market', 'n', { small: true, dy: 18 }),
            P(qo, po, 'Optimum', 'o', { dx: -9 }),
          ];
        },
        readout(s) {
          const qm = 9 / 1.4, qo = (9 - s.e) / 1.4;
          return { rows: [['Market quantity', f(qm)], ['Efficient quantity', f(qo)], ['Overproduction', f(qm - qo)], ['Pigouvian tax needed', money(s.e)], ['Deadweight loss', money(0.5 * s.e * (qm - qo))]] };
        },
      },
      equations: [
        { name: 'Marginal social cost', tex: R`MSC = MPC + MEC`, note: 'Negative production externality: MSC lies above supply.' },
        { name: 'Marginal social benefit', tex: R`MSB = MPB + MEB`, note: 'Positive consumption externality: MSB lies above demand.' },
        { name: 'Social optimum', tex: R`MSB = MSC`, note: 'The market instead sets MPB = MPC.' },
        { name: 'Pigouvian tax', tex: R`t = MEC(Q^*)`, note: 'Internalises the externality; a subsidy equal to MEB does the same for positive externalities.' },
        { name: 'Deadweight loss', tex: R`DWL = \tfrac{1}{2}\,MEC\,(Q_m - Q^*)`, note: 'For a constant MEC per unit.' },
      ],
      points: [
        'Negative externalities: overproduction. Positive externalities: underproduction.',
        'Solutions: Pigouvian taxes or subsidies, regulation, tradable permits, Coasian bargaining.',
        'Coase theorem: with clear property rights and low transaction costs, bargaining reaches the efficient outcome.',
        'Public goods are non-rival and non-excludable, so the free-rider problem leads to underprovision.',
      ],
      tip: 'Label which curve is private and which is social. The DWL triangle points toward the market equilibrium.',
    },
    {
      id: 'lorenz',
      unit: 'Microeconomics',
      title: 'Lorenz curve and Gini coefficient',
      summary: 'The Lorenz curve plots the cumulative share of income earned by the poorest share of households. The further it sags below the line of equality, the more unequal the distribution.',
      model: 'Lorenz curve L(x) = x^k. Gini = (k − 1) / (k + 1).',
      graph: {
        x: { range: [0, 100], label: 'Cumulative % of households', ticks: range(0, 100, 20), fmt: (v) => v + '%' },
        y: { range: [0, 100], label: 'Cumulative % of income', ticks: range(0, 100, 20), fmt: (v) => v + '%' },
        params: [{ id: 'k', label: 'Inequality (k)', min: 1, max: 5, step: 0.05, value: 2.2 }],
        draw(s) {
          const L = (x) => 100 * Math.pow(x / 100, s.k);
          const pts = [[0, 0], [100, 100]];
          for (let x = 100; x >= 0; x -= 2) pts.push([x, L(x)]);
          return [
            A(pts, 'o', 'A'),
            C((x) => x, 'n', 'Line of equality', { labelAt: 38 }),
            C(L, 'd', 'Lorenz curve', { labelAt: 78 }),
            G(50, L(50), 'Bottom 50%', `${L(50).toFixed(0)}%`, 'd'),
          ];
        },
        readout(s) {
          const L = (x) => 100 * Math.pow(x, s.k);
          return { rows: [['Gini coefficient', f((s.k - 1) / (s.k + 1))], ['Income share, bottom 50%', pct(L(0.5))], ['Income share, bottom 20%', pct(L(0.2))], ['Income share, top 10%', pct(100 - L(0.9))]] };
        },
      },
      equations: [
        { name: 'Gini coefficient', tex: R`G = \frac{A}{A + B}`, note: 'A: area between equality line and Lorenz curve. B: area under the Lorenz curve.' },
        { name: 'Gini from the Lorenz curve', tex: R`G = 1 - 2\int_0^1 L(x)\,dx`, note: 'Since A + B = ½.' },
        { name: 'Range', tex: R`0 \le G \le 1`, note: '0 is perfect equality; 1 is one household earning everything.' },
        { name: 'Income share ratio', tex: R`S_{80/20} = \frac{\text{income of top }20\%}{\text{income of bottom }20\%}`, note: 'A simpler inequality measure.' },
      ],
      points: [
        'Progressive taxes and transfers move the Lorenz curve toward the line of equality.',
        'Two different Lorenz curves can cross yet have the same Gini.',
        'Gini measures inequality, not poverty or living standards.',
      ],
      tip: 'Shade area A on the diagram and say which way the curve moves after a policy change.',
    },

    /* ───────────── Macroeconomics ───────────── */
    {
      id: 'growth-measure',
      unit: 'Macroeconomics',
      title: 'Measuring output and growth',
      summary: 'GDP measures the value of final output. Small differences in growth rates compound into large differences in living standards, which the rule of 70 makes easy to estimate.',
      model: 'Real GDP index Y(t) = (1 + g)^t, starting at 1.',
      graph: {
        x: { range: [0, 40], label: 'Years', ticks: range(0, 40, 10) },
        y: { range: [0, 10], label: 'Real GDP (start = 1)', ticks: range(0, 10, 2) },
        params: [{ id: 'g', label: 'Annual growth rate g (%)', min: 0.5, max: 8, step: 0.1, value: 3 }],
        draw(s) {
          const g = s.g / 100, t2 = Math.log(2) / Math.log(1 + g);
          return [
            C((t) => Math.pow(1.02, t), 'ghost', '2% path'),
            C((t) => Math.pow(1 + g, t), 'd', `${s.g.toFixed(1)}% growth`),
            G(t2, 2, 'Doubles', '2×'),
            G(2 * t2, 4, '', '4×', 'n'),
            P(t2, 2, ''),
            P(2 * t2, 4, '', 'n', { small: true }),
          ];
        },
        readout(s) {
          const g = s.g / 100;
          return { rows: [['Exact doubling time', f(Math.log(2) / Math.log(1 + g), 1) + ' years'], ['Rule of 70 estimate', f(70 / s.g, 1) + ' years'], ['Output after 40 years', f(Math.pow(1 + g, 40), 1) + '×']] };
        },
      },
      equations: [
        { name: 'GDP (expenditure approach)', tex: R`Y = C + I + G + (X - M)`, note: 'Consumption, investment, government purchases, net exports.' },
        { name: 'GDP deflator', tex: R`\text{Deflator} = \frac{\text{Nominal GDP}}{\text{Real GDP}} \times 100`, note: 'Covers all domestically produced goods.' },
        { name: 'Inflation rate (CPI)', tex: R`\pi_t = \frac{CPI_t - CPI_{t-1}}{CPI_{t-1}} \times 100`, note: 'CPI prices a fixed basket of consumer goods.' },
        { name: 'Real value', tex: R`\text{Real} = \frac{\text{Nominal}}{\text{Price index}} \times 100`, note: 'Converts to base-year prices.' },
        { name: 'Unemployment rate', tex: R`u = \frac{U}{U + E} \times 100`, note: 'Labour force = employed + unemployed (actively seeking).' },
        { name: 'Growth rate', tex: R`g = \frac{Y_t - Y_{t-1}}{Y_{t-1}}`, note: 'Use real GDP per capita for living standards.' },
        { name: 'Rule of 70', tex: R`t_{\text{double}} \approx \frac{70}{g\,(\%)}`, note: 'Works because ln 2 ≈ 0.69.' },
        { name: 'Present value', tex: R`PV = \frac{FV}{(1 + r)^t}`, note: 'Discounts a future payment to today.' },
      ],
      points: [
        'GDP counts final goods only, to avoid double counting intermediate goods.',
        'Nominal GDP can rise from prices alone; real GDP removes price changes.',
        'Frictional, structural and cyclical unemployment; the natural rate excludes cyclical.',
        'CPI tends to overstate inflation (substitution, quality and new-good biases).',
      ],
      tip: 'State which base year you use and whether a figure is nominal or real.',
    },
    {
      id: 'ad-as',
      unit: 'Macroeconomics',
      title: 'Aggregate demand and aggregate supply',
      summary: 'Short-run output and the price level are set where AD meets SRAS. Long-run output is fixed at potential, shown by the vertical LRAS.',
      model: 'AD: P = a − Y; SRAS: P = c + 0.8Y; LRAS at potential output Y* = 5.',
      graph: {
        x: { range: [0, 10], label: 'Real GDP (Y)' },
        y: { range: [0, 10], label: 'Price level (P)' },
        params: [
          { id: 'a', label: 'Aggregate demand (a)', min: 7, max: 13, step: 0.1, value: 10, hint: 'C, I, G or NX up shifts AD right' },
          { id: 'c', label: 'Input costs (c)', min: -2, max: 4, step: 0.1, value: 1, hint: 'Oil or wage shock shifts SRAS left' },
        ],
        draw(s) {
          const y = (s.a - s.c) / 1.8, p = s.a - y;
          return [
            ghost(changed(s.a, 10), (Y) => 10 - Y, 'AD₀'),
            ghost(changed(s.c, 1), (Y) => 1 + 0.8 * Y, 'SRAS₀'),
            V(5, 'g', 'LRAS'),
            C((Y) => s.a - Y, 'd', 'AD'),
            C((Y) => s.c + 0.8 * Y, 's', 'SRAS'),
            G(y, p, 'Y', 'P'),
            T(5, 0.4, 'Y*', 'g', { anchor: 'middle' }),
            P(y, p, 'E'),
          ];
        },
        readout(s) {
          const y = (s.a - s.c) / 1.8, p = s.a - y, gap = ((y - 5) / 5) * 100;
          const u = 5 - gap / 2;
          return {
            rows: [['Real GDP', f(y)], ['Price level', f(p)], ['Output gap', pct(gap)], ['Unemployment (Okun, u* = 5%)', pct(u)]],
            status: Math.abs(gap) < 0.5 ? 'At potential: long-run equilibrium.' : gap < 0 ? 'Recessionary gap: output below potential, unemployment above natural rate.' : 'Inflationary gap: output above potential, upward pressure on wages and prices.',
            tone: Math.abs(gap) < 0.5 ? 'good' : 'warn',
          };
        },
      },
      equations: [
        { name: 'Aggregate demand', tex: R`AD = C + I + G + (X - M)`, note: 'Slopes down: wealth, interest-rate and exchange-rate effects.' },
        { name: 'Output gap', tex: R`\text{Gap} = \frac{Y - Y^*}{Y^*} \times 100`, note: 'Negative: recessionary. Positive: inflationary.' },
        { name: 'Okun’s law', tex: R`\frac{Y - Y^*}{Y^*} = -\beta\,(u - u^*),\quad \beta \approx 2`, note: 'Each point of cyclical unemployment costs about 2% of output.' },
        { name: 'Short-run AS', tex: R`Y = Y^* + \alpha\,(P - P^e)`, note: 'Output exceeds potential only when prices surprise upward.' },
      ],
      points: [
        'Demand-pull inflation: AD shifts right. Cost-push inflation: SRAS shifts left (stagflation).',
        'Without policy, wages adjust and SRAS shifts until output returns to potential.',
        'LRAS shifts right with more labour, capital, or better technology.',
      ],
      tip: 'Always draw LRAS. Say whether the economy self-corrects and which curve moves.',
    },
    {
      id: 'keynesian-cross',
      unit: 'Macroeconomics',
      title: 'Keynesian cross and the multiplier',
      summary: 'Equilibrium income is where planned spending equals output, on the 45° line. A change in autonomous spending changes output by a multiple of itself.',
      model: 'Planned expenditure AE = A + MPC · Y, where A is autonomous spending.',
      graph: {
        x: { range: [0, 12], label: 'Real GDP / income (Y)' },
        y: { range: [0, 12], label: 'Planned expenditure (AE)' },
        params: [
          { id: 'A', label: 'Autonomous spending (A)', min: 0.5, max: 4, step: 0.1, value: 2 },
          { id: 'mpc', label: 'Marginal propensity to consume', min: 0.3, max: 0.85, step: 0.01, value: 0.6 },
        ],
        draw(s) {
          const y = s.A / (1 - s.mpc);
          return [
            C((Y) => Y, 'n', 'AE = Y (45°)', { labelAt: 10.3 }),
            ghost(changed(s.A, 2) || changed(s.mpc, 0.6), (Y) => 2 + 0.6 * Y, 'AE₀'),
            C((Y) => s.A + s.mpc * Y, 'd', 'AE'),
            G(y, y, 'Y*', 'AE*'),
            P(y, y, 'E'),
          ];
        },
        readout(s) {
          const k = 1 / (1 - s.mpc);
          return { rows: [['Equilibrium output Y*', f(s.A * k)], ['Spending multiplier', f(k)], ['Tax multiplier', f(-s.mpc * k)], ['MPS', f(1 - s.mpc)]], status: `A $1 rise in government spending raises output by $${k.toFixed(2)}.` };
        },
      },
      equations: [
        { name: 'Consumption function', tex: R`C = C_0 + MPC\,(Y - T)`, note: 'MPC + MPS = 1.' },
        { name: 'Equilibrium', tex: R`Y = C + I + G + NX \Rightarrow Y^* = \frac{A}{1 - MPC}`, note: 'A is all autonomous spending.' },
        { name: 'Spending multiplier', tex: R`k = \frac{\Delta Y}{\Delta G} = \frac{1}{1 - MPC} = \frac{1}{MPS}`, note: 'Larger MPC, larger multiplier.' },
        { name: 'Tax multiplier', tex: R`k_T = \frac{-MPC}{1 - MPC}`, note: 'Smaller than the spending multiplier in absolute value.' },
        { name: 'Balanced-budget multiplier', tex: R`k_G + k_T = 1`, note: 'Equal rises in G and T raise Y by the same amount.' },
        { name: 'Open-economy multiplier', tex: R`k = \frac{1}{1 - MPC(1 - t) + MPM}`, note: 'Taxes and imports are leakages that shrink the multiplier.' },
      ],
      points: [
        'If AE > Y, inventories fall and firms raise output; if AE < Y, inventories pile up.',
        'Paradox of thrift: a higher saving rate can lower total income without raising total saving.',
        'The simple multiplier ignores crowding out and price-level changes.',
      ],
      tip: 'Show the change in Y as a multiple of the vertical shift in AE, with the multiplier value stated.',
    },
    {
      id: 'money-market',
      unit: 'Macroeconomics',
      title: 'Money market',
      summary: 'The central bank sets the money supply; money demand falls as interest rates rise. Their intersection sets the nominal interest rate in the short run.',
      model: 'Money demand i = a − 0.9(M/P); money supply vertical at the level set by the central bank.',
      graph: {
        x: { range: [0, 10], label: 'Quantity of money (M/P)' },
        y: { range: [0, 10], label: 'Nominal interest rate (i, %)' },
        params: [
          { id: 'm', label: 'Money supply (M/P)', min: 2, max: 9, step: 0.1, value: 5 },
          { id: 'a', label: 'Money demand (income)', min: 6, max: 12, step: 0.1, value: 9.5 },
        ],
        draw(s) {
          const i = s.a - 0.9 * s.m;
          return [
            ghost(changed(s.a, 9.5), (M) => 9.5 - 0.9 * M, 'Md₀'),
            changed(s.m, 5) ? V(5, 'ghost', 'Ms₀') : null,
            C((M) => s.a - 0.9 * M, 'd', 'Md'),
            V(s.m, 's', 'Ms'),
            G(s.m, i, null, 'i*'),
            P(s.m, i, 'E'),
          ];
        },
        readout(s) {
          const i = s.a - 0.9 * s.m;
          return { rows: [['Equilibrium interest rate', pct(i, 2)], ['Real money balances', f(s.m)]], status: i < 0.3 ? 'Near the zero lower bound: further money growth barely lowers rates.' : 'More money supply lowers i, which stimulates investment and AD.' };
        },
      },
      equations: [
        { name: 'Quantity equation', tex: R`MV = PY`, note: 'Money × velocity = price level × real output.' },
        { name: 'Quantity theory (growth form)', tex: R`\%\Delta M + \%\Delta V = \%\Delta P + \%\Delta Y`, note: 'With stable V, money growth above output growth becomes inflation.' },
        { name: 'Fisher equation', tex: R`i = r + \pi^e`, note: 'Nominal rate = real rate + expected inflation.' },
        { name: 'Money multiplier', tex: R`m = \frac{1}{rr},\quad M = m \times MB`, note: 'rr is the reserve ratio; MB is the monetary base.' },
        { name: 'Money demand', tex: R`\frac{M^d}{P} = L(i, Y)`, note: 'Falls with i (opportunity cost), rises with Y (transactions).' },
        { name: 'Taylor rule', tex: R`i = r^* + \pi + 0.5(\pi - \pi^*) + 0.5\,\frac{Y - Y^*}{Y^*}`, note: 'A guide to how central banks set policy rates.' },
      ],
      points: [
        'Tools: open market operations, the policy rate, reserve requirements, interest on reserves.',
        'Expansionary policy: Ms right, i down, investment up, AD right.',
        'Bond prices and interest rates move in opposite directions.',
      ],
      tip: 'Label the axes nominal interest rate and quantity of money. Then trace the transmission chain to AD.',
    },
    {
      id: 'loanable-funds',
      unit: 'Macroeconomics',
      title: 'Loanable funds and crowding out',
      summary: 'Saving supplies loanable funds and borrowing demands them. Government borrowing raises the real interest rate and crowds out private investment.',
      model: 'Supply r = 1 + 0.8(L − s); demand r = 9 − 0.8(L − B), where B is government borrowing.',
      graph: {
        x: { range: [0, 10], label: 'Quantity of loanable funds' },
        y: { range: [0, 10], label: 'Real interest rate (r, %)' },
        params: [
          { id: 'B', label: 'Government borrowing (deficit)', min: 0, max: 3, step: 0.1, value: 0 },
          { id: 's', label: 'Private saving shift', min: -2, max: 2, step: 0.1, value: 0 },
        ],
        draw(s) {
          const L = 5 + 0.5 * (s.B + s.s), r = 1 + 0.8 * (L - s.s);
          return [
            ghost(changed(s.B, 0), (Q) => 9 - 0.8 * Q, 'D₀'),
            ghost(changed(s.s, 0), (Q) => 1 + 0.8 * Q, 'S₀'),
            C((Q) => 9 - 0.8 * (Q - s.B), 'd', 'D (investment + deficit)'),
            C((Q) => 1 + 0.8 * (Q - s.s), 's', 'S (saving)'),
            G(L, r, 'L*', 'r*'),
            P(L, r, 'E'),
          ];
        },
        readout(s) {
          const L = 5 + 0.5 * (s.B + s.s), r = 1 + 0.8 * (L - s.s), inv = L - s.B;
          return { rows: [['Real interest rate', pct(r, 2)], ['Total lending', f(L)], ['Private investment', f(inv)], ['Investment crowded out', f(Math.max(0, 5 + 0.5 * s.s - inv))]] };
        },
      },
      equations: [
        { name: 'National saving', tex: R`S = (Y - T - C) + (T - G)`, note: 'Private saving plus public saving.' },
        { name: 'Closed-economy identity', tex: R`S = I`, note: 'Saving equals investment in equilibrium.' },
        { name: 'Open-economy identity', tex: R`S = I + NX`, note: 'Equivalently S − I = net capital outflow.' },
        { name: 'Budget balance', tex: R`\text{Deficit} = G + TR - T`, note: 'A deficit is negative public saving.' },
        { name: 'Debt dynamics', tex: R`\Delta\frac{D}{Y} \approx (r - g)\frac{D}{Y} - \text{primary surplus}`, note: 'Debt ratio grows when the interest rate exceeds growth.' },
      ],
      points: [
        'A budget deficit lowers national saving (or shifts demand), raising r.',
        'Crowding out is smaller when saving is very responsive to r or the economy is far below potential.',
        'Tax incentives for saving shift supply right and lower r.',
      ],
      tip: 'State which curve the deficit shifts in your model and be consistent. Both conventions are accepted.',
    },
    {
      id: 'is-lm',
      unit: 'Macroeconomics',
      title: 'IS–LM model',
      summary: 'IS shows combinations of output and interest rates that clear the goods market; LM shows those that clear the money market. Their intersection gives short-run equilibrium.',
      model: 'IS: r = a − 0.8Y; LM: r = c + 0.8Y.',
      graph: {
        x: { range: [0, 10], label: 'Real GDP (Y)' },
        y: { range: [0, 10], label: 'Real interest rate (r)' },
        params: [
          { id: 'a', label: 'Fiscal stance (G − T)', min: 6, max: 12, step: 0.1, value: 9, hint: 'Raise to shift IS right' },
          { id: 'c', label: 'Monetary tightness', min: -3, max: 4, step: 0.1, value: 1, hint: 'Lower means more money: LM shifts right' },
        ],
        draw(s) {
          const y = (s.a - s.c) / 1.6, r = s.c + 0.8 * y;
          return [
            ghost(changed(s.a, 9), (Y) => 9 - 0.8 * Y, 'IS₀'),
            ghost(changed(s.c, 1), (Y) => 1 + 0.8 * Y, 'LM₀'),
            C((Y) => s.a - 0.8 * Y, 'd', 'IS'),
            C((Y) => s.c + 0.8 * Y, 's', 'LM'),
            G(y, r, 'Y*', 'r*'),
            P(y, r, 'E'),
          ];
        },
        readout(s) {
          const y = (s.a - s.c) / 1.6, r = s.c + 0.8 * y;
          return { rows: [['Output Y*', f(y)], ['Interest rate r*', pct(r, 2)]], status: 'Fiscal expansion raises Y and r (crowding out). Monetary expansion raises Y and lowers r.' };
        },
      },
      equations: [
        { name: 'IS curve', tex: R`Y = C(Y - T) + I(r) + G`, note: 'Goods market equilibrium; slopes down because lower r raises investment.' },
        { name: 'LM curve', tex: R`\frac{M}{P} = L(r, Y)`, note: 'Money market equilibrium; slopes up because higher Y raises money demand.' },
        { name: 'Linear IS', tex: R`Y = \frac{A - b\,r}{1 - MPC}`, note: 'A is autonomous spending; b is interest sensitivity of investment.' },
        { name: 'Linear LM', tex: R`r = \frac{1}{h}\left(kY - \frac{M}{P}\right)`, note: 'k: income sensitivity, h: interest sensitivity of money demand.' },
      ],
      points: [
        'Liquidity trap: a flat LM makes fiscal policy strong and monetary policy weak.',
        'Steep LM (money demand insensitive to r): strong crowding out of fiscal policy.',
        'The policy mix can hold r constant while raising Y.',
      ],
      tip: 'Say which curve shifts and in which direction before describing the new equilibrium.',
    },
    {
      id: 'phillips',
      unit: 'Macroeconomics',
      title: 'Phillips curve',
      summary: 'In the short run, lower unemployment comes with higher inflation. In the long run, unemployment returns to its natural rate at any inflation rate, so the long-run curve is vertical.',
      model: 'SRPC: π = πᵉ − β(u − uₙ), natural rate uₙ = 5%.',
      graph: {
        x: { range: [0, 10], label: 'Unemployment rate (%)', ticks: range(0, 10, 2), fmt: (v) => v + '%' },
        y: { range: [-2, 10], label: 'Inflation rate (%)', ticks: range(-2, 10, 2), fmt: (v) => v + '%' },
        params: [
          { id: 'u', label: 'Actual unemployment u', min: 2, max: 9, step: 0.1, value: 4 },
          { id: 'pe', label: 'Expected inflation πᵉ', min: 1, max: 7, step: 0.1, value: 3 },
          { id: 'b', label: 'Slope β', min: 0.4, max: 2, step: 0.05, value: 1 },
        ],
        draw(s) {
          const pi = s.pe - s.b * (s.u - 5);
          return [
            Hl(0, 'ghost', ''),
            Hl(s.pe, 'ghost', 'πᵉ'),
            V(5, 'g', 'LRPC'),
            C((u) => s.pe - s.b * (u - 5), 'd', 'SRPC'),
            G(s.u, pi, null, null),
            P(s.u, pi, 'A'),
          ];
        },
        readout(s) {
          const pi = s.pe - s.b * (s.u - 5);
          return {
            rows: [['Inflation π', pct(pi)], ['Unemployment u', pct(s.u)], ['Cyclical unemployment', pct(s.u - 5)]],
            status: s.u < 4.95 ? 'Below the natural rate: inflation exceeds expectations, so πᵉ will rise and SRPC shift up.' : s.u > 5.05 ? 'Above the natural rate: inflation is below expectations, so SRPC will drift down.' : 'At the natural rate: inflation equals expectations.',
          };
        },
      },
      equations: [
        { name: 'Expectations-augmented Phillips curve', tex: R`\pi = \pi^e - \beta\,(u - u_n)`, note: 'Only surprise inflation lowers unemployment.' },
        { name: 'Adding supply shocks', tex: R`\pi = \pi^e - \beta\,(u - u_n) + v`, note: 'A negative supply shock v shifts SRPC up.' },
        { name: 'Adaptive expectations', tex: R`\pi^e_t = \pi_{t-1}`, note: 'Expectations catch up with past inflation.' },
        { name: 'Sacrifice ratio', tex: R`\text{SR} = \frac{\%\text{ output lost}}{\text{fall in } \pi}`, note: 'Cost of disinflation; lower with credible policy.' },
        { name: 'Long run', tex: R`\pi = \pi^e \Rightarrow u = u_n`, note: 'The long-run Phillips curve is vertical at the natural rate.' },
      ],
      points: [
        'Moving along SRPC matches AD shifts; SRPC shifts match changes in expectations or supply shocks.',
        'Stagflation (1970s) showed that the short-run trade-off is not stable.',
        'Credible inflation targets anchor πᵉ and flatten the trade-off’s cost.',
      ],
      tip: 'Link SRPC movements to the AD–AS diagram: a rightward AD shift is a move up and left along SRPC.',
    },
    {
      id: 'solow',
      unit: 'Macroeconomics',
      title: 'Solow growth model',
      summary: 'Capital per worker grows while investment exceeds break-even investment. The steady state is where they meet; higher saving raises the level of output but not its long-run growth rate.',
      model: 'y = k^α; investment s·y; break-even investment (n + δ)k.',
      graph: {
        x: { range: [0, 10], label: 'Capital per worker (k)' },
        y: { range: [0, 3], label: 'Output and investment per worker', ticks: range(0, 3, 1) },
        params: [
          { id: 's', label: 'Saving rate s', min: 0.1, max: 0.6, step: 0.01, value: 0.3 },
          { id: 'nd', label: 'Population growth + depreciation (n + δ)', min: 0.05, max: 0.2, step: 0.005, value: 0.1 },
          { id: 'al', label: 'Capital share α', min: 0.25, max: 0.5, step: 0.01, value: 0.33 },
        ],
        draw(s) {
          const ks = Math.pow(s.s / s.nd, 1 / (1 - s.al)), kg = Math.pow(s.al / s.nd, 1 / (1 - s.al));
          return [
            C((k) => Math.pow(k, s.al), 'n', 'y = f(k)'),
            C((k) => s.s * Math.pow(k, s.al), 'd', 's·f(k)'),
            C((k) => s.nd * k, 's', '(n + δ)k'),
            V(kg, 'ghost', 'k gold'),
            G(ks, s.nd * ks, 'k*', null),
            P(ks, Math.pow(ks, s.al), 'y*', 'n', { small: true }),
            P(ks, s.nd * ks, 'E'),
          ];
        },
        readout(s) {
          const ks = Math.pow(s.s / s.nd, 1 / (1 - s.al)), ys = Math.pow(ks, s.al);
          return {
            rows: [['Steady-state capital k*', f(ks)], ['Steady-state output y*', f(ys)], ['Consumption per worker c*', f((1 - s.s) * ys)], ['Golden-rule saving rate', pct(s.al * 100, 0)]],
            status: Math.abs(s.s - s.al) < 0.01 ? 'Saving rate equals the golden rule: consumption per worker is maximised.' : s.s < s.al ? 'Below the golden rule: saving more would raise steady-state consumption.' : 'Above the golden rule: saving less would raise steady-state consumption.',
          };
        },
      },
      equations: [
        { name: 'Production per worker', tex: R`y = f(k) = k^{\alpha}`, note: 'Diminishing returns to capital (α < 1).' },
        { name: 'Capital accumulation', tex: R`\Delta k = s\,f(k) - (n + \delta)\,k`, note: 'Investment minus break-even investment.' },
        { name: 'Steady state', tex: R`s\,f(k^*) = (n + \delta)\,k^* \Rightarrow k^* = \left(\frac{s}{n + \delta}\right)^{\frac{1}{1-\alpha}}`, note: 'Capital per worker stops changing.' },
        { name: 'Golden rule', tex: R`MPK = f'(k_g) = n + \delta \;\Rightarrow\; s_g = \alpha`, note: 'Maximises steady-state consumption per worker.' },
        { name: 'Growth accounting', tex: R`g_Y = g_A + \alpha\,g_K + (1 - \alpha)\,g_L`, note: 'The residual g_A is total factor productivity growth.' },
      ],
      points: [
        'Only technological progress sustains long-run growth in output per worker.',
        'Conditional convergence: poorer countries with similar parameters grow faster.',
        'Higher population growth lowers steady-state capital and output per worker.',
      ],
      tip: 'Distinguish level effects (a new steady state) from growth effects (a permanently higher growth rate).',
    },

    /* ───────────── International ───────────── */
    {
      id: 'tariff',
      unit: 'International',
      title: 'Tariffs and trade',
      summary: 'With free trade a small country imports at the world price. A tariff raises the domestic price, helps domestic producers and the government, and costs consumers more than both gain.',
      model: 'Domestic demand P = 10 − 0.8Q; domestic supply P = 1 + 0.6Q; world price Pw.',
      graph: {
        x: { range: [0, 12], label: 'Quantity (Q)' }, y: YP,
        params: [
          { id: 'pw', label: 'World price (Pw)', min: 1.2, max: 4.5, step: 0.1, value: 2 },
          { id: 't', label: 'Tariff per unit (t)', min: 0, max: 2.8, step: 0.1, value: 1 },
        ],
        draw(s) {
          const paut = 10 - 0.8 * (9 / 1.4), pt = Math.min(s.pw + s.t, paut);
          const qs0 = (s.pw - 1) / 0.6, qd0 = (10 - s.pw) / 0.8, qs = (pt - 1) / 0.6, qd = (10 - pt) / 0.8;
          return [
            A([[qs, pt], [qd, pt], [qd, s.pw], [qs, s.pw]], 'g', 'Revenue'),
            A([[qs0, s.pw], [qs, pt], [qs, s.pw]], 'o', ''),
            A([[qd, pt], [qd0, s.pw], [qd, s.pw]], 'o', ''),
            C((Q) => 10 - 0.8 * Q, 'd', 'D'),
            C((Q) => 1 + 0.6 * Q, 's', 'S'),
            Hl(s.pw, 'n', 'Pw', { dash: true }),
            s.t > 0 ? Hl(pt, 'o', 'Pw + t', { dash: true }) : null,
            G(qs, pt, 'Qs', null, 's'),
            G(qd, pt, 'Qd', null, 'd'),
            G(qs0, s.pw, '', null, 'n'),
            G(qd0, s.pw, '', null, 'n'),
            S(qs, pt, qd, pt, 'o', 'Imports', { bold: true }),
          ];
        },
        readout(s) {
          const paut = 10 - 0.8 * (9 / 1.4), pt = Math.min(s.pw + s.t, paut);
          const qs0 = (s.pw - 1) / 0.6, qd0 = (10 - s.pw) / 0.8, qs = (pt - 1) / 0.6, qd = (10 - pt) / 0.8, dp = pt - s.pw;
          return { rows: [['Domestic price', money(pt)], ['Imports (free trade)', f(qd0 - qs0)], ['Imports (with tariff)', f(Math.max(0, qd - qs))], ['Tariff revenue', money(dp * Math.max(0, qd - qs))], ['Deadweight loss (both triangles)', money(0.5 * dp * (qs - qs0) + 0.5 * dp * (qd0 - qd))]], status: pt >= paut - 1e-6 ? 'Prohibitive tariff: imports stop and the market returns to autarky.' : null };
        },
      },
      equations: [
        { name: 'Imports', tex: R`M = Q_d(P) - Q_s(P)`, note: 'Measured at the domestic price.' },
        { name: 'Domestic price with tariff', tex: R`P = P_w + t`, note: 'For a small open economy that cannot affect world prices.' },
        { name: 'Tariff revenue', tex: R`\text{Revenue} = t \times M_t`, note: 'The rectangle between the two price lines.' },
        { name: 'Deadweight loss', tex: R`DWL = \tfrac{1}{2}t\,\Delta Q_s + \tfrac{1}{2}t\,\Delta Q_d`, note: 'Production inefficiency plus consumption distortion.' },
        { name: 'Balance of payments', tex: R`CA + KA + FA = 0`, note: 'Current + capital + financial accounts sum to zero (ignoring errors).' },
      ],
      points: [
        'Winners: domestic producers and the government. Losers: domestic consumers, by more.',
        'A quota has the same price effect as a tariff, but the rectangle goes to licence holders.',
        'Arguments for protection: infant industry, national security, anti-dumping, strategic trade.',
      ],
      tip: 'Label four areas: consumer loss, producer gain, revenue, and two DWL triangles.',
    },
    {
      id: 'forex',
      unit: 'International',
      title: 'Exchange rates',
      summary: 'The exchange rate is the price of one currency in terms of another, set by supply and demand in the foreign-exchange market. Stronger demand for a currency appreciates it.',
      model: 'Demand for domestic currency e = a − 0.8Q; supply e = c + 0.6Q (e = foreign currency per unit of domestic).',
      graph: {
        x: { range: [0, 10], label: 'Quantity of domestic currency traded' },
        y: { range: [0, 10], label: 'Exchange rate (foreign per domestic)' },
        params: [
          { id: 'a', label: 'Demand for currency (exports, inflows)', min: 6, max: 12, step: 0.1, value: 9 },
          { id: 'c', label: 'Supply of currency (imports, outflows)', min: -1, max: 4, step: 0.1, value: 1, hint: 'Lower means more supplied: curve shifts right' },
        ],
        draw(s) {
          const q = (s.a - s.c) / 1.4, e = s.a - 0.8 * q;
          return [
            ghost(changed(s.a, 9), (Q) => 9 - 0.8 * Q, 'D₀'),
            ghost(changed(s.c, 1), (Q) => 1 + 0.6 * Q, 'S₀'),
            C((Q) => s.a - 0.8 * Q, 'd', 'D'),
            C((Q) => s.c + 0.6 * Q, 's', 'S'),
            G(q, e, 'Q*', 'e*'),
            P(q, e, 'E'),
          ];
        },
        readout(s) {
          const q = (s.a - s.c) / 1.4, e = s.a - 0.8 * q, e0 = 9 - 0.8 * (8 / 1.4), ch = ((e - e0) / e0) * 100;
          return { rows: [['Exchange rate e*', f(e, 3)], ['Change from start', pct(ch)]], status: Math.abs(ch) < 0.05 ? 'At the starting rate.' : ch > 0 ? 'Appreciation: exports become dearer abroad, imports cheaper at home.' : 'Depreciation: exports become cheaper abroad, imports dearer at home.' };
        },
      },
      equations: [
        { name: 'Real exchange rate', tex: R`\varepsilon = e \times \frac{P}{P^*}`, note: 'Relative price of domestic goods in foreign goods.' },
        { name: 'Purchasing power parity', tex: R`e = \frac{P^*}{P}`, note: 'Long-run anchor: the real exchange rate tends toward 1.' },
        { name: 'Relative PPP', tex: R`\%\Delta e \approx \pi^* - \pi`, note: 'Higher domestic inflation means depreciation.' },
        { name: 'Uncovered interest parity', tex: R`i = i^* + \text{expected depreciation of the home currency}`, note: 'Investors need a higher home rate to hold a currency they expect to fall.' },
        { name: 'Marshall–Lerner condition', tex: R`|E_X| + |E_M| > 1`, note: 'A depreciation improves the trade balance only if this holds.' },
      ],
      points: [
        'Demand for a currency: foreign purchases of exports, inbound investment, higher domestic interest rates.',
        'Supply of a currency: domestic purchases of imports, outbound investment.',
        'J-curve: the trade balance often worsens before improving after a depreciation.',
      ],
      tip: 'Always state which way the rate is quoted before saying a rise is an appreciation.',
    },
  ];
})();
