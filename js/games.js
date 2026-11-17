/* Game theory topics: an editable 2×2 game with presets and a sequential entry game,
   and the prisoner’s dilemma with the repeated-game (grim trigger) condition.
   A topic's `game` is rendered by app.js as a payoff matrix with best responses marked
   and the equilibria worked out. Payoffs are listed as [row player, column player]. */
(function () {
  const { R, f, money, C, V, Hl, P, G, A, S, T, range } = window.TOPIC_KIT;
  const MICRO = 'Microeconomics';

  const PRESETS = [
    {
      name: 'Prisoner’s dilemma', rowName: 'Prisoner A', colName: 'Prisoner B',
      rows: ['Confess', 'Stay silent'], cols: ['Confess', 'Stay silent'],
      pay: [[[-5, -5], [0, -10]], [[-10, 0], [-1, -1]]],
      note: 'Payoffs are years in prison as negative numbers. Confessing is dominant for both, so both confess, although both staying silent would leave each better off.',
    },
    {
      name: 'Cartel pricing', rowName: 'Firm A', colName: 'Firm B',
      rows: ['Keep price high', 'Cut price'], cols: ['Keep price high', 'Cut price'],
      pay: [[[10, 10], [2, 15]], [[15, 2], [5, 5]]],
      note: 'Profits in £m. Each firm gains by undercutting whatever the other does, so the cartel breaks down to (cut, cut): an oligopoly prisoner’s dilemma.',
    },
    {
      name: 'Iterated dominance', rowName: 'Firm A', colName: 'Firm B',
      rows: ['Launch now', 'Wait'], cols: ['Launch now', 'Wait'],
      pay: [[[3, 1], [5, 4]], [[2, 5], [1, 3]]],
      note: 'Only A has a dominant strategy (launch). B has none, but knowing A will launch, B waits. The equilibrium is found by eliminating A’s dominated strategy first.',
    },
    {
      name: 'Coordination (standards)', rowName: 'Firm A', colName: 'Firm B',
      rows: ['Standard X', 'Standard Y'], cols: ['Standard X', 'Standard Y'],
      pay: [[[3, 2], [0, 0]], [[0, 0], [2, 3]]],
      note: 'Both gain from matching but disagree on which standard. Two pure equilibria and a mixed one: game theory alone does not say which will happen.',
    },
    {
      name: 'Chicken (price war)', rowName: 'Firm A', colName: 'Firm B',
      rows: ['Back down', 'Fight'], cols: ['Back down', 'Fight'],
      pay: [[[3, 3], [1, 5]], [[5, 1], [0, 0]]],
      note: 'Each wants the other to back down; a mutual fight is worst for both. Two pure equilibria, each with one firm backing down, so commitment to fighting is valuable.',
    },
    {
      name: 'Matching pennies (inspection)', rowName: 'Inspector', colName: 'Firm',
      rows: ['Inspect', 'Don’t inspect'], cols: ['Cheat', 'Comply'],
      pay: [[[1, -1], [-1, 1]], [[-1, 1], [1, -1]]],
      note: 'A zero-sum game with no pure-strategy equilibrium: whatever one player does, the other wants to switch. The only equilibrium is in mixed strategies.',
    },
  ];

  // Sequential entry game drawn as a tree; backward induction path highlighted.
  const entryTree = `
    <h2>Sequential games: entry deterrence</h2>
    <p class="extra-lede">Some games are played in turn. Solve them by <strong>backward induction</strong>: start at the last move, work out what that player will do, then go back to the earlier move. The result is a <strong>subgame-perfect equilibrium</strong>.</p>
    <div class="graph-wrap"><svg class="graph diagram" viewBox="0 0 560 250" role="img" aria-label="Entry game tree">
      <defs><marker id="gt-o" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="p-o"/></marker></defs>
      <path class="flow k-ghost dashed" d="M70 125 L250 205"/>
      <path class="flow k-o" d="M70 125 L250 55" marker-end="url(#gt-o)"/>
      <path class="flow k-ghost dashed" d="M262 50 L430 25"/>
      <path class="flow k-o" d="M262 60 L430 95" marker-end="url(#gt-o)"/>
      <g class="node"><rect x="20" y="105" width="100" height="40" rx="6"/><text x="70" y="130" text-anchor="middle">Entrant</text></g>
      <g class="node"><rect x="200" y="35" width="120" height="40" rx="6"/><text x="260" y="60" text-anchor="middle">Incumbent</text></g>
      <text class="flabel t-o" x="140" y="78" text-anchor="middle">Enter</text>
      <text class="flabel t-n" x="150" y="185" text-anchor="middle">Stay out</text>
      <text class="flabel t-n" x="345" y="28" text-anchor="middle">Fight</text>
      <text class="flabel t-o" x="345" y="96" text-anchor="middle">Accommodate</text>
      <text class="flabel t-n" x="440" y="30">(−2, 2)</text>
      <text class="flabel t-o" x="440" y="100">(3, 5)</text>
      <text class="flabel t-o" x="440" y="116">equilibrium</text>
      <text class="flabel t-n" x="260" y="210">(0, 10)</text>
      <text class="flabel t-n" x="20" y="240">Payoffs: (entrant, incumbent)</text>
    </svg></div>
    <ol class="extra-steps">
      <li>Last move first: if the entrant has entered, the incumbent compares fighting (2) with accommodating (5) and accommodates.</li>
      <li>Back to the entrant: entering gives 3 (because the incumbent will accommodate), staying out gives 0, so it enters.</li>
      <li>Equilibrium: (Enter, Accommodate). The incumbent’s threat to fight is <strong>not credible</strong>: once entry has happened, fighting would hurt it.</li>
      <li>To deter entry the incumbent needs a <strong>commitment</strong> that changes its own payoffs, such as building spare capacity in advance so that fighting becomes its best response.</li>
    </ol>`;

  const gameTheory = {
    id: 'game-theory',
    title: 'Game theory',
    summary: 'Game theory studies decisions where each player’s payoff depends on what others do, as in oligopoly. A game lists the players, their strategies and their payoffs. The central idea is Nash equilibrium: a set of strategies where nobody can do better by changing only their own choice.',
    game: { editable: true, presets: PRESETS },
    extra: entryTree,
    equations: [
      { name: 'Best response', tex: R`BR_A(s_B) = \arg\max_{s_A}\ \pi_A(s_A, s_B)`, note: 'A’s payoff-maximising strategy for each strategy of B.' },
      { name: 'Nash equilibrium', tex: R`s_A^* = BR_A(s_B^*) \quad\text{and}\quad s_B^* = BR_B(s_A^*)`, note: 'Each strategy is a best response to the other: no profitable unilateral deviation.' },
      { name: 'Strictly dominant strategy', tex: R`\pi_A(s_A^d, s_B) > \pi_A(s_A, s_B)\ \text{for every } s_B \text{ and every } s_A \ne s_A^d`, note: 'Best whatever the rival does. A dominant-strategy equilibrium is also a Nash equilibrium.' },
      { name: 'Mixed strategy (2×2)', tex: R`p\,\pi_B(r_1, c_1) + (1 - p)\,\pi_B(r_2, c_1) = p\,\pi_B(r_1, c_2) + (1 - p)\,\pi_B(r_2, c_2)`, note: 'A chooses the probability p of its first row that leaves B indifferent between its columns (and vice versa).' },
      { name: 'Pareto efficiency of an outcome', tex: R`\nexists\ \text{outcome with } \pi_A' \ge \pi_A,\ \pi_B' \ge \pi_B,\ \text{one strictly}`, note: 'An equilibrium need not be Pareto efficient: that is the prisoner’s dilemma.' },
    ],
    points: [
      'Find pure-strategy Nash equilibria by underlining each player’s best response in every row and column; a cell with both payoffs underlined is an equilibrium.',
      'Look for dominant strategies first; if a player has one, the other can predict it. Removing dominated strategies step by step (iterated dominance) can solve games where only one player has a dominant strategy.',
      'A game can have no pure equilibrium (matching pennies), one, or several (coordination, chicken). Every finite game has at least one equilibrium once mixed strategies are allowed.',
      'Simultaneous games are shown in a payoff matrix (normal form); sequential games in a game tree (extensive form), solved by backward induction.',
      'Credibility matters: a threat or promise only shapes behaviour if carrying it out would be in the player’s interest when the time comes.',
    ],
    tip: 'Write each payoff pair as (row player, column player), underline best responses, then state the equilibrium and whether it is Pareto efficient. For a sequential game, solve from the last move backwards.',
  };

  /* ── Prisoner's dilemma and the repeated game ── */
  const pdGame = (s) => ({
    rowName: 'Firm A', colName: 'Firm B',
    rows: ['Cooperate (collude)', 'Defect (cheat)'], cols: ['Cooperate (collude)', 'Defect (cheat)'],
    pay: [[[s.R, s.R], [s.S, s.T]], [[s.T, s.S], [s.P, s.P]]],
  });
  const crit = (s) => (s.T - s.R) / (s.T - s.P);
  const prisonersDilemma = {
    id: 'prisoners-dilemma',
    title: 'Prisoner’s dilemma and repeated games',
    summary: 'In a prisoner’s dilemma each player has a dominant strategy to defect, yet both would be better off cooperating. This explains why cartels are unstable. If the game is repeated indefinitely, cooperation can be sustained by the threat of future punishment, provided players value the future enough.',
    model: 'Payoffs per period: R (both cooperate), T (temptation: you defect, rival cooperates), P (both defect, the punishment), S (sucker: you cooperate, rival defects), with T > R > P > S. Grim trigger: cooperate until the rival defects, then defect for ever. δ is the discount factor (how much next period’s payoff is worth today).',
    game: { fromState: pdGame },
    graph: {
      x: { range: [0, 1], label: 'Discount factor δ', ticks: [0, 0.2, 0.4, 0.6, 0.8, 1], fmt: (v) => String(v) },
      y: { range: [0, 60], label: 'Present value of payoffs', ticks: range(0, 60, 10) },
      params: [
        { id: 'T', label: 'Temptation T (you cheat, rival colludes)', min: 2, max: 20, step: 0.5, value: 15 },
        { id: 'R', label: 'Reward R (both collude)', min: 1, max: 19, step: 0.5, value: 10 },
        { id: 'P', label: 'Punishment P (both cheat)', min: 0.5, max: 18, step: 0.5, value: 5 },
        { id: 'S', label: 'Sucker’s payoff S (you collude, rival cheats)', min: 0, max: 17, step: 0.5, value: 2 },
        { id: 'd', label: 'Discount factor δ', min: 0, max: 0.95, step: 0.01, value: 0.6 },
      ],
      valid(s) {
        if (!(s.T > s.R)) return 'For a prisoner’s dilemma the temptation T must exceed the reward R; otherwise cheating would not pay.';
        if (!(s.R > s.P)) return 'For a prisoner’s dilemma both colluding (R) must beat both cheating (P); otherwise there is no dilemma.';
        if (!(s.P > s.S)) return 'For a prisoner’s dilemma being cheated (S) must be worse than mutual cheating (P); otherwise defecting is not dominant.';
        return true;
      },
      draw(s) {
        const dc = crit(s), coop = (d) => s.R / (1 - d), dev = (d) => s.T + (d * s.P) / (1 - d);
        return [
          C(coop, 'g', 'Collude for ever: R/(1 − δ)', { to: 0.97, labelAt: 0.7 }),
          C(dev, 's', 'Cheat once: T + δP/(1 − δ)', { to: 0.97, labelAt: 0.04 }),
          V(dc, 'ghost', `δ* = ${dc.toFixed(2)}`),
          P(dc, coop(dc), '', 'n', { small: true }),
          G(s.d, Math.max(coop(s.d), dev(s.d)), 'δ', null, 'o'),
          P(s.d, coop(s.d), '', 'g'),
          P(s.d, dev(s.d), '', 's'),
        ];
      },
      readout(s) {
        const dc = crit(s), coop = s.R / (1 - s.d), dev = s.T + (s.d * s.P) / (1 - s.d), ok = s.d >= dc;
        return {
          rows: [['Critical discount factor δ*', f(dc)], ['Your δ', f(s.d)], ['PV of colluding for ever', f(coop)], ['PV of cheating once, then punished', f(dev)], ['One-shot gain from cheating', f(s.T - s.R)], ['Loss per period once punished', f(s.R - s.P)]],
          status: ok
            ? `δ ≥ δ*: the future loss from punishment outweighs the one-off gain from cheating, so collusion can be sustained in the repeated game.`
            : `δ < δ*: firms are too impatient; the one-off gain from cheating beats the future loss, so the cartel breaks down even with repetition.`,
          tone: ok ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Prisoner’s dilemma payoffs', tex: R`T > R > P > S`, note: 'Temptation > reward > punishment > sucker.' },
      { name: 'One-shot outcome', tex: R`\text{Defect is strictly dominant} \Rightarrow (D, D) \text{ with payoffs } (P, P) < (R, R)`, note: 'The unique Nash equilibrium is Pareto inefficient.' },
      { name: 'Value of colluding for ever', tex: R`R + \delta R + \delta^2 R + \dots = \frac{R}{1 - \delta}`, note: 'δ is the discount factor, between 0 and 1.' },
      { name: 'Value of cheating under grim trigger', tex: R`T + \delta P + \delta^2 P + \dots = T + \frac{\delta P}{1 - \delta}`, note: 'One period of temptation, then punishment for ever.' },
      { name: 'Condition for collusion', tex: R`\frac{R}{1 - \delta} \ge T + \frac{\delta P}{1 - \delta} \iff \delta \ge \delta^* = \frac{T - R}{T - P}`, note: 'Patient players (high δ) can sustain cooperation.' },
    ],
    points: [
      'The dilemma: individually rational choices (defect) give a collectively worse outcome than cooperation.',
      'Oligopoly application: each cartel member gains by secretly cutting price or raising output, so cartels tend to break down without enforcement.',
      'Repetition helps: with an indefinite horizon, strategies such as grim trigger or tit-for-tat punish cheating in later periods.',
      'Collusion is easier with few firms, frequent interaction, easy detection of cheating, and patient firms (high δ). It is harder with a known final period, which unravels by backward induction.',
      'Other examples: arms races, advertising wars, overfishing and other common-resource problems, climate agreements.',
    ],
    tip: 'Show the matrix, underline best responses to prove defection is dominant, then point out that (cooperate, cooperate) Pareto-dominates the equilibrium. For repeated games, compare R/(1 − δ) with T + δP/(1 − δ).',
  };

  /* ── Collusion and cartels ── */
  // Demand P = 24 − Q, n identical firms with constant MC = c. The cartel sets the monopoly output
  // and shares it equally. A cheat takes the others' quotas as given and maximises on the residual
  // demand. Grim trigger: after cheating, either Cournot for ever or a price war (P = MC, zero profit).
  const CA = 24;
  const cartel = (s) => {
    const n = s.n, m = CA - s.c;
    const Qm = m / 2, Pm = CA - Qm, quota = Qm / n, piC = (Pm - s.c) * quota;
    const aRes = CA - (n - 1) * quota;                  // residual demand intercept for a cheat
    const qD = (aRes - s.c) / 2, PD = aRes - qD, piD = (PD - s.c) * qD;
    const piRest = (PD - s.c) * quota;                  // each loyal member's profit after the cheat
    const qN = m / (n + 1), PN = CA - n * qN, piN = (PN - s.c) * qN;
    const war = s.pun === 1, piP = war ? 0 : piN;
    const dStar = (piD - piC) / (piD - piP);
    return { n, m, Qm, Pm, quota, piC, aRes, qD, PD, piD, piRest, qN, PN, piN, piP, war, dStar };
  };
  const collusion = {
    id: 'collusion',
    title: 'Collusion and cartels',
    summary: 'A cartel is a group of firms that agree to act like one monopolist: they cut total output to the monopoly level, share it out as quotas and split the monopoly profit. Every member, though, gains by secretly producing more than its quota, so cartels are unstable. They hold together only if cheating can be detected and punished, and firms value future profits enough.',
    model: 'Market demand P = 24 − Q; n identical firms, each with constant MC = c. The cartel produces the monopoly output and gives each firm an equal quota. A cheat assumes the others keep to their quotas, so it faces the residual demand P = (24 − (n − 1) × quota) − q. Grim trigger: once anyone cheats, the cartel collapses for ever, either to Cournot competition or to a price war at P = MC.',
    graph: {
      layout: 'row',
      params: [
        { id: 'n', label: 'Number of firms in the cartel (n)', min: 2, max: 6, step: 1, value: 2 },
        { id: 'c', label: 'Marginal cost (c)', min: 0, max: 16, step: 0.5, value: 4 },
        { id: 'd', label: 'Discount factor δ', min: 0, max: 0.95, step: 0.01, value: 0.6 },
        { id: 'pun', label: 'Punishment after cheating', options: [{ v: 0, label: 'Cournot for ever' }, { v: 1, label: 'Price war (P = MC)' }], value: 0 },
      ],
      panels: [
        {
          title: 'Industry: the cartel acts as a monopolist',
          x: { range: [0, 24], label: 'Industry output (Q)' },
          y: { range: [0, 24], label: 'Price ($)', ticks: range(0, 24, 4) },
          draw(s) {
            const z = cartel(s);
            return [
              A([[0, z.Pm], [z.Qm, z.Pm], [z.Qm, s.c], [0, s.c]], 'g', ''),
              s.c <= 9.5 ? T(0.6, s.c + 0.4 * (z.Pm - s.c), 'Cartel profit', 'g') : null,
              C((q) => CA - q, 'd', 'D', { to: 24 }),
              C((q) => CA - 2 * q, 'g', 'MR', { to: 12, labelAt: 10.6 }),
              Hl(s.c, 's', 'MC', { labelLeft: true }),
              P(z.n * z.qN, z.PN, 'Cournot', 'n', { small: true, dx: 9 }),
              P(z.m, s.c, 'P = MC', 'n', { small: true, dx: 6, dy: -8 }),
              G(z.Qm, z.Pm, 'Q_m', 'P_m'),
              P(z.Qm, z.Pm, 'Cartel'),
            ];
          },
        },
        {
          title: 'One member: keep to the quota or cheat?',
          x: { range: [0, 16], label: 'Member’s output (q)' },
          y: { range: [0, 24], label: 'Price and cost ($)', ticks: range(0, 24, 4) },
          draw(s) {
            const z = cartel(s);
            return [
              A([[0, z.PD], [z.qD, z.PD], [z.qD, s.c], [0, s.c]], 'o', z.qD > 5.5 && z.PD - s.c > 2.5 ? 'Profit if it cheats' : ''),
              S(0, z.Pm, z.quota, z.Pm, 'g', '', { dash: true }),
              S(z.quota, z.Pm, z.quota, s.c, 'g', '', { dash: true }),
              C((q) => z.aRes - q, 'd', 'Residual demand', { to: z.aRes, labelAt: Math.min(z.aRes - 3, 13) }),
              C((q) => z.aRes - 2 * q, 'g', 'MR', { to: z.aRes / 2, labelAt: z.aRes / 2 - 1.2 }),
              Hl(s.c, 's', 'MC'),
              G(z.quota, z.Pm, 'quota', 'P_m', 'g'),
              P(z.quota, z.Pm, 'Keep quota', 'g'),
              G(z.qD, z.PD, 'q_cheat', null),
              P(z.qD, z.PD, 'Cheat'),
            ];
          },
        },
      ],
      readout(s) {
        const z = cartel(s), ok = s.d >= z.dStar - 1e-9;
        return {
          rows: [
            ['Cartel output / price', `${f(z.Qm)} / ${money(z.Pm)}`],
            ['Quota and profit per member', `${f(z.quota)} / ${money(z.piC)}`],
            ['A cheat’s best output / its profit', `${f(z.qD)} / ${money(z.piD)}`],
            ['Each loyal member’s profit once cheated on', money(z.piRest)],
            [z.war ? 'Profit per member in a price war' : 'Profit per member under Cournot', money(z.piP)],
            ['Critical discount factor δ*', f(z.dStar)],
          ],
          status: ok
            ? `δ = ${f(s.d)} ≥ δ* = ${f(z.dStar)}: the one-off gain from cheating (${money(z.piD - z.piC)}) is outweighed by the profit lost once the cartel collapses (${money(z.piC - z.piP)} every period), so the cartel holds.`
            : `δ = ${f(s.d)} < δ* = ${f(z.dStar)}: each member gains ${money(z.piD - z.piC)} by cheating now and the future punishment is not enough to stop it, so the cartel breaks down.`,
          tone: ok ? 'good' : 'warn',
        };
      },
    },
    equations: [
      { name: 'Joint profit maximisation', tex: R`MR(Q) = MC \;\Rightarrow\; Q_m,\qquad \text{quota} = \frac{Q_m}{n}`, note: 'The cartel behaves like a multi-plant monopolist and shares out the monopoly output.' },
      { name: 'Incentive to cheat', tex: R`MR_i = P_m - b\,q_i > MC \;\text{ at the quota}`, note: 'On its residual demand, each member’s MR at the quota is above MC, so producing more raises its own profit.' },
      { name: 'Cheat’s best response (linear demand)', tex: R`q_{cheat} = \frac{a - c - (n - 1)\,\text{quota}}{2b}`, note: 'MR = MC on the residual demand left by the other members’ quotas.' },
      { name: 'Grim-trigger condition', tex: R`\frac{\pi_C}{1 - \delta} \ge \pi_D + \frac{\delta\,\pi_P}{1 - \delta} \iff \delta \ge \delta^* = \frac{\pi_D - \pi_C}{\pi_D - \pi_P}`, note: 'π_C cartel share, π_D profit from cheating, π_P profit once punished. Same as (T − R)/(T − P).' },
      { name: 'Two firms, linear demand, Cournot punishment', tex: R`\begin{aligned} \pi_C &= \frac{(a-c)^2}{8b} \\[4pt] \pi_D &= \frac{9(a-c)^2}{64b} \\[4pt] \pi_N &= \frac{(a-c)^2}{9b} \\[4pt] \delta^* &= \frac{\pi_D - \pi_C}{\pi_D - \pi_N} = \frac{9}{17} \approx 0.53 \end{aligned}`, note: 'Top to bottom: each firm’s profit in the cartel, a cheat’s profit while its rival keeps to its quota, each firm’s profit under Cournot, and the critical discount factor. If the punishment is a price war (zero profit after cheating), the critical discount factor falls to 1/9 ≈ 0.11.' },
    ],
    points: [
      'A cartel restricts output and raises price to the monopoly level: consumers lose and there is a deadweight loss, just as under monopoly.',
      'Every member has an incentive to cheat: at the cartel price its MR on the residual demand is above MC. If all cheat, output rises towards the Cournot level. This is a prisoner’s dilemma.',
      'Collusion is easier with few firms (δ* rises with n), similar costs and products, transparent prices so cheating is seen quickly, frequent interaction, stable demand, barriers to entry and harsh punishment.',
      'A harsher punishment (a price war rather than Cournot) lowers δ*, so the threat makes collusion easier to sustain, provided it is credible.',
      'Explicit collusion (price fixing, market sharing) is illegal under competition law in the UK and EU; leniency programmes reward the first member to confess, turning the cartel into a prisoner’s dilemma against itself. Tacit collusion, such as price leadership, involves no agreement and is hard to prosecute.',
      'Example: OPEC sets production quotas for its members; quota breaking and price collapses (1986, 2014) show the instability.',
    ],
    tip: 'Draw the industry and one member side by side. Show the cartel price and quota, then the member’s residual demand with MR above MC at the quota, and the larger output it would choose. Finish with the repeated-game condition δ ≥ (π_D − π_C)/(π_D − π_P) and list the factors that make collusion easier.',
  };

  const insertAfter = (id, topic, unit, block) => {
    const i = window.TOPICS.findIndex((t) => t.id === id);
    window.TOPICS.splice(i + 1, 0, Object.assign(topic, { unit, block }));
  };
  insertAfter('kinked-demand', gameTheory, MICRO, 'Blocks 6–8');
  insertAfter('game-theory', prisonersDilemma, MICRO, 'Blocks 6–8');
  insertAfter('prisoners-dilemma', collusion, MICRO, 'Blocks 6–8');
  window.GAME_PRESETS = PRESETS;
})();
