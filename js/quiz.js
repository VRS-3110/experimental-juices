/* Practice quiz built on the worked answers.
   Calculation questions are generators: each call picks new numbers, so the quiz tests
   the method, not memory of the example. Concept questions are fixed multiple choice.
   Every item names the worked answer it tests (worked: id). */
(function () {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const int = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const n = (v, dp = 2) => String(+(+v).toFixed(dp)); // trim trailing zeros
  const money = (v) => (v < 0 ? '−' : '') + n(Math.abs(v));
  // A linear direct function written the way the guide writes it: Q = a − bP.
  const lin = (lhs, a, b, v = 'P') => `${lhs} = ${a < 0 ? '−' + Math.abs(a) : a} ${b < 0 ? '−' : '+'} ${Math.abs(b)}${v}`;

  // Market with clean equilibrium: Q_D = a − bP, Q_S = c + dP, equilibrium (P*, Q*) chosen first.
  const market = (b, d) => {
    const P = int(4, 9), Q = pick([30, 40, 50, 60]);
    return { a: Q + b * P, b, c: Q - d * P, d, P, Q };
  };

  const generators = [
    {
      worked: 'w-comparative-advantage', topic: 'ppf',
      gen() {
        const [ac, at] = pick([[10, 5], [12, 4], [8, 4], [9, 3]]);
        const [bc, bt] = pick([[6, 2], [6, 3], [10, 2], [4, 2]]).map((x) => x);
        const ocA = at / ac, ocB = bt / bc;
        if (Math.abs(ocA - ocB) < 1e-9) return this.gen();
        const cheaper = ocA < ocB ? 0 : 1;
        return {
          q: `In a day a worker in A makes ${ac} cloth or ${at} tea; a worker in B makes ${bc} cloth or ${bt} tea.`,
          parts: [
            { label: 'Opportunity cost of 1 cloth in A (units of tea)', answer: ocA },
            { label: 'Opportunity cost of 1 cloth in B (units of tea)', answer: ocB },
            { label: 'Which country should specialise in cloth?', choices: ['A', 'B'], correct: cheaper },
          ],
          solution: [
            `OC of cloth = tea given up ÷ cloth gained: A = ${at}/${ac} = ${n(ocA)}, B = ${bt}/${bc} = ${n(ocB)}.`,
            `The lower opportunity cost is ${cheaper ? 'B' : 'A'}, so ${cheaper ? 'B' : 'A'} has the comparative advantage in cloth.`,
          ],
        };
      },
    },
    {
      worked: 'w-equilibrium-surplus', topic: 'supply-demand',
      gen() {
        const m = market(pick([2, 5, 10]), pick([5, 10]));
        const cs = (m.Q * m.Q) / (2 * m.b);
        return {
          q: `${lin('Q_D', m.a, -m.b)} and ${lin('Q_S', m.c, m.d)}.`,
          parts: [
            { label: 'Equilibrium price P*', answer: m.P },
            { label: 'Equilibrium quantity Q*', answer: m.Q },
            { label: 'Consumer surplus', answer: cs },
          ],
          solution: [
            `Set Q_D = Q_S: ${m.a} − ${m.b}P = ${m.c} + ${m.d}P → ${m.a - m.c} = ${m.b + m.d}P → P* = ${m.P}.`,
            `Q* = ${m.a} − ${m.b}(${m.P}) = ${m.Q}.`,
            `Choke price = ${m.a}/${m.b} = ${n(m.a / m.b)}. CS = ½ × (${n(m.a / m.b)} − ${m.P}) × ${m.Q} = ${n(cs)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-price-ceiling', topic: 'price-controls',
      gen() {
        const d = pick([5, 10]), m = market(pick([5, 10]), d);
        const k = int(1, 3), pc = m.P - k, qs = m.Q - d * k, qd = m.Q + m.b * k;
        if (qs <= 0) return this.gen();
        return {
          q: `${lin('Q_D', m.a, -m.b)}, ${lin('Q_S', m.c, m.d)} (equilibrium P = ${m.P}). A price ceiling is set at ${pc}.`,
          parts: [
            { label: 'Shortage', answer: qd - qs },
            { label: 'Quantity actually traded', answer: qs },
          ],
          solution: [
            `At P = ${pc}: Q_D = ${m.a} − ${m.b}(${pc}) = ${qd}; Q_S = ${m.c} + ${m.d}(${pc}) = ${qs}.`,
            `Shortage = ${qd} − ${qs} = ${qd - qs}. The short side decides trade, so ${qs} units are traded.`,
          ],
        };
      },
    },
    {
      worked: 'w-elasticity', topic: 'elasticity',
      gen() {
        const a = pick([60, 80, 100, 120]), b = pick([2, 4, 5, 10]);
        const P = int(1, Math.floor(a / b) - 1), Q = a - b * P, ped = (-b * P) / Q;
        return {
          q: `Demand is ${lin('Q', a, -b)}.`,
          parts: [
            { label: `Point price elasticity of demand at P = ${P}`, answer: ped },
            { label: 'At that price, is demand…', choices: ['Elastic', 'Unit elastic', 'Inelastic'], correct: Math.abs(ped) > 1.0001 ? 0 : Math.abs(ped) < 0.9999 ? 2 : 1 },
            { label: 'Revenue-maximising price', answer: a / (2 * b) },
          ],
          solution: [
            `At P = ${P}, Q = ${a} − ${b}(${P}) = ${Q}. PED = (dQ/dP)(P/Q) = −${b} × ${P}/${Q} = ${n(ped)}.`,
            `|PED| ${Math.abs(ped) > 1 ? '> 1: elastic' : Math.abs(ped) < 1 ? '< 1: inelastic' : '= 1: unit elastic'}.`,
            `Revenue peaks where |PED| = 1, at the midpoint of linear demand: P = ${a}/(2 × ${b}) = ${n(a / (2 * b))}.`,
          ],
        };
      },
    },
    {
      worked: 'w-specific-tax', topic: 'tax-incidence',
      gen() {
        const [b, d] = pick([[5, 5], [10, 10], [5, 20], [20, 5]]), m = market(b, d);
        const t = pick([1, 2, 3]), dq = (t * b * d) / (b + d), qt = m.Q - dq;
        if (qt <= 0) return this.gen();
        const pb = m.P + (t * d) / (b + d);
        return {
          q: `${lin('Q_D', m.a, -m.b)} and ${lin('Q_S', m.c, m.d)} (equilibrium P = ${m.P}, Q = ${m.Q}). A specific tax of ${t} per unit is imposed on sellers.`,
          parts: [
            { label: 'New quantity traded Q_t', answer: qt },
            { label: 'Price buyers pay P_b', answer: pb },
            { label: 'Tax revenue', answer: t * qt },
            { label: 'Deadweight loss', answer: 0.5 * t * dq },
          ],
          solution: [
            `The tax shifts supply up by ${t}. Solve ${m.a} − ${m.b}P_b = ${m.c} + ${m.d}(P_b − ${t}): P_b = ${n(pb)}, P_s = ${n(pb - t)}.`,
            `Q_t = ${m.a} − ${m.b}(${n(pb)}) = ${n(qt)}.`,
            `Revenue = ${t} × ${n(qt)} = ${n(t * qt)}. DWL = ½ × ${t} × (${m.Q} − ${n(qt)}) = ${n(0.5 * t * dq)}.`,
            `Buyers bear ${n(pb - m.P)} of the ${t}: the share d/(b + d) = ${d}/${b + d}.`,
          ],
        };
      },
    },
    {
      worked: 'w-consumer-optimum', topic: 'consumer-choice',
      gen() {
        const al = pick([0.25, 0.5, 0.75]), M = pick([60, 80, 100, 120]), px = pick([2, 4, 5]), py = pick([2, 5, 10]);
        return {
          q: `U = X^{${al}}Y^{${1 - al}}, income M = ${M}, P_X = ${px}, P_Y = ${py}.`,
          parts: [
            { label: 'Optimal X*', answer: (al * M) / px },
            { label: 'Optimal Y*', answer: ((1 - al) * M) / py },
          ],
          solution: [
            `Tangency MU_X/MU_Y = P_X/P_Y gives (${al}/${1 - al})(Y/X) = ${px}/${py}.`,
            `With Cobb–Douglas, spending shares equal the exponents: X* = ${al} × ${M}/${px} = ${n((al * M) / px)}, Y* = ${1 - al} × ${M}/${py} = ${n(((1 - al) * M) / py)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-slutsky', topic: 'income-substitution',
      gen() {
        const M = pick([80, 120, 160]), p0 = pick([2, 4]), p1 = 4 * p0, py = pick([2, 4, 5]);
        const x0 = M / (2 * p0), x1 = M / (2 * p1), xc = x0 / 2;
        return {
          q: `U = X^{0.5}Y^{0.5}, M = ${M}, P_Y = ${py}. P_X rises from ${p0} to ${p1}.`,
          parts: [
            { label: 'Total change in X', answer: x1 - x0 },
            { label: 'Substitution effect (Hicks)', answer: xc - x0 },
            { label: 'Income effect', answer: x1 - xc },
          ],
          solution: [
            `Before: X₀ = 0.5 × ${M}/${p0} = ${n(x0)}. After: X₁ = 0.5 × ${M}/${p1} = ${n(x1)}. Total = ${n(x1 - x0)}.`,
            `Stay on U₀ at the new price ratio. The tangency gives Y/X = P_X/P_Y, so X′ = X₀ × √(P_X⁰/P_X¹) = ${n(x0)} × √(1/4) = ${n(xc)}.`,
            `SE = ${n(xc)} − ${n(x0)} = ${n(xc - x0)}. IE = ${n(x1)} − ${n(xc)} = ${n(x1 - xc)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-cost-min', topic: 'isoquant',
      gen() {
        const [w, r] = pick([[4, 16], [16, 4], [9, 1], [1, 9], [2, 8], [8, 2], [4, 4]]), Q = pick([10, 20, 30]);
        const L = Q * Math.sqrt(r / w), K = Q * Math.sqrt(w / r);
        return {
          q: `Q = L^{0.5}K^{0.5}, wage w = ${w}, rental rate r = ${r}. Produce Q = ${Q} at least cost.`,
          parts: [
            { label: 'Labour L', answer: L },
            { label: 'Capital K', answer: K },
            { label: 'Minimum cost', answer: w * L + r * K },
          ],
          solution: [
            `MP_L/MP_K = K/L = w/r = ${w}/${r}, so K = ${n(w / r)}L.`,
            `${Q} = √(L × ${n(w / r)}L) → L = ${n(L)}, K = ${n(K)}.`,
            `Cost = ${w}(${n(L)}) + ${r}(${n(K)}) = ${n(w * L + r * K)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-perfect-competition', topic: 'costs',
      gen() {
        const F = pick([16, 36, 64, 100]), c = pick([2, 4, 6]), q = int(Math.sqrt(F) + 2, Math.sqrt(F) + 8), P = c + 2 * q;
        const profit = P * q - (F + c * q + q * q), be = 2 * Math.sqrt(F) + c;
        return {
          q: `A price-taking firm has TC = ${F} + ${c}Q + Q². The market price is ${P}.`,
          parts: [
            { label: 'Profit-maximising output', answer: q },
            { label: 'Profit', answer: profit },
            { label: 'Break-even price (min ATC)', answer: be },
          ],
          solution: [
            `MC = ${c} + 2Q. Set P = MC: ${P} = ${c} + 2Q → Q = ${q}.`,
            `Profit = ${P}(${q}) − (${F} + ${c}(${q}) + ${q}²) = ${P * q} − ${F + c * q + q * q} = ${profit}.`,
            `ATC = ${F}/Q + ${c} + Q is lowest where ${F}/Q² = 1 → Q = ${Math.sqrt(F)}, ATC = ${n(be)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-monopoly', topic: 'monopoly',
      gen() {
        const b = pick([1, 2]), mc = pick([10, 20]), a = pick([60, 80, 100, 120]);
        const qm = (a - mc) / (2 * b), pm = (a + mc) / 2, qc = (a - mc) / b;
        return {
          q: `A monopolist faces P = ${a} − ${b === 1 ? '' : b}Q with constant MC = ${mc} and no fixed cost.`,
          parts: [
            { label: 'Output', answer: qm },
            { label: 'Price', answer: pm },
            { label: 'Profit', answer: (pm - mc) * qm },
            { label: 'Deadweight loss', answer: 0.5 * (pm - mc) * (qc - qm) },
          ],
          solution: [
            `MR = ${a} − ${2 * b}Q. MR = MC: Q = (${a} − ${mc})/${2 * b} = ${n(qm)}.`,
            `Price from demand: P = ${a} − ${b}(${n(qm)}) = ${n(pm)}. Profit = (${n(pm)} − ${mc}) × ${n(qm)} = ${n((pm - mc) * qm)}.`,
            `Competitive output P = MC: Q = ${n(qc)}. DWL = ½ × (${n(pm)} − ${mc}) × (${n(qc)} − ${n(qm)}) = ${n(0.5 * (pm - mc) * (qc - qm))}.`,
          ],
        };
      },
    },
    {
      worked: 'w-natural-monopoly', topic: 'natural-monopoly',
      gen() {
        const F = pick([18, 32, 42, 48]), root = Math.sqrt(100 - 2 * F), q = 10 + root, p = 12 - 0.5 * q;
        return {
          q: `A natural monopoly faces P = 12 − 0.5Q with MC = 2 and fixed cost F = ${F}.`,
          parts: [
            { label: 'Output under average-cost pricing', answer: q },
            { label: 'Price under average-cost pricing', answer: p },
            { label: 'Subsidy needed under marginal-cost pricing', answer: F },
          ],
          solution: [
            `P = AC: 12 − 0.5Q = 2 + ${F}/Q → 0.5Q² − 10Q + ${F} = 0 → Q = 10 ± ${n(root)}. Take the larger root: Q = ${n(q)}.`,
            `P = 12 − 0.5(${n(q)}) = ${n(p)}.`,
            `Under P = MC = 2 every unit earns zero margin, so the loss is the whole fixed cost: ${F}.`,
          ],
        };
      },
    },
    {
      worked: 'w-cournot', topic: 'cournot',
      gen() {
        const c = pick([10, 20, 30]), a = c + 3 * int(15, 40), q = (a - c) / 3, p = a - 2 * q;
        return {
          q: `Two Cournot firms face P = ${a} − Q, where Q = q_A + q_B. Both have MC = ${c}.`,
          parts: [
            { label: 'Output of each firm', answer: q },
            { label: 'Market price', answer: p },
            { label: 'Profit of each firm', answer: (p - c) * q },
          ],
          solution: [
            `MR_A = ${a} − 2q_A − q_B = ${c} → reaction function q_A = (${a - c} − q_B)/2.`,
            `By symmetry q = (${a - c} − q)/2 → q = ${n(q)}. Q = ${n(2 * q)}, P = ${n(p)}.`,
            `Profit each = (${n(p)} − ${c}) × ${n(q)} = ${n((p - c) * q)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-limit-pricing', topic: 'entry-barriers',
      gen() {
        const c = pick([10, 20]), m = int(15, 30), a = c + 4 * m, k = int(3, 2 * m - 3), F = k * k;
        const qL = a - c - 2 * k, pL = c + 2 * k, qm = (a - c) / 2;
        return {
          q: `Market demand is P = ${a} − Q. An incumbent and a potential entrant both have MC = ${c}; the entrant must sink an entry cost of ${F} and expects the incumbent’s output to stay fixed.`,
          parts: [
            { label: 'Limit output (smallest incumbent output that deters entry)', answer: qL },
            { label: 'Limit price', answer: pL },
            { label: 'Does the incumbent need to limit price, or is entry blockaded?', choices: ['Must limit price: the monopoly output would invite entry', 'Entry is blockaded: the monopoly output already deters it'], correct: qL > qm ? 0 : 1 },
          ],
          solution: [
            `Residual demand: P = (${a} − q_I) − q_E. Entrant’s best output (${a - c} − q_I)/2, profit ((${a - c} − q_I)/2)² − ${F}.`,
            `Deterred when (${a - c} − q_I)/2 ≤ √${F} = ${k}, i.e. q_I ≥ ${a - c} − ${2 * k} = ${qL}. Limit price = ${a} − ${qL} = ${pL}.`,
            `Monopoly output is (${a} − ${c})/2 = ${qm}, which is ${qL > qm ? 'below' : 'at or above'} the limit output, so ${qL > qm ? 'the incumbent must limit price' : 'entry is blockaded'}.`,
          ],
        };
      },
    },
    {
      worked: 'w-prisoners-dilemma', topic: 'prisoners-dilemma',
      gen() {
        const S = int(0, 3), P = S + int(1, 4), R = P + int(2, 6), T = R + int(1, 6);
        const dc = (T - R) / (T - P), d = pick([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
        if (Math.abs(d - dc) < 0.02) return this.gen();
        return {
          q: `A two-firm cartel, repeated for ever with grim-trigger strategies. Profits per period: both collude ${R} each; both cheat ${P} each; a lone cheat earns ${T} while the colluder gets ${S}. The discount factor is δ = ${d}.`,
          parts: [
            { label: 'Critical discount factor δ*', answer: dc },
            { label: 'Present value of colluding for ever', answer: R / (1 - d) },
            { label: `Can collusion be sustained at δ = ${d}?`, choices: ['Yes', 'No'], correct: d >= dc ? 0 : 1 },
          ],
          solution: [
            `Collusion holds if R/(1 − δ) ≥ T + δP/(1 − δ), i.e. δ ≥ (T − R)/(T − P) = (${T} − ${R})/(${T} − ${P}) = ${n(dc, 3)}.`,
            `PV of colluding = ${R}/(1 − ${d}) = ${n(R / (1 - d))}; PV of cheating = ${T} + ${d} × ${P}/(1 − ${d}) = ${n(T + (d * P) / (1 - d))}.`,
            `δ = ${d} is ${d >= dc ? 'at least' : 'below'} δ*, so collusion ${d >= dc ? 'can' : 'cannot'} be sustained.`,
          ],
        };
      },
    },
    {
      worked: 'w-game-theory', topic: 'game-theory',
      gen() {
        const pay = [0, 1].map(() => [0, 1].map(() => [int(0, 9), int(0, 9)]));
        // Avoid ties in best responses so the answer is clear-cut.
        if (pay[0][0][0] === pay[1][0][0] || pay[0][1][0] === pay[1][1][0] || pay[0][0][1] === pay[0][1][1] || pay[1][0][1] === pay[1][1][1]) return this.gen();
        const rows = ['Up', 'Down'], cols = ['Left', 'Right'];
        const ne = [];
        for (const i of [0, 1]) for (const j of [0, 1]) if (pay[i][j][0] > pay[1 - i][j][0] && pay[i][j][1] > pay[i][1 - j][1]) ne.push([i, j]);
        const opts = ['(Up, Left) only', '(Up, Right) only', '(Down, Left) only', '(Down, Right) only', 'Two equilibria', 'None in pure strategies'];
        const correct = ne.length === 0 ? 5 : ne.length === 2 ? 4 : ne[0][0] * 2 + ne[0][1];
        const dom = [0, 1].findIndex((i) => pay[i][0][0] > pay[1 - i][0][0] && pay[i][1][0] > pay[1 - i][1][0]);
        const cell = (i, j) => `(${rows[i]}, ${cols[j]}) → (${pay[i][j][0]}, ${pay[i][j][1]})`;
        return {
          q: `Payoffs (Row, Column): ${cell(0, 0)}; ${cell(0, 1)}; ${cell(1, 0)}; ${cell(1, 1)}.`,
          parts: [
            { label: 'Pure-strategy Nash equilibria', choices: opts, correct },
            { label: 'Does Row have a dominant strategy?', choices: ['Yes, Up', 'Yes, Down', 'No'], correct: dom === -1 ? 2 : dom },
          ],
          solution: [
            `Row’s best responses: to Left → ${rows[pay[0][0][0] > pay[1][0][0] ? 0 : 1]}; to Right → ${rows[pay[0][1][0] > pay[1][1][0] ? 0 : 1]}.`,
            `Column’s best responses: to Up → ${cols[pay[0][0][1] > pay[0][1][1] ? 0 : 1]}; to Down → ${cols[pay[1][0][1] > pay[1][1][1] ? 0 : 1]}.`,
            `Cells where both are best responses: ${ne.length ? ne.map(([i, j]) => `(${rows[i]}, ${cols[j]})`).join(' and ') : 'none'}. Row ${dom === -1 ? 'has no dominant strategy (its best response changes)' : `always does best with ${rows[dom]}`}.`,
          ],
        };
      },
    },
    {
      worked: 'w-price-discrimination', topic: 'price-discrimination',
      gen() {
        const c = pick([10, 20]), b1 = pick([1, 2]), b2 = pick([1, 2]);
        const a1 = c + 2 * b1 * int(15, 30), a2 = c + 2 * b2 * int(5, 14);
        const q1 = (a1 - c) / (2 * b1), q2 = (a2 - c) / (2 * b2), p1 = (a1 + c) / 2, p2 = (a2 + c) / 2;
        const lin2 = (a, b, i) => `P_${i} = ${a} − ${b === 1 ? '' : b}Q_${i}`;
        return {
          q: `A monopolist with constant MC = ${c} sells in two separate markets with no resale: ${lin2(a1, b1, 1)} and ${lin2(a2, b2, 2)}.`,
          parts: [
            { label: 'Price in market 1', answer: p1 },
            { label: 'Price in market 2', answer: p2 },
            { label: 'Total profit', answer: (p1 - c) * q1 + (p2 - c) * q2 },
          ],
          solution: [
            `MR₁ = ${a1} − ${2 * b1}Q₁ = ${c} → Q₁ = ${n(q1)}, P₁ = ${n(p1)}.`,
            `MR₂ = ${a2} − ${2 * b2}Q₂ = ${c} → Q₂ = ${n(q2)}, P₂ = ${n(p2)}.`,
            `Profit = (${n(p1)} − ${c})(${n(q1)}) + (${n(p2)} − ${c})(${n(q2)}) = ${n((p1 - c) * q1 + (p2 - c) * q2)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-kinked-demand', topic: 'kinked-demand',
      gen() {
        const Q = pick([4, 6, 8]), P = pick([8, 10, 12]), b1 = pick([0.25, 0.5]), b2 = pick([1, 1.5]);
        const top = P - b1 * Q, bot = P - b2 * Q;
        if (bot <= 0.5) return this.gen();
        const inside = Math.random() < 0.5;
        const mc = inside ? +(bot + (top - bot) * pick([0.25, 0.5, 0.75])).toFixed(2) : +(top + pick([0.5, 1, 1.5])).toFixed(2);
        return {
          q: `An oligopolist sells ${Q} units at a price of ${P}. Above that price demand is P = ${n(P + b1 * Q)} − ${b1}Q; below it, P = ${n(P + b2 * Q)} − ${b2}Q. Marginal cost is ${n(mc)}.`,
          parts: [
            { label: 'MR just to the left of the kink (top of the gap)', answer: top },
            { label: 'MR just to the right of the kink (bottom of the gap)', answer: bot },
            { label: `Does the price stay at ${P}?`, choices: ['Yes: MC is inside the MR gap', 'No: MC is outside the MR gap'], correct: inside ? 0 : 1 },
          ],
          solution: [
            `Upper MR = ${n(P + b1 * Q)} − ${2 * b1}Q; at Q = ${Q}: ${n(top)}.`,
            `Lower MR = ${n(P + b2 * Q)} − ${2 * b2}Q; at Q = ${Q}: ${n(bot)}.`,
            `MC = ${n(mc)} is ${inside ? `between ${n(bot)} and ${n(top)}, so output stays at ${Q} and price at ${P}` : `above ${n(top)}, so MC cuts the upper MR: output falls and price rises`}.`,
          ],
        };
      },
    },
    {
      worked: 'w-stackelberg', topic: 'stackelberg',
      gen() {
        const c = pick([10, 20, 30]), a = c + 4 * int(10, 25), k = a - c;
        const qL = k / 2, qF = k / 4, p = a - qL - qF;
        return {
          q: `Market demand is P = ${a} − Q. Both firms have MC = ${c}. The leader chooses output first, then the follower.`,
          parts: [
            { label: 'Leader output', answer: qL },
            { label: 'Follower output', answer: qF },
            { label: 'Market price', answer: p },
            { label: 'Leader profit', answer: (p - c) * qL },
          ],
          solution: [
            `Follower: q_F = (${k} − q_L)/2.`,
            `Leader’s profit: (${a} − q_L − (${k} − q_L)/2 − ${c})q_L = (${k / 2} − q_L/2)q_L → q_L = ${n(qL)}.`,
            `q_F = (${k} − ${n(qL)})/2 = ${n(qF)}. P = ${a} − ${n(qL + qF)} = ${n(p)}.`,
            `Leader profit = (${n(p)} − ${c}) × ${n(qL)} = ${n((p - c) * qL)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-bertrand', topic: 'bertrand',
      gen() {
        const c = pick([5, 10, 15]), p = c + int(5, 20), a = 3 * p - 2 * c, q = a - p;
        return {
          q: `Two firms sell differentiated goods with demand q_A = ${a} − 2p_A + p_B and q_B = ${a} − 2p_B + p_A. Both have MC = ${c}. They set prices simultaneously.`,
          parts: [
            { label: 'Equilibrium price of each firm', answer: p },
            { label: 'Output of each firm', answer: q },
            { label: 'Profit of each firm', answer: (p - c) * q },
          ],
          solution: [
            `A maximises (p_A − ${c})(${a} − 2p_A + p_B): ${a} − 4p_A + p_B + ${2 * c} = 0 → p_A = (${a + 2 * c} + p_B)/4.`,
            `Symmetric: p = (${a + 2 * c} + p)/4 → 3p = ${a + 2 * c} → p = ${p}.`,
            `q = ${a} − 2(${p}) + ${p} = ${q}. Profit = (${p} − ${c}) × ${q} = ${(p - c) * q}.`,
          ],
        };
      },
    },
    {
      worked: 'w-labour-mrp', topic: 'labour-market',
      gen() {
        const A = pick([20, 24, 30]), P = pick([2, 4, 5]), L = int(4, A - 4), w = P * (A - L);
        return {
          q: `A competitive firm has Q = ${A}L − 0.5L². The output price is ${P} and the wage is ${w}.`,
          parts: [{ label: 'Workers hired', answer: L }],
          solution: [`MP_L = ${A} − L. MRP_L = ${P}(${A} − L). Set MRP_L = w: ${P}(${A} − L) = ${w} → L = ${L}.`],
        };
      },
    },
    {
      worked: 'w-externality', topic: 'externalities',
      gen() {
        const c = pick([10, 20]), e = pick([10, 20, 30]), A = c + e + 2 * int(10, 30);
        const qm = (A - c) / 2, qs = (A - c - e) / 2;
        return {
          q: `Demand (= MSB) is P = ${A} − Q. Marginal private cost is MPC = ${c} + Q. Each unit causes external damage of ${e}.`,
          parts: [
            { label: 'Market output', answer: qm },
            { label: 'Efficient output', answer: qs },
            { label: 'Deadweight loss of the free market', answer: 0.5 * e * (qm - qs) },
          ],
          solution: [
            `Market: ${A} − Q = ${c} + Q → Q = ${n(qm)}.`,
            `MSC = ${c + e} + Q. Efficient: ${A} − Q = ${c + e} + Q → Q = ${n(qs)}. A Pigouvian tax of ${e} gets there.`,
            `DWL = ½ × ${e} × (${n(qm)} − ${n(qs)}) = ${n(0.5 * e * (qm - qs))}.`,
          ],
        };
      },
    },
    {
      worked: 'w-tariff', topic: 'tariff',
      gen() {
        const m = market(10, 10), pw = m.P - 3, t = pick([1, 2]);
        const before = 20 * (m.P - pw), after = 20 * (m.P - pw - t);
        return {
          q: `Domestic ${lin('Q_D', m.a, -10)} and ${lin('Q_S', m.c, 10)}. The world price is ${pw} and a tariff of ${t} per unit is imposed.`,
          parts: [
            { label: 'Imports before the tariff', answer: before },
            { label: 'Imports after the tariff', answer: after },
            { label: 'Tariff revenue', answer: t * after },
            { label: 'Deadweight loss', answer: 10 * t * t },
          ],
          solution: [
            `At P = ${pw}: Q_D = ${m.a - 10 * pw}, Q_S = ${m.c + 10 * pw}, imports = ${before}.`,
            `At P = ${pw + t}: Q_D = ${m.a - 10 * (pw + t)}, Q_S = ${m.c + 10 * (pw + t)}, imports = ${after}.`,
            `Revenue = ${t} × ${after} = ${t * after}. DWL = two triangles, each ½ × ${t} × ${10 * t} = ${5 * t * t}, total ${10 * t * t}.`,
          ],
        };
      },
    },
    {
      worked: 'w-gdp', topic: 'national-income',
      gen() {
        const C = pick([500, 600, 700]), I = pick([100, 150, 200]), G = pick([150, 200, 250]), X = pick([80, 120, 160]), Z = pick([100, 150, 200]), NT = pick([150, 180, 220]);
        const Y = C + I + G + X - Z;
        return {
          q: `C = ${C}, I = ${I}, G = ${G}, X = ${X}, Z = ${Z}, net taxes NT = ${NT}.`,
          parts: [
            { label: 'GDP', answer: Y },
            { label: 'Household saving S', answer: Y - NT - C },
          ],
          solution: [
            `Y = C + I + G + (X − Z) = ${C} + ${I} + ${G} + (${X} − ${Z}) = ${Y}.`,
            `Y_d = ${Y} − ${NT} = ${Y - NT}. S = Y_d − C = ${Y - NT - C}.`,
            `Check: S + NT + Z = ${Y - NT - C + NT + Z} = I + G + X = ${I + G + X}.`,
          ],
        };
      },
    },
    {
      worked: 'w-multiplier', topic: 'keynesian-cross',
      gen() {
        const [c, t, z] = pick([[0.8, 0.25, 0.1], [0.75, 0.2, 0.1], [0.9, 0.2, 0.12], [0.8, 0.2, 0.14]]);
        const k = 1 / (1 - c * (1 - t) + z), A = pick([300, 400, 430, 500]), dG = pick([10, 20, 50]);
        return {
          q: `C = ${c}Y_d plus autonomous spending, tax rate t = ${t}, marginal propensity to import z = ${z}. Total autonomous spending is ${A}.`,
          parts: [
            { label: 'Multiplier K', answer: k },
            { label: 'Equilibrium income Y*', answer: A * k },
            { label: `Change in Y if G rises by ${dG}`, answer: dG * k },
          ],
          solution: [
            `K = 1/[1 − c(1 − t) + z] = 1/[1 − ${c}(${1 - t}) + ${z}] = 1/${n(1 - c * (1 - t) + z, 3)} = ${n(k)}.`,
            `Y* = K × autonomous spending = ${n(k)} × ${A} = ${n(A * k)}.`,
            `ΔY = K × ΔG = ${n(k)} × ${dG} = ${n(dG * k)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-solow', topic: 'solow',
      gen() {
        const [s, nd] = pick([[0.2, 0.05], [0.3, 0.1], [0.4, 0.05], [0.3, 0.05], [0.2, 0.1]]), root = s / nd;
        return {
          q: `y = k^{0.5}, saving rate s = ${s}, n + d = ${nd}, no technical progress.`,
          parts: [
            { label: 'Steady-state capital k*', answer: root * root },
            { label: 'Steady-state output y*', answer: root },
            { label: 'Steady-state consumption c*', answer: (1 - s) * root },
          ],
          solution: [
            `s·k^{0.5} = (n + d)k → k^{0.5} = s/(n + d) = ${n(root)}.`,
            `k* = ${n(root * root)}, y* = ${n(root)}, c* = (1 − ${s}) × ${n(root)} = ${n((1 - s) * root)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-money-creation', topic: 'money-market',
      gen() {
        const rr = pick([0.05, 0.1, 0.2, 0.25]), cr = pick([0, 0.1, 0.2, 0.25]), MB = pick([50, 100, 200, 400]);
        const gM = int(3, 10), gY = int(1, 4), gV = pick([0, 0, 1, -1]), r = int(1, 3);
        const m = (1 + cr) / (cr + rr), pi = gM + gV - gY;
        return {
          q: `The monetary base is ${MB}. Banks hold reserves of ${n(rr * 100)}% of deposits and the public holds cash equal to ${n(cr * 100)}% of deposits. Money grows ${gM}% a year, real output ${gY}% and velocity ${gV > 0 ? 'rises ' + gV + '%' : gV < 0 ? 'falls ' + -gV + '%' : 'is constant'}. The real interest rate is ${r}%.`,
          parts: [
            { label: 'Money multiplier', answer: m },
            { label: 'Money supply', answer: m * MB },
            { label: 'Inflation (%)', answer: pi },
            { label: 'Nominal interest rate (%), with expected inflation equal to that inflation', answer: r + pi },
          ],
          solution: [
            `m = (1 + cr)/(cr + rr) = ${n(1 + cr)}/${n(cr + rr)} = ${n(m)}${cr === 0 ? ' (with no cash this is just 1/rr)' : ''}.`,
            `M = ${n(m)} × ${MB} = ${n(m * MB)}.`,
            `%ΔM + %ΔV = %ΔP + %ΔY → π = ${gM} + (${gV}) − ${gY} = ${pi}%.`,
            `Fisher: i = r + πᵉ = ${r} + ${pi} = ${r + pi}%.`,
          ],
        };
      },
    },
    {
      worked: 'w-ismp', topic: 'is-mp',
      gen() {
        const c = pick([0.75, 0.8]), C0 = pick([100, 150]), T = 100, I0 = pick([200, 250]), h = pick([10, 20]), G = pick([150, 200]), r = int(2, 6), dG = pick([20, 25, 50]);
        const k = 1 / (1 - c), Y = k * (C0 - c * T + I0 + G - h * r);
        return {
          q: `C = ${C0} + ${c}(Y − T), T = ${T}, I = ${I0} − ${h}r, G = ${G}. The central bank sets r = ${r}.`,
          parts: [
            { label: 'Equilibrium output Y', answer: Y },
            { label: `Change in Y if G rises by ${dG} (r held at ${r})`, answer: k * dG },
          ],
          solution: [
            `Y = ${C0} + ${c}(Y − ${T}) + ${I0} − ${h}r + ${G} → ${n(1 - c)}Y = ${n(C0 - c * T + I0 + G)} − ${h}r.`,
            `IS: Y = ${n(k * (C0 - c * T + I0 + G))} − ${n(k * h)}r. At r = ${r}: Y = ${n(Y)}.`,
            `With MP flat, ΔY = ΔG/(1 − c) = ${dG} × ${n(k)} = ${n(k * dG)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-phillips-taylor', topic: 'adas-phillips',
      gen() {
        const pe = int(1, 4), beta = pick([0.5, 1]), u = pick([3, 4, 6, 7]), us = 5;
        const pi = pe - beta * (u - us), gap = -2 * (u - us), r = 2 + 0.5 * (pi - 2) + 0.5 * gap;
        return {
          q: `π = πᵉ − ${beta}(u − 5) with πᵉ = ${pe}. Unemployment is ${u}%. Okun: gap = −2(u − u*). Taylor rule: r = 2 + 0.5(π − 2) + 0.5·gap.`,
          parts: [
            { label: 'Inflation π (%)', answer: pi },
            { label: 'Output gap (%)', answer: gap },
            { label: 'Taylor-rule real rate r (%)', answer: r },
          ],
          solution: [
            `π = ${pe} − ${beta}(${u} − 5) = ${n(pi)}.`,
            `Gap = −2(${u} − 5) = ${gap}%.`,
            `r = 2 + 0.5(${n(pi)} − 2) + 0.5(${gap}) = ${n(r)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-exchange-rate', topic: 'forex',
      gen() {
        const e = pick([1.2, 1.25, 1.5]), P = 100, Ps = pick([100, 110, 120, 140]), pi = int(2, 6), pis = int(1, 4);
        return {
          q: `e = ${e} dollars per pound. A basket costs £${P} in the UK and $${Ps} in the US. UK inflation is ${pi}%, US inflation ${pis}%.`,
          parts: [
            { label: 'Real exchange rate e·P/P*', answer: (e * P) / Ps },
            { label: 'PPP exchange rate (dollars per pound)', answer: Ps / P },
            { label: 'Predicted % change in e (relative PPP)', answer: pis - pi },
          ],
          solution: [
            `RER = ${e} × ${P}/${Ps} = ${n((e * P) / Ps, 3)}.`,
            `PPP: e = P*/P = ${Ps}/${P} = ${n(Ps / P)}.`,
            `%Δe ≈ π* − π = ${pis} − ${pi} = ${pis - pi}%${pis - pi < 0 ? ' (the pound depreciates)' : pis - pi > 0 ? ' (the pound appreciates)' : ''}.`,
          ],
        };
      },
    },
  ];

  const concepts = [
    { worked: 'w-oil-shock', topic: 'ad-as', q: 'A large rise in the price of oil, starting from long-run equilibrium, in the short run causes…', choices: ['Higher prices and higher output', 'Higher prices and lower output (stagflation)', 'Lower prices and lower output', 'No change, because LRAS is vertical'], correct: 1, why: 'An adverse supply shock shifts SRAS up/left along a fixed AD: the price level rises while output falls.' },
    { worked: 'w-oil-shock', topic: 'ad-as', q: 'Why does an adverse supply shock pose a dilemma for the central bank?', choices: ['It cannot change interest rates after a supply shock', 'Stimulating output adds to inflation, while fighting inflation deepens the recession', 'Supply shocks only affect the long run', 'Fiscal policy automatically offsets it'], correct: 1, why: 'One instrument cannot move output up and inflation down at the same time when SRAS has shifted.' },
    { worked: 'w-shutdown', topic: 'costs', q: 'A competitive firm’s price is above minimum AVC but below minimum ATC. In the short run it should…', choices: ['Shut down immediately', 'Keep producing where P = MC', 'Raise its price to ATC', 'Produce where ATC is lowest'], correct: 1, why: 'Revenue covers variable cost and part of fixed cost, so the loss is smaller than the fixed cost it would lose by closing.' },
    { worked: 'w-shutdown', topic: 'costs', q: 'The short-run shutdown price of a perfectly competitive firm is…', choices: ['Minimum ATC', 'Minimum AVC', 'Minimum MC', 'Average fixed cost'], correct: 1, why: 'Below minimum AVC, producing loses more than fixed cost.' },
    { worked: 'w-fiscal-regimes', topic: 'money-ismp', q: 'The central bank holds the interest rate fixed (flat MP). Government spending rises. Which is true?', choices: ['Output rises by the full multiplier and there is no crowding out', 'Output is unchanged because of full crowding out', 'The interest rate rises and investment falls', 'The money supply must fall'], correct: 0, why: 'To hold r, the bank expands the money supply as money demand rises, so investment is not crowded out.' },
    { worked: 'w-fiscal-regimes', topic: 'money-ismp', q: 'With a fixed money supply (an upward-sloping LM), a fiscal expansion…', choices: ['Lowers the interest rate', 'Raises output by more than the multiplier', 'Raises the interest rate, partly crowding out investment', 'Has no effect on money demand'], correct: 2, why: 'Higher income raises money demand; with M/P fixed, r must rise, reducing investment.' },
    { worked: 'w-minimum-wage', topic: 'labour-market', q: 'In a competitive labour market a minimum wage above the market wage will…', choices: ['Raise employment', 'Reduce employment and create unemployment', 'Have no effect', 'Lower the wage'], correct: 1, why: 'Firms move up their MRP curves and hire fewer workers, while more people want to work.' },
    { worked: 'w-minimum-wage', topic: 'labour-market', q: 'Under monopsony, a minimum wage set between the monopsony wage and the competitive wage can…', choices: ['Only reduce employment', 'Raise both the wage and employment', 'Cause the firm to shut down', 'Leave the wage unchanged'], correct: 1, why: 'It flattens the firm’s marginal factor cost, so hiring more no longer raises the wage it pays to everyone.' },
    { worked: 'w-specific-tax', topic: 'tax-incidence', q: 'Demand is very inelastic and supply is elastic. Who bears most of a per-unit tax?', choices: ['Sellers', 'Buyers', 'It is always split equally', 'Whoever is legally liable'], correct: 1, why: 'The less elastic side bears more: the buyers’ share is E_s/(E_s + |E_d|).' },
    { worked: 'w-comparative-advantage', topic: 'ppf', q: 'A country should specialise in the good for which it has…', choices: ['The highest output per worker', 'The lowest opportunity cost', 'The highest price', 'An absolute advantage'], correct: 1, why: 'Comparative advantage, the lower opportunity cost, determines the gains from specialisation.' },
    { worked: 'w-multiplier', topic: 'keynesian-cross', q: 'Full-employment output is 1,000, equilibrium is 860 and the multiplier is 2. The deflationary gap is…', choices: ['140', '70', '280', '1,000'], correct: 1, why: 'The deflationary gap is the shortfall of AD at Y_f: 140 ÷ 2 = 70. The 140 is the output gap.' },
    { worked: 'w-monopoly', topic: 'monopoly', q: 'Having found output where MR = MC, a monopolist sets price…', choices: ['On the MR curve', 'Equal to MC', 'On the demand curve above that output', 'Equal to average cost'], correct: 2, why: 'The price is the most buyers will pay for that quantity, read from demand.' },
    { worked: 'w-solow', topic: 'solow', q: 'In the Solow model, a permanent rise in the saving rate…', choices: ['Permanently raises the growth rate of output per worker', 'Raises the steady-state level of output per worker but not its long-run growth rate', 'Has no effect', 'Lowers steady-state capital'], correct: 1, why: 'Higher s raises k* and y* (a level effect); only technological progress sustains growth.' },
    { worked: 'w-externality', topic: 'externalities', q: 'With a negative production externality, the free market produces…', choices: ['Too little', 'The efficient amount', 'Too much', 'Nothing'], correct: 2, why: 'Firms ignore the external cost, so they produce where MPC = MSB, beyond the point where MSC = MSB.' },
    { worked: 'w-contestable', topic: 'contestable-markets', q: 'In a perfectly contestable market served by a single firm, the price will be…', choices: ['The monopoly price, since there is only one firm', 'Equal to average cost, giving only normal profit', 'Equal to marginal cost, with the firm making a loss', 'Set by the government'], correct: 1, why: 'Any supernormal profit would attract hit-and-run entry, so the incumbent prices at average cost even though it is alone.' },
    { worked: 'w-contestable', topic: 'contestable-markets', q: 'Which condition is essential for a market to be perfectly contestable?', choices: ['A large number of firms', 'No sunk costs, so firms can leave without loss', 'Identical products', 'Government price regulation'], correct: 1, why: 'Hit-and-run entry only works if an entrant can exit and recover what it spent. Sunk costs make entry risky and protect the incumbent.' },
    { worked: 'w-limit-pricing', topic: 'entry-barriers', q: 'Which of these is a strategic barrier to entry, rather than a structural or legal one?', choices: ['A patent', 'Economies of scale in the industry’s technology', 'Building excess capacity to threaten a price war', 'A government licence'], correct: 2, why: 'Strategic barriers are deliberate actions by incumbents; patents and licences are legal, and scale economies are structural.' },
    { worked: 'w-limit-pricing', topic: 'entry-barriers', q: 'Why might an incumbent set a price below the profit-maximising monopoly price?', choices: ['To raise short-run profit', 'To deter entry by leaving too little residual demand for an entrant to cover its costs', 'Because demand is inelastic', 'To meet a legal requirement'], correct: 1, why: 'Limit pricing sacrifices some profit now to keep the market, and the profit stream, in future.' },
    { worked: 'w-prisoners-dilemma', topic: 'prisoners-dilemma', q: 'What makes a game a prisoner’s dilemma?', choices: ['Neither player has a dominant strategy', 'Each player has a dominant strategy, but the resulting equilibrium is worse for both than another outcome', 'The game has two Nash equilibria', 'One player always wins'], correct: 1, why: 'Individually rational (dominant) choices produce a Pareto-inefficient equilibrium.' },
    { worked: 'w-prisoners-dilemma', topic: 'prisoners-dilemma', q: 'In an infinitely repeated cartel game with grim-trigger strategies, collusion is easier to sustain when…', choices: ['Firms are impatient (low discount factor)', 'The one-off gain from cheating is large', 'Firms value future profits highly (high discount factor)', 'The game has a known last round'], correct: 2, why: 'Collusion needs δ ≥ (T − R)/(T − P): patient firms lose more from future punishment than they gain from cheating once.' },
    { worked: 'w-prisoners-dilemma', topic: 'prisoners-dilemma', q: 'A cartel game is repeated exactly 10 times and both firms know it. Backward induction predicts…', choices: ['Collusion in every round', 'Collusion until round 10, then cheating', 'Cheating in every round', 'Random play'], correct: 2, why: 'Both cheat in the last round, so the ninth is effectively the last, and so on back to round 1.' },
    { worked: 'w-game-theory', topic: 'game-theory', q: 'Which statement about Nash equilibrium is correct?', choices: ['Every Nash equilibrium uses dominant strategies', 'A dominant-strategy equilibrium is a Nash equilibrium, but a Nash equilibrium need not involve dominant strategies', 'A Nash equilibrium always maximises joint payoffs', 'Every game has exactly one pure-strategy Nash equilibrium'], correct: 1, why: 'Nash only requires each strategy to be a best response to the others, which holds for dominant strategies but also in games like coordination games.' },
    { worked: 'w-game-theory', topic: 'game-theory', q: 'An incumbent threatens to start a price war if a rival enters, but once entry happens a price war would lower its own profit. The threat is…', choices: ['Credible, so the rival stays out', 'Not credible, so backward induction predicts entry and accommodation', 'Credible only if the rival is larger', 'Irrelevant to the outcome in every case'], correct: 1, why: 'At the incumbent’s decision node, accommodating pays more, so the rival anticipates that and enters. A credible deterrent needs a commitment that changes the incumbent’s payoffs.' },
    { worked: 'w-price-discrimination', topic: 'price-discrimination', q: 'Under third-degree price discrimination, which group pays the higher price?', choices: ['The group with more elastic demand', 'The group with less elastic demand', 'The larger group', 'Both pay the same, because MC is the same'], correct: 1, why: 'Each market sets MR = MC, so (P − MC)/P = 1/|PED|: a lower elasticity means a higher markup.' },
    { worked: 'w-price-discrimination', topic: 'price-discrimination', q: 'Compared with a single-price monopoly, perfect (first-degree) price discrimination…', choices: ['Lowers output and raises deadweight loss', 'Raises output to the competitive level, removes deadweight loss and leaves consumers no surplus', 'Leaves output unchanged but raises price', 'Gives all the surplus to consumers'], correct: 1, why: 'Every unit with willingness to pay above MC is sold, so output is efficient, but the firm captures all of the surplus.' },
    { worked: 'w-price-discrimination', topic: 'price-discrimination', q: 'Which condition is needed for price discrimination to work?', choices: ['Perfect competition', 'Identical demand elasticities in every group', 'Buyers cannot resell the good to each other', 'Constant returns to scale'], correct: 2, why: 'If low-price buyers could resell to high-price buyers, arbitrage would remove the price difference. Market power and different elasticities are also needed.' },
    { worked: 'w-kinked-demand', topic: 'kinked-demand', q: 'In the kinked demand model, what does each firm assume about its rivals?', choices: ['They match price rises but ignore cuts', 'They match price cuts but ignore rises', 'They match all price changes', 'They never react'], correct: 1, why: 'Matching cuts makes demand inelastic below the kink; ignoring rises makes it elastic above, which creates the kink.' },
    { worked: 'w-kinked-demand', topic: 'kinked-demand', q: 'A kinked-demand oligopolist’s marginal cost rises but stays within the gap in MR. What happens?', choices: ['Price rises and output falls', 'Price and output are unchanged', 'Price falls', 'The firm leaves the market'], correct: 1, why: 'MC still crosses MR in the vertical gap, so the profit-maximising output stays at the kink and price is unchanged.' },
    { worked: 'w-bertrand', topic: 'bertrand', q: 'Two firms sell identical goods, have the same constant marginal cost and compete on price. The equilibrium price is…', choices: ['The monopoly price', 'Between marginal cost and the monopoly price, as in Cournot', 'Equal to marginal cost', 'Below marginal cost'], correct: 2, why: 'Any price above MC is undercut by the rival, who would take the whole market: the Bertrand paradox.' },
    { worked: 'w-bertrand', topic: 'bertrand', q: 'With differentiated goods and price competition, the firms’ reaction functions…', choices: ['Slope down: prices are strategic substitutes', 'Slope up: prices are strategic complements', 'Are vertical', 'Do not exist'], correct: 1, why: 'If the rival raises its price, your demand rises and your best price rises too.' },
    { worked: 'w-stackelberg', topic: 'stackelberg', q: 'Compared with Cournot, the Stackelberg leader…', choices: ['Produces less and earns less', 'Produces more and earns more', 'Produces the same and earns more', 'Produces more but earns less'], correct: 1, why: 'Committing first to a larger output makes the follower cut back, raising the leader’s profit: first-mover advantage.' },
    { worked: 'w-stackelberg', topic: 'stackelberg', q: 'Where is the Stackelberg equilibrium on the reaction-function diagram?', choices: ['Where the two reaction functions cross', 'Where the leader’s isoprofit curve is tangent to the follower’s reaction function', 'At the monopoly output on the leader’s axis with zero follower output', 'Where the follower’s isoprofit curve touches the leader’s reaction function'], correct: 1, why: 'The leader picks its best point on the follower’s reaction function; the crossing of the two functions is Cournot.' },
    { worked: 'w-perfect-competition', topic: 'cost-curves', q: 'On a total cost diagram, average total cost at output Q equals…', choices: ['The slope of TC at Q', 'The slope of a straight line from the origin to TC at Q', 'The vertical distance between TC and TVC', 'The height of TC at Q'], correct: 1, why: 'ATC = TC/Q, which is rise over run along the ray from the origin. The slope of TC itself is MC; the gap between TC and TVC is fixed cost.' },
    { worked: 'w-slutsky', topic: 'income-substitution', q: 'The price of an inferior good that is not a Giffen good rises. What happens to the quantity demanded?', choices: ['It rises, because the income effect dominates', 'It falls: the income effect raises it, but by less than the substitution effect lowers it', 'It falls, because both effects reduce it', 'It is unchanged'], correct: 1, why: 'For an inferior good the income effect works against the substitution effect, but here it is smaller, so demand still slopes down.' },
    { worked: 'w-slutsky', topic: 'income-substitution', q: 'Which statement about Giffen goods is correct?', choices: ['Every inferior good is a Giffen good', 'A Giffen good is a normal good with a large substitution effect', 'A Giffen good is an inferior good whose income effect outweighs its substitution effect, so demand slopes up', 'For a Giffen good the substitution effect raises demand when its price rises'], correct: 2, why: 'The substitution effect always moves against the price change; Giffen behaviour needs an inferior good with a large enough income effect to outweigh it.' },
    { worked: 'w-money-creation', topic: 'money-market', q: 'The central bank buys government bonds from commercial banks (an open market purchase). What happens?', choices: ['The monetary base and money supply fall, and interest rates rise', 'The monetary base and money supply rise, and interest rates fall', 'Only the price of bonds changes', 'The reserve ratio rises'], correct: 1, why: 'Paying for the bonds adds reserves to banks, raising the monetary base; banks lend more, the money supply rises, and higher bond prices mean lower interest rates.' },
    { worked: 'w-money-creation', topic: 'money-market', q: 'Banks raise their reserve ratio, and households start holding more cash. The money multiplier…', choices: ['Rises', 'Falls', 'Is unchanged', 'Becomes 1/cr'], correct: 1, why: 'm = (1 + cr)/(cr + rr): a higher rr or a higher cr (when rr < 1) lowers it, because less base money is re-lent.' },
    { worked: 'w-cournot', topic: 'cournot', q: 'Compared with monopoly and perfect competition, Cournot duopoly output is…', choices: ['Below monopoly output', 'Between monopoly and competitive output', 'Equal to competitive output', 'Above competitive output'], correct: 1, why: 'With linear demand and equal costs, Cournot total output is 2/3 of competitive output, monopoly is 1/2.' },
  ];

  window.QUIZ = {
    // Each item yields a fresh question; concept items are fixed.
    items: [
      // key: stable id used to store per-question results for spaced review.
      ...generators.map((g) => ({ key: 'calc:' + g.worked, kind: 'calc', worked: g.worked, topic: g.topic, make: () => g.gen() })),
      // Concept keys use the question text so inserting new questions never reshuffles them.
      ...concepts.map((c) => ({ key: `concept:${c.worked}:${c.q.slice(0, 60)}`, kind: 'concept', worked: c.worked, topic: c.topic, make: () => ({ q: c.q, parts: [{ label: 'Choose one', choices: c.choices, correct: c.correct }], solution: [c.why] }) })),
    ],
  };
})();
