/* More macroeconomics: demand-pull and cost-push inflation, the Laffer curve, investment demand and the
   liquidity trap, interest rate parity and the J-curve. Loads after more-micro.js. */
(function () {
  const { R, f, money, pct, C, V, Hl, P, G, A, S, T, ghost, range } = window.TOPIC_KIT;
  const MACRO = 'Macroeconomics';
  const blockOf = (id, fb) => (window.TOPICS.find((t) => t.id === id) || {}).block || fb;
  const unitOf = (id, fb) => (window.TOPICS.find((t) => t.id === id) || {}).unit || fb;
  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };

  /* ── Demand-pull and cost-push inflation ── */
  // AD: P = a − Y. SRAS: P = Pᵉ + (Y − 5) + v. LRAS at Y* = 5. Start: a = 10, Pᵉ = 5, v = 0, so Y = 5, P = 5.
  const infl = (s) => {
    const dp = s.type === 0;
    const a1 = dp ? 10 + s.size : 10, v = dp ? 0 : s.size;
    const Y1 = (a1 - v) / 2, P1 = a1 - Y1;                                  // short run: a − Y = Y + v
    let a2 = a1, pe2 = 5, Y2 = Y1, P2 = P1;
    if (dp) { pe2 = a1 - 5; Y2 = 5; P2 = a1 - 5; }                          // expectations catch up, back to Y*
    else { a2 = 10 + v; Y2 = 5; P2 = 5 + v; }                               // accommodating policy: AD meets SRAS₁ at Y*
    return { dp, a1, v, Y1, P1, a2, pe2, Y2, P2 };
  };
  const inflationTypes = {
    id: 'inflation-types',
    title: 'Demand-pull and cost-push inflation',
    summary: 'Inflation can start from either side of the economy. Demand-pull inflation comes from aggregate demand growing faster than the economy can produce: output rises above potential and inflation rises. Cost-push inflation comes from higher costs (oil, wages, a falling currency) shifting short-run aggregate supply up: inflation rises while output falls, which is stagflation. The two call for different policy responses.',
    model: 'As in the guide, the vertical axis is inflation. AD: π = a − Y. SRAS: π = πᵉ + (Y − 5) + v, with v a cost shock. LRAS is vertical at potential output Y* = 5. The economy starts at Y = 5 with inflation of 5%, as expected. A demand shock raises a; a cost shock raises v. The second stage shows what happens next: for demand-pull, expected inflation catches up and SRAS shifts up; for cost-push, the central bank accommodates the shock by raising AD.',
    graph: {
      x: { range: [3, 8], label: 'Real output (Y)', ticks: range(3, 8, 1), fmt: (v) => String(v) },
      y: { range: [0, 12], label: 'Inflation rate (π, %)', ticks: range(0, 12, 2) },
      params: [
        { id: 'type', label: 'Source', options: [{ v: 0, label: 'Demand-pull (AD rises)' }, { v: 1, label: 'Cost-push (SRAS shifts up)' }], value: 0 },
        { id: 'size', label: 'Size of the shock', min: 0, max: 15, step: 0.1, value: 1.5 },
        { id: 'stage', label: 'Show', options: [{ v: 0, label: 'Short run' }, { v: 1, label: 'Next stage' }], value: 0 },
      ],
      draw(s) {
        const z = infl(s), on = s.size > 0.01, out = [V(5, 'n', 'LRAS'), C((Y) => 10 - Y, on ? 'ghost' : 'd', on ? 'AD₀' : 'AD', { from: 3, to: 8, labelAt: 7.4 }), C((Y) => 5 + (Y - 5), on ? 'ghost' : 'g', on ? 'SRAS₀' : 'SRAS', { from: 3, to: 8, labelAt: 7.4 })];
        if (on) {
          if (z.dp) out.push(C((Y) => z.a1 - Y, 'd', 'AD₁', { from: 3, to: 8, labelAt: 7.4 }));
          else out.push(C((Y) => 5 + (Y - 5) + z.v, 'g', 'SRAS₁', { from: 3, to: 8, labelAt: Math.min(7.4, 12 - z.v - 0.6) }));
          out.push(P(z.Y1, z.P1, 'E₁', 'o', { dx: 9, dy: 14 }), G(z.Y1, z.P1, 'Y₁', 'π₁'));
          if (s.stage === 1) {
            if (z.dp) out.push(C((Y) => z.pe2 + (Y - 5), 's', 'SRAS₂ (higher πᵉ)', { from: 3, to: 8, labelAt: Math.min(7.2, 12 - z.pe2 + 3 - 0.6) }));
            else out.push(C((Y) => z.a2 - Y, 's', 'AD₂ (accommodated)', { from: 3, to: 8, labelAt: 7.2 }));
            out.push(P(z.Y2, z.P2, 'E₂', 's', { dx: -24, dy: 5 }), G(z.Y2, z.P2, null, 'π₂'));
          }
        }
        out.push(P(5, 5, 'E₀', 'n', { small: true, dx: -18, dy: 14 }));
        return out;
      },
      readout(s) {
        const z = infl(s), last = s.stage === 1 ? [z.Y2, z.P2] : [z.Y1, z.P1];
        return {
          rows: [
            ['Short run: output / inflation', `${f(z.Y1)} / ${f(z.P1)}%`],
            ['Output gap (Y − Y*) in the short run', `${z.Y1 >= 5 ? '+' : '−'}${f(Math.abs(z.Y1 - 5))}`],
            ['Rise in inflation in the short run', `${f(z.P1 - 5)} points`],
            [s.stage === 1 ? 'After the next stage: output / inflation' : 'Next stage (not shown yet)', s.stage === 1 ? `${f(last[0])} / ${f(last[1])}%` : '—'],
          ],
          status: s.size < 0.01 ? 'Choose a shock: demand-pull shifts AD right, cost-push shifts SRAS up.' : z.dp
            ? (s.stage === 0 ? 'Demand-pull: AD shifts right, so output rises above potential and inflation rises. Unemployment falls below its natural rate.' : 'Workers and firms come to expect the higher inflation, so SRAS shifts up until output is back at potential. The only lasting effect is higher inflation: demand cannot keep output above Y*.')
            : (s.stage === 0 ? 'Cost-push: higher costs shift SRAS up, so inflation rises and output falls at the same time (stagflation). The central bank faces a dilemma: fight inflation or support output.' : 'If the central bank accommodates the shock by raising AD, output returns to potential but inflation rises further, and repeated accommodation risks a wage–price spiral.'),
          tone: s.size < 0.01 ? 'info' : z.dp ? 'info' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Short-run equilibrium', tex: R`AD:\ \pi = a - Y \qquad SRAS:\ \pi = \pi^e + \gamma(Y - Y^*) + v` },
      { name: 'Demand-pull', tex: R`\Delta a > 0 \;\Rightarrow\; Y \uparrow,\; \pi \uparrow` },
      { name: 'Cost-push', tex: R`\Delta v > 0 \;\Rightarrow\; Y \downarrow,\; \pi \uparrow \quad (\text{stagflation})` },
    ],
    points: [
      'Demand-pull causes: loose monetary or fiscal policy, a consumer or investment boom, strong export demand. Remedy: tighter demand policy, with little cost to long-run output.',
      'Cost-push causes: higher energy and commodity prices, wage rises above productivity growth, a depreciation raising import prices, higher indirect taxes. Remedy: there is a trade-off; supply-side policies help in the long run.',
      'In the Phillips-curve picture, demand-pull is a move along the short-run curve; cost-push is a shift of the curve.',
      'Expectations matter: if people expect inflation to persist, wage and price setting builds it in, which is why central banks guard their credibility.',
      'Example: the 2021–23 inflation mixed both, with energy-price shocks (cost-push) on top of strong post-pandemic demand (demand-pull).',
    ],
    tip: 'Name the source, shift the right curve, and compare: demand-pull moves output and prices in the same direction, cost-push in opposite directions. Then discuss the policy dilemma that cost-push creates.',
  };

  /* ── The Laffer curve ── */
  // Tax base B(t) = 100(1 − t)^ε, revenue R(t) = t·B(t). Revenue is highest at t* = 1/(1 + ε).
  const laffer = (s) => {
    const t = s.t / 100, rev = (x) => 100 * x * (1 - x) ** s.eps, ts = 1 / (1 + s.eps);
    return { t, rev, ts, Rt: rev(t), Rmax: rev(ts), base: 100 * (1 - t) ** s.eps };
  };
  const lafferTopic = {
    id: 'laffer',
    title: 'The Laffer curve',
    summary: 'The Laffer curve shows tax revenue against the tax rate. At a 0% rate revenue is zero, and at 100% no one bothers to earn taxable income, so revenue is zero again. In between, revenue rises to a peak and then falls: above the peak, a higher rate shrinks the tax base so much that revenue falls. Where the peak lies depends on how strongly the tax base responds to the tax rate.',
    model: 'The tax base (taxable income) shrinks as the rate rises: B(t) = 100(1 − t)^ε, where ε measures how strongly people respond (working less, avoiding or evading tax, moving abroad). Revenue R = t × B(t) is highest at t* = 1/(1 + ε).',
    graph: {
      x: { range: [0, 100], label: 'Tax rate (%)', ticks: range(0, 100, 10), fmt: (v) => v + '%' },
      y: (s) => { const top = 5 * Math.ceil((laffer(s).Rmax * 1.15) / 5); return { range: [0, top], label: 'Tax revenue', ticks: range(0, top, top / 5) }; },
      params: [
        { id: 't', label: 'Tax rate (%)', min: 0, max: 100, step: 1, value: 40 },
        { id: 'eps', label: 'Responsiveness of the tax base (ε)', min: 0.05, max: 14, step: 0.05, value: 1 },
      ],
      draw(s) {
        const z = laffer(s);
        return [
          C((x) => z.rev(x / 100), 'd', 'Laffer curve', { from: 0, to: 100, labelAt: 82 }),
          V(100 * z.ts, 'ghost', `revenue-maximising rate ${f(100 * z.ts, 0)}%`),
          P(100 * z.ts, z.Rmax, '', 'n', { small: true }),
          G(s.t, z.Rt, 't', 'R'),
          P(s.t, z.Rt, ''),
        ];
      },
      readout(s) {
        const z = laffer(s);
        return {
          rows: [
            ['Tax revenue', f(z.Rt, 1)],
            ['Tax base', f(z.base, 1)],
            ['Revenue-maximising rate t* = 1/(1 + ε)', pct(100 * z.ts, 1)],
            ['Revenue at t*', f(z.Rmax, 1)],
          ],
          status: s.t / 100 < z.ts - 0.005
            ? 'Below the peak: raising the rate raises revenue, although it shrinks the tax base.'
            : s.t / 100 > z.ts + 0.005
              ? 'Above the peak (the prohibitive range): cutting the rate would raise revenue, because the tax base would grow by more than enough to compensate.'
              : 'At the peak: a small change in the rate leaves revenue unchanged.',
          tone: s.t / 100 > z.ts + 0.005 ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Revenue', tex: R`R(t) = t \cdot B(t)` },
      { name: 'Revenue-maximising rate', tex: R`\frac{dR}{dt} = 0 \iff \frac{dB}{dt}\cdot\frac{t}{B} = -1`, note: 'At the peak a 1% higher rate cuts the base by 1%.' },
      { name: 'This model', tex: R`B = 100(1 - t)^{\varepsilon} \;\Rightarrow\; t^* = \frac{1}{1 + \varepsilon}` },
    ],
    points: [
      'The argument for supply-side tax cuts rests on the economy being above the peak; most estimates put the peak for top income tax rates well above typical rates, although they are uncertain.',
      'The tax base responds through less work, more avoidance and evasion, shifting income to lower-taxed forms or years, and migration of high earners.',
      'Even below the peak, high rates create deadweight losses: revenue is not the only test of a good tax.',
      'The peak differs by tax and over time: a base that can move easily (capital, high earners) has a lower revenue-maximising rate.',
    ],
    tip: 'Draw revenue against the rate with zeros at 0% and 100% and a single peak. Explain why revenue falls above the peak (the base shrinks faster than the rate rises), and be sceptical: where the peak lies is an empirical question.',
  };

  /* ── Investment demand and the liquidity trap ── */
  // Money demand: i = max(0, 9 − 0.9M), so for M ≥ 10 the interest rate is stuck at zero (the liquidity trap).
  // Investment: I = I₀ − d·i.
  const invest = (s) => {
    const i = Math.max(0, 9 - 0.9 * s.M), I = Math.max(0, s.I0 - s.d * i);
    return { i, I, trap: s.M >= 10 - 1e-9 };
  };
  const investmentTrap = {
    id: 'investment-trap',
    title: 'Investment demand and the liquidity trap',
    summary: 'Firms invest when the expected return on new capital beats the interest rate, so investment demand slopes down: a lower interest rate makes more projects worthwhile. Monetary policy works by lowering the interest rate to raise investment. But it can fail: if the interest rate is already at zero, more money just sits idle (a liquidity trap), and if investment is insensitive to the interest rate or firms are pessimistic, cheaper borrowing does little.',
    model: 'Money market: the central bank sets the money supply M; money demand gives i = 9 − 0.9M until the interest rate hits zero at M = 10, after which people simply hold the extra money (the liquidity trap). Investment demand: I = I₀ − d·i, where I₀ reflects expected returns (“animal spirits”) and d how sensitive investment is to the interest rate. The panels share the interest-rate axis.',
    graph: {
      layout: 'row',
      params: [
        { id: 'M', label: 'Money supply (M)', min: 0.5, max: 60, step: 0.1, value: 6 },
        { id: 'I0', label: 'Business confidence: investment at i = 0 (I₀)', min: 1, max: 60, step: 0.1, value: 14 },
        { id: 'd', label: 'Interest sensitivity of investment (b)', min: 0.05, max: 11, step: 0.05, value: 1.2 },
      ],
      panels: [
        {
          title: 'Money market',
          x: { range: [0, 16], label: 'Money (M)', ticks: range(0, 16, 2) },
          y: { range: [0, 10], label: 'Interest rate (i, %)', ticks: range(0, 10, 2) },
          draw(s) {
            const z = invest(s);
            return [
              C((M) => Math.max(0, 9 - 0.9 * M), 'd', 'Money demand', { to: 16, labelAt: 3 }),
              T(11, 0.6, 'liquidity trap: i = 0', 'r'),
              V(s.M, 'g', 'Mˢ', { bold: true }),
              G(s.M, z.i, null, 'i'),
              P(s.M, z.i, ''),
            ];
          },
        },
        {
          title: 'Investment demand',
          x: { range: [0, 20], label: 'Investment (I)', ticks: range(0, 20, 4) },
          y: { range: [0, 10], label: 'Interest rate (i, %)', ticks: range(0, 10, 2) },
          draw(s) {
            const z = invest(s);
            return [
              C((I) => (s.I0 - I) / s.d, 'd', 'Investment demand (MEC)', { from: Math.max(0, s.I0 - 10 * s.d), to: Math.min(20, s.I0), labelAt: Math.max(1, s.I0 - 7 * s.d) }),
              Hl(z.i, 'ghost', ''),
              G(z.I, z.i, 'I', null),
              P(z.I, z.i, ''),
            ];
          },
        },
      ],
      readout(s) {
        const z = invest(s), dI = s.d * 0.9;
        return {
          rows: [
            ['Interest rate', pct(z.i, 2)],
            ['Investment', f(z.I)],
            ['Extra investment from 1 more unit of money', z.trap ? '0 (in the trap)' : f(dI)],
          ],
          status: z.trap
            ? 'Liquidity trap: the interest rate is at zero, so extra money is simply held and investment does not respond. Monetary policy is “pushing on a string”; fiscal policy or unconventional tools (forward guidance, quantitative easing) are needed.'
            : s.d < 0.5
              ? 'Investment is not very sensitive to the interest rate here, so even a large cut in rates raises investment only a little.'
              : 'More money lowers the interest rate, and more investment projects become worthwhile: monetary policy works through investment.',
          tone: z.trap ? 'warn' : 'info',
        };
      },
    },
    equations: [
      { name: 'Investment decision', tex: R`\text{invest if expected return on capital (MEC)} > i` },
      { name: 'Investment demand', tex: R`I = I_0 - b\,i`, note: 'The guide writes I = I₀ − br.' },
      { name: 'Liquidity trap', tex: R`i = 0:\ \frac{\Delta i}{\Delta M} = 0 \;\Rightarrow\; \frac{\Delta I}{\Delta M} = 0` },
    ],
    points: [
      'Investment demand shifts with expected profits (confidence, “animal spirits”), technology, the cost of capital goods, taxes on profits and the accelerator (expected growth in demand).',
      'Keynes stressed that pessimism can make investment insensitive to interest rates in a slump.',
      'Japan from the 1990s and many economies after 2008 hit the zero lower bound, prompting quantitative easing and fiscal stimulus.',
      'In the IS–MP model, a flatter IS curve (interest-sensitive investment) makes monetary policy more powerful.',
    ],
    tip: 'Draw the money market beside investment demand on a shared interest-rate axis. Show a rise in money supply lowering i and raising I, then show the two failures: the flat (trap) section of money demand, and a steep investment demand curve.',
  };

  /* ── Interest rate parity ── */
  // E = home currency per unit of foreign currency (a rise is a depreciation of the home currency).
  // Expected return on foreign deposits in home currency: R* = i* + (Eᵉ − E)/E. Equilibrium where R* = i.
  const uip = (s) => { const E = s.Ee / (1 + (s.i - s.istar) / 100); return { E, dep: (100 * (s.Ee - E)) / E }; };
  const interestParity = {
    id: 'interest-parity',
    title: 'Interest rate parity and the exchange rate',
    summary: 'With free capital movement, investors move money to wherever the expected return is highest. Holding foreign deposits pays the foreign interest rate plus any expected depreciation of the home currency. Investors are only content holding both when these returns are equal: uncovered interest parity. So a rise in home interest rates attracts capital and makes the home currency appreciate today; a rise in foreign rates, or an expected future depreciation, makes it depreciate.',
    model: 'E is the price of one unit of foreign currency in home currency, so a fall in E is an appreciation of the home currency. Return on home deposits: i. Expected return on foreign deposits, in home currency: i* + (Eᵉ − E)/E, where Eᵉ is the exchange rate expected next year. The exchange rate adjusts until they are equal: E = Eᵉ/(1 + i − i*).',
    graph: {
      x: { range: [0, 15], label: 'Expected rate of return (%)', ticks: range(0, 15, 3), fmt: (v) => v + '%' },
      y: (s) => { const lo = Math.floor((s.Ee / 1.17) * 20) / 20, hi = Math.ceil((s.Ee / 0.93) * 20) / 20; return { range: [lo, hi], label: 'Exchange rate E (home per foreign)', ticks: range(lo, hi, 0.05), fmt: (v) => v.toFixed(2) }; },
      params: [
        { id: 'i', label: 'Home interest rate (i, %)', min: 0, max: 50, step: 0.1, value: 5 },
        { id: 'istar', label: 'Foreign interest rate (i*, %)', min: 0, max: 49, step: 0.1, value: 3 },
        { id: 'Ee', label: 'Expected future exchange rate (Eᵉ)', min: 0.05, max: 4.4, step: 0.01, value: 1.25 },
      ],
      draw(s) {
        const z = uip(s);
        return [
          C((Rr) => s.Ee / (1 + (Rr - s.istar) / 100), 's', 'Expected return on foreign deposits', { from: 0, to: 15, labelAt: s.i > 7 ? 1 : 8.5 }),
          V(s.i, 'd', 'Return on home deposits = i', { bold: true }),
          G(s.i, z.E, null, 'E'),
          P(s.i, z.E, 'Parity', 'o', { dx: 9, dy: -8 }),
          Hl(s.Ee, 'ghost', 'Eᵉ'),
        ];
      },
      readout(s) {
        const z = uip(s);
        return {
          rows: [
            ['Equilibrium exchange rate E', f(z.E, 3)],
            ['Expected change in E over the year', `${z.dep >= 0 ? '+' : '−'}${pct(Math.abs(z.dep), 2)}`],
            ['Interest differential i − i*', `${s.i - s.istar >= 0 ? '+' : '−'}${pct(Math.abs(s.i - s.istar), 1)}`],
          ],
          status: Math.abs(s.i - s.istar) < 0.05
            ? 'Equal interest rates: the exchange rate today equals the expected future rate.'
            : s.i > s.istar
              ? 'Home deposits pay more, so capital flows in and the home currency appreciates today (E falls) until it is expected to depreciate by just enough to offset the interest advantage.'
              : 'Foreign deposits pay more, so capital flows out and the home currency depreciates today (E rises) until it is expected to appreciate by enough to compensate.',
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Uncovered interest parity', tex: R`i = i^* + \frac{E^e - E}{E}` },
      { name: 'Exchange rate today', tex: R`E = \frac{E^e}{1 + i - i^*}` },
      { name: 'Covered interest parity', tex: R`i = i^* + \frac{F - E}{E}`, note: 'F is the forward exchange rate, which removes the exchange-rate risk.' },
    ],
    points: [
      'A rise in the home interest rate appreciates the currency now; this is one channel through which monetary policy affects net exports.',
      'Expectations drive exchange rates: news that changes the expected future rate moves today’s rate at once.',
      'In practice UIP often fails over short horizons (carry trades earn a return), partly because investors demand a risk premium.',
      'Under a fixed exchange rate with free capital flows, UIP means home interest rates must follow foreign rates: the “impossible trinity”.',
    ],
    tip: 'Draw the home return as a vertical line at i and the foreign return as a downward-sloping curve in E. Shift the vertical line right for a rate rise: the intersection moves down, an appreciation.',
  };

  /* ── The J-curve ── */
  // After a depreciation of d%, export and import volumes respond gradually: the sum of elasticities grows
  // from 0 towards η_LR with half-life h quarters. Change in the trade balance (% of imports) ≈ d(η(t) − 1).
  const jc = (s) => {
    const eta = (t) => s.eta * (1 - 2 ** (-t / s.h)), tb = (t) => s.d * (eta(t) - 1);
    let cross = null; for (let t = 0; t <= 16; t += 0.01) if (tb(t) >= 0) { cross = t; break; }
    return { eta, tb, cross, lr: s.d * (s.eta - 1) };
  };
  const jCurve = {
    id: 'j-curve',
    title: 'The J-curve and the Marshall–Lerner condition',
    summary: 'A depreciation makes exports cheaper abroad and imports dearer at home, but volumes take time to respond because contracts are fixed and buyers take time to switch. At first the higher price of imports dominates and the trade balance gets worse; as volumes adjust it improves. Plotted over time, the trade balance traces a J. It ends up better than before only if the Marshall–Lerner condition holds: the price elasticities of demand for exports and imports add up to more than 1.',
    model: 'A depreciation of d% at time 0. The sum of export and import price elasticities rises gradually from 0 to its long-run value η, adjusting half-way every h quarters. The change in the trade balance, as a share of the initial value of imports, is approximately d × (η(t) − 1).',
    graph: {
      x: { range: [0, 16], label: 'Quarters after the depreciation', ticks: range(0, 16, 2), fmt: (v) => String(v) },
      y: (s) => { const lo = -Math.ceil(s.d + 2), hi = Math.max(4, Math.ceil(s.d * Math.max(0, s.eta - 1) + 3)); return { range: [lo, hi], label: 'Change in trade balance (% of imports)', ticks: range(lo, hi, Math.max(2, Math.ceil((hi - lo) / 8))) }; },
      params: [
        { id: 'd', label: 'Depreciation (d, %)', min: 1, max: 100, step: 1, value: 10 },
        { id: 'eta', label: 'Long-run sum of elasticities (η)', min: 0, max: 11, step: 0.05, value: 1.6 },
        { id: 'h', label: 'Adjustment speed: half-life (quarters)', min: 0.25, max: 20, step: 0.5, value: 2 },
      ],
      draw(s) {
        const z = jc(s), span = Math.ceil(s.d + 2) + Math.max(4, Math.ceil(s.d * Math.max(0, s.eta - 1) + 3)), out = [Hl(0, 'n', 'No change'), C(z.tb, s.eta > 1 ? 'd' : 'r', '', { from: 0, to: 16 }), T(9, z.tb(9) - 0.08 * span, s.eta > 1 ? 'Trade balance: the J-curve' : 'Trade balance: no recovery', s.eta > 1 ? 'd' : 'r')];
        out.push(P(0, -s.d, 'Immediate worsening', 'r', { small: true, dx: 9, dy: 4 }));
        if (z.cross != null) out.push(G(z.cross, 0, null, null, 'o'), P(z.cross, 0, `improves after ${f(z.cross, 1)} quarters`, 'o', { dx: 9, dy: 16 }));
        out.push(Hl(z.lr, 'ghost', `long run: ${z.lr >= 0 ? '+' : ''}${f(z.lr, 1)}%`));
        return out;
      },
      readout(s) {
        const z = jc(s);
        return {
          rows: [
            ['Immediate change in the trade balance', `−${pct(s.d, 1)} of imports`],
            ['Long-run change', `${z.lr >= 0 ? '+' : '−'}${pct(Math.abs(z.lr), 1)} of imports`],
            ['Marshall–Lerner condition (η > 1)', s.eta > 1 ? 'holds' : 'fails'],
            ['Quarters until the balance improves', z.cross == null ? 'not within 16 quarters' : f(z.cross, 1)],
          ],
          status: s.eta > 1
            ? `The trade balance first worsens (imports cost more before volumes react), then improves as buyers switch, crossing zero after about ${z.cross == null ? 'more than 16' : f(z.cross, 1)} quarters: a J-curve.`
            : 'The Marshall–Lerner condition fails: volumes never respond enough to offset the higher price of imports, so the depreciation leaves the trade balance worse.',
          tone: s.eta > 1 ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Marshall–Lerner condition', tex: R`|\varepsilon_X| + |\varepsilon_M| > 1`, note: 'Starting from balanced trade, a depreciation improves the trade balance only if this holds.' },
      { name: 'Approximate effect (this model)', tex: R`\Delta TB \approx d\,(\eta - 1)`, note: 'd: depreciation; η: sum of elasticities, small at first and larger later.' },
    ],
    points: [
      'Short-run elasticities are low: contracts are agreed in advance, and switching suppliers takes time.',
      'Pass-through matters: if foreign firms cut their prices to keep market share, import prices rise less.',
      'A depreciation also raises inflation through dearer imports, which can erode the competitiveness gain.',
      'Example: the UK’s exit from the ERM in 1992 and the sterling fall after 2016 were followed by slow and partial improvements in net trade.',
    ],
    tip: 'Plot the trade balance against time: an initial dip (price effect) and a gradual rise (volume effect). State the Marshall–Lerner condition and why short-run elasticities are low.',
  };


  /* ── Fiscal and monetary policy under fixed and floating exchange rates (guide Block 20, BVFD 28.2 and 28.5) ── */
  // IS: r = a − 0.8Y, Y* = 5, world rate i* = 5. MP: flat at i* under a peg with perfect capital mobility,
  // otherwise r = r₀ + 0.8(Y − 5). Under a float the exchange rate moves net exports by 60% of the policy shift.
  const K_NX = 0.6, BETA = 0.8;
  const openEq = (a, r0, beta) => { const Y = (a - r0 + 5 * beta) / (0.8 + beta); return { Y, r: a - 0.8 * Y }; };
  const openModel = (s) => {
    const fiscal = s.pol === 0, d = s.size, beta = s.reg === 0 ? 0 : BETA;
    let a = 9, r0 = 5, aBefore = null, r0Tried = null;
    if (fiscal) {
      if (s.reg === 2) { aBefore = 9 + d; a = 9 + d * (1 - K_NX); } else a = 9 + d;
    } else if (s.reg === 0) { r0Tried = 5 - d; }
    else { r0 = 5 - d; if (s.reg === 2) { aBefore = 9; a = 9 + K_NX * d; } }
    const e = openEq(a, r0, beta), closed = fiscal ? openEq(9 + d, 5, BETA) : openEq(9, 5 - d, BETA);
    return { fiscal, d, beta, a, r0, aBefore, r0Tried, ...e, closedY: closed.Y };
  };
  const openPolicy = {
    id: 'open-policy',
    title: 'Policy under fixed and floating exchange rates',
    summary: 'How well fiscal and monetary policy work in an open economy depends on the exchange rate regime and on how freely capital moves. With a fixed rate and perfect capital mobility, fiscal policy is very effective and monetary policy is powerless. With a floating rate it is the other way round.',
    model: 'IS: r = a − 0.8Y, with potential output Y* = 5 and the world interest rate i* = 5. Under a peg with perfect capital mobility the MP schedule is flat at i*; otherwise r = r₀ + 0.8(Y − 5). Under a floating rate the exchange rate moves net exports by 60% of the policy shift. The closed-economy comparison uses the same shock with no exchange-rate effect and an MP slope of 0.8.',
    graph: {
      x: { range: [0, 10], label: 'Output (Y)' },
      y: { range: [0, 10], label: 'Interest rate (r)' },
      params: [
        { id: 'reg', label: 'Exchange rate regime', options: [{ v: 0, label: 'Fixed, perfect capital mobility' }, { v: 1, label: 'Fixed, low capital mobility' }, { v: 2, label: 'Floating' }], value: 0 },
        { id: 'pol', label: 'Policy', options: [{ v: 0, label: 'Fiscal expansion' }, { v: 1, label: 'Monetary expansion' }], value: 0 },
        { id: 'size', label: 'Size of the policy change', min: 0, max: 3, step: 0.1, value: 2, hint: 'Fiscal: how far G shifts IS up. Monetary: the cut in the interest rate.' },
      ],
      draw(s) {
        const z = openModel(s), moved = z.d > 1e-6;
        const mpLabel = s.reg === 0 ? 'MP = i*' : 'MP';
        return [
          ghost(moved && (z.a !== 9 || z.aBefore !== null), (Y) => 9 - 0.8 * Y, 'IS₀'),
          ghost(moved && z.aBefore !== null && z.aBefore !== 9, (Y) => z.aBefore - 0.8 * Y, z.fiscal ? 'IS before appreciation' : 'IS₀'),
          ghost(moved && z.r0 !== 5, () => 5, 'MP₀'),
          ghost(moved && z.r0Tried !== null, () => z.r0Tried, 'MP attempted'),
          C((Y) => z.a - 0.8 * Y, 'd', moved && z.a !== 9 ? 'IS₁' : 'IS'),
          C((Y) => z.r0 + z.beta * (Y - 5), 's', mpLabel),
          moved && Math.abs(z.Y - 5) > 1e-6 ? P(5, 5, 'E₀') : null,
          G(z.Y, z.r, 'Y', 'r'),
          P(z.Y, z.r, moved && Math.abs(z.Y - 5) > 1e-6 ? 'E₁' : 'E'),
        ];
      },
      readout(s) {
        const z = openModel(s), dY = z.Y - 5, dC = z.closedY - 5;
        const sign = (v) => (v >= 0 ? '+' : '−') + f(Math.abs(v));
        const fx = [
          ['The bank sells its own currency to stop an appreciation: reserves and the money supply rise.', 'Capital flows out. The bank buys its own currency with reserves to hold the peg, so the money supply shrinks back.'],
          ['Capital controls let r rise above i*; the bank intervenes to hold the peg.', 'Capital controls let r fall below i* for a while; the bank uses reserves to hold the peg.'],
          ['Appreciates: the higher interest rate attracts capital.', 'Depreciates: the lower interest rate drives capital out.'],
        ][s.reg][s.pol];
        const status = [
          ['Fixed rate, perfect capital mobility: the interest rate is pinned at the world rate, so a fiscal expansion raises output by the full multiplier with no crowding out. Fiscal policy is very effective.', 'Fixed rate, perfect capital mobility: monetary policy is powerless. A lower rate would start a capital outflow; defending the peg, the central bank buys its own currency, the money supply falls back, and MP returns to i*.'],
          ['Fixed rate, low capital mobility: capital controls let the domestic rate rise above i*, so MP slopes up and some spending is crowded out. Output rises by less than with perfect capital mobility.', 'Fixed rate, low capital mobility: capital controls give the central bank some room to set its own rate, so a cut raises output. The more mobile capital is, the less room it has.'],
          ['Floating rate: the higher interest rate attracts capital and the currency appreciates. Net exports fall and IS shifts back part of the way, so fiscal policy is weaker than in a closed economy.', 'Floating rate: the lower interest rate drives capital out and the currency depreciates. Net exports rise and IS shifts right, reinforcing the cut: monetary policy is more powerful than in a closed economy.'],
        ][s.reg][s.pol];
        const strong = (s.reg === 0 && s.pol === 0) || (s.reg === 2 && s.pol === 1);
        return {
          rows: [['Output Y', f(z.Y)], ['Interest rate r', pct(z.r, 2)], ['Change in output', sign(dY)], ['Closed economy, same shock', sign(dC)], ['Exchange rate', fx]],
          status: z.d < 1e-6 ? 'Choose a policy change to see how the regime alters its effect.' : status,
          tone: z.d < 1e-6 ? undefined : strong ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Open-economy IS', tex: R`(1 - c)Y + (a + b)r = A_0 + I_0 + G - cT + NX`, note: 'The guide’s IS curve with net exports added. A real appreciation lowers NX and shifts IS left; a depreciation shifts it right.' },
      { name: 'Peg with perfect capital mobility', tex: R`r = i^*`, note: 'The guide (Block 20): the MP schedule is horizontal at the foreign interest rate.' },
    ],
    points: [
      'Fixed rate, perfect capital mobility: fiscal policy is very effective (no crowding out); monetary policy is ineffective, because defending the peg reverses any change in the money supply (BVFD 28.2).',
      'Floating rate: monetary policy is powerful, because the exchange rate moves net exports the same way; fiscal policy is weakened by the appreciation it causes (BVFD 28.5).',
      'Fixing the exchange rate means giving up control of the interest rate, and fixing the interest rate means giving up control of the exchange rate.',
      'The guide’s Block 20 text says a fiscal expansion under floating rates puts pressure on the currency to “depreciate”. It appreciates: the higher interest rate attracts capital, as BVFD 28.5 explains.',
    ],
    tip: 'Name the regime and the degree of capital mobility first. Then follow the chain: interest rate, capital flows, exchange rate (or intervention and the money supply), net exports, IS.',
  };

  insertAfter('ad-as', inflationTypes, MACRO, blockOf('ad-as', 'Block 16'));
  insertAfter('inflation-types', lafferTopic, MACRO, blockOf('ad-as', 'Block 16'));
  insertAfter('money-ismp', investmentTrap, MACRO, blockOf('money-ismp', 'Block 15'));
  insertAfter('forex', interestParity, unitOf('forex', MACRO), blockOf('forex', 'Blocks 19–20'));
  insertAfter('interest-parity', jCurve, unitOf('forex', MACRO), blockOf('forex', 'Blocks 19–20'));
  insertAfter('j-curve', openPolicy, unitOf('forex', MACRO), blockOf('forex', 'Blocks 19–20'));
})();
