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
      worked: 'w-cartel', topic: 'collusion',
      gen() {
        const nf = pick([2, 3]), c = pick([10, 20, 30]), m = pick([2, 3, 4]), a = c + 24 * m, X = a - c;
        const Qm = X / 2, Pm = a - Qm, quota = Qm / nf, piC = (Pm - c) * quota;
        const aRes = a - (nf - 1) * quota, qD = (aRes - c) / 2, PD = aRes - qD, piD = (PD - c) * qD;
        const qN = X / (nf + 1), piN = qN * qN, dStar = (piD - piC) / (piD - piN);
        const names = nf === 2 ? 'Two' : 'Three';
        return {
          q: `${names} identical firms face market demand P = ${a} − Q, each with constant MC = ${c}. They form a cartel and share the monopoly output equally. One member considers cheating, assuming the others keep to their quotas. If anyone cheats, the cartel collapses to Cournot competition for ever.`,
          parts: [
            { label: 'Cartel price', answer: Pm },
            { label: 'Each member’s quota', answer: quota },
            { label: 'The cheat’s profit-maximising output', answer: qD },
            { label: 'Critical discount factor δ* (Cournot punishment)', answer: dStar },
          ],
          solution: [
            `Cartel: MR = ${a} − 2Q = ${c} → Q = ${n(Qm)}, P = ${n(Pm)}. Quota = ${n(Qm)}/${nf} = ${n(quota)}, profit ${n(piC)} each.`,
            `Cheat’s residual demand: P = ${n(aRes)} − q. MR = ${n(aRes)} − 2q = ${c} → q = ${n(qD)}, P = ${n(PD)}, profit ${n(piD)}.`,
            `Cournot with ${nf} firms: q = (${a} − ${c})/${nf + 1} = ${n(qN)}, profit ${n(piN)}.`,
            `δ* = (π_D − π_C)/(π_D − π_N) = (${n(piD)} − ${n(piC)})/(${n(piD)} − ${n(piN)}) = ${n(dStar, 3)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-price-leadership', topic: 'price-leadership',
      gen() {
        const b = pick([2, 4, 5]), a = b * pick([20, 24, 30]), p0 = pick([1, 2]), k = pick([2, 4, 5, 10]);
        const A0 = a + k * p0, B0 = b + k, pMax = A0 / B0;
        if (Math.floor(pMax) - 2 < p0 + 1) return this.gen();
        const c = int(p0 + 1, Math.floor(pMax) - 2);
        const qL = (A0 - c * B0) / 2, p = (A0 - qL) / B0, qF = k * (p - p0);
        return {
          q: `Market demand is Q = ${a} − ${b}P. A competitive fringe supplies Q_F = ${k}P − ${k * p0} at prices above ${p0}. A dominant firm with constant MC = ${c} sets the price and the fringe takes it as given.`,
          parts: [
            { label: 'Price set by the dominant firm', answer: p },
            { label: 'Dominant firm’s output', answer: qL },
            { label: 'Fringe output', answer: qF },
          ],
          solution: [
            `Residual demand: Q_L = (${a} − ${b}P) − (${k}P − ${k * p0}) = ${A0} − ${B0}P, so P = (${A0} − Q_L)/${B0}.`,
            `MR = (${A0} − 2Q_L)/${B0} = ${c} → Q_L = (${A0} − ${c * B0})/2 = ${n(qL)}. P = (${A0} − ${n(qL)})/${B0} = ${n(p)}.`,
            `Fringe: Q_F = ${k}(${n(p)}) − ${k * p0} = ${n(qF)}. Market output ${n(a - b * p)} = ${n(qL)} + ${n(qF)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-oligopoly-compare', topic: 'oligopoly-compare',
      gen() {
        const c = pick([10, 20, 30]), m = 12 * int(4, 9), a = c + m, nf = pick([3, 4, 5, 9]);
        const pN = (a + nf * c) / (nf + 1);
        return {
          q: `Market demand is P = ${a} − Q and every firm has constant MC = ${c}.`,
          parts: [
            { label: 'Market output under monopoly', answer: m / 2 },
            { label: 'Market output in a Cournot duopoly', answer: (2 * m) / 3 },
            { label: 'Market output in a Stackelberg duopoly', answer: (3 * m) / 4 },
            { label: `Price with ${nf} Cournot firms`, answer: pN },
          ],
          solution: [
            `Competitive output (P = MC) is ${a} − ${c} = ${m}.`,
            `Monopoly: MR = ${a} − 2Q = ${c} → Q = ${m / 2}. Cournot duopoly: Q = (2/3)(${m}) = ${n((2 * m) / 3)}. Stackelberg: q_L = ${m / 2}, q_F = ${m / 4}, Q = ${n((3 * m) / 4)}.`,
            `${nf} Cournot firms: Q = (${nf}/${nf + 1})(${m}) = ${n((nf * m) / (nf + 1))}, P = (${a} + ${nf} × ${c})/${nf + 1} = ${n(pN)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-monopsony', topic: 'monopsony',
      gen() {
        const c0 = pick([5, 10, 20]), b = pick([1, 2]), d = pick([1, 2]), Lm = int(8, 25), a = c0 + (2 * b + d) * Lm;
        const wm = c0 + b * Lm, mrpM = a - d * Lm, Lc = (a - c0) / (b + d), wc = c0 + b * Lc;
        const room = Math.floor(wc - wm - 0.5);
        if (room < 1) return this.gen();
        const mw = wm + int(1, room), Lmw = Math.min((mw - c0) / b, (a - mw) / d);
        const sup = b === 1 ? `${c0} + L` : `${c0} + ${b}L`, dem = d === 1 ? `${a} − L` : `${a} − ${d}L`;
        return {
          q: `A monopsony employer faces labour supply w = ${sup}; the marginal revenue product of labour is MRP = ${dem}.`,
          parts: [
            { label: 'Employment under monopsony', answer: Lm },
            { label: 'Wage under monopsony', answer: wm },
            { label: 'Gap between MRP and the wage', answer: mrpM - wm },
            { label: `Employment with a minimum wage of ${mw}`, answer: Lmw },
          ],
          solution: [
            `MFC = ${c0} + ${2 * b}L. MFC = MRP: ${c0} + ${2 * b}L = ${a} − ${d}L → L = ${Lm}.`,
            `Wage from supply: w = ${c0} + ${b} × ${Lm} = ${wm}. MRP = ${a} − ${d} × ${Lm} = ${mrpM}, a gap of ${mrpM - wm}.`,
            `Minimum wage ${mw} (between ${wm} and the competitive wage ${n(wc)}): MFC is flat at ${mw}, so L = min{(${mw} − ${c0})/${b}, (${a} − ${mw})/${d}} = ${n(Lmw)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-bilateral', topic: 'bilateral-monopoly',
      gen() {
        const c0 = pick([5, 10, 20]), b = pick([1, 2]), d = pick([1, 2]), Lm = int(8, 25), a = c0 + (2 * b + d) * Lm;
        const wm = c0 + b * Lm, Lu = (a - c0) / (b + 2 * d), wu = a - d * Lu;
        if (wu - wm < 3) return this.gen();
        const w = Math.round(wm + (0.25 + 0.5 * Math.random()) * (wu - wm)), L = Math.min((w - c0) / b, (a - w) / d);
        const sup = b === 1 ? `${c0} + L` : `${c0} + ${b}L`, dem = d === 1 ? `${a} − L` : `${a} − ${d}L`;
        return {
          q: `A monopsony employer (labour supply w = ${sup}, MRP = ${dem}) bargains with a union that acts as a monopoly seller of labour.`,
          parts: [
            { label: 'Employer’s preferred wage', answer: wm },
            { label: 'Union’s preferred wage', answer: wu },
            { label: `Employment if they agree a wage of ${w}`, answer: L },
          ],
          solution: [
            `Employer: MFC = ${c0} + ${2 * b}L = MRP → L = ${Lm}, w = ${wm} from supply.`,
            `Union: MR from MRP is ${a} − ${2 * d}L; set equal to supply ${sup}: L = ${n(Lu)}, wage on MRP = ${n(wu)}.`,
            `At w = ${w}: L = min{(${w} − ${c0})/${b}, (${a} − ${w})/${d}} = ${n(L)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-compensating', topic: 'wage-differentials',
      gen() {
        const N = 40, theta = pick([2, 4, 6, 8]), a = int(40, 60), bI = a + 2 * int(-5, 5);
        const LA = (theta + a + N - bI) / 2, LB = N - LA, wA = a - LA, wB = bI - LB;
        if (LA < 5 || LB < 5 || wA < 5) return this.gen();
        return {
          q: `A labour market has ${N} workers and two kinds of job. Demand in pleasant jobs is w_A = ${a} − L_A; in unpleasant jobs it is w_B = ${bI} − L_B. Workers need an extra ${theta} to take an unpleasant job, and can move freely between them.`,
          parts: [
            { label: 'Workers in pleasant jobs (L_A)', answer: LA },
            { label: 'Wage in pleasant jobs', answer: wA },
            { label: 'Wage in unpleasant jobs', answer: wB },
          ],
          solution: [
            `Free movement: w_B − w_A = ${theta}, with L_B = ${N} − L_A.`,
            `(${bI} − ${N} + L_A) − (${a} − L_A) = ${theta} → 2L_A = ${theta + a + N - bI} → L_A = ${LA}, L_B = ${LB}.`,
            `w_A = ${a} − ${LA} = ${wA}; w_B = ${bI} − ${LB} = ${wB}. The gap ${wB - wA} is the compensating differential.`,
          ],
        };
      },
    },
    {
      worked: 'w-human-capital', topic: 'human-capital',
      gen() {
        const fees = pick([5, 8, 10, 12]), forgone = pick([15, 20, 25]), C0 = fees + forgone, X = int(2, 6), r = pick([4, 5, 8, 10, 12]);
        const pv = X / (r / 100), irr = (100 * X) / C0;
        if (Math.abs(irr - r) < 0.5) return this.gen();
        return {
          q: `A course costs ${fees} in fees and ${forgone} in earnings given up this year. It raises earnings by ${X} a year for ever, starting next year. The interest rate is ${r}%.`,
          parts: [
            { label: 'Present value of the extra earnings', answer: pv },
            { label: 'Net present value of the course', answer: pv - C0 },
            { label: 'Internal rate of return (%)', answer: irr },
            { label: 'Is the course worth taking?', choices: ['Yes', 'No'], correct: irr > r ? 0 : 1 },
          ],
          solution: [
            `Cost now: ${fees} + ${forgone} = ${C0}. PV of a perpetuity of ${X}: ${X}/${r / 100} = ${n(pv)}.`,
            `NPV = ${n(pv)} − ${C0} = ${n(pv - C0)}.`,
            `IRR: ${X}/i = ${C0} → i = ${n(irr)}%, which is ${irr > r ? 'above' : 'below'} ${r}%, so ${irr > r ? 'invest' : 'do not invest'}.`,
          ],
        };
      },
    },
    {
      worked: 'w-unions', topic: 'trade-unions',
      gen() {
        const c = pick([5, 10, 15, 20]), a = c + 2 * int(10, 25), k = int(2, 8);
        const wc = (a + c) / 2, wu = wc + k, LD = a - wu, LS = wu - c;
        return {
          q: `In a competitive labour market, labour demand is w = ${a} − L and labour supply is w = ${c} + L. A union negotiates a wage of ${wu}.`,
          parts: [
            { label: 'Competitive wage', answer: wc },
            { label: 'Employment at the union wage', answer: LD },
            { label: 'Workers who want a job at the union wage but are not hired', answer: LS - LD },
          ],
          solution: [
            `Competitive: ${a} − L = ${c} + L → L = ${(a - c) / 2}, w = ${wc}.`,
            `At w = ${wu} employers hire L_D = ${a} − ${wu} = ${LD}.`,
            `Labour supplied L_S = ${wu} − ${c} = ${LS}, so ${LS - LD} want work but are not hired.`,
          ],
        };
      },
    },
    {
      worked: 'w-efficiency-wage', topic: 'efficiency-wages',
      gen() {
        const beta = pick([0.25, 0.5]), u = int(2, 8), ws = u / (1 - beta), es = (ws - u) ** beta;
        const wc = Math.floor(ws) - int(1, 2);
        if (wc < 1) return this.gen();
        const A = 4 * wc;
        return {
          q: `A worker’s effort is e = (w − ${u})^${beta} for wages above ${u}. Labour demand is L_D = ${A} − 2w and labour supply is L_S = 2w.`,
          parts: [
            { label: 'Efficiency wage (minimises the wage per unit of effort)', answer: ws },
            { label: 'Effort at the efficiency wage', answer: es },
            { label: 'Involuntary unemployment if firms pay the efficiency wage', answer: 4 * ws - A },
          ],
          solution: [
            `Solow condition: ${beta}w/(w − ${u}) = 1 → w* = ${u}/(1 − ${beta}) = ${n(ws)}.`,
            `Effort: (${n(ws)} − ${u})^${beta} = ${n(es, 3)}.`,
            `Market clears at ${A} − 2w = 2w → w = ${wc}. At w* = ${n(ws)}: L_D = ${n(A - 2 * ws)}, L_S = ${n(2 * ws)}, unemployment ${n(4 * ws - A)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-discrimination', topic: 'discrimination',
      gen() {
        const c = pick([5, 10, 15]), a = c + 2 * int(10, 25), d = pick([0.25, 0.5, 1]);
        const wA = (a + c) / 2, LB = (a - (1 + d) * c) / (2 + d), wB = c + LB;
        if (LB < 4) return this.gen();
        return {
          q: `Groups A and B are equally productive. For each, labour demand (MRP) is w = ${a} − L and supply is w = ${c} + L. All employers discriminate against B with a discrimination coefficient of ${d}.`,
          parts: [
            { label: 'Wage of group A', answer: wA },
            { label: 'Wage of group B', answer: wB },
            { label: 'Employment of group B', answer: LB },
          ],
          solution: [
            `A: ${a} − L = ${c} + L → L = ${(a - c) / 2}, w = ${wA}.`,
            `B: employers hire until MRP = ${1 + d}w, so ${1 + d}(${c} + L) = ${a} − L → L = (${a} − ${n((1 + d) * c)})/${2 + d} = ${n(LB)}.`,
            `w_B = ${c} + ${n(LB)} = ${n(wB)}, a gap of ${n(wA - wB)}.`,
          ],
        };
      },
    },
    {
      worked: 'w-labour-policy', topic: 'labour-policy',
      gen() {
        const c = pick([5, 10, 15]), t = pick([2, 4, 6, 8]), m = int(8, 20), a = c + t + 2 * m;
        const L = m, wW = c + L;
        return {
          q: `Labour demand is w = ${a} − L and labour supply is w = ${c} + L. The government taxes employers ${t} per worker.`,
          parts: [
            { label: 'Employment with the tax', answer: L },
            { label: 'Take-home wage', answer: wW },
            { label: 'Tax revenue', answer: t * L },
            { label: 'Deadweight loss', answer: 0.5 * t * ((a - c) / 2 - L) },
          ],
          solution: [
            `Without the tax: L = ${(a - c) / 2}. With it, the employer pays take-home pay + ${t}: ${a} − L = ${c} + L + ${t} → L = ${L}.`,
            `Take-home pay = ${c} + ${L} = ${wW}; employers pay ${wW + t}.`,
            `Revenue = ${t} × ${L} = ${t * L}; DWL = ½ × ${t} × ${n((a - c) / 2 - L)} = ${n(0.5 * t * ((a - c) / 2 - L))}.`,
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
    { worked: 'w-monopsony', topic: 'monopsony', q: 'Why does a monopsonist’s marginal factor cost lie above the labour supply curve?', choices: ['Because MRP falls as more workers are hired', 'Because to hire one more worker it must raise the wage for all its workers', 'Because of the minimum wage', 'Because labour supply is perfectly elastic'], correct: 1, why: 'MFC = w + L·Δw/ΔL: the extra worker’s wage plus the rise paid to everyone already employed.' },
    { worked: 'w-monopsony', topic: 'monopsony', q: 'Where does a monopsonist set the wage?', choices: ['Where MFC = MRP', 'On the labour supply curve at the employment where MFC = MRP', 'On the MRP curve at the employment where MFC = MRP', 'Where supply = MRP'], correct: 1, why: 'Employment comes from MFC = MRP; the wage is the lowest that attracts that many workers, read off the supply curve.' },
    { worked: 'w-bilateral', topic: 'bilateral-monopoly', q: 'In a bilateral monopoly between a union and a monopsony employer, the wage is…', choices: ['Always the competitive wage', 'Always the monopsony wage', 'Somewhere between the employer’s and the union’s preferred wages, depending on bargaining power', 'Set where MFC = MRP'], correct: 2, why: 'Theory gives the range; relative bargaining strength picks the point. The outcome is indeterminate.' },
    { worked: 'w-bilateral', topic: 'bilateral-monopoly', q: 'What does countervailing power mean in a labour market?', choices: ['The government setting wages', 'A union offsetting a monopsony employer’s power, which can raise both wages and employment', 'Firms merging to cut costs', 'Workers moving to another town'], correct: 1, why: 'A negotiated wage between the monopsony and competitive wages makes MFC flat, so the employer hires more workers at a higher wage.' },
    { worked: 'w-compensating', topic: 'wage-differentials', q: 'Two jobs need the same skills, but one involves night shifts. With free movement between them, the night-shift job pays more because…', choices: ['Workers in it are more productive', 'A compensating differential is needed to attract workers to less pleasant work', 'Night-shift employers have monopsony power', 'The labour market is in disequilibrium'], correct: 1, why: 'Equal-skill jobs that differ in non-wage features settle at a gap that just compensates for the disadvantage.' },
    { worked: 'w-compensating', topic: 'wage-differentials', q: 'Which of these is most likely to cause a disequilibrium wage differential?', choices: ['Danger at work', 'Geographical immobility after a rise in demand in one region', 'The skill a job requires', 'Unsocial hours'], correct: 1, why: 'Immobility stops workers moving to where wages have risen; the gap narrows as they move. The others persist in equilibrium.' },
    { worked: 'w-human-capital', topic: 'human-capital', q: 'Which change would make a degree a better investment, other things equal?', choices: ['A rise in the interest rate', 'A rise in tuition fees', 'A rise in the graduate earnings premium', 'A shorter working life after graduating'], correct: 2, why: 'A larger premium raises the PV of the gains; the other changes raise costs or shrink the PV of gains.' },
    { worked: 'w-human-capital', topic: 'human-capital', q: 'The signalling view of education says that…', choices: ['Education raises productivity, which raises wages', 'Education may raise wages mainly by showing employers who is able, so the social return can be lower than the private return', 'Education has no effect on wages', 'Firms always pay for general training'], correct: 1, why: 'In Spence’s model a degree sorts workers by ability; it pays the individual but adds less to output than the human-capital view implies.' },
    { worked: 'w-unions', topic: 'trade-unions', q: 'A union in a competitive labour market raises the wage above equilibrium. Employment falls least when…', choices: ['Labour is easy to replace with machines', 'Labour is a large share of the firm’s costs', 'Demand for the firm’s product is price-inelastic', 'Demand for the product is very elastic'], correct: 2, why: 'Marshall’s rules: inelastic product demand makes labour demand inelastic, so a higher wage costs fewer jobs.' },
    { worked: 'w-unions', topic: 'trade-unions', q: 'Which union strategy can raise both wages and employment in a competitive labour market?', choices: ['Bargaining for a wage above the market wage', 'A closed shop that limits entry', 'Raising labour productivity and so the demand for labour', 'Longer apprenticeships'], correct: 2, why: 'Shifting labour demand right raises both; the other strategies move along demand or shift supply left, cutting employment.' },
    { worked: 'w-efficiency-wage', topic: 'efficiency-wages', q: 'Why might a firm pay more than the market-clearing wage?', choices: ['Because the minimum wage forces it to', 'Because higher pay raises effort, cuts quits or attracts better workers enough to lower the cost per unit of effort', 'Because it has monopsony power', 'Because labour supply is perfectly elastic'], correct: 1, why: 'Efficiency wage theories: shirking, turnover, adverse selection and fairness.' },
    { worked: 'w-efficiency-wage', topic: 'efficiency-wages', q: 'With efficiency wages, why does unemployment not push wages down?', choices: ['Unions block wage cuts', 'Cutting the wage would reduce effort by more, raising the cost per unit of effort', 'Unemployed workers do not want jobs', 'The government fixes wages'], correct: 1, why: 'At w* the firm is already at its lowest cost per unit of effort, so it gains nothing by hiring cheaper workers.' },
    { worked: 'w-discrimination', topic: 'discrimination', q: 'In Becker’s model, why might competition reduce employer discrimination over time?', choices: ['Discriminating firms have lower costs', 'Non-discriminating firms can hire undervalued workers, earn more profit and expand', 'The government always bans discrimination', 'Discriminated workers become more productive'], correct: 1, why: 'Prejudice is costly to the employer; profit-seeking rivals exploit the wage gap and bid it away.' },
    { worked: 'w-discrimination', topic: 'discrimination', q: 'Statistical discrimination occurs when…', choices: ['Employers dislike a group', 'Employers judge individuals by group averages because individual productivity is hard to observe', 'Workers choose lower-paid jobs', 'Unions exclude a group'], correct: 1, why: 'It can be profit-maximising yet unfair to individuals, and can discourage the group from investing in skills.' },
    { worked: 'w-labour-policy', topic: 'labour-policy', q: 'A payroll tax is paid by employers. If labour supply is very inelastic, who bears most of the tax?', choices: ['Employers, because they pay it', 'Workers, through lower take-home pay', 'Consumers only', 'It is split equally'], correct: 1, why: 'Incidence depends on elasticities, not on who legally pays: the less elastic side bears more.' },
    { worked: 'w-labour-policy', topic: 'labour-policy', q: 'Compared with a minimum wage, a wage subsidy to employers…', choices: ['Reduces employment', 'Raises both employment and take-home pay, but costs public money', 'Has no cost to the government', 'Always gives the whole benefit to workers'], correct: 1, why: 'The subsidy shifts effective demand up; part goes to employers and the taxpayer funds it.' },
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
    { worked: 'w-cartel', topic: 'collusion', q: 'Why does each cartel member have an incentive to produce more than its quota?', choices: ['Its MR at the quota is below MC', 'Its MR on the residual demand at the quota is above MC, so extra output adds to its own profit', 'The cartel price is below the competitive price', 'Quotas are set above the monopoly output'], correct: 1, why: 'At the quota, the member’s MR (P_m − b·quota) exceeds MC; it ignores the fall in price borne by the other members.' },
    { worked: 'w-cartel', topic: 'collusion', q: 'Which of these makes collusion harder to sustain?', choices: ['Few firms in the market', 'Transparent, published prices', 'A large number of firms with different costs', 'Frequent interaction between the same firms'], correct: 2, why: 'More firms raise δ* (each cheat gains more relative to its share), and different costs make a single price harder to agree.' },
    { worked: 'w-cartel', topic: 'collusion', q: 'Switching the punishment for cheating from Cournot competition to a price war at P = MC…', choices: ['Raises the critical discount factor, so collusion is harder', 'Lowers the critical discount factor, so collusion is easier, if the threat is credible', 'Has no effect on cartel stability', 'Makes cheating the dominant strategy in the repeated game'], correct: 1, why: 'δ* = (π_D − π_C)/(π_D − π_P): a lower punishment profit π_P makes the denominator larger and δ* smaller.' },
    { worked: 'w-cartel', topic: 'collusion', q: 'What is a leniency programme in competition policy?', choices: ['A cap on the fines a cartel can pay', 'Immunity or reduced fines for the first cartel member to report the cartel, which turns collusion into a prisoner’s dilemma', 'Permission for small firms to collude', 'A rule letting firms share price information'], correct: 1, why: 'Each member fears being reported first, so confessing becomes dominant and cartels are detected more often.' },
    { worked: 'w-price-leadership', topic: 'price-leadership', q: 'In the dominant-firm price leadership model, the leader’s demand curve is…', choices: ['The market demand curve', 'Market demand minus the fringe’s supply at each price', 'The fringe’s supply curve', 'Perfectly elastic at the competitive price'], correct: 1, why: 'The fringe sells all it wants at the leader’s price, so the leader faces only the residual demand.' },
    { worked: 'w-price-leadership', topic: 'price-leadership', q: 'Barometric price leadership is when…', choices: ['The largest firm sets a price below cost to drive rivals out', 'Firms sign an agreement to follow one firm’s price', 'Rivals follow a firm whose price changes are seen as a reliable signal of market conditions, even if it is not dominant', 'The government sets a maximum price'], correct: 2, why: 'The barometric leader reads costs and demand well; the others follow its lead without any agreement.' },
    { worked: 'w-oligopoly-compare', topic: 'oligopoly-compare', q: 'With linear demand and equal constant MC, which ranking of market output is correct for two firms?', choices: ['Cournot < monopoly < Stackelberg < Bertrand', 'Monopoly < Stackelberg < Cournot < Bertrand', 'Monopoly < Cournot < Stackelberg < Bertrand', 'Monopoly < Cournot = Bertrand < Stackelberg'], correct: 2, why: 'Monopoly (a − c)/2b < Cournot 2(a − c)/3b < Stackelberg 3(a − c)/4b < Bertrand (a − c)/b.' },
    { worked: 'w-oligopoly-compare', topic: 'oligopoly-compare', q: 'As the number of firms in a Cournot market rises, the market price…', choices: ['Stays at the monopoly level', 'Falls toward marginal cost', 'Falls to marginal cost as soon as there are two firms', 'Rises, because each firm has less output to sell'], correct: 1, why: 'P = (a + nc)/(n + 1) falls toward c as n grows; only Bertrand reaches P = MC with two firms.' },
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
