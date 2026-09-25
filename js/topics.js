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
  window.TOPIC_KIT = { R, f, money, pct, C, V, Hl, P, G, A, S, T, ghost, changed, range, XQ, YP: { range: [0, 10], label: 'Price (P)' } };
  const YP = { range: [0, 10], label: 'Price (P)' };

  return [
    /* ───────────── Foundations ───────────── */

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
        { name: 'Direct demand', tex: R`Q_D = a - bP`, note: 'Law of demand: quantity demanded falls as price rises (b > 0).' },
        { name: 'Direct supply', tex: R`Q_S = c + dP`, note: 'Quantity supplied rises with price (d > 0).' },
        { name: 'Equilibrium', tex: R`Q_D = Q_S \;(\text{or } P_D = P_S) \;\Rightarrow\; P^* = \frac{a - c}{b + d}`, note: 'Substitute P* back into either curve to get Q*.' },
        { name: 'Inverse functions (for plotting)', tex: R`P = f(Q_D),\; P = f(Q_S)\quad\text{e.g. } P = 12 - 4Q_D`, note: 'Solve the direct function for P so price sits on the vertical axis.' },
        { name: 'Consumer surplus', tex: R`CS = \tfrac{1}{2}\,(P_{\max} - P^*)\,Q^*`, note: 'Area below demand and above the price.' },
        { name: 'Producer surplus', tex: R`PS = \tfrac{1}{2}\,(P^* - P_{\min})\,Q^*`, note: 'Area above supply and below the price.' },
        { name: 'Social surplus', tex: R`SS = CS + PS`, note: 'Maximised at the competitive equilibrium; any DWL is the part lost.' },
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
        { name: 'Own-price elasticity (PED)', tex: R`PED = \frac{\%\Delta Q_D}{\%\Delta P} = \frac{\Delta Q}{\Delta P}\cdot\frac{P}{Q}`, note: 'Usually negative; compare its absolute value to 1.' },
        { name: 'Midpoint (arc) formula', tex: R`E_d = \frac{(Q_2 - Q_1)/\bar{Q}}{(P_2 - P_1)/\bar{P}}`, note: 'Uses averages so the answer is the same in either direction.' },
        { name: 'Point elasticity', tex: R`E_d = \frac{dQ}{dP}\cdot\frac{P}{Q}`, note: 'For a linear curve the slope term is constant but P/Q is not.' },
        { name: 'Income elasticity (IED)', tex: R`IED = \frac{\%\Delta Q}{\%\Delta M} = \frac{\Delta Q}{\Delta M}\cdot\frac{M}{Q}`, note: 'Positive: normal good. Negative: inferior. Above 1: luxury.' },
        { name: 'Cross-price elasticity (XED)', tex: R`XED = \frac{\%\Delta Q_A}{\%\Delta P_B}`, note: 'Positive: substitutes. Negative: complements.' },
        { name: 'Price elasticity of supply (PES)', tex: R`PES = \frac{\%\Delta Q_S}{\%\Delta P} = \frac{\Delta Q}{\Delta P}\cdot\frac{P}{Q}`, note: 'Larger in the long run as firms adjust capacity.' },
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
          { id: 'I', label: 'Income (M)', min: 20, max: 60, step: 1, value: 40 },
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
        { name: 'Budget constraint', tex: R`P_X X + P_Y Y = M \;\Rightarrow\; Y = \frac{M}{P_Y} - \frac{P_X}{P_Y}X`, note: 'Slope −PX/PY; intercepts M/PX and M/PY.' },
        { name: 'Marginal rate of substitution', tex: R`MRS = -\frac{\Delta Y}{\Delta X} = -\frac{MU_X}{MU_Y}`, note: 'Slope of the indifference curve. Some texts drop the minus sign; be consistent.' },
        { name: 'Utility maximisation (tangency)', tex: R`MRS = -\frac{P_X}{P_Y} \;\Rightarrow\; \frac{MU_X}{P_X} = \frac{MU_Y}{P_Y}`, note: 'Equal marginal utility per dollar in every use.' },
        { name: 'Cobb–Douglas demands', tex: R`U = X^{\alpha}Y^{1-\alpha} \Rightarrow X^* = \frac{\alpha M}{P_X},\; Y^* = \frac{(1-\alpha) M}{P_Y}`, note: 'Budget shares are constant at α and 1 − α.' },
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
      title: 'Short-run costs and perfect competition',
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
            C((Q) => s.F / Q, 'ghost', 'SAFC', { from: 0.3 }),
            C(avc, 'n', 'SAVC', { labelAt: 9.4 }),
            C(atc, 'd', 'SATC', { from: 0.3, labelAt: 9.4 }),
            C(mc, 's', 'SMC'),
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
        { name: 'Short-run total cost', tex: R`STC = SFC + SVC`, note: 'Fixed cost does not vary with output in the short run.' },
        { name: 'Short-run marginal cost', tex: R`SMC = \frac{d(STC)}{dQ}`, note: 'SMC cuts SAVC and SATC at their minimum points.' },
        { name: 'Short-run average costs', tex: R`SATC = \frac{STC}{Q} = SAFC + SAVC`, note: 'SAFC = SFC/Q falls continuously.' },
        { name: 'Profit maximisation', tex: R`MR = MC`, note: 'For a price taker MR = P, so produce where P = MC on the rising part of MC.' },
        { name: 'Profit function', tex: R`\pi = TR - TC = P \cdot Q - TC = (P - SATC)\,Q`, note: 'Includes opportunity costs; zero profit is a normal return.' },
        { name: 'Shutdown rule', tex: R`P < \min AVC \Rightarrow Q = 0`, note: 'The firm’s short-run supply curve is MC above min AVC.' },
        { name: 'Perfect competition, long run', tex: R`P = MR = MC = \min LAC`, note: 'Zero economic profit; productive and allocative efficiency.' },
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
      title: 'Price indices and growth rates',
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
        { name: 'GDP (expenditure approach)', tex: R`Y = C + I + G + (X - Z)`, note: 'Consumption, investment, government purchases, net exports.' },
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
  ];
})();
