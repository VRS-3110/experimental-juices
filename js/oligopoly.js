/* Oligopoly extras (Blocks 6–8): dominant-firm price leadership, and a side-by-side comparison of
   monopoly, Cournot, Stackelberg and Bertrand outcomes in one market. Loads after games.js and
   inserts each topic after the collusion topic. */
(function () {
  const { R, f, money, pct, C, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MICRO = 'Microeconomics';

  /* ── Dominant-firm price leadership ── */
  // Market demand Q = 100 − 5P. Competitive fringe supplies Q_F = k(P − 2) above P = 2.
  // The leader's residual demand is D − S_F; it sets MR_r = MC = c and the fringe takes that price.
  const PL_A = 100, PL_B = 5, PL_P0 = 2;
  const lead = (s) => {
    const k = s.k, A0 = PL_A + k * PL_P0, B0 = PL_B + k; // residual demand above P0: Q_r = A0 − B0·P
    const pMax = A0 / B0;                                 // price at which the fringe supplies the whole market
    const qL = Math.max(0, (A0 - s.c * B0) / 2);
    const p = (A0 - qL) / B0, qF = k * Math.max(0, p - PL_P0), q = PL_A - PL_B * p;
    const pm = (PL_A / PL_B + s.c) / 2, qm = PL_A - PL_B * pm; // leader as a monopolist with no fringe
    return { k, A0, B0, pMax, qL, p, qF, q, pm, qm, profit: (p - s.c) * qL, share: q > 0 ? qL / q : 0 };
  };
  const resid = (k) => (x) => (x <= PL_A - PL_B * PL_P0 ? (PL_A + k * PL_P0 - x) / (PL_B + k) : PL_A / PL_B - x / PL_B);

  const priceLeadership = {
    id: 'price-leadership',
    title: 'Price leadership',
    summary: 'In many oligopolies one firm sets the price and the others follow. In the dominant-firm model, a large low-cost leader faces a competitive fringe of small price-taking firms. The leader works out what the fringe will supply at each price, treats the rest of market demand as its own (residual) demand, and sets MR = MC on it. The fringe then sells as much as it wants at that price.',
    model: 'Market demand Q = 100 − 5P. Fringe supply Q_F = k(P − 2) for P above 2 (k measures the size of the fringe; k = 0 means no fringe). The leader’s residual demand is Q_L = (100 − 5P) − k(P − 2), and its marginal cost is a constant c.',
    graph: {
      x: { range: [0, 100], label: 'Quantity (Q)', ticks: range(0, 100, 20) },
      y: { range: [0, 20], label: 'Price and cost ($)', ticks: range(0, 20, 4) },
      params: [
        { id: 'k', label: 'Size of the fringe (k)', min: 0, max: 20, step: 1, value: 5, hint: '0 = no fringe: the leader is a monopolist' },
        { id: 'c', label: 'Leader’s marginal cost (c)', min: 2, max: 10, step: 0.5, value: 4 },
      ],
      valid(s) {
        const z = lead(s);
        if (z.pMax <= s.c + 0.25) return 'The fringe would supply the whole market at any price above the leader’s marginal cost, so the leader could sell nothing at a profit.';
        return true;
      },
      draw(s) {
        const z = lead(s), out = [];
        out.push(A([[0, z.p], [z.qL, z.p], [z.qL, s.c], [0, s.c]], 'o', ''));
        out.push(C((x) => PL_A / PL_B - x / PL_B, 'd', 'D (market)', { to: 100, labelAt: 10 }));
        if (s.k > 0) out.push(C((x) => PL_P0 + x / s.k, 'n', 'S fringe', { to: Math.min(100, 18 * s.k), labelAt: Math.min(90, 15 * s.k) }));
        if (s.k > 0) out.push(C(resid(s.k), 'o', 'D residual', { to: 100, dash: true, labelAt: Math.min(70, z.A0 - 12 * z.B0 > 0 ? 60 : 50) }));
        out.push(
          C((x) => (z.A0 - 2 * x) / z.B0, 'g', 'MR residual', { to: Math.min(z.A0 / 2, 90), labelAt: Math.min(z.A0 / 2, 90) * 0.78 }),
          Hl(s.c, 's', 'MC leader'),
          S(0, z.p, z.q, z.p, 'ghost', '', { dash: true }),
        );
        if (s.k > 0) out.push(G(z.qF, z.p, 'Q_F', null, 'n'), P(z.qF, z.p, '', 'n', { small: true }));
        out.push(G(z.q, z.p, 'Q', null, 'd'), P(z.q, z.p, 'Market', 'd', { small: true }));
        out.push(G(z.qL, z.p, 'Q_L', 'P_L'), P(z.qL, z.p, 'Leader'));
        return out;
      },
      readout(s) {
        const z = lead(s);
        return {
          rows: [
            ['Price set by the leader', money(z.p)],
            ['Leader’s output', f(z.qL)],
            ['Fringe output (at that price)', f(z.qF)],
            ['Market output', f(z.q)],
            ['Leader’s market share', pct(100 * z.share)],
            ['Leader’s profit (before fixed costs)', money(z.profit)],
            ['Price with no fringe (pure monopoly)', money(z.pm)],
          ],
          status: s.k === 0
            ? 'No fringe: the residual demand is the whole market demand, so the leader is simply a monopolist.'
            : `The leader sets ${money(z.p)}, where MR on its residual demand equals its MC. At that price the fringe supplies ${f(z.qF)} and the leader the remaining ${f(z.qL)}. A bigger fringe flattens the residual demand and pushes the price down toward the leader’s cost.`,
          tone: 'info',
        };
      },
    },
    equations: [
      { name: 'Leader’s residual demand', tex: R`D_L(P) = D(P) - S_F(P)`, note: 'Market demand minus what the fringe supplies at each price.' },
      { name: 'Leader’s price and output', tex: R`MR_L(Q_L) = MC_L \;\Rightarrow\; Q_L,\; P_L = D_L^{-1}(Q_L)`, note: 'The leader acts as a monopolist on its residual demand.' },
      { name: 'Fringe follows', tex: R`P_L = MC_F(Q_F),\qquad Q = Q_L + Q_F = D(P_L)`, note: 'Each fringe firm is a price taker and produces where the leader’s price equals its marginal cost.' },
      { name: 'Linear case', tex: R`Q_L = \frac{(a + k p_0) - c\,(b + k)}{2},\qquad P_L = \frac{1}{2}\Big(\frac{a + k p_0}{b + k} + c\Big)`, note: 'Demand Q = a − bP, fringe supply Q_F = k(P − p_0), leader’s MC = c.' },
    ],
    points: [
      'Dominant-firm leadership: the leader is large and usually has lower costs; the fringe firms are price takers.',
      'The residual demand is flatter than market demand because the fringe absorbs part of any price rise. A larger fringe means less market power for the leader.',
      'Barometric price leadership: the leader is not necessarily the largest firm, but one whose price changes are seen as a good signal of cost and demand conditions, so the others follow it.',
      'Collusive (tacit) leadership: firms follow the leader to keep prices high without any explicit agreement. It is a form of tacit collusion and is hard to prosecute.',
      'Over time a profitable fringe tends to grow, eroding the leader’s share. Examples often cited: US Steel in the early twentieth century, Saudi Arabia within OPEC.',
    ],
    tip: 'Build the residual demand step by step: at the price where the fringe supplies the whole market the leader sells nothing; below the fringe’s minimum price the residual demand is the market demand. Then set MR on the residual demand equal to the leader’s MC, read the price off the residual demand, and show the fringe’s output at that price.',
  };

  /* ── Oligopoly comparisons ── */
  // Demand P = 24 − Q, all firms have constant MC = c. Compare monopoly (or cartel), Cournot with n firms,
  // Stackelberg duopoly and Bertrand with identical goods (same as perfect competition).
  const OA = 24;
  const MODELS = ['Monopoly / cartel', 'Cournot', 'Stackelberg', 'Bertrand / competition'];
  const outcomes = (s) => {
    const m = OA - s.c;
    const qs = [m / 2, (s.n * m) / (s.n + 1), (3 * m) / 4, m];
    return qs.map((Q, i) => {
      const p = OA - Q;
      return { name: i === 1 ? `Cournot (${s.n} firms)` : i === 2 ? 'Stackelberg (2 firms)' : MODELS[i], Q, p, profit: (p - s.c) * Q, cs: 0.5 * Q * Q, dwl: 0.5 * (m - Q) * (m - Q), lerner: p > 0 ? (p - s.c) / p : 0 };
    });
  };
  const compareTable = `
    <h2>The models side by side</h2>
    <p class="extra-lede">What each model assumes, and what it predicts with linear demand P = a − bQ and equal constant marginal cost c.</p>
    <div class="table-scroll"><table class="compare">
      <thead><tr><th>Model</th><th>Firms choose</th><th>Timing</th><th>Market output</th><th>Price and profit</th></tr></thead>
      <tbody>
        <tr><th>Monopoly / cartel</th><td>Output (or price) jointly</td><td>—</td><td>(a − c)/2b</td><td>Highest price; maximum joint profit</td></tr>
        <tr><th>Cournot (n firms)</th><td>Quantities</td><td>Simultaneous</td><td>n(a − c)/((n + 1)b)</td><td>P &gt; MC; profit falls as n rises</td></tr>
        <tr><th>Stackelberg</th><td>Quantities</td><td>Leader first, follower second</td><td>3(a − c)/4b</td><td>Leader earns more than in Cournot, follower less</td></tr>
        <tr><th>Bertrand, identical goods</th><td>Prices</td><td>Simultaneous</td><td>(a − c)/b</td><td>P = MC; zero profit (the Bertrand paradox)</td></tr>
        <tr><th>Bertrand, differentiated goods</th><td>Prices</td><td>Simultaneous</td><td>Between Cournot and competition</td><td>P &gt; MC; positive profit</td></tr>
        <tr><th>Price leadership</th><td>Leader sets price; fringe takes it</td><td>Leader first</td><td>Leader: MR on residual demand = MC</td><td>Leader earns supernormal profit; fringe is a price taker</td></tr>
        <tr><th>Kinked demand</th><td>Price</td><td>Rivals match cuts, ignore rises</td><td>At the kink</td><td>Explains sticky prices, not how the price was set</td></tr>
        <tr><th>Perfect competition</th><td>Price takers</td><td>—</td><td>(a − c)/b</td><td>P = MC; normal profit in the long run</td></tr>
      </tbody>
    </table></div>`;
  const oligopolyCompare = {
    id: 'oligopoly-compare',
    title: 'Comparing oligopoly models',
    summary: 'The same market can end up anywhere between the monopoly outcome and the competitive one, depending on what firms compete over (quantities or prices), whether they move together or in turn, and how many there are. With linear demand and equal costs, output ranks monopoly < Cournot duopoly < Stackelberg < Bertrand = perfect competition, and price ranks the other way.',
    model: 'Market demand P = 24 − Q; every firm has the same constant MC = c. Monopoly is also the outcome of a perfect cartel. Stackelberg is a duopoly; Cournot has n firms. Bertrand with identical goods gives the competitive outcome, P = MC.',
    graph: {
      layout: 'row',
      params: [
        { id: 'c', label: 'Marginal cost (c)', min: 0, max: 16, step: 0.5, value: 4 },
        { id: 'n', label: 'Number of Cournot firms (n)', min: 2, max: 20, step: 1, value: 2 },
        { id: 'focus', label: 'Shade the welfare for', options: MODELS.map((label, v) => ({ v, label })), value: 1 },
      ],
      panels: [
        {
          title: 'One market, four models',
          x: { range: [0, 24], label: 'Market output (Q)' },
          y: { range: [0, 24], label: 'Price ($)', ticks: range(0, 24, 4) },
          draw(s) {
            const o = outcomes(s), z = o[s.focus], m = OA - s.c, out = [];
            out.push(A([[0, OA], [0, z.p], [z.Q, z.p]], 'd', z.Q > 7 ? 'CS' : ''));
            if (z.Q < m - 0.01) out.push(A([[0, z.p], [z.Q, z.p], [z.Q, s.c], [0, s.c]], 'g', z.p - s.c > 2.5 ? 'Profit' : ''));
            if (z.Q < m - 0.01) out.push(A([[z.Q, z.p], [m, s.c], [z.Q, s.c]], 'r', m - z.Q > 5 ? 'DWL' : ''));
            out.push(
              C((x) => OA - x, 'd', 'D', { to: 24 }),
              Hl(s.c, 's', 'MC', { labelLeft: true }),
              P(o[0].Q, o[0].p, 'Monopoly', s.focus === 0 ? 'o' : 'n', { small: s.focus !== 0 }),
              P(o[2].Q, o[2].p, 'Stackelberg', s.focus === 2 ? 'o' : 'n', { small: s.focus !== 2 }),
              P(o[1].Q, o[1].p, 'Cournot', s.focus === 1 ? 'o' : 'n', { small: s.focus !== 1, dx: -9, dy: 16 }),
              P(o[3].Q, o[3].p, 'Bertrand = competition', s.focus === 3 ? 'o' : 'n', { small: s.focus !== 3, dx: -6, dy: 17 }),
              G(z.Q, z.p, 'Q', 'P'),
            );
            return out;
          },
        },
        {
          title: 'Cournot price as the number of firms grows',
          x: { range: [1, 20], label: 'Number of firms (n)', ticks: [1, 2, 5, 10, 15, 20], fmt: (v) => String(v) },
          y: { range: [0, 24], label: 'Price ($)', ticks: range(0, 24, 4) },
          draw(s) {
            const pn = (k) => (OA + k * s.c) / (k + 1), o = outcomes(s);
            return [
              Hl((OA + s.c) / 2, 'ghost', 'Monopoly (n = 1)'),
              Hl(o[2].p, 'n', 'Stackelberg', { dash: true }),
              Hl(s.c, 's', 'P = MC (Bertrand)'),
              C(pn, 'd', 'Cournot price', { from: 1, to: 20, labelAt: s.n < 10 ? 14 : 2.2 }),
              G(s.n, pn(s.n), 'n', null),
              P(s.n, pn(s.n), ''),
            ];
          },
        },
      ],
      readout(s) {
        const o = outcomes(s), z = o[s.focus];
        const rank = s.n === 3 ? 'Cournot with 3 firms gives the same output as a Stackelberg duopoly.' : s.n > 3 ? `With ${s.n} firms, Cournot output is above the Stackelberg duopoly’s.` : 'Output: monopoly < Cournot < Stackelberg < Bertrand; price ranks the other way.';
        return {
          rows: [
            ...o.map((x) => [`${x.name}: Q at P`, `${f(x.Q)} at ${money(x.p)}`]),
            [`${z.name}: CS / profit / DWL`, `${money(z.cs)} / ${money(z.profit)} / ${money(z.dwl)}`],
            [`${z.name}: Lerner index (P − MC)/P`, f(z.lerner)],
          ],
          status: `${rank} As n grows, the Cournot price falls from the monopoly price toward MC: ${money(o[1].p)} with ${s.n} firms.`,
          tone: 'info',
        };
      },
    },
    extra: compareTable,
    equations: [
      { name: 'Monopoly or perfect cartel', tex: R`Q_m = \frac{a - c}{2b}` },
      { name: 'Cournot with n identical firms', tex: R`q_i = \frac{a - c}{(n + 1)b},\qquad Q = \frac{n}{n + 1}\cdot\frac{a - c}{b},\qquad P = \frac{a + nc}{n + 1}`, note: 'n = 1 gives monopoly; as n → ∞, P → c.' },
      { name: 'Stackelberg duopoly', tex: R`Q = \frac{3}{4}\cdot\frac{a - c}{b},\qquad q_L = 2q_F` },
      { name: 'Bertrand, identical goods', tex: R`P = c,\qquad Q = \frac{a - c}{b},\qquad \pi = 0` },
      { name: 'Deadweight loss with linear demand', tex: R`DWL = \tfrac{1}{2}\,b\,(Q_c - Q)^2,\qquad Q_c = \frac{a - c}{b}`, note: 'The welfare loss shrinks as output approaches the competitive level.' },
    ],
    points: [
      'What firms choose matters: competing in quantities (Cournot) keeps price above MC; competing in prices with identical goods (Bertrand) drives it to MC with just two firms.',
      'Timing matters: a Stackelberg leader’s commitment raises total output above Cournot and shifts profit from the follower to the leader.',
      'Numbers matter in Cournot: each extra firm raises output and lowers price, and the outcome approaches perfect competition as n grows. In Bertrand the number of firms does not matter once there are two.',
      'Collusion pushes the outcome back to the monopoly point, but it must survive each member’s incentive to cheat.',
      'Ways out of the Bertrand paradox: product differentiation, capacity limits (which lead back to Cournot-like outcomes), and repeated interaction.',
      'Welfare: consumer surplus rises and deadweight loss falls as you move from monopoly toward competition; industry profit does the opposite.',
    ],
    tip: 'In a comparison question, set out a small table: Q, P, profit per firm, CS and DWL for each model, using the same demand and cost. State the ranking and explain each step with the model’s assumption (strategic variable, timing, number of firms).',
  };

  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  insertAfter('collusion', priceLeadership, MICRO, 'Blocks 6–8');
  insertAfter('price-leadership', oligopolyCompare, MICRO, 'Blocks 6–8');
})();
