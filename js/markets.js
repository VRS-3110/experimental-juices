/* Market graphs built on the student's own linear demand and supply functions.
   Loads after syllabus.js and installs the graph on each supply-and-demand topic.

   Internally every market is kept in inverse form:
     demand  P = pd − md·Q   (md > 0)
     supply  P = ps + ms·Q   (ms > 0)
   Each graph has a valid(s) check. Sliders cannot move past the last valid
   value, so the diagram stops where the market stops existing. */
(function () {
  const { f, money, pct, C, Hl, P, G, A, S } = window.TOPIC_KIT;
  const PRICE_VARS = ['p', 'e'];

  /* ── Parsing ── */
  function parseLinear(text) {
    const src = String(text).toLowerCase().replace(/[\s×·]/g, '').replace(/[−–—]/g, '-').replace(/\*/g, '');
    const m = src.match(/^([a-z]+)=(.+)$/);
    if (!m) return { error: 'Write it as Q = … or P = …, for example Qd = 120 − 10P.' };
    const lhsPrice = PRICE_VARS.includes(m[1]);
    if (!lhsPrice && m[1][0] !== 'q') return { error: `The left-hand side should be Q or P, not ${m[1].toUpperCase()}.` };
    let k = 0, slope = 0;
    const terms = m[2].replace(/^\+/, '').split(/(?=[+-])/);
    for (const term of terms) {
      const t = term.match(/^([+-]?)(\d*\.?\d+)?([a-z]+)?(?:\/(\d*\.?\d+))?$/);
      if (!t || (t[2] === undefined && !t[3])) return { error: `Could not read “${term}”. Use numbers, + and −, and one variable.` };
      const sign = t[1] === '-' ? -1 : 1;
      let coef = t[2] !== undefined ? parseFloat(t[2]) : 1;
      if (t[4]) coef /= parseFloat(t[4]);
      if (!t[3]) { k += sign * coef; continue; }
      const isPrice = PRICE_VARS.includes(t[3]), isQty = t[3][0] === 'q';
      if ((lhsPrice && !isQty) || (!lhsPrice && !isPrice)) return { error: `The right-hand side should use ${lhsPrice ? 'Q' : 'P'}, not ${t[3].toUpperCase()}.` };
      slope += sign * coef;
    }
    if (!Number.isFinite(k) || !Number.isFinite(slope)) return { error: 'Some number could not be read.' };
    if (slope === 0) return { error: `Include a ${lhsPrice ? 'Q' : 'P'} term so the line has a slope.` };
    return lhsPrice ? { p0: k, s: slope } : { p0: -k / slope, s: 1 / slope };
  }

  const eqm = (m) => { const q = (m.pd - m.ps) / (m.md + m.ms); return { q, p: m.pd - m.md * q }; };
  const Dp = (m, q) => m.pd - m.md * q;
  const Sp = (m, q) => m.ps + m.ms * q;
  const Qd = (m, p) => Math.max(0, (m.pd - p) / m.md);
  const Qs = (m, p) => Math.max(0, (p - m.ps) / m.ms);
  // Horizontal shifts: sd, ss are extra quantity demanded/supplied at every price.
  const shifted = (m, sd = 0, ss = 0) => ({ ...m, pd: m.pd + m.md * sd, ps: m.ps - m.ms * ss });

  function buildMarket(dText, sText) {
    const d = parseLinear(dText), s = parseLinear(sText);
    if (d.error) return { error: 'Demand: ' + d.error };
    if (s.error) return { error: 'Supply: ' + s.error };
    if (d.s >= 0) return { error: 'Demand must slope downward: quantity demanded should fall as price rises.' };
    if (s.s <= 0) return { error: 'Supply must slope upward: quantity supplied should rise as price rises.' };
    const m = { pd: d.p0, md: -d.s, ps: s.p0, ms: s.s, dText, sText };
    if (m.pd <= 0) return { error: 'Demand is zero at every positive price, so no one buys.' };
    if (m.pd <= m.ps) return { error: `No market: the most any buyer will pay (P = ${f(m.pd)}) is not above the least any seller will accept (P = ${f(m.ps)}), so nothing is traded.` };
    const e = eqm(m);
    if (e.p <= 0) return { error: `The curves cross at P = ${f(e.p)}. A market needs a positive equilibrium price.` };
    return { m };
  }

  /* ── Scales ── */
  function niceStep(raw) {
    const e = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 2.5, 5, 10].map((k) => k * e).find((v) => v >= raw - 1e-12);
  }
  const trim = (v) => String(+v.toFixed(6));
  function axis(max, label) {
    const step = niceStep(max / 5), top = Math.ceil(max / step - 1e-9) * step, ticks = [];
    for (let v = 0; v <= top + 1e-9; v += step) ticks.push(+v.toFixed(6));
    return { range: [0, top], label, ticks, fmt: trim };
  }
  const stepFor = (range) => niceStep(Math.abs(range) / 200);
  const snap = (v, step) => Math.round(v / step) * step;
  function axesFor(m, qx = 1.15, py = 1.15, labels = ['Quantity (Q)', 'Price (P)']) {
    const qmax = Math.max(m.pd / m.md, eqm(m).q * 1.5);
    return { x: axis(qmax * qx, labels[0]), y: axis(Math.max(m.pd, eqm(m).p * 1.3) * py, labels[1]) };
  }

  /* ── Drawing helpers ── */
  const demandCurve = (m, k, label, o = {}) => C((q) => Dp(m, q), k, label, { to: m.pd / m.md, ...o });
  const supplyCurve = (m, k, label, o = {}) => C((q) => Sp(m, q), k, label, { from: Math.max(0, -m.ps / m.ms), ...o });
  function surplusAreas(m, q, p) {
    const floor = Math.max(0, m.ps), qs0 = Qs(m, 0);
    return [
      A([[0, m.pd], [0, p], [q, p]], 'd', 'CS'),
      A([[0, p], [q, p], [qs0, floor], [0, floor]], 's', 'PS'),
    ];
  }
  // Producer surplus when sellers receive price p on quantity q (area above supply, below p).
  const producerSurplus = (m, q, p) => (m.ps >= 0 ? 0.5 * (p - m.ps) * q : 0.5 * (Qs(m, 0) + q) * p);

  const describe = (m) => `Inverse demand P = ${f(m.pd)} − ${f(m.md, 3)}Q; inverse supply P = ${f(m.ps)} ${m.ms >= 0 ? '+' : '−'} ${f(m.ms, 3)}Q.`;

  /* ── Graphs ── */
  const graphs = {
    'supply-demand': {
      market: { demand: 'Qd = 120 - 10P', supply: 'Qs = -20 + 10P' },
      graph: {
        x: (s) => axesFor(s.m, 1.5, 1.35).x,
        y: (s) => axesFor(s.m, 1.5, 1.35).y,
        params: [
          { id: 'sd', label: 'Demand shift (extra Q at every price)', min: (s) => -snap(s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), max: (s) => snap(0.6 * s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), step: (s) => stepFor(1.6 * s.m.pd / s.m.md), value: 0 },
          { id: 'ss', label: 'Supply shift (extra Q at every price)', min: (s) => -snap(s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), max: (s) => snap(0.6 * s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), step: (s) => stepFor(1.6 * s.m.pd / s.m.md), value: 0 },
        ],
        valid(s) {
          const m = shifted(s.m, s.sd, s.ss), e = eqm(m);
          if (m.pd <= 0) return 'Demand has shifted so far left that no one buys at any positive price.';
          if (e.q <= 0) return 'Past this point the highest price buyers pay is below the lowest price sellers accept, so nothing is traded.';
          if (e.p <= 0) return 'Past this point the equilibrium price would fall to zero.';
          return true;
        },
        draw(s) {
          const m = shifted(s.m, s.sd, s.ss), e = eqm(m);
          return [
            ...surplusAreas(m, e.q, e.p),
            s.sd ? demandCurve(s.m, 'ghost', 'D₀') : null,
            s.ss ? supplyCurve(s.m, 'ghost', 'S₀') : null,
            demandCurve(m, 'd', 'D'),
            supplyCurve(m, 's', 'S'),
            G(e.q, e.p, 'Q*', 'P*'),
            P(e.q, e.p, 'E'),
          ];
        },
        readout(s) {
          const m = shifted(s.m, s.sd, s.ss), e = eqm(m);
          const cs = 0.5 * (m.pd - e.p) * e.q, ps = producerSurplus(m, e.q, e.p);
          return { rows: [['Equilibrium price P*', money(e.p)], ['Equilibrium quantity Q*', f(e.q)], ['Consumer surplus', money(cs)], ['Producer surplus', money(ps)], ['Social surplus', money(cs + ps)]] };
        },
      },
    },

    'price-controls': {
      market: { demand: 'Qd = 120 - 10P', supply: 'Qs = -20 + 10P' },
      graph: {
        x: (s) => axesFor(s.m).x,
        y: (s) => axesFor(s.m).y,
        params: [{
          id: 'pc', label: 'Controlled price',
          min: (s) => snap(Math.max(0, s.m.ps), stepFor(s.m.pd)) + stepFor(s.m.pd),
          max: (s) => snap(s.m.pd, stepFor(s.m.pd)) - stepFor(s.m.pd),
          step: (s) => stepFor(s.m.pd),
          value: (s) => snap((eqm(s.m).p + Math.max(0, s.m.ps)) / 2, stepFor(s.m.pd)),
          hint: 'Below P* it is a ceiling, above P* a floor',
        }],
        valid(s) {
          if (Math.min(Qd(s.m, s.pc), Qs(s.m, s.pc)) <= 0) return s.pc >= eqm(s.m).p ? 'At this floor buyers want nothing, so no units are traded.' : 'At this ceiling sellers supply nothing, so no units are traded.';
          return true;
        },
        draw(s) {
          const m = s.m, e = eqm(m), qd = Qd(m, s.pc), qs = Qs(m, s.pc), qt = Math.min(qd, qs), ceiling = s.pc < e.p;
          const binding = Math.abs(s.pc - e.p) > 1e-9;
          return [
            binding ? A([[qt, Dp(m, qt)], [qt, Sp(m, qt)], [e.q, e.p]], 'o', 'DWL') : null,
            demandCurve(m, 'd', 'D'),
            supplyCurve(m, 's', 'S'),
            Hl(s.pc, 'o', ceiling ? 'Price ceiling' : 'Price floor', { dash: true }),
            G(qd, s.pc, 'Qd', null, 'd'),
            G(qs, s.pc, 'Qs', null, 's'),
            binding ? S(qs, s.pc, qd, s.pc, 'r', ceiling ? 'Shortage' : 'Surplus', { bold: true, below: true }) : null,
            P(e.q, e.p, 'E', 'n', { small: true }),
          ];
        },
        readout(s) {
          const m = s.m, e = eqm(m), qd = Qd(m, s.pc), qs = Qs(m, s.pc), qt = Math.min(qd, qs);
          const dwl = 0.5 * (Dp(m, qt) - Sp(m, qt)) * (e.q - qt), ceiling = qd > qs;
          return {
            rows: [['Controlled price', money(s.pc)], ['Quantity demanded', f(qd)], ['Quantity supplied', f(qs)], [ceiling ? 'Shortage' : 'Surplus', f(Math.abs(qd - qs))], ['Quantity traded', f(qt)], ['Deadweight loss', money(dwl)]],
            status: Math.abs(qd - qs) < 1e-9 ? 'Set at the equilibrium price, the control does not bind.' : ceiling ? 'Binding ceiling: buyers want more than sellers offer.' : 'Binding floor: sellers offer more than buyers want.',
          };
        },
      },
    },

    'tax-incidence': {
      market: { demand: 'Qd = 120 - 10P', supply: 'Qs = -20 + 10P' },
      graph: {
        x: (s) => axesFor(s.m).x,
        y: (s) => axesFor(s.m).y,
        params: [{
          id: 't', label: 'Specific (per-unit) tax t', min: 0,
          max: (s) => snap(s.m.pd, stepFor(s.m.pd)),
          step: (s) => stepFor(s.m.pd),
          value: (s) => snap((s.m.pd - Math.max(0, s.m.ps)) * 0.3, stepFor(s.m.pd)),
        }],
        valid(s) {
          const m = s.m, qt = (m.pd - m.ps - s.t) / (m.md + m.ms), pb = Dp(m, qt), ps = pb - s.t;
          if (qt <= 0) return `A tax of ${f(m.pd - m.ps)} or more closes the market: buyers’ highest price minus the tax is below sellers’ lowest price, so no units are traded.`;
          if (ps < 0) return 'Past this tax sellers would receive a negative price per unit.';
          return true;
        },
        draw(s) {
          const m = s.m, e = eqm(m), qt = (m.pd - m.ps - s.t) / (m.md + m.ms), pb = Dp(m, qt), ps = pb - s.t;
          return [
            A([[0, pb], [qt, pb], [qt, ps], [0, ps]], 'g', s.t ? 'Tax revenue' : ''),
            A([[qt, pb], [qt, ps], [e.q, e.p]], 'o', ''),
            demandCurve(m, 'd', 'D'),
            supplyCurve(m, 's', 'S'),
            s.t > 0 ? supplyCurve({ ...m, ps: m.ps + s.t }, 's', 'S + t', { dash: true }) : null,
            G(qt, pb, 'Qt', 'Pb'),
            G(qt, ps, null, 'Ps', 's'),
            P(e.q, e.p, 'E₀', 'n', { small: true, dx: 9, dy: 14 }),
            P(qt, pb, '', 'o'),
            P(qt, ps, '', 's', { small: true }),
          ];
        },
        readout(s) {
          const m = s.m, e = eqm(m), qt = (m.pd - m.ps - s.t) / (m.md + m.ms), pb = Dp(m, qt), ps = pb - s.t;
          const share = m.md / (m.md + m.ms);
          return {
            rows: [['Buyers pay Pb', money(pb)], ['Sellers keep Ps', money(ps)], ['Quantity traded Qt', f(qt)], ['Buyers’ share of the tax', pct(share * 100, 0)], ['Tax revenue', money(s.t * qt)], ['Deadweight loss', money(0.5 * s.t * (e.q - qt))]],
            status: share > 0.505 ? 'Demand is less elastic than supply here, so buyers bear most of the tax.' : share < 0.495 ? 'Supply is less elastic than demand here, so sellers bear most of the tax.' : 'Buyers and sellers share the tax equally.',
          };
        },
      },
    },

    externalities: {
      market: { demand: 'Qd = 120 - 10P', supply: 'Qs = -20 + 10P', dLabel: 'Demand (MPB = MSB)', sLabel: 'Supply (MPC)' },
      graph: {
        x: (s) => axesFor(s.m).x,
        y: (s) => axesFor(s.m, 1.15, 1.3).y,
        params: [{
          id: 'e', label: 'Marginal external cost (MEC per unit)', min: 0,
          max: (s) => snap(s.m.pd - s.m.ps, stepFor(s.m.pd)),
          step: (s) => stepFor(s.m.pd),
          value: (s) => snap((s.m.pd - s.m.ps) * 0.3, stepFor(s.m.pd)),
        }],
        valid(s) {
          if ((s.m.pd - s.m.ps - s.e) / (s.m.md + s.m.ms) <= 0) return 'At this external cost the socially efficient output is zero: the good should not be produced at all.';
          return true;
        },
        draw(s) {
          const m = s.m, e = eqm(m), soc = { ...m, ps: m.ps + s.e }, o = eqm(soc);
          return [
            A([[o.q, o.p], [e.q, Sp(soc, e.q)], [e.q, e.p]], 'o', 'DWL'),
            demandCurve(m, 'd', 'D = MSB'),
            supplyCurve(m, 's', 'MPC = S'),
            s.e > 0 ? supplyCurve(soc, 'g', 'MSC') : null,
            G(e.q, e.p, 'Qm', null, 'n'),
            G(o.q, o.p, 'Q*', 'P*'),
            P(e.q, e.p, 'Market', 'n', { small: true, dy: 18 }),
            P(o.q, o.p, 'Optimum', 'o', { dx: -9 }),
          ];
        },
        readout(s) {
          const m = s.m, e = eqm(m), o = eqm({ ...m, ps: m.ps + s.e });
          return { rows: [['Market quantity', f(e.q)], ['Efficient quantity', f(o.q)], ['Overproduction', f(e.q - o.q)], ['Pigouvian tax needed', money(s.e)], ['Deadweight loss', money(0.5 * s.e * (e.q - o.q))]] };
        },
      },
    },

    tariff: {
      market: { demand: 'Qd = 120 - 10P', supply: 'Qs = -20 + 10P', dLabel: 'Domestic demand', sLabel: 'Domestic supply' },
      graph: {
        x: (s) => axesFor(s.m).x,
        y: (s) => axesFor(s.m).y,
        params: [
          {
            id: 'pw', label: 'World price (Pw)',
            min: (s) => snap(Math.max(0, s.m.ps), stepFor(s.m.pd)) + stepFor(s.m.pd),
            max: (s) => snap(eqm(s.m).p, stepFor(s.m.pd)),
            step: (s) => stepFor(s.m.pd),
            value: (s) => snap((eqm(s.m).p + Math.max(0, s.m.ps)) / 2, stepFor(s.m.pd)),
            hint: 'Must be below the autarky price for the country to import',
          },
          {
            id: 't', label: 'Tariff per unit (t)', min: 0,
            max: (s) => Math.max(0, snap(eqm(s.m).p - s.pw, stepFor(s.m.pd))),
            step: (s) => stepFor(s.m.pd),
            value: (s) => snap((eqm(s.m).p - s.pw) / 2, stepFor(s.m.pd)),
            hint: 'Stops at the prohibitive tariff, where imports reach zero',
          },
        ],
        valid(s) {
          const pa = eqm(s.m).p;
          if (s.pw >= pa) return `At a world price of ${f(pa)} or more the country would not import: that is the autarky price.`;
          if (s.pw + s.t > pa + 1e-9) return 'This tariff is already prohibitive: imports are zero, so a higher tariff changes nothing.';
          return true;
        },
        draw(s) {
          const m = s.m, pt = s.pw + s.t;
          const qs0 = Qs(m, s.pw), qd0 = Qd(m, s.pw), qs = Qs(m, pt), qd = Qd(m, pt);
          return [
            A([[qs, pt], [qd, pt], [qd, s.pw], [qs, s.pw]], 'g', s.t ? 'Revenue' : ''),
            A([[qs0, s.pw], [qs, pt], [qs, s.pw]], 'o', ''),
            A([[qd, pt], [qd0, s.pw], [qd, s.pw]], 'o', ''),
            demandCurve(m, 'd', 'D'),
            supplyCurve(m, 's', 'S'),
            Hl(s.pw, 'n', 'Pw', { dash: true }),
            s.t > 0 ? Hl(pt, 'o', 'Pw + t', { dash: true }) : null,
            G(qs, pt, 'Qs', null, 's'),
            G(qd, pt, 'Qd', null, 'd'),
            s.t > 0 ? G(qs0, s.pw, '', null, 'n') : null,
            s.t > 0 ? G(qd0, s.pw, '', null, 'n') : null,
            qd > qs ? S(qs, pt, qd, pt, 'o', 'Imports', { bold: true }) : null,
          ];
        },
        readout(s) {
          const m = s.m, pt = s.pw + s.t, dp = s.t;
          const qs0 = Qs(m, s.pw), qd0 = Qd(m, s.pw), qs = Qs(m, pt), qd = Qd(m, pt), imp = Math.max(0, qd - qs);
          return {
            rows: [['Autarky price', money(eqm(m).p)], ['Domestic price', money(pt)], ['Imports (free trade)', f(qd0 - qs0)], ['Imports (with tariff)', f(imp)], ['Tariff revenue', money(dp * imp)], ['Deadweight loss (both triangles)', money(0.5 * dp * (qs - qs0) + 0.5 * dp * (qd0 - qd))]],
            status: imp < 1e-9 ? 'Prohibitive tariff: imports stop and the market is back at autarky.' : null,
          };
        },
      },
    },

    forex: {
      market: { demand: 'Q = 120 - 10e', supply: 'Q = -20 + 10e', dLabel: 'Demand for the currency', sLabel: 'Supply of the currency' },
      graph: {
        x: (s) => axesFor(s.m, 1.5, 1.35, ['Quantity of domestic currency', 'Exchange rate e (foreign per domestic)']).x,
        y: (s) => axesFor(s.m, 1.5, 1.35, ['Quantity of domestic currency', 'Exchange rate e (foreign per domestic)']).y,
        params: [
          { id: 'reg', label: 'Regime', options: [{ v: 0, label: 'Floating' }, { v: 1, label: 'Fixed' }], value: 0 },
          { id: 'sd', label: 'Demand shift (exports, capital inflows)', min: (s) => -snap(s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), max: (s) => snap(0.6 * s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), step: (s) => stepFor(1.6 * s.m.pd / s.m.md), value: 0 },
          { id: 'ss', label: 'Supply shift (imports, capital outflows)', min: (s) => -snap(s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), max: (s) => snap(0.6 * s.m.pd / s.m.md, stepFor(s.m.pd / s.m.md)), step: (s) => stepFor(1.6 * s.m.pd / s.m.md), value: 0 },
          { id: 'fix', label: 'Pegged rate (fixed regime)', min: (s) => snap(eqm(s.m).p * 0.4, stepFor(s.m.pd)), max: (s) => snap(Math.min(s.m.pd, eqm(s.m).p * 1.6), stepFor(s.m.pd)), step: (s) => stepFor(s.m.pd), value: (s) => snap(eqm(s.m).p, stepFor(s.m.pd)) },
        ],
        valid(s) {
          const m = shifted(s.m, s.sd, s.ss), e = eqm(m);
          if (m.pd <= 0) return 'Demand for the currency has shifted so far left that no one wants it at any rate.';
          if (e.q <= 0 || e.p <= 0) return 'Past this point the currency market has no positive equilibrium.';
          if (s.reg === 1 && (Qd(m, s.fix) <= 0 || Qs(m, s.fix) <= 0)) return 'At this peg one side of the market disappears entirely; the bank would be the whole market.';
          return true;
        },
        draw(s) {
          const m = shifted(s.m, s.sd, s.ss), e = eqm(m);
          const out = [
            s.sd ? demandCurve(s.m, 'ghost', 'D₀') : null,
            s.ss ? supplyCurve(s.m, 'ghost', 'S₀') : null,
            demandCurve(m, 'd', 'D'),
            supplyCurve(m, 's', 'S'),
          ];
          if (s.reg === 1) {
            const qd = Qd(m, s.fix), qs = Qs(m, s.fix);
            out.push(Hl(s.fix, 'o', 'Peg', { dash: true }), G(qd, s.fix, 'Qd', null, 'd'), G(qs, s.fix, 'Qs', null, 's'),
              Math.abs(qs - qd) > 1e-6 ? S(Math.min(qd, qs), s.fix, Math.max(qd, qs), s.fix, 'o', qs > qd ? 'Bank buys' : 'Bank sells', { bold: true, below: true }) : null,
              P(e.q, e.p, '', 'n', { small: true }));
          } else {
            out.push(G(e.q, e.p, 'Q*', 'e*'), P(e.q, e.p, 'E'));
          }
          return out;
        },
        readout(s) {
          const m = shifted(s.m, s.sd, s.ss), e = eqm(m), e0 = eqm(s.m).p, ch = ((e.p - e0) / e0) * 100;
          if (s.reg === 1) {
            const gap = Qs(m, s.fix) - Qd(m, s.fix);
            return {
              rows: [['Pegged rate', f(s.fix, 3)], ['Market-clearing rate', f(e.p, 3)], [gap > 0 ? 'Excess supply of currency' : 'Excess demand for currency', f(Math.abs(gap))]],
              status: gap > 1e-6 ? 'Peg is overvalued: the bank buys its own currency with foreign reserves, which run down.' : gap < -1e-6 ? 'Peg is undervalued: the bank sells its own currency and builds up foreign reserves.' : 'Peg equals the market rate: no intervention needed.',
              tone: gap > 1e-6 ? 'warn' : 'info',
            };
          }
          return { rows: [['Exchange rate e*', f(e.p, 3)], ['Quantity traded', f(e.q)], ['Change from starting rate', pct(ch)]], status: Math.abs(ch) < 0.05 ? 'At the starting rate.' : ch > 0 ? 'Appreciation: exports dearer abroad, imports cheaper at home.' : 'Depreciation: exports cheaper abroad, imports dearer at home.' };
        },
      },
    },
  };

  for (const t of window.TOPICS) {
    const g = graphs[t.id];
    if (!g) continue;
    t.market = g.market;
    t.graph = g.graph;
    t.model = null; // the functions panel shows the model
  }

  window.MARKET = { parse: parseLinear, build: buildMarket, eqm, describe };
})();
